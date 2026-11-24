import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { gzipSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FetchError, fetchPage, type FetchOptions } from './fetch-page.ts';

type Route = (request: http.IncomingMessage, response: http.ServerResponse) => void;

const PAGE = '<!doctype html><html lang="en"><head><title>Shoes</title></head><body></body></html>';

let robots: Route = (_request, response) => {
  response.writeHead(404).end();
};

const routes: Record<string, Route> = {
  '/': (_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(PAGE);
  },
  '/gzip': (_request, response) => {
    const body = gzipSync(PAGE);
    response.writeHead(200, { 'content-type': 'text/html', 'content-encoding': 'gzip' }).end(body);
  },
  '/a': (_request, response) => {
    response.writeHead(301, { location: '/b' }).end();
  },
  '/b': (_request, response) => {
    response.writeHead(302, { location: `${base}/` }).end();
  },
  '/loop': (_request, response) => {
    response.writeHead(302, { location: '/loop' }).end();
  },
  '/json': (_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' }).end('{}');
  },
  '/missing': (_request, response) => {
    response.writeHead(404, { 'content-type': 'text/html' }).end('<html><h1>Not found</h1></html>');
  },
  '/broken': (_request, response) => {
    response.writeHead(500, { 'content-type': 'text/plain' }).end('Server error');
  },
  '/big': (_request, response) => {
    response
      .writeHead(200, { 'content-type': 'text/html' })
      .end(`<html>${'x'.repeat(5000)}</html>`);
  },
  '/hidden': (_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex' }).end(PAGE);
  },
  '/turkish': (_request, response) => {
    // "Çay" in windows-1254, declared only by the server.
    response
      .writeHead(200, { 'content-type': 'text/html; charset=windows-1254' })
      .end(Buffer.from([0x3c, 0x68, 0x31, 0x3e, 0xc7, 0x61, 0x79, 0x3c, 0x2f, 0x68, 0x31, 0x3e]));
  },
  '/meta-charset': (_request, response) => {
    response
      .writeHead(200, { 'content-type': 'text/html' })
      .end(
        Buffer.from(
          '<html><head><meta charset="iso-8859-9"></head><body>\xdd</body></html>',
          'latin1',
        ),
      );
  },
  '/no-type': (_request, response) => {
    response.writeHead(200).end(PAGE);
  },
  '/slow': () => {
    // Never answers.
  },
  '/robots.txt': (request, response) => {
    robots(request, response);
  },
};

let server: http.Server;
let base = '';
const local: FetchOptions = { allowPrivateNetwork: true };

