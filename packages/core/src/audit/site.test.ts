import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { createZip } from '../test-support/zip-writer.ts';
import { pageAddress, reviewSite, sharedFolder, type SiteReport } from './site.ts';

const parse = (html: string) => new JSDOM(html).window.document;

const page = (title: string, description = '') =>
  [
    '<!doctype html><html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    title === '' ? '' : `<title>${title}</title>`,
    description === '' ? '' : `<meta name="description" content="${description}">`,
    `</head><body><h1>${title || 'Untitled'}</h1></body></html>`,
  ].join('');

async function siteZip(): Promise<Uint8Array> {
  return createZip([
    { name: 'atelance/', data: '', method: 'stored' },
    {
      name: 'atelance/index.html',
      data: page('Atelance studio for brand design', 'Brand identity and websites.'),
    },
    { name: 'atelance/about/index.html', data: page('About the Atelance studio team') },
    { name: 'atelance/contact.html', data: page('') },
    { name: 'atelance/img/logo.png', data: new Uint8Array([0x89, 0x50, 0x4e, 0x47]) },
    { name: 'atelance/css/site.css', data: 'body{}' },
    { name: '__MACOSX/atelance/._index.html', data: 'resource fork' },
  ]);
}

async function review(...args: Parameters<typeof reviewSite>): Promise<SiteReport> {
  const result = await reviewSite(...args);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.value;
}

describe('reviewSite', () => {
  it('reviews every page in an archive and leaves the other files unread', async () => {
    const report = await review([{ name: 'site.zip', bytes: await siteZip() }], parse);
    expect(report.pages.map((p) => p.path).sort()).toEqual([
      'about/index.html',
      'contact.html',
      'index.html',
    ]);
    expect(report.otherFiles).toBe(2);
    expect(report.skipped).toEqual([]);
    // The page without a title has the most to fix, so it comes first.
    expect(report.pages[0]?.path).toBe('contact.html');
    expect(report.pages[0]?.report.title).toBeNull();
    expect(report.pages.find((p) => p.path === 'index.html')?.report.title).toBe(
      'Atelance studio for brand design',
    );
  });

  it('counts on how many pages each issue appears, the most widespread first', async () => {
    const report = await review([{ name: 'site.zip', bytes: await siteZip() }], parse);
    const description = report.issues.find((issue) => issue.rule === 'page.description');
    expect(description?.pages).toEqual(['contact.html', 'about/index.html']);
    const title = report.issues.find((issue) => issue.rule === 'page.title');
    expect(title?.status).toBe('attention');
    expect(title?.pages).toEqual(['contact.html']);
    const statuses = report.issues.map((issue) => issue.status);
    expect(statuses).toEqual(
      [...statuses].sort((a, b) => (a === b ? 0 : a === 'attention' ? -1 : 1)),
    );
    const total = report.pages.reduce((sum, p) => sum + p.report.counts.attention, 0);
    expect(report.counts.attention).toBe(total);
  });

  it('gives each page its address when the site address is known', async () => {
    const report = await review([{ name: 'site.zip', bytes: await siteZip() }], parse, {
      siteUrl: 'https://atelance.com',
    });
    const urls = Object.fromEntries(report.pages.map((p) => [p.path, p.report.url]));
    expect(urls).toEqual({
      'index.html': 'https://atelance.com/',
      'about/index.html': 'https://atelance.com/about/',
      'contact.html': 'https://atelance.com/contact.html',
    });
  });

  it('accepts HTML files chosen directly', async () => {
    const encoder = new TextEncoder();
    const report = await review(
      [
        { name: 'home.html', bytes: encoder.encode(page('Home of the example shop', 'Shoes.')) },
        { name: 'notes.txt', bytes: encoder.encode('not a page') },
      ],
      parse,
    );
    expect(report.pages.map((p) => p.path)).toEqual(['home.html']);
    expect(report.otherFiles).toBe(1);
  });

  it('lists pages it could not review, and why', async () => {
    const report = await review(
      [
        {
          name: 'site.zip',
          bytes: await createZip([
            { name: 'good.html', data: page('A page with a proper title') },
            { name: 'empty.html', data: '' },
          ]),
        },
      ],
      parse,
    );
    expect(report.pages.map((p) => p.path)).toEqual(['good.html']);
    expect(report.skipped).toEqual([
      { path: 'empty.html', diagnostics: [expect.objectContaining({ code: 'input.empty' })] },
    ]);
  });

  it('says so when no file is a web page', async () => {
    const result = await reviewSite(
      [{ name: 'photos.zip', bytes: await createZip([{ name: 'a.jpg', data: 'x' }]) }],
      parse,
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map((d) => d.code)).toEqual(['site.no-pages']);
  });

  it('reports progress and can be stopped between pages', async () => {
    const progress: [number, number][] = [];
    const report = await review([{ name: 'site.zip', bytes: await siteZip() }], parse, {
      onProgress: (done, total) => progress.push([done, total]),
    });
    expect(report.pages).toHaveLength(3);
    expect(progress).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);

    const controller = new AbortController();
    const stopped = reviewSite([{ name: 'site.zip', bytes: await siteZip() }], parse, {
      signal: controller.signal,
      onProgress: (done) => {
        if (done === 1) controller.abort();
      },
    });
    await expect(stopped).rejects.toThrow();
  });
});

describe('sharedFolder', () => {
  it('finds the folder every path starts with', () => {
    expect(sharedFolder(['site/index.html', 'site/a/b.html'])).toBe('site/');
    expect(sharedFolder(['backup/public_html/index.html', 'backup/public_html/x.css'])).toBe(
      'backup/public_html/',
    );
    expect(sharedFolder(['index.html', 'site/a.html'])).toBe('');
    expect(sharedFolder(['blog/post.html'])).toBe('blog/');
    expect(sharedFolder([])).toBe('');
  });
});

describe('pageAddress', () => {
  it('serves index pages at their folder, as web servers do', () => {
    expect(pageAddress('https://example.com/', 'index.html')).toBe('https://example.com/');
    expect(pageAddress('https://example.com/', 'blog/index.htm')).toBe('https://example.com/blog/');
    expect(pageAddress('https://example.com/shop/', 'a b.html')).toBe(
      'https://example.com/shop/a%20b.html',
    );
  });
});
