import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import type { Finding } from '../findings.ts';
import {
  displayWidth,
  isValidLanguageTag,
  normalizeUrl,
  reviewHtml,
  siteAddress,
  type PageReport,
} from './review.ts';

const parse = (html: string) => new JSDOM(html).window.document;

function review(html: string, url?: string): PageReport {
  const result = reviewHtml(html, parse, url === undefined ? {} : { url });
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.value;
}

function page(head: string, body = '<h1>Running shoes</h1>', htmlAttributes = 'lang="en"'): string {
  return `<!doctype html><html ${htmlAttributes}><head>${head}</head><body>${body}</body></html>`;
}

const GOOD_HEAD = [
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<title>Running shoes for trails and roads | Example</title>',
  '<meta name="description" content="Compare running shoes for trails and roads, with sizing advice.">',
  '<link rel="canonical" href="https://example.com/shoes">',
  '<meta property="og:title" content="Running shoes">',
  '<meta property="og:description" content="Compare running shoes.">',
  '<meta property="og:image" content="https://example.com/shoes.jpg">',
].join('');

function byRule(report: PageReport, rule: string): Finding[] {
  return report.findings.filter((f) => f.rule === rule);
}

function titleKey(report: PageReport, rule: string): string | undefined {
  return byRule(report, rule)[0]?.title.key;
}

describe('reviewHtml', () => {
  it('finds nothing to fix on a well-built page', () => {
    const report = review(
      page(GOOD_HEAD, '<h1>Shoes</h1><h2>Trail</h2><img src="a.jpg" alt="A trail shoe">'),
      'https://example.com/shoes',
    );
    expect(report.counts).toMatchObject({ attention: 0, review: 0 });
    expect(report.findings.map((f) => f.title.key)).toEqual(
      expect.arrayContaining([
        'page.head.ok',
        'page.robots.indexable',
        'page.title.ok',
        'page.description.ok',
        'page.lang.ok',
        'page.viewport.ok',
        'page.canonical.self',
        'page.headings.ok',
        'page.images.ok',
        'page.charset.ok',
        'page.social.ok',
      ]),
    );
    expect(report.limitations.map((m) => m.key)).toEqual(['page.limit.source', 'page.limit.scope']);
  });

  it('rejects empty input, oversized input and text that is not HTML', () => {
    expect(reviewHtml('  ', parse).diagnostics[0]?.code).toBe('page.empty');
    expect(
      reviewHtml('<p>x</p>', parse, { limits: { maxHtmlLength: 3 } }).diagnostics[0]?.code,
    ).toBe('page.too-large');
    expect(reviewHtml('https://example.com/', parse).diagnostics[0]?.code).toBe('page.not-html');
  });

  it('ignores an unusable page address but still reviews the page', () => {
    const result = reviewHtml(page(GOOD_HEAD), parse, { url: 'javascript:alert(1)' });
    expect(result.ok && result.value.url).toBeNull();
    expect(result.diagnostics.map((d) => d.code)).toEqual(['page.invalid-url']);
  });
});

describe('the head', () => {
  it('detects important tags pushed out of the head by an invalid element', () => {
    const report = review(
      page(
        '<title>Shoes</title><img src="pixel.gif"><link rel="canonical" href="https://example.com/"><meta name="robots" content="noindex">',
      ),
    );
    const [head] = byRule(report, 'page.head');
    expect(head).toMatchObject({
      status: 'attention',
      title: { key: 'page.head.broken', params: { count: 2 } },
    });
    expect(head?.evidence[0]?.value).toEqual({ kind: 'code', value: '<img src="pixel.gif">' });
    expect(head?.table?.rows).toEqual([
      [{ kind: 'code', value: '<link rel="canonical" href="https://example.com/">' }],
      [{ kind: 'code', value: '<meta name="robots" content="noindex">' }],
    ]);
    // Tags outside the head are ignored, so the misplaced noindex does not count as one.
    expect(titleKey(report, 'page.robots.noindex')).toBeUndefined();
    expect(titleKey(report, 'page.canonical')).toBe('page.canonical.missing');
  });

  it('names stray text that ends the head', () => {
    const report = review(
      page('<title>Shoes</title>Oops<link rel="canonical" href="https://example.com/">'),
    );
    expect(byRule(report, 'page.head')[0]?.evidence[0]?.value).toEqual({
      kind: 'code',
      value: 'Oops',
    });
  });

  it('is gentler about images inside noscript, which only some tools trip over', () => {
    const report = review(
      page(
        '<title>Shoes</title><noscript><img src="pixel.gif"></noscript><link rel="canonical" href="https://example.com/">',
      ),
    );
    expect(byRule(report, 'page.head')[0]).toMatchObject({
      status: 'review',
      title: { key: 'page.head.noscript' },
    });
  });
});