beforeAll(async () => {
  server = http.createServer((request, response) => {
    const route = routes[new URL(request.url ?? '/', 'http://x').pathname];
    if (route === undefined) response.writeHead(404).end();
    else route(request, response);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

async function failure(input: string, options: FetchOptions = local): Promise<string> {
  try {
    await fetchPage(input, options);
  } catch (error) {
    if (error instanceof FetchError) return error.code;
    throw error;
  }
  throw new Error('expected the fetch to fail');
}

describe('fetchPage', () => {
  it('returns the HTML and what the server said', async () => {
    const page = await fetchPage(`${base}/`, local);
    expect(page.html).toBe(PAGE);
    expect(page.http).toMatchObject({
      requestedUrl: `${base}/`,
      finalUrl: `${base}/`,
      status: 200,
      redirects: [],
      bytes: PAGE.length,
      contentType: 'text/html; charset=utf-8',
      contentEncoding: null,
      xRobotsTag: null,
      hsts: false,
      robotsTxt: { found: false, allowsPage: true, rule: null, sitemaps: [] },
    });
    expect(page.http.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('decompresses gzip and reports the bytes as sent', async () => {
    const page = await fetchPage(`${base}/gzip`, local);
    expect(page.html).toBe(PAGE);
    expect(page.http.contentEncoding).toBe('gzip');
    expect(page.http.bytes).toBe(gzipSync(PAGE).length);
  });

  it('follows redirects and lists them', async () => {
    const page = await fetchPage(`${base}/a`, local);
    expect(page.http.finalUrl).toBe(`${base}/`);
    expect(page.http.redirects).toEqual([
      { url: `${base}/a`, status: 301 },
      { url: `${base}/b`, status: 302 },
    ]);
  });

  it('keeps error pages that are HTML, so their status can be reviewed', async () => {
    const page = await fetchPage(`${base}/missing`, local);
    expect(page.http.status).toBe(404);
    expect(page.html).toContain('Not found');
  });

  it('decodes the encoding the server or the page declares', async () => {
    expect((await fetchPage(`${base}/turkish`, local)).html).toContain('Çay');
    expect((await fetchPage(`${base}/meta-charset`, local)).html).toContain('İ');
    expect((await fetchPage(`${base}/no-type`, local)).html).toBe(PAGE);
  });

  it('reports the X-Robots-Tag header', async () => {
    expect((await fetchPage(`${base}/hidden`, local)).http.xRobotsTag).toBe('noindex');
  });

  it('reads robots.txt as Googlebot does', async () => {
    robots = (_request, response) => {
      response
        .writeHead(200, { 'content-type': 'text/plain' })
        .end('User-agent: *\nDisallow: /hidden\nSitemap: https://example.com/sitemap.xml');
    };
    expect((await fetchPage(`${base}/hidden`, local)).http.robotsTxt).toEqual({
      found: true,
      allowsPage: false,
      rule: 'Disallow: /hidden',
      sitemaps: ['https://example.com/sitemap.xml'],
    });
    expect((await fetchPage(`${base}/`, local)).http.robotsTxt?.allowsPage).toBe(true);

    robots = (_request, response) => {
      response.writeHead(503).end();
    };
    expect((await fetchPage(`${base}/`, local)).http.robotsTxt).toBeNull();
    robots = (_request, response) => {
      response.writeHead(404).end();
    };
  });

  it('explains why a page could not be fetched', async () => {
    expect(await failure('not an address')).toBe('invalid-address');
    expect(await failure(`${base}/loop`)).toBe('too-many-redirects');
    expect(await failure(`${base}/json`)).toBe('not-html');
    expect(await failure(`${base}/broken`)).toBe('http-status');
    expect(await failure(`${base}/big`, { ...local, maxBytes: 1000 })).toBe('too-large');
    expect(await failure(`${base}/slow`, { ...local, timeoutMs: 300 })).toBe('timeout');
  });

  it('never connects to this machine or a private network', async () => {
    expect(await failure(`${base}/`, {})).toBe('blocked-address');
    expect(await failure('http://127.0.0.1/', {})).toBe('blocked-address');
    expect(await failure('http://[::1]/', {})).toBe('blocked-address');
    const resolve = (addresses: string[]) => () =>
      Promise.resolve(
        addresses.map((address) => ({ address, family: address.includes(':') ? 6 : 4 })),
      );
    expect(await failure('https://intranet.example/', { resolve: resolve(['10.0.0.5']) })).toBe(
      'blocked-address',
    );
    // A public decoy next to a private address does not help.
    expect(
      await failure('https://mixed.example/', {
        resolve: resolve(['93.184.216.34', '192.168.0.2']),
      }),
    ).toBe('blocked-address');
    expect(
      await failure('https://metadata.example/', { resolve: resolve(['169.254.169.254']) }),
    ).toBe('blocked-address');
  });

  it('refuses non-standard ports and unknown names', async () => {
    expect(await failure('https://example.com:8443/', {})).toBe('blocked-address');
    expect(
      await failure('https://no-such-host.example/', {
        resolve: () => Promise.reject(new Error('ENOTFOUND')),
      }),
    ).toBe('unknown-host');
    expect(await failure('https://empty.example/', { resolve: () => Promise.resolve([]) })).toBe(
      'unknown-host',
    );
  });
});
