import { lookup as dnsLookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import type { LookupFunction } from 'node:net';
import { isIP } from 'node:net';
import type { Transform } from 'node:stream';
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib';
import {
  decodeText,
  parseRobots,
  ROBOTS_MAX_CHARS,
  robotsAddress,
  robotsRule,
  siteAddress,
  type HttpFacts,
} from '@searchunveil/core';
import { isPublicAddress } from './network.ts';

/**
 * Fetches one public web page by its address, the way a visitor's browser would, and records
 * what the server said: status, redirects, timing, headers and the site's robots.txt.
 *
 * Every connection goes to an address checked by `isPublicAddress`, pinned for the request,
 * so a name cannot resolve to a public address for the check and a private one for the
 * connection. Redirects are followed by hand and checked the same way.
 */

export interface FetchOptions {
  /** Time for the whole page, redirects included. */
  readonly timeoutMs?: number;
  /** Most bytes of HTML read, after decompression. */
  readonly maxBytes?: number;
  readonly signal?: AbortSignal;
  /** Resolves a host name; replaceable in tests. */
  readonly resolve?: (hostname: string) => Promise<readonly ResolvedAddress[]>;
  /** Lets tests fetch from servers on this machine. Never set it in production. */
  readonly allowPrivateNetwork?: boolean;
}

export interface ResolvedAddress {
  readonly address: string;
  readonly family: number;
}

export interface FetchedPage {
  readonly html: string;
  readonly http: HttpFacts;
}

export type FetchErrorCode =
  | 'invalid-address'
  | 'blocked-address'
  | 'unknown-host'
  | 'unreachable'
  | 'timeout'
  | 'tls'
  | 'too-many-redirects'
  | 'too-large'
  | 'not-html'
  | 'http-status';

export class FetchError extends Error {
  readonly code: FetchErrorCode;
  /** A detail worth showing, such as the status or content type; never an internal address. */
  readonly detail: string | null;

  constructor(code: FetchErrorCode, detail: string | null = null) {
    super(detail === null ? code : `${code}: ${detail}`);
    this.code = code;
    this.detail = detail;
  }
}

export const FETCH_DEFAULTS = {
  timeoutMs: 15_000,
  maxBytes: 15 * 1024 * 1024,
  robotsTimeoutMs: 5_000,
  maxRedirects: 5,
} as const;

const USER_AGENT =
  'Mozilla/5.0 (compatible; SearchUnveil/0.1; page review requested by a site owner)';

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

export async function fetchPage(input: string, options: FetchOptions = {}): Promise<FetchedPage> {
  const start = siteAddress(input);
  if (start === null) throw new FetchError('invalid-address');
  const signal = AbortSignal.any([
    AbortSignal.timeout(options.timeoutMs ?? FETCH_DEFAULTS.timeoutMs),
    ...(options.signal === undefined ? [] : [options.signal]),
  ]);

  const redirects: { url: string; status: number }[] = [];
  let url = new URL(start);
  for (;;) {
    const response = await get(url, {
      ...options,
      signal,
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
      maxBytes: options.maxBytes ?? FETCH_DEFAULTS.maxBytes,
      truncate: false,
    });
    const location = response.headers.location;
    if (REDIRECTS.has(response.status) && location !== undefined) {
      redirects.push({ url: url.href, status: response.status });
      if (redirects.length > FETCH_DEFAULTS.maxRedirects)
        throw new FetchError('too-many-redirects');
      url = nextUrl(location, url);
      continue;
    }

    const contentType = header(response.headers['content-type']);
    if (!looksLikeHtml(contentType, response.body)) {
      throw response.status >= 200 && response.status < 300
        ? new FetchError('not-html', contentType)
        : new FetchError('http-status', String(response.status));
    }
    const robotsTxt = await fetchRobots(url, options);
    return {
      html: decodeHtml(response.body, contentType),
      http: {
        requestedUrl: start,
        finalUrl: url.href,
        status: response.status,
        redirects,
        elapsedMs: Math.round(response.elapsedMs),
        bytes: response.receivedBytes,
        contentType,
        contentEncoding: header(response.headers['content-encoding']),
        xRobotsTag: header(response.headers['x-robots-tag']),
        hsts: response.headers['strict-transport-security'] !== undefined,
        robotsTxt,
      },
    };
  }
}

/**
 * The site's robots.txt as Googlebot reads it: a missing file (a 4xx answer) allows
 * everything; a server error, 429 or no answer leaves it unknown (`null`), because Google then
 * stops crawling the site for a while.
 */
async function fetchRobots(page: URL, options: FetchOptions): Promise<HttpFacts['robotsTxt']> {
  const signal = AbortSignal.any([
    AbortSignal.timeout(FETCH_DEFAULTS.robotsTimeoutMs),
    ...(options.signal === undefined ? [] : [options.signal]),
  ]);
  try {
    let url = new URL(robotsAddress(page.href));
    for (let hops = 0; ; hops++) {
      const response = await get(url, {
        ...options,
        signal,
        accept: 'text/plain,*/*;q=0.5',
        maxBytes: ROBOTS_MAX_CHARS,
        truncate: true,
      });
      const location = response.headers.location;
      if (REDIRECTS.has(response.status) && location !== undefined) {
        if (hops >= FETCH_DEFAULTS.maxRedirects) return null;
        url = nextUrl(location, url);
        continue;
      }
      if (response.status >= 200 && response.status < 300) {
        const robots = parseRobots(new TextDecoder().decode(response.body));
        const rule = robotsRule(robots, 'googlebot', `${page.pathname}${page.search}`);
        return {
          found: true,
          allowsPage: rule?.allow ?? true,
          rule: rule === null ? null : `${rule.allow ? 'Allow' : 'Disallow'}: ${rule.path}`,
          sitemaps: robots.sitemaps.slice(0, 20),
        };
      }
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return { found: false, allowsPage: true, rule: null, sitemaps: [] };
      }
      return null;
    }
  } catch {
    return null;
  }
}

