import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { FetchError, type FetchedPage } from './fetch-page.ts';
import { RateLimiter } from './rate-limit.ts';

/**
 * SearchUnveil's optional server. It serves the web app and adds the one thing a browser cannot
 * do alone: fetching a public page by its address. It needs no API key and keeps nothing; the
 * review and the analysis run in the browser.
 *
 *   GET  /api/health   what this server offers
 *   POST /api/page     {address} -> {html, http}
 */

export interface AppOptions {
  /** The built web app (`apps/web/dist-server`), or `null` to serve only the API. */
  readonly staticDir: string | null;
  readonly fetchPage: (address: string, signal: AbortSignal) => Promise<FetchedPage>;
  /** Read the client address from X-Forwarded-For; only behind a proxy that sets it. */
  readonly trustProxy?: boolean;
  readonly limits?: Partial<ServerLimits>;
}

export interface ServerLimits {
  /** Page fetches per visitor per minute. */
  readonly pagesPerMinute: number;
}

export const DEFAULT_SERVER_LIMITS: ServerLimits = { pagesPerMinute: 20 };

const MINUTE = 60_000;

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
      send(response, 200, { fetch: true });
      return;
    }
    if (pathname !== '/api/page') {
      send(response, 404, { error: 'not-found' });
      return;
    }
    if (request.method !== 'POST') {
      send(response, 405, { error: 'method-not-allowed' }, { allow: 'POST' });
      return;
    }
    // Only this app's own pages may call the API: other sites can't use it as a fetcher.
    if (!sameOrigin(request)) throw new HttpError(403, 'forbidden');
    if (!/^application\/json\b/i.test(request.headers['content-type'] ?? '')) {
      throw new HttpError(415, 'unsupported-media-type');
    }
    const client = clientAddress(request, options.trustProxy === true);
    const controller = new AbortController();
    response.on('close', () => {
      if (!response.writableFinished) controller.abort();
    });

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
