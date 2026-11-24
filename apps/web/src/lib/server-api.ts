import type { HttpFacts, Locale } from '@searchunveil/core';

/**
 * The optional server (`apps/server`). Only the server build talks to it: the static and
 * standalone builds keep `connect-src 'none'` and never try.
 */
export const SERVER_BUILD = import.meta.env.MODE === 'server';

export interface ServerHealth {
  readonly fetch: boolean;
  readonly analysis: boolean;
  readonly model: string;
}

let health: Promise<ServerHealth | null> | undefined;

/** What the server offers, asked once per page load; `null` without a server. */
export function serverHealth(): Promise<ServerHealth | null> {
  if (!SERVER_BUILD) return Promise.resolve(null);
  health ??= fetch('./api/health', { headers: { accept: 'application/json' } })
    .then(async (response) => (response.ok ? ((await response.json()) as unknown) : null))
    .then((value) =>
      isRecord(value)
        ? {
            fetch: value['fetch'] === true,
            analysis: value['analysis'] === true,
            model: typeof value['model'] === 'string' ? value['model'] : '',
          }
        : null,
    )
    .catch(() => null);
  return health;
}

export type ServerResult<T> =
  | ({ readonly ok: true } & T)
  | { readonly ok: false; readonly error: string; readonly detail: string | null };

/** Asks the server to download a page by its address. */
export async function fetchPageByAddress(
  address: string,
  signal: AbortSignal,
): Promise<ServerResult<{ readonly html: string; readonly http: HttpFacts }>> {
  const reply = await post('./api/page', { address }, signal);
  if (!reply.ok) return reply;
  const { value } = reply;
  const http = isRecord(value) ? parseHttpFacts(value['http']) : null;
  if (!isRecord(value) || typeof value['html'] !== 'string' || http === null) {
    return { ok: false, error: 'failed', detail: null };
  }
  return { ok: true, html: value['html'], http };
}

/** Asks the server for the AI analysis. The answer is checked by the caller. */
export async function analyzeOnServer(
  request: {
    readonly locale: Locale;
    readonly pageLanguage: string | null;
    readonly evidence: string;
  },
  signal: AbortSignal,
): Promise<
  ServerResult<{ readonly analysis: unknown; readonly model: string; readonly fallback: boolean }>
> {
  const reply = await post('./api/analyze', request, signal);
  if (!reply.ok) return reply;
  const { value } = reply;
  if (!isRecord(value) || typeof value['model'] !== 'string') {
    return { ok: false, error: 'failed', detail: null };
  }
  return {
    ok: true,
    analysis: value['analysis'],
    model: value['model'],
    fallback: value['fallback'] === true,
  };
}

async function post(
  url: string,
  body: unknown,
  signal: AbortSignal,
): Promise<ServerResult<{ readonly value: unknown }>> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return { ok: false, error: signal.aborted ? 'cancelled' : 'offline', detail: null };
  }
  let value: unknown = null;
  try {
    value = await response.json();
  } catch {
    // An answer that isn't JSON: a proxy's error page, for example.
  }
  if (response.ok) return { ok: true, value };
  const error = isRecord(value) && typeof value['error'] === 'string' ? value['error'] : 'failed';
  const detail = isRecord(value) && typeof value['detail'] === 'string' ? value['detail'] : null;
  return { ok: false, error, detail };
}

/** Reads the server's description of a fetch, refusing anything of the wrong shape. */
export function parseHttpFacts(value: unknown): HttpFacts | null {
  if (!isRecord(value)) return null;
  const text = (key: string) => (typeof value[key] === 'string' ? value[key] : null);
  const number = (key: string) =>
    typeof value[key] === 'number' && Number.isFinite(value[key]) ? value[key] : null;
  const requestedUrl = text('requestedUrl');
  const finalUrl = text('finalUrl');
  const status = number('status');
  const redirects = value['redirects'];
  if (requestedUrl === null || finalUrl === null || status === null || !Array.isArray(redirects)) {
    return null;
  }
  const robots = value['robotsTxt'];
  return {
    requestedUrl,
    finalUrl,
    status,
    redirects: redirects
      .filter(isRecord)
      .map((r) => ({ url: String(r['url']), status: Number(r['status']) })),
    elapsedMs: number('elapsedMs') ?? 0,
    bytes: number('bytes') ?? 0,
    contentType: text('contentType'),
    contentEncoding: text('contentEncoding'),
    xRobotsTag: text('xRobotsTag'),
    hsts: value['hsts'] === true,
    robotsTxt: isRecord(robots)
      ? {
          found: robots['found'] === true,
          allowsPage: robots['allowsPage'] !== false,
          rule: typeof robots['rule'] === 'string' ? robots['rule'] : null,
          sitemaps: Array.isArray(robots['sitemaps'])
            ? robots['sitemaps'].filter((s): s is string => typeof s === 'string')
            : [],
        }
      : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