describe('titles and descriptions', () => {
  it('requires a title', () => {
    expect(byRule(review(page('')), 'page.title')[0]).toMatchObject({
      status: 'attention',
      title: { key: 'page.title.missing' },
    });
    expect(titleKey(review(page('<title> </title>')), 'page.title')).toBe('page.title.empty');
  });

  it('does not mistake an SVG icon’s title for the page title', () => {
    const report = review(page('', '<h1>Shoes</h1><svg><title>Cart icon</title></svg>'));
    expect(titleKey(report, 'page.title')).toBe('page.title.missing');
  });

  it('flags several titles, very short ones and long ones', () => {
    expect(titleKey(review(page('<title>One</title><title>Two</title>')), 'page.title')).toBe(
      'page.title.multiple',
    );
    expect(titleKey(review(page('<title>Home</title>')), 'page.title')).toBe('page.title.short');
    const long = review(page(`<title>${'Running shoes '.repeat(6)}</title>`));
    expect(byRule(long, 'page.title')[0]).toMatchObject({
      title: { key: 'page.title.long' },
      limitations: [{ key: 'page.limit.width' }],
    });
  });

  it('counts Chinese characters as wide when estimating title width', () => {
    expect(displayWidth('跑鞋')).toBe(4);
    expect(displayWidth('Shoes')).toBe(5);
    const report = review(
      page(`<title>${'跑步鞋专卖店'.repeat(6)}</title>`, '<h1>跑鞋</h1>', 'lang="zh-CN"'),
    );
    expect(titleKey(report, 'page.title')).toBe('page.title.long');
  });

  it('treats a missing description as optional but worth a look', () => {
    expect(
      byRule(review(page('<title>Running shoes guide</title>')), 'page.description')[0],
    ).toMatchObject({
      status: 'review',
      title: { key: 'page.description.missing' },
    });
    const long = `<meta name="description" content="${'Compare running shoes. '.repeat(10)}">`;
    expect(titleKey(review(page(long)), 'page.description')).toBe('page.description.long');
    const two = '<meta name="description" content="a"><meta name="DESCRIPTION" content="b">';
    expect(titleKey(review(page(two)), 'page.description')).toBe('page.description.multiple');
  });
});

describe('language, viewport and encoding', () => {
  it('requires a valid page language', () => {
    expect(titleKey(review(page('', '', '')), 'page.lang')).toBe('page.lang.missing');
    expect(titleKey(review(page('', '', 'lang="en_US"')), 'page.lang')).toBe('page.lang.invalid');
    expect(titleKey(review(page('', '', 'lang="tr"')), 'page.lang')).toBe('page.lang.ok');
  });

  it('validates language tags, including the common en-UK mistake', () => {
    expect(isValidLanguageTag('en-GB')).toBe(true);
    expect(isValidLanguageTag('zh-Hans')).toBe(true);
    expect(isValidLanguageTag('en-UK')).toBe(false);
    expect(isValidLanguageTag('uk-UA')).toBe(true);
    expect(isValidLanguageTag('english')).toBe(false);
  });

  it('checks the viewport, including blocked zoom', () => {
    expect(titleKey(review(page('')), 'page.viewport')).toBe('page.viewport.missing');
    for (const content of [
      'width=device-width, user-scalable=no',
      'width=device-width, maximum-scale=1',
    ]) {
      const report = review(page(`<meta name="viewport" content="${content}">`));
      expect(titleKey(report, 'page.viewport')).toBe('page.viewport.zoom-blocked');
    }
  });

  it('checks the declared character encoding', () => {
    expect(titleKey(review(page('')), 'page.charset')).toBe('page.charset.missing');
    expect(
      titleKey(
        review(page('<meta http-equiv="Content-Type" content="text/html; charset=windows-1254">')),
        'page.charset',
      ),
    ).toBe('page.charset.legacy');
    expect(titleKey(review(page('<meta charset="UTF-8">')), 'page.charset')).toBe(
      'page.charset.ok',
    );
  });
});