interface GetOptions extends FetchOptions {
  readonly signal: AbortSignal;
  readonly accept: string;
  readonly maxBytes: number;
  /** Stop reading at `maxBytes` and keep what arrived, instead of failing. */
  readonly truncate: boolean;
}

interface Response {
  readonly status: number;
  readonly headers: http.IncomingHttpHeaders;
  /** The body after decompression; empty for redirects. */
  readonly body: Uint8Array;
  /** Bytes as sent, before decompression. */
  readonly receivedBytes: number;
  readonly elapsedMs: number;
}

async function get(url: URL, options: GetOptions): Promise<Response> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new FetchError('invalid-address');
  }
  if (url.username !== '' || url.password !== '') throw new FetchError('invalid-address');
  // Only the standard web ports: other ports would let the server probe other services.
  if (url.port !== '' && !options.allowPrivateNetwork) throw new FetchError('blocked-address');
  const target = await resolveSafely(url.hostname, options);

  const lookup: LookupFunction = (_hostname, lookupOptions, callback) => {
    if (lookupOptions.all === true) callback(null, [target]);
    else callback(null, target.address, target.family);
  };
  const client = url.protocol === 'https:' ? https : http;
  const started = performance.now();

  return new Promise<Response>((resolve, reject) => {
    const fail = (error: unknown) => {
      reject(toFetchError(error, options.signal));
    };
    const request = client.request(
      url,
      {
        method: 'GET',
        agent: false,
        lookup,
        signal: options.signal,
        headers: {
          'user-agent': USER_AGENT,
          accept: options.accept,
          'accept-encoding': 'gzip, deflate, br',
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (REDIRECTS.has(status)) {
          response.resume();
          resolve({
            status,
            headers: response.headers,
            body: new Uint8Array(),
            receivedBytes: 0,
            elapsedMs: performance.now() - started,
          });
          return;
        }
        let received = 0;
        response.on('data', (chunk: Buffer) => {
          received += chunk.length;
        });
        const decoder = decompressor(header(response.headers['content-encoding']));
        const stream = decoder === null ? response : response.pipe(decoder);
        if (decoder !== null) response.on('error', fail);
        const chunks: Buffer[] = [];
        let length = 0;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve({
            status,
            headers: response.headers,
            body: new Uint8Array(Buffer.concat(chunks, length)),
            receivedBytes: received,
            elapsedMs: performance.now() - started,
          });
        };
        stream.on('data', (chunk: Buffer) => {
          if (done) return;
          if (length + chunk.length > options.maxBytes) {
            if (!options.truncate) {
              done = true;
              request.destroy();
              reject(new FetchError('too-large'));
              return;
            }
            chunks.push(chunk.subarray(0, options.maxBytes - length));
            length = options.maxBytes;
            finish();
            request.destroy();
            return;
          }
          chunks.push(chunk);
          length += chunk.length;
        });
        stream.on('end', finish);
        stream.on('error', (error) => {
          if (!done) fail(error);
        });
      },
    );
    request.on('error', fail);
    request.end();
  });
}

