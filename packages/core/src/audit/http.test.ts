import { describe, expect, it } from 'vitest';
import { reviewHttp, robotsAddress, type HttpFacts } from './http.ts';

const HEALTHY: HttpFacts = {
  requestedUrl: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 200,
  redirects: [],
  elapsedMs: 420,
  bytes: 18_000,
  contentType: 'text/html; charset=utf-8',
  contentEncoding: 'br',
  xRobotsTag: null,
  hsts: true,
  robotsTxt: { found: true, allowsPage: true, rule: null, sitemaps: [] },
};

const rules = (facts: Partial<HttpFacts>) =>
  reviewHttp({ ...HEALTHY, ...facts }).map((f) => `${f.status} ${f.rule}`);

describe('reviewHttp', () => {
  it('confirms a page served over HTTPS that search engines may crawl and index', () => {
    const [ok] = reviewHttp(HEALTHY);
    expect(rules({})).toEqual(['good http.ok']);
    expect(ok?.evidence.map((e) => e.value)).toEqual([
      { kind: 'code', value: '200' },
      { kind: 'decimal', value: 0.42, digits: 2 },
    ]);
  });

  it('flags error statuses with the code as written', () => {
    const [status] = reviewHttp({ ...HEALTHY, status: 404 });
    expect(status?.rule).toBe('http.status');
    expect(status?.title.params).toEqual({ status: { kind: 'code', value: '404' } });
    expect(rules({ status: 503 })).toEqual(['attention http.status']);
  });

  it('flags pages served without HTTPS', () => {
    expect(rules({ finalUrl: 'http://example.com/' })).toEqual(['attention http.https']);
  });

  it('reads noindex and none in the X-Robots-Tag header, also per crawler', () => {
    expect(rules({ xRobotsTag: 'noindex, nofollow' })).toEqual(['attention http.x-robots-tag']);
    expect(rules({ xRobotsTag: 'googlebot: none' })).toEqual(['attention http.x-robots-tag']);
    expect(rules({ xRobotsTag: 'noarchive' })).toEqual(['good http.ok']);
    expect(rules({ xRobotsTag: 'max-snippet:-1, noindexed-not-a-rule' })).toEqual(['good http.ok']);
  });

  it('flags a page robots.txt blocks, naming the rule', () => {
    const [blocked] = reviewHttp({
      ...HEALTHY,
      robotsTxt: { found: true, allowsPage: false, rule: 'Disallow: /', sitemaps: [] },
    });
    expect(blocked?.rule).toBe('http.robots-txt');
    expect(blocked?.evidence[1]?.value).toEqual({ kind: 'code', value: 'Disallow: /' });
  });

  it('asks for a look when robots.txt could not be read, without calling the page fine', () => {
    expect(rules({ robotsTxt: null })).toEqual(['review http.robots-txt.unreadable']);
    expect(
      rules({ robotsTxt: { found: false, allowsPage: true, rule: null, sitemaps: [] } }),
    ).toEqual(['good http.ok']);
  });

  it('lists chains of two or more redirects', () => {
    const redirects = [
      { url: 'http://example.com/', status: 301 },
      { url: 'https://example.com/', status: 302 },
    ];
    expect(rules({ redirects: redirects.slice(0, 1) })).toEqual(['good http.ok']);
    const [chain] = reviewHttp({ ...HEALTHY, redirects }).filter(
      (f) => f.rule === 'http.redirects',
    );
    expect(chain?.status).toBe('review');
    expect(chain?.evidence[0]?.value).toEqual({
      kind: 'list',
      values: ['301 http://example.com/', '302 https://example.com/'],
    });
  });
});

describe('robotsAddress', () => {
  it('points to robots.txt at the root of the page’s host', () => {
    expect(robotsAddress('https://example.com:8443/a/b?c=1')).toBe(
      'https://example.com:8443/robots.txt',
    );
  });
});