describe('indexing rules', () => {
  it('puts noindex first, whichever robots tag carries it', () => {
    for (const tag of [
      '<meta name="robots" content="noindex, follow">',
      '<meta name="googlebot" content="none">',
    ]) {
      const report = review(page(tag));
      expect(report.findings[0]).toMatchObject({
        rule: 'page.robots.noindex',
        status: 'attention',
      });
      expect(titleKey(report, 'page.robots.indexable')).toBeUndefined();
    }
  });

  it('reports nofollow and snippet limits', () => {
    const report = review(page('<meta name="robots" content="nofollow, max-snippet:0">'));
    expect(titleKey(report, 'page.robots.nofollow')).toBe('page.robots.nofollow');
    expect(titleKey(report, 'page.robots.limited')).toBe('page.robots.limited');
    expect(titleKey(report, 'page.robots.indexable')).toBe('page.robots.indexable');
  });

  it('checks canonical links against the page address', () => {
    const url = 'https://example.com/shoes';
    const canonical = (href: string) => page(`<link rel="canonical" href="${href}">`);
    expect(titleKey(review(page('')), 'page.canonical')).toBe('page.canonical.missing');
    expect(titleKey(review(canonical(url), url), 'page.canonical')).toBe('page.canonical.self');
    expect(titleKey(review(canonical('https://example.com/boots'), url), 'page.canonical')).toBe(
      'page.canonical.other-page',
    );
    expect(titleKey(review(canonical('https://other.example/shoes'), url), 'page.canonical')).toBe(
      'page.canonical.other-site',
    );
    expect(titleKey(review(canonical('https://example.com/shoes')), 'page.canonical')).toBe(
      'page.canonical.present',
    );
    expect(titleKey(review(canonical('https://exa mple.com/')), 'page.canonical')).toBe(
      'page.canonical.invalid',
    );

    const relative = review(canonical('/shoes'), url);
    expect(byRule(relative, 'page.canonical').map((f) => f.title.key)).toEqual([
      'page.canonical.relative',
    ]);
    const disagree = page(
      '<link rel="canonical" href="https://example.com/a"><link rel="canonical" href="https://example.com/b">',
    );
    expect(byRule(review(disagree), 'page.canonical')[0]).toMatchObject({
      status: 'attention',
      title: { key: 'page.canonical.multiple', params: { count: 2 } },
    });
  });

  it('resolves relative canonical links against the base element', () => {
    const html = page('<base href="https://example.com/shop/"><link rel="canonical" href="shoes">');
    const report = review(html, 'https://example.com/shop/shoes');
    expect(byRule(report, 'page.canonical').map((f) => f.title.key)).toEqual([
      'page.canonical.relative',
    ]);
  });
});

describe('structure and accessibility', () => {
  it('checks the heading outline', () => {
    expect(titleKey(review(page('', '<h2>Only</h2>')), 'page.headings.h1')).toBe('page.h1.missing');
    expect(titleKey(review(page('', '<h1>A</h1><h1>B</h1>')), 'page.headings.h1')).toBe(
      'page.h1.multiple',
    );
    const skipped = review(page('', '<h1>A</h1><h2>B</h2><h4>C</h4>'));
    expect(byRule(skipped, 'page.headings.order')[0]).toMatchObject({
      title: { key: 'page.headings.skipped', params: { from: 2, to: 4 } },
    });
    expect(titleKey(review(page('', '<h1>A</h1><h2></h2>')), 'page.headings.empty')).toBe(
      'page.headings.empty',
    );
    expect(
      titleKey(
        review(page('', '<h1><img src="logo.png" alt="Example shop"></h1>')),
        'page.headings.order',
      ),
    ).toBe('page.headings.ok');
  });

  it('requires text alternatives only for images people can perceive', () => {
    const report = review(
      page(
        '',
        '<h1>A</h1><img src="a.jpg"><img src="b.jpg" alt=""><img src="c.jpg" aria-hidden="true"><img src="d.jpg" role="presentation">',
      ),
    );
    expect(byRule(report, 'page.images.alt')[0]).toMatchObject({
      status: 'attention',
      title: { params: { count: 1 } },
      table: { rows: [[{ kind: 'code', value: 'a.jpg' }]] },
    });
  });

  it('requires every link to have a name', () => {
    const report = review(
      page(
        '',
        '<h1>A</h1><a href="/cart"><svg></svg></a><a href="/help" aria-label="Help"></a><a href="/home"><img src="h.svg" alt="Home"></a>',
      ),
    );
    expect(byRule(report, 'page.links.name')[0]).toMatchObject({ title: { params: { count: 1 } } });
  });

  it('flags links search engines cannot follow and summarizes the rest', () => {
    const report = review(
      page(
        '',
        '<h1>A</h1><a href="javascript:void(0)">Menu</a><a href="/a">A</a><a href="https://example.com/b">B</a><a href="https://other.example/" rel="nofollow sponsored">C</a><a href="mailto:hi@example.com">Mail</a>',
      ),
      'https://example.com/',
    );
    expect(titleKey(report, 'page.links.crawlable')).toBe('page.links.javascript');
    expect(byRule(report, 'page.links.summary')[0]).toMatchObject({
      title: { params: { total: 3, internal: 2, external: 1 } },
      summary: { key: 'page.links.nofollow', params: { count: 1 } },
    });
  });
});

