import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {
  ANALYSIS_EVIDENCE_MAX_CHARS,
  ANALYSIS_MODEL,
  isLocale,
  pageAnalysisInstructions,
  serializePageAnalysis,
} from '@searchunveil/core';
import { AnalysisError, type Analyze } from './analyze.ts';
import { FetchError, type FetchedPage } from './fetch-page.ts';
import { RateLimiter } from './rate-limit.ts';

/**
 * SearchUnveil's optional server. It serves the web app and adds two things a browser cannot
 * do alone: fetching a public page by its address, and the AI analysis with an Anthropic API
 * key that stays on the server.
 *
 *   GET  /api/health   what this server offers
 *   POST /api/page     {address} -> {html, http}
 *   POST /api/analyze  {locale, pageLanguage, evidence} -> {analysis, model, fallback}
 *
 * The analysis travels in the model's own JSON shape, which the browser checks again.
 */

export interface AppOptions {
  /** The built web app (`apps/web/dist-server`), or `null` to serve only the API. */
  readonly staticDir: string | null;
  readonly fetchPage: (address: string, signal: AbortSignal) => Promise<FetchedPage>;
  /** `null` when no API key is configured: the analysis is then unavailable. */
  readonly analyze: Analyze | null;
  /** Read the client address from X-Forwarded-For; only behind a proxy that sets it. */
  readonly trustProxy?: boolean;
  readonly limits?: Partial<ServerLimits>;
}

export interface ServerLimits {
  /** Page fetches per visitor per minute. */
  readonly pagesPerMinute: number;
  /** Analyses per visitor per hour. */
  readonly analysesPerHour: number;
  /** Analyses for everyone per day: a ceiling on what the API key can spend. */
  readonly analysesPerDay: number;
}

export const DEFAULT_SERVER_LIMITS: ServerLimits = {
  pagesPerMinute: 20,
  analysesPerHour: 10,
  analysesPerDay: 200,
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // The page's own meta policy covers everything else; framing can only be set here.
  'content-security-policy': "frame-ancestors 'none'",
} as const;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export function createApp(options: AppOptions): http.Server {
  const limits = { ...DEFAULT_SERVER_LIMITS, ...options.limits };
  const pageLimiter = new RateLimiter(limits.pagesPerMinute, MINUTE);
  const analysisLimiter = new RateLimiter(limits.analysesPerHour, HOUR);
  const dailyLimiter = new RateLimiter(limits.analysesPerDay, DAY);

  const handle = async (request: http.IncomingMessage, response: http.ServerResponse) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      await api(url.pathname, request, response);
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      send(response, 405, { error: 'method-not-allowed' }, { allow: 'GET, HEAD' });
      return;
    }
    await serveFile(url.pathname, request, response);
  };

  const api = async (
    pathname: string,
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    if (pathname === '/api/health' && request.method === 'GET') {
      send(response, 200, {
        fetch: true,
        analysis: options.analyze !== null,
        model: ANALYSIS_MODEL,
      });
      return;
    }
    if (pathname !== '/api/page' && pathname !== '/api/analyze') {
      send(response, 404, { error: 'not-found' });
      return;
    }
    if (request.method !== 'POST') {
      send(response, 405, { error: 'method-not-allowed' }, { allow: 'POST' });
      return;
    }
    // Only this app's own pages may call the API: other sites can't spend its quota.
    if (!sameOrigin(request)) throw new HttpError(403, 'forbidden');
    if (!/^application\/json\b/i.test(request.headers['content-type'] ?? '')) {
      throw new HttpError(415, 'unsupported-media-type');
    }
    const client = clientAddress(request, options.trustProxy === true);
    const controller = new AbortController();
    response.on('close', () => {
      if (!response.writableFinished) controller.abort();
    });

    if (pathname === '/api/page') {
      const body = await readJson(request, 4 * 1024);
      const address = body['address'];
      if (typeof address !== 'string' || address.length > 2048) {
        throw new HttpError(400, 'invalid-address');
      }
      if (!pageLimiter.take(client)) throw new HttpError(429, 'rate-limited');
      try {
        send(response, 200, await options.fetchPage(address, controller.signal));
      } catch (error) {
        if (!(error instanceof FetchError)) throw error;
        send(response, fetchStatus(error), {
          error: error.code,
          ...(error.detail === null ? {} : { detail: error.detail }),
        });
      }
      return;
    }

    if (options.analyze === null) throw new HttpError(503, 'not-configured');
    const body = await readJson(request, ANALYSIS_EVIDENCE_MAX_CHARS + 4 * 1024);
    const { locale, pageLanguage, evidence } = body;
    if (
      !isLocale(locale) ||
      (pageLanguage !== null && typeof pageLanguage !== 'string') ||
      typeof evidence !== 'string' ||
      evidence.length > ANALYSIS_EVIDENCE_MAX_CHARS ||
      !isEvidence(evidence)
    ) {
      throw new HttpError(400, 'invalid-request');
    }
    if (!analysisLimiter.take(client) || !dailyLimiter.take('everyone')) {
      throw new HttpError(429, 'rate-limited');
    }
    try {
      const outcome = await options.analyze(
        { instructions: pageAnalysisInstructions({ locale, pageLanguage }), evidence },
        controller.signal,
      );
      send(response, 200, {
        analysis: serializePageAnalysis(outcome.analysis),
        model: outcome.model,
        fallback: outcome.fallback,
      });
    } catch (error) {
      if (!(error instanceof AnalysisError)) throw error;
      send(response, analysisStatus(error), { error: error.code });
    }
  };

  const serveFile = async (
    pathname: string,
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    if (options.staticDir === null) {
      send(response, 404, { error: 'not-found' });
      return;
    }
    const root = path.resolve(options.staticDir);
    let relative: string;
    try {
      relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
    } catch {
      throw new HttpError(400, 'bad-request');
    }
    const file = path.resolve(root, `.${relative}`);
    if (!file.startsWith(`${root}${path.sep}`) || relative.includes('\0')) {
      throw new HttpError(404, 'not-found');
    }
    const info = await stat(file).catch(() => null);
    if (!info?.isFile()) throw new HttpError(404, 'not-found');
    const type = CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    // Built assets carry a content hash in their names, so they never change.
    const immutable = relative.startsWith('/assets/');
    response.writeHead(200, {
      ...SECURITY_HEADERS,
      'content-type': type,
      'content-length': info.size,
      'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(file).pipe(response);
  };

  return http.createServer((request, response) => {
    handle(request, response).catch((error: unknown) => {
      if (response.headersSent) {
        response.destroy();
        return;
      }
      if (error instanceof HttpError) send(response, error.status, { error: error.code });
      else send(response, 500, { error: 'internal-error' });
    });
  });
}

function send(
  response: http.ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  const json = JSON.stringify(body);
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    ...headers,
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(json),
    'cache-control': 'no-store',
  });
  response.end(json);
}