async function resolveSafely(hostname: string, options: FetchOptions): Promise<ResolvedAddress> {
  const literal = hostname.replace(/^\[|\]$/g, '');
  const family = isIP(literal);
  let addresses: readonly ResolvedAddress[];
  if (family !== 0) {
    addresses = [{ address: literal, family }];
  } else {
    try {
      addresses = await untilAborted((options.resolve ?? resolveAll)(hostname), options.signal);
    } catch (error) {
      throw options.signal?.aborted === true
        ? new FetchError('timeout')
        : error instanceof FetchError
          ? error
          : new FetchError('unknown-host');
    }
  }
  if (addresses.length === 0) throw new FetchError('unknown-host');
  // Refuse a name if any of its addresses is private: a public one may be a decoy.
  if (!options.allowPrivateNetwork && !addresses.every((a) => isPublicAddress(a.address))) {
    throw new FetchError('blocked-address');
  }
  const [first] = addresses;
  if (first === undefined) throw new FetchError('unknown-host');
  return first;
}

async function resolveAll(hostname: string): Promise<readonly ResolvedAddress[]> {
  // IPv4 first: many hosts that run this server have no IPv6 route.
  return dnsLookup(hostname, { all: true, order: 'ipv4first' });
}

/** Settles with `promise`, or rejects as soon as `signal` aborts. */
async function untilAborted<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (signal === undefined) return promise;
  signal.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      reject(new FetchError('timeout'));
    };
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', abort);
    });
  });
}

function nextUrl(location: string, base: URL): URL {
  try {
    return new URL(location, base);
  } catch {
    throw new FetchError('invalid-address');
  }
}

function decompressor(encoding: string | null): Transform | null {
  switch ((encoding ?? '').toLowerCase()) {
    case 'gzip':
    case 'x-gzip':
      return createGunzip();
    case 'deflate':
      return createInflate();
    case 'br':
      return createBrotliDecompress();
    default:
      return null;
  }
}

function header(value: string | string[] | undefined): string | null {
  const text = Array.isArray(value) ? value.join(', ') : value;
  return text === undefined || text.trim() === '' ? null : text.trim();
}

function looksLikeHtml(contentType: string | null, body: Uint8Array): boolean {
  if (contentType !== null) return /^(text\/html|application\/xhtml\+xml)\b/i.test(contentType);
  const start = new TextDecoder().decode(body.subarray(0, 1024)).trimStart().toLowerCase();
  return start.startsWith('<!doctype html') || start.startsWith('<html');
}

/**
 * Decodes HTML with the encoding the server declared, else the one the page declares in its
 * first kilobyte, else as the engine reads files (UTF-8, or a legacy encoding it detects).
 */
function decodeHtml(body: Uint8Array, contentType: string | null): string {
  // A byte order mark outranks every declaration, as in browsers.
  if (body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf)
    return new TextDecoder().decode(body);
  if (body[0] === 0xff && body[1] === 0xfe) return new TextDecoder('utf-16le').decode(body);
  if (body[0] === 0xfe && body[1] === 0xff) return new TextDecoder('utf-16be').decode(body);
  const head = new TextDecoder('windows-1252').decode(body.subarray(0, 1024));
  const declared =
    /charset\s*=\s*["']?([\w.:-]+)/i.exec(contentType ?? '')?.[1] ??
    /<meta[^>]+charset\s*=\s*["']?([\w.:-]+)/i.exec(head)?.[1];
  if (declared !== undefined) {
    try {
      return new TextDecoder(declared).decode(body);
    } catch {
      // An encoding the platform does not know: read the bytes as files are read.
    }
  }
  const decoded = decodeText(body);
  return decoded.ok ? decoded.value.text : new TextDecoder().decode(body);
}

function toFetchError(error: unknown, signal: AbortSignal): FetchError {
  if (error instanceof FetchError) return error;
  if (signal.aborted) return new FetchError('timeout');
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === 'string') {
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return new FetchError('unknown-host');
    if (code.startsWith('ERR_TLS') || code.includes('CERT') || code === 'EPROTO') {
      return new FetchError('tls');
    }
    if (code === 'ETIMEDOUT') return new FetchError('timeout');
  }
  return new FetchError('unreachable');
}