describe('structured data, languages and link previews', () => {
  it('reads JSON-LD, including types inside @graph, and flags broken blocks', () => {
    const json = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'Organization' }, { '@type': ['Product', 'Thing'] }],
    });
    const report = review(
      page(
        `<script type="application/ld+json">${json}</script><script type="application/ld+json">{ broken </script>`,
      ),
    );
    expect(byRule(report, 'page.structured-data.valid')[0]).toMatchObject({
      status: 'attention',
      title: { params: { count: 1 } },
    });
    expect(byRule(report, 'page.structured-data.types')[0]?.title.params?.['types']).toEqual({
      kind: 'list',
      values: ['Organization', 'Product', 'Thing'],
    });
  });

  it('validates language annotations and reminds that return links matter', () => {
    const invalid = review(
      page('<link rel="alternate" hreflang="en-UK" href="https://example.com/uk">'),
    );
    expect(titleKey(invalid, 'page.hreflang')).toBe('page.hreflang.invalid');

    const html = page(
      '<link rel="alternate" hreflang="en" href="https://example.com/en"><link rel="alternate" hreflang="x-default" href="https://example.com/">',
    );
    expect(
      byRule(review(html, 'https://example.com/tr'), 'page.hreflang').map((f) => f.title.key),
    ).toEqual(['page.hreflang.no-self', 'page.hreflang.ok']);
    expect(byRule(review(html, 'https://example.com/en'), 'page.hreflang')[0]).toMatchObject({
      title: { key: 'page.hreflang.ok', params: { count: 2 } },
      limitations: [{ key: 'page.hreflang.limit' }],
    });
  });

  it('notes missing link preview tags without overstating them', () => {
    const report = review(page('<meta property="og:title" content="Shoes">'));
    expect(byRule(report, 'page.social')[0]).toMatchObject({
      status: 'info',
      title: { params: { tags: { kind: 'list', values: ['og:description', 'og:image'] } } },
    });
  });
});

describe('normalizeUrl', () => {
  it('accepts only absolute http(s) addresses without credentials', () => {
    expect(normalizeUrl('HTTPS://Example.com:443/a')).toBe('https://example.com/a');
    expect(normalizeUrl('/a', 'https://example.com/b')).toBe('https://example.com/a');
    expect(normalizeUrl('ftp://example.com/')).toBeNull();
    expect(normalizeUrl('https://user:pass@example.com/')).toBeNull();
    expect(normalizeUrl('not a url')).toBeNull();
  });
});

