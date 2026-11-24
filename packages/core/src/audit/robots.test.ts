import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parseRobots, ROBOTS_MAX_CHARS, robotsAllows, robotsRule } from './robots.ts';

describe('parseRobots', () => {
  it('groups consecutive user-agent lines and collects sitemaps', () => {
    const robots = parseRobots(
      [
        '# Shop rules',
        'User-agent: Googlebot',
        'User-agent: Bingbot # both crawlers',
        'Disallow: /cart',
        'Allow: /cart/help',
        '',
        'user-agent: *',
        'disallow:',
        'Disallow: /admin',
        'Sitemap: https://example.com/sitemap.xml',
        'Crawl-delay: 10',
        'not a rule',
      ].join('\r\n'),
    );
    expect(robots.groups).toEqual([
      {
        agents: ['googlebot', 'bingbot'],
        rules: [
          { allow: false, path: '/cart' },
          { allow: true, path: '/cart/help' },
        ],
      },
      { agents: ['*'], rules: [{ allow: false, path: '/admin' }] },
    ]);
    expect(robots.sitemaps).toEqual(['https://example.com/sitemap.xml']);
  });

  it('starts a new group when a user-agent line follows rules', () => {
    const robots = parseRobots('User-agent: a\nDisallow: /x\nUser-agent: b\nDisallow: /y');
    expect(robots.groups.map((g) => g.agents)).toEqual([['a'], ['b']]);
  });

  it('ignores rules before any group and reads only the first 500 KiB', () => {
    expect(parseRobots('Disallow: /\n').groups).toEqual([]);
    const padded = `User-agent: *\n${'#'.repeat(ROBOTS_MAX_CHARS)}\nDisallow: /`;
    expect(parseRobots(padded).groups[0]?.rules).toEqual([]);
  });
});

describe('robotsAllows', () => {
  const robots = parseRobots(
    [
      'User-agent: *',
      'Disallow: /private',
      'Allow: /private/press',
      'Disallow: /*.pdf$',
      'Disallow: /search?',
      '',
      'User-agent: Googlebot-Image',
      'Disallow: /',
    ].join('\n'),
  );

  it('names the rule that decided', () => {
    expect(robotsRule(robots, 'Googlebot', '/private/press/a')).toEqual({
      allow: true,
      path: '/private/press',
    });
    expect(robotsRule(robots, 'Googlebot', '/')).toBeNull();
  });

  it('follows the longest matching rule', () => {
    expect(robotsAllows(robots, 'Googlebot', '/')).toBe(true);
    expect(robotsAllows(robots, 'Googlebot', '/private/plans')).toBe(false);
    expect(robotsAllows(robots, 'Googlebot', '/private/press/2026')).toBe(true);
  });

  it('understands * and a final $', () => {
    expect(robotsAllows(robots, 'Googlebot', '/files/report.pdf')).toBe(false);
    expect(robotsAllows(robots, 'Googlebot', '/files/report.pdf?v=2')).toBe(true);
    expect(robotsAllows(robots, 'Googlebot', '/search?q=shoes')).toBe(false);
    expect(robotsAllows(robots, 'Googlebot', '/search-tips')).toBe(true);
  });

  it('uses a crawler’s own group instead of the * group', () => {
    expect(robotsAllows(robots, 'Googlebot-Image', '/photos/a.jpg')).toBe(false);
    expect(robotsAllows(robots, 'googlebot-image', '/')).toBe(false);
  });

  it('lets Allow win a tie and allows everything without rules', () => {
    const tie = parseRobots('User-agent: *\nDisallow: /page\nAllow: /page');
    expect(robotsAllows(tie, 'Googlebot', '/page')).toBe(true);
    expect(robotsAllows(parseRobots(''), 'Googlebot', '/anything')).toBe(true);
  });

  it('compares decoded paths, so encoded addresses match their rules', () => {
    const encoded = parseRobots('User-agent: *\nDisallow: /ürün');
    expect(robotsAllows(encoded, 'Googlebot', '/%C3%BCr%C3%BCn/1')).toBe(false);
    expect(robotsAllows(encoded, 'Googlebot', '/%E0%A4%A')).toBe(true);
    const encodedRule = parseRobots('User-agent: *\nDisallow: /%C3%BCr%C3%BCn');
    expect(robotsAllows(encodedRule, 'Googlebot', '/ürün/1')).toBe(false);
  });

  it('never throws, whatever the file and path', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (text, path) => {
        const allowed = robotsAllows(parseRobots(text), 'Googlebot', `/${path}`);
        expect(typeof allowed).toBe('boolean');
      }),
    );
  });
});
