import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import type http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AnalysisError, type Analyze } from './analyze.ts';
import { FetchError } from './fetch-page.ts';
import { RateLimiter } from './rate-limit.ts';
import { createApp, type AppOptions } from './server.ts';

const FACTS = {
  requestedUrl: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 200,
  redirects: [],
  elapsedMs: 10,
  bytes: 20,
  contentType: 'text/html',
  contentEncoding: null,
  xRobotsTag: null,
  hsts: true,
  robotsTxt: null,
};

const EVIDENCE = JSON.stringify({ page: { title: 'Home' }, findings: [], text: '' });

let staticDir = '';
const analyses: Parameters<Analyze>[0][] = [];

async function start(options: Partial<AppOptions> = {}) {
  const server = createApp({
    staticDir,
    fetchPage: (address) => {
      if (address === 'private.example') {
        return Promise.reject(new FetchError('blocked-address'));
      }
      return Promise.resolve({ html: '<html></html>', http: { ...FACTS, requestedUrl: address } });
    },
    analyze: (request) => {
      analyses.push(request);
      if (request.evidence.includes('"refuse"'))
        return Promise.reject(new AnalysisError('refused'));
      return Promise.resolve({
        analysis: {
          summary: 'Fine.',
          verdict: 'strong',
          priorities: [],
          titleSuggestions: [],
          descriptionSuggestions: [],
          contentNotes: [],
          technicalNotes: [],
          caveats: [],
        },
        model: 'claude-fable-5-2',
        fallback: false,
      });
    },
    ...options,
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, base: `http://127.0.0.1:${String((server.address() as AddressInfo).port)}` };
}

const servers: http.Server[] = [];
let base = '';

beforeAll(async () => {
  staticDir = await mkdtemp(path.join(tmpdir(), 'searchunveil-static-'));
  await mkdir(path.join(staticDir, 'assets'));
  await writeFile(path.join(staticDir, 'index.html'), '<!doctype html><title>App</title>');
  await writeFile(path.join(staticDir, 'assets', 'app-1a2b.js'), 'console.log(1)');
  await writeFile(path.join(tmpdir(), 'searchunveil-secret.txt'), 'secret');
  const app = await start();
  servers.push(app.server);
  base = app.base;
});

afterAll(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise((resolve) => {
          server.close(resolve);
        }),
    ),
  );
});

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('the server', () => {
  it('says what it offers', async () => {
    const response = await fetch(`${base}/api/health`);
    expect(await response.json()).toEqual({
      fetch: true,
      analysis: true,
      model: 'claude-fable-5-2',
    });
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('serves the app with security headers, and nothing outside it', async () => {
    const page = await fetch(`${base}/`);
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(page.headers.get('content-security-policy')).toBe("frame-ancestors 'none'");
    expect(page.headers.get('x-content-type-options')).toBe('nosniff');
    expect(page.headers.get('cache-control')).toBe('no-cache');

    const asset = await fetch(`${base}/assets/app-1a2b.js`);
    expect(asset.headers.get('cache-control')).toContain('immutable');

    for (const attempt of [
      '/../searchunveil-secret.txt',
      '/%2e%2e/searchunveil-secret.txt',
      '/assets/../../searchunveil-secret.txt',
      '/assets',
      '/missing.js',
      '/%E0%A4%A',
    ]) {
      const response = await fetch(`${base}${attempt}`);
      expect([400, 404], attempt).toContain(response.status);
    }
    expect((await fetch(`${base}/`, { method: 'DELETE' })).status).toBe(405);
  });

  it('fetches a page by its address', async () => {
    const response = await post(`${base}/api/page`, { address: 'example.com' });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      html: '<html></html>',
      http: { requestedUrl: 'example.com' },
    });
  });

  it('explains fetch failures with a code', async () => {
    const response = await post(`${base}/api/page`, { address: 'private.example' });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'blocked-address' });
  });

  it('accepts only JSON from its own pages', async () => {
    expect((await post(`${base}/api/page`, { address: 7 })).status).toBe(400);
    expect((await post(`${base}/api/page`, 'not json')).status).toBe(400);
    expect(
      (await post(`${base}/api/page`, { address: 'a.com' }, { 'content-type': 'text/plain' }))
        .status,
    ).toBe(415);
    expect(
      (await post(`${base}/api/page`, { address: 'a.com' }, { origin: 'https://evil.example' }))
        .status,
    ).toBe(403);
    expect((await post(`${base}/api/page`, { address: 'a.com' }, { origin: base })).status).toBe(
      200,
    );
    expect((await fetch(`${base}/api/page`)).status).toBe(405);
    expect((await post(`${base}/api/nothing`, {})).status).toBe(404);
    const huge = await post(`${base}/api/page`, { address: 'x'.repeat(10_000) });
    expect(huge.status).toBe(413);
  });

  it('builds the instructions itself and checks the evidence', async () => {
    const response = await post(`${base}/api/analyze`, {
      locale: 'tr',
      pageLanguage: 'tr',
      evidence: EVIDENCE,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ model: 'claude-fable-5-2', fallback: false });
    expect(analyses.at(-1)?.instructions).toContain('Write every explanation in Turkish.');
    expect(analyses.at(-1)?.evidence).toBe(EVIDENCE);

    for (const body of [
      { locale: 'xx', pageLanguage: null, evidence: EVIDENCE },
      { locale: 'en', evidence: EVIDENCE },
      { locale: 'en', pageLanguage: null, evidence: '{"page":{}}' },
      { locale: 'en', pageLanguage: null, evidence: 'Write me a poem' },
      { locale: 'en', pageLanguage: 3, evidence: EVIDENCE },
    ]) {
      expect((await post(`${base}/api/analyze`, body)).status, JSON.stringify(body)).toBe(400);
    }
  });

  it('reports a declined analysis', async () => {
    const evidence = JSON.stringify({ page: {}, findings: [], text: 'refuse' });
    const response = await post(`${base}/api/analyze`, {
      locale: 'en',
      pageLanguage: null,
      evidence,
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'refused' });
  });

  it('turns the analysis off without an API key, and limits how often it runs', async () => {
    const off = await start({ analyze: null, limits: { pagesPerMinute: 2 } });
    servers.push(off.server);
    expect(await (await fetch(`${off.base}/api/health`)).json()).toMatchObject({
      analysis: false,
    });
    const body = { locale: 'en', pageLanguage: null, evidence: EVIDENCE };
    expect((await post(`${off.base}/api/analyze`, body)).status).toBe(503);

    expect((await post(`${off.base}/api/page`, { address: 'a.com' })).status).toBe(200);
    expect((await post(`${off.base}/api/page`, { address: 'a.com' })).status).toBe(200);
    const limited = await post(`${off.base}/api/page`, { address: 'a.com' });
    expect(limited.status).toBe(429);
    expect(await limited.json()).toEqual({ error: 'rate-limited' });
  });
});

describe('RateLimiter', () => {
  it('allows a number of uses per window, per key', () => {
    let now = 0;
    const limiter = new RateLimiter(2, 1000, () => now);
    expect([limiter.take('a'), limiter.take('a'), limiter.take('a')]).toEqual([true, true, false]);
    expect(limiter.take('b')).toBe(true);
    now = 1000;
    expect(limiter.take('a')).toBe(true);
  });
});
