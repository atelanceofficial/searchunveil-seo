import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createZip } from '../../../packages/core/src/test-support/zip-writer.ts';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Fails on any WCAG A/AA violation, listing each rule and the elements involved. */
async function expectAccessible(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? 'unknown'}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
  );
  expect(summary).toEqual([]);
}

/** On narrow screens the language and theme choices sit behind the Menu button. */
async function chooseLanguage(page: Page, locale: string): Promise<void> {
  const menu = page.getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) await menu.click();
  await page.getByLabel('Language').selectOption(locale);
}

// Every test fails if the page logs an error, unless the test expects that exact message.
const watched = new WeakMap<Page, { problems: string[]; allowed: RegExp[] }>();

function allowConsole(page: Page, pattern: RegExp): void {
  watched.get(page)?.allowed.push(pattern);
}

test.beforeEach(({ page }) => {
  const state = { problems: [] as string[], allowed: [] as RegExp[] };
  watched.set(page, state);
  page.on('console', (message) => {
    if (message.type() === 'error') state.problems.push(message.text());
  });
  page.on('pageerror', (error) => state.problems.push(error.message));
});

test.afterEach(({ page }) => {
  const state = watched.get(page);
  const unexpected = (state?.problems ?? []).filter(
    (problem) => !(state?.allowed ?? []).some((pattern) => pattern.test(problem)),
  );
  expect(unexpected).toEqual([]);
});

