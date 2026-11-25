import { extractSnapshot, reviewHtml } from '@searchunveil/core';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { parseHtml } from './dom.ts';

/** The engine's own tests parse with jsdom, which follows the HTML standard as browsers do. */
const browser = (html: string) => new JSDOM(html).window.document;
const URL = 'https://example.com/page';

const PAGES: Record<string, string> = {
  'a complete page': `<!doctype html><html lang="tr"><head><meta charset="utf-8">
    <title>Koşu ayakkabıları | Örnek</title>
    <meta name="description" content="Hafif koşu ayakkabıları.">
    <meta name="robots" content="index, follow"><meta name="viewport" content="width=device-width">
    <link rel="canonical" href="https://example.com/page">
    <link rel="alternate" hreflang="en" href="https://example.com/en/page">
    <meta property="og:title" content="Koşu"><meta property="og:image" content="/i.jpg">
    <script type="application/ld+json">{"@type":["Product","Thing"],"offers":{"@type":"Offer"}}</script>
    <style>p{color:red}</style></head>
    <body><nav><a href="/">Ana sayfa</a> <a href="/x" aria-label="Sepet"></a></nav>
    <h1>Koşu ayakkabıları</h1><h2 hidden>Gizli</h2><p>Hafif ve <b>rahat</b> modeller.</p>
    <ul><li>Bir</li><li>İki</li></ul><img src="a.jpg" alt="Ayakkabı"><img src="b.jpg">
    <a href="/y" id="ly"><img src="c.png" alt="Logo"></a><span id="lbl">Etiket</span>
    <a href="/z" aria-labelledby="lbl"></a><a href="/t" title="Başlık"></a>
    <table><tr><td>Hücre</td></tr></table><script>var x = 1;</script>
    <noscript><p>JavaScript kapalı</p></noscript><template><h1>Şablon</h1></template>
    <footer>© Örnek</footer></body></html>`,
  'a head ended by a div': `<html><head><title>T</title><div>x</div>
    <link rel="canonical" href="/c"><meta name="description" content="d"></head><body>B</body></html>`,
  'a head ended by text': `<head><title>T</title>Hello<meta name="robots" content="noindex"></head>`,
  'noscript in the head': `<head><noscript><link rel="stylesheet" href="a.css"></noscript>
    <meta name="viewport" content="width=device-width"></head><body><p>x</p></body>`,
  'an image in a noscript in the head': `<head><noscript><img src="p.gif"></noscript>
    <link rel="canonical" href="/x"></head><body>y</body>`,
  'SVG titles and links': `<body><svg><title>Icon</title><a xlink:href="/x"><text>t</text></a>
    <a href="/y">y</a></svg><h1>Hi</h1><math><mi>x</mi></math></body>`,
  templates: `<head><template><meta name="description" content="hidden"></template></head>
    <body><template><h1>no</h1></template><h1>Yes</h1></body>`,
  'capital letters': `<HTML LANG="EN"><HEAD><META NAME="Description" CONTENT="Up">
    <LINK REL="Canonical" HREF="https://e.com/"></HEAD><BODY><H2>Up</H2><IMG SRC="u.png"></BODY></HTML>`,
  'a fragment': '<p>Just a paragraph</p>',
  'charset and base': `<head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-9">
    <base href="https://e.com/base/"></head><body><a href="rel">r</a></body>`,
  'a frameset':
    '<html><head><title>F</title></head><frameset><frame src="a.html"></frameset></html>',
  'a fostered paragraph': '<table><tr><td>a</td></tr><p>foster</p></table><h1>After</h1>',
  'comments and a late doctype': '<!-- c --><!doctype html><p>x<!-- y -->z</p><title>Late</title>',
  'unclosed tags': '<p>one<p>two<div>three<li>four<h1>five<h2>six',
};

describe('parseHtml', () => {
  it.each(Object.entries(PAGES))('reads %s as a browser does', (_, html) => {
    expect(extractSnapshot(parseHtml(html), URL)).toEqual(extractSnapshot(browser(html), URL));
  });

  it('gives the same review as a browser', () => {
    for (const html of Object.values(PAGES)) {
      expect(reviewHtml(html, parseHtml, { url: URL })).toEqual(
        reviewHtml(html, browser, { url: URL }),
      );
    }
  });

  it('matches a browser on generated markup', () => {
    const pieces = [
      '<head>',
      '</head>',
      '<body>',
      '</body>',
      '<title>T</title>',
      '<title>',
      '<meta name="description" content="d">',
      '<meta name="robots" content="noindex">',
      '<meta name="viewport" content="width=device-width">',
      '<meta charset="utf-8">',
      '<meta property="og:title" content="o">',
      '<link rel="canonical" href="/c">',
      '<link rel="alternate" hreflang="de" href="/de">',
      '<base href="/b/">',
      '<script>x</script>',
      '<style>s</style>',
      '<noscript>',
      '</noscript>',
      '<template>',
      '</template>',
      '<div>',
      '</div>',
      '<p>',
      '</p>',
      '<span hidden>',
      '</span>',
      '<a href="/l">',
      '</a>',
      '<img src="i.png">',
      '<img alt="A">',
      '<h1>',
      '</h1>',
      '<h2>',
      '</h2>',
      '<svg>',
      '</svg>',
      '<table>',
      '<tr>',
      '<td>',
      '</table>',
      '<li>',
      'text ',
      'Söz ',
      '<!-- c -->',
      '<br>',
      '<select><option>o</option></select>',
      '<frameset>',
      '<textarea>t</textarea>',
    ];
    const html = fc
      .tuple(
        fc.constantFrom('', '<!doctype html>', '<!doctype html><html><head>'),
        fc.array(fc.constantFrom(...pieces), { maxLength: 40 }),
      )
      .map(([start, rest]) => start + rest.join(''));
    fc.assert(
      fc.property(html, (markup) => {
        expect(extractSnapshot(parseHtml(markup), URL)).toEqual(
          extractSnapshot(browser(markup), URL),
        );
      }),
      { numRuns: 300 },
    );
  });

  it('reads deeply nested pages without exhausting the stack', () => {
    const depth = 20_000;
    const html = `${'<div>'.repeat(depth)}deep${'</div>'.repeat(depth)}`;
    expect(extractSnapshot(parseHtml(html), URL).words).toBe(1);
  });

  it('refuses selectors it cannot read, rather than answer wrongly', () => {
    const document = parseHtml('<p>x</p>');
    expect(() => document.querySelectorAll('div > p')).toThrow(SyntaxError);
    expect(document.querySelectorAll('p').length).toBe(1);
  });
});