async function readJson(
  request: http.IncomingMessage,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request as AsyncIterable<Buffer>) {
    length += chunk.length;
    if (length > maxBytes) throw new HttpError(413, 'too-large');
    chunks.push(chunk);
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'invalid-json');
  }
  return value as Record<string, unknown>;
}

/** Evidence as `pageAnalysisEvidence` builds it: a JSON object describing a page. */
function isEvidence(text: string): boolean {
  try {
    const value = JSON.parse(text) as unknown;
    return (
      typeof value === 'object' &&
      value !== null &&
      'page' in value &&
      'findings' in value &&
      Array.isArray(value.findings)
    );
  } catch {
    return false;
  }
}

/**
 * Browsers send Origin with every cross-site POST. Requests without one come from tools
 * such as curl, which the rate limits cover.
 */
function sameOrigin(request: http.IncomingMessage): boolean {
  const origin = request.headers.origin;
  if (origin === undefined) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function clientAddress(request: http.IncomingMessage, trustProxy: boolean): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (trustProxy && typeof forwarded === 'string') {
    const first = forwarded.split(',')[0]?.trim();
    if (first !== undefined && first !== '') return first;
  }
  return request.socket.remoteAddress ?? 'unknown';
}

function fetchStatus(error: FetchError): number {
  switch (error.code) {
    case 'invalid-address':
    case 'blocked-address':
      return 400;
    case 'timeout':
      return 504;
    case 'unknown-host':
    case 'unreachable':
    case 'tls':
    case 'too-many-redirects':
    case 'too-large':
    case 'not-html':
    case 'http-status':
      return 502;
  }
}

function analysisStatus(error: AnalysisError): number {
  switch (error.code) {
    case 'cancelled':
      return 499;
    case 'rate-limited':
      return 429;
    case 'overloaded':
    case 'not-configured':
      return 503;
    case 'refused':
    case 'too-long':
    case 'invalid-answer':
      return 422;
    case 'upstream-error':
      return 502;
  }
}