describe('page facts', () => {
  it('describes what the page shows search engines and visitors', () => {
    const report = review(
      page(
        `${GOOD_HEAD}<meta name="robots" content="max-snippet:50"><meta name="googlebot" content="noarchive">` +
          '<link rel="alternate" hreflang="de" href="https://example.com/de/shoes">' +
          '<script type="application/ld+json">{"@type":"Product","name":"Shoe"}</script>',
        '<h1>Running shoes</h1><p>Light shoes for long runs.</p><h2>Sizing</h2>' +
          '<img src="a.jpg"><img src="b.jpg" alt=""><img src="c.jpg" alt="Trail shoe">' +
          '<a href="/a">Trails</a><a href="https://www.example.com/b">Roads</a>' +
          '<a href="https://other.org/" rel="nofollow">Elsewhere</a><a href="/c"></a>' +
          '<a href="mailto:hi@example.com">Mail</a>',
      ),
      'https://example.com/shoes',
    );
    expect(report.facts).toMatchObject({
      title: 'Running shoes for trails and roads | Example',
      description: 'Compare running shoes for trails and roads, with sizing advice.',
      lang: 'en',
      canonical: 'https://example.com/shoes',
      robots: 'max-snippet:50; googlebot: noarchive',
      headings: [
        { level: 1, text: 'Running shoes' },
        { level: 2, text: 'Sizing' },
      ],
      headingCount: 2,
      images: { total: 3, missingAlt: 1, decorative: 1 },
      links: { total: 5, internal: 3, external: 1, nofollow: 1, unnamed: 1 },
      structuredData: ['Product'],
      social: {
        title: 'Running shoes',
        description: 'Compare running shoes.',
        image: 'https://example.com/shoes.jpg',
      },
      languageVersions: 1,
    });
    expect(report.facts.words).toBe(12);
    expect(report.facts.textSample).toContain('Light shoes for long runs.');
    expect(report.http).toBeNull();
  });

  it('reads only text a visitor can see', () => {
    const report = review(
      page(
        '<title>Shop</title><style>p{color:red}</style>',
        '<h1>Shop</h1><script>var secret = 1;</script><noscript>Enable JavaScript</noscript>' +
          '<div hidden><p>Hidden promo</p></div><template><p>Template</p></template>' +
          '<svg><text>Chart label</text></svg><p>Open   every\nday</p>',
      ),
    );
    expect(report.facts.textSample).toBe('Shop Open every day');
    expect(report.facts.words).toBe(4);
  });

  it('keeps empty values out and lists at most the first headings', () => {
    const headings = Array.from({ length: 70 }, (_, i) => `<h2>Part ${String(i)}</h2>`).join('');
    const report = review(page('<title> </title>', `<h1>Guide</h1>${headings}`, 'lang=" "'));
    expect(report.facts).toMatchObject({ title: null, lang: null, robots: null, canonical: null });
    expect(report.facts.headings).toHaveLength(60);
    expect(report.facts.headingCount).toBe(71);
  });

  it('adds the server’s answer when the page was fetched by its address', () => {
    const result = reviewHtml(page(GOOD_HEAD), parse, {
      url: 'https://example.com/shoes',
      http: {
        requestedUrl: 'https://example.com/shoes',
        finalUrl: 'https://example.com/shoes',
        status: 200,
        redirects: [],
        elapsedMs: 300,
        bytes: 2000,
        contentType: 'text/html',
        contentEncoding: null,
        xRobotsTag: 'noindex',
        hsts: false,
        robotsTxt: { found: true, allowsPage: true, rule: null, sitemaps: [] },
      },
    });
    if (!result.ok) throw new Error('fixture');
    expect(result.value.http?.status).toBe(200);
    expect(result.value.findings[0]?.rule).toBe('http.x-robots-tag');
    const indexable = result.value.findings.find((f) => f.rule === 'page.robots.indexable');
    expect(indexable?.summary).toBeUndefined();
    expect(result.value.limitations.map((m) => m.key)).toEqual([
      'page.limit.fetched',
      'page.limit.scope.fetched',
    ]);
  });
});

describe('siteAddress', () => {
  it('reads addresses the way people type them', () => {
    expect(siteAddress('atelance.com')).toBe('https://atelance.com/');
    expect(siteAddress('  www.example.com/shop?x=1 ')).toBe('https://www.example.com/shop?x=1');
    expect(siteAddress('http://example.com')).toBe('http://example.com/');
    expect(siteAddress('//example.com/a')).toBe('https://example.com/a');
    expect(siteAddress('example.com:8443/a')).toBe('https://example.com:8443/a');
    expect(siteAddress('[2001:db8::1]')).toBe('https://[2001:db8::1]/');
    expect(siteAddress('ÖRNEK.com.tr')).toBe('https://xn--rnek-4qa.com.tr/');
  });

  it('refuses text that cannot be a website', () => {
    for (const value of [
      '',
      'localhost',
      'my site.com',
      'ftp://example.com',
      'user:pw@example.com',
      'mailto:a@b.co',
    ]) {
      expect(siteAddress(value), value).toBeNull();
    }
  });
});