test.describe('overview', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`is accessible in the ${colorScheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'See how your website gets found',
      );
      await expectAccessible(page);
    });
  }

  test('lets keyboard users skip straight to the content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern.');
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('moves focus to the new page heading after navigating', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Analyze an export' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Search Console export' }),
    ).toBeFocused();
    await expect(page).toHaveTitle('Search Console · SearchUnveil');
  });
});

test.describe('Search Console export', () => {
  test('tells the sample export’s story and stays accessible', async ({ page }) => {
    await page.goto('/#/search-console');
    await page.getByRole('button', { name: 'Try sample data' }).click();
    const results = page.getByRole('heading', { name: 'What happened' });
    await expect(results).toBeFocused();
    await expect(page.locator('.headline')).toContainText(
      'Your pages appeared in search more often, but clicks stayed about the same.',
    );
    await expect(page.getByRole('figure')).toContainText('Clicks per day');
    await page.getByRole('radio', { name: 'Impressions' }).check();
    await expect(page.getByRole('figure')).toContainText('Impressions per day');
    await expectAccessible(page);
  });

  test('reads a CSV file the person chooses', async ({ page }) => {
    await page.goto('/#/search-console');
    const csv = [
      'Top queries,Clicks,Impressions,CTR,Position',
      'trail running shoes,120,2400,5%,3.2',
      'hiking boots,15,900,1.67%,12.4',
    ].join('\n');
    await page.locator('input[type=file]').setInputFiles({
      name: 'Queries.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    await expect(page.getByRole('heading', { name: 'Top queries' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Top queries' })).toContainText(
      'trail running shoes',
    );
    await expect(
      page.getByText('This export has no daily data, so trends can’t be shown.'),
    ).toBeVisible();
  });

  test('explains files it cannot read', async ({ page }) => {
    await page.goto('/#/search-console');
    await page.locator('input[type=file]').setInputFiles({
      name: 'products.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,price\nA1,9.99\n'),
    });
    await expect(page.getByRole('heading', { name: 'We couldn’t read these files' })).toBeFocused();
    await expect(
      page.getByText('This file doesn’t look like a Search Console performance export.'),
    ).toBeVisible();
  });
});

test.describe('page review', () => {
  test('reviews pasted HTML without running it', async ({ page }) => {
    // The parsed copy is inert, and the security policy refuses its inline handler outright;
    // the browser reports that refusal, which is exactly what should happen.
    allowConsole(page, /inline event handler violates the following Content Security Policy/);
    await page.goto('/#/page-review');
    await page
      .getByLabel('Page HTML')
      .fill(
        '<html><head><title>Hi</title><script>window.ran = true</script></head><body><img src="x.png" onerror="window.ran = true"></body></html>',
      );
    await page.getByRole('button', { name: 'Review page' }).click();
    await expect(page.getByRole('heading', { name: 'Results' })).toBeFocused();
    await expect(page.getByText('The page doesn’t declare its language')).toBeVisible();
    // The pasted page's scripts and event handlers never ran.
    expect(await page.evaluate(() => (window as Window & { ran?: boolean }).ran)).toBeUndefined();
    await expectAccessible(page);
  });
});

test.describe('AI mention log', () => {
  test('validates, saves, exports and deletes a mention', async ({ page }) => {
    await page.goto('/#/mentions');
    await page.getByRole('button', { name: 'Save mention' }).click();
    await expect(page.getByLabel('AI assistant')).toBeFocused();
    await expect(page.getByText('This is required.').first()).toBeVisible();

    await page.getByLabel('AI assistant').fill('Perplexity');
    await page.getByLabel('Cited page on your site').fill('https://example.com/shoes');
    await page.getByLabel('What the answer said').fill('Example’s guide compares trail shoes.');
    await page.getByRole('button', { name: 'Save mention' }).click();
    await expect(page.getByRole('list').filter({ hasText: 'Perplexity' })).toBeVisible();
    await expectAccessible(page);

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download log (JSON)' }).click();
    expect((await download).suggestedFilename()).toMatch(
      /^searchunveil-ai-mentions-\d{4}-\d{2}-\d{2}\.json$/,
    );

    await page.reload();
    await expect(page.getByText('Example’s guide compares trail shoes.')).toBeVisible();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('No mentions recorded yet.')).toBeVisible();
  });
});

test.describe('languages', () => {
  test('switches to Arabic with a right-to-left layout', async ({ page }) => {
    await page.goto('/#/search-console');
    await chooseLanguage(page, 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await page.locator('.panel__aside button').click();
    await expect(page.locator('.headline')).toContainText('ظهرت صفحاتك في البحث أكثر من قبل');
    await expectAccessible(page);
  });

  test('honours a language link', async ({ page }) => {
    await page.goto('/?lang=tr#/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Web sitenizin nasıl bulunduğunu görün',
    );
  });
});

test.describe('large files', () => {
  /** A site's backup: three pages and a 30 MB video, larger than any limit the app once had. */
  async function siteArchive(): Promise<Uint8Array> {
    const page = (title: string, description = '') =>
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>` +
      (description === '' ? '' : `<meta name="description" content="${description}">`) +
      `</head><body><h1>${title}</h1></body></html>`;
    const video = new Uint8Array(30 * 1024 * 1024);
    for (let i = 0; i < video.length; i++) video[i] = (i * 2654435761) >>> 24;
    return createZip([
      { name: 'atelance/index.html', data: page('Atelance, a studio for brands', 'Identity.') },
      { name: 'atelance/about/index.html', data: page('About the Atelance studio team') },
      { name: 'atelance/contact.html', data: page('Contact') },
      { name: 'atelance/media/showreel.mp4', data: video, method: 'stored' },
    ]);
  }

  test('passes a 30 MB site archive from Search Console to a review of every page', async ({
    page,
  }, testInfo) => {
    const file = testInfo.outputPath('atelance-site.zip');
    await writeFile(file, await siteArchive());
    await page.goto('/#search-console');
    await page.locator('input[type="file"]').setInputFiles(file);
    await expect(
      page.getByText(/This ZIP file holds a website \(3 web pages among 4 files\)/),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Review this site’s pages' }).click();
    await expect(page.getByRole('heading', { name: 'Site review', level: 3 })).toBeVisible();
    await expect(page.locator('.site-results > p.muted').first()).toContainText(
      '3 pages reviewed.',
    );
    await expect(page.locator('.site-page')).toHaveCount(3);
    await expect(page.locator('.site-issue').first()).toContainText('On ');

    const first = page.locator('.site-page').first();
    await first.locator('summary').click();
    await expect(first.locator('.finding').first()).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe('inside a host page', () => {
  // Viewers that embed pages, such as artifact previews, wrap them in a skeleton whose own
  // unlayered reset paints body black on white. It must not reach the dark theme's text.
  test('keeps its own ground and text colours under a host reset', async ({ page }) => {
    await page.route('**/host-reset.css', (route) =>
      route.fulfill({
        contentType: 'text/css',
        body: ':root{color-scheme:light}body{margin:0;padding:0;font:14px sans-serif;background:#fff;color:#000}',
      }),
    );
    await page.route(
      (url) => url.pathname === '/',
      async (route) => {
        const response = await route.fetch();
        const html = await response.text();
        await route.fulfill({
          response,
          body: html.replace('<head>', '<head><link rel="stylesheet" href="/host-reset.css" />'),
        });
      },
    );
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('.tool__title').first()).toBeVisible();

    const black = 'rgb(0, 0, 0)';
    await expect(page.locator('body')).not.toHaveCSS('color', black);
    await expect(page.locator('body')).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    for (const title of await page.locator('.tool__title').all()) {
      await expect(title).not.toHaveCSS('color', black);
    }
    await expectAccessible(page);
  });
});

test.describe('privacy and resilience', () => {
  test('blocks network connections once the page has loaded', async ({ page }) => {
    // The browser reports the refused connection; that report is the expected outcome.
    allowConsole(page, /Content Security Policy|Failed to fetch/);
    await page.goto('/');
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
      'content',
      /connect-src 'none'/,
    );
    const outcome = await page.evaluate(async () => {
      const violations: string[] = [];
      document.addEventListener('securitypolicyviolation', (event) =>
        violations.push(event.violatedDirective),
      );
      try {
        await fetch('https://example.com/collect', { method: 'POST', body: 'data' });
        return { sent: true, violations };
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { sent: false, violations };
      }
    });
    expect(outcome.sent).toBe(false);
    expect(outcome.violations).toContain('connect-src');
  });

  test('never scrolls sideways at 320 CSS pixels (WCAG reflow)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const route of ['/', '/#/search-console', '/#/page-review', '/#/mentions', '/#/privacy']) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, route).toBeLessThanOrEqual(0);
    }
    await page.goto('/#/search-console');
    await page.getByRole('button', { name: 'Try sample data' }).click();
    await expect(page.locator('.headline')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });
});

test.describe('standalone file', () => {
  const file = new URL('../dist-standalone/searchunveil.html', import.meta.url);

  test('opens from disk, without a server, under the same strict policy', async ({ page }) => {
    test.skip(!existsSync(file), 'Run `npm run build:standalone` first.');
    await page.goto(file.href);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'See how your website gets found',
    );
    const policy = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(policy).toContain("connect-src 'none'");
    expect(policy).toMatch(/script-src 'sha256-[\w+/=]+'/);
    expect(policy).not.toContain('unsafe-inline');

    // Every language is inside the file, and the analysis runs offline.
    await page.goto(`${file.href}#/search-console`);
    await page.getByRole('button', { name: 'Try sample data' }).click();
    await expect(page.locator('.headline')).toContainText(
      'Your pages appeared in search more often, but clicks stayed about the same.',
    );
    await chooseLanguage(page, 'tr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Search Console dışa aktarımı',
    );
    await expectAccessible(page);
  });
});
