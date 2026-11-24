import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { reviewHttp } from '../../audit/http.ts';
import { reviewHtml } from '../../audit/review.ts';
import type { Finding } from '../../findings.ts';
import { analyzeSearchConsole } from '../../gsc/analyze.ts';
import { importSearchConsole } from '../../gsc/import.ts';
import {
  csvFile,
  dailySeries,
  datesFile,
  filtersFile,
  queriesFile,
} from '../../test-support/gsc-fixtures.ts';
import { createTranslator, describeMessage } from '../format.ts';
import { LOCALES, type Locale } from '../locales.ts';
import type { Message, MessageParams } from '../message.ts';
import { CORE_CATALOGS } from './all.ts';
import { en, type CoreMessageKey } from './en.ts';
import { loadCoreCatalog } from './load.ts';

const KEYS = Object.keys(en) as CoreMessageKey[];
const TRANSLATIONS = LOCALES.filter((locale) => locale !== 'en');

/** Parameters that exercise every branch a message can take. */
function sampleParams(key: CoreMessageKey, count: number): MessageParams[] {
  const shape = describeMessage(en[key]);
  const base: Record<string, MessageParams[string]> = {};
  for (const name of shape.arguments) base[name] = count;
  const variants: MessageParams[] = [base];
  for (const [name, options] of shape.selectOptions) {
    for (const option of options) variants.push({ ...base, [name]: option });
  }
  return variants;
}

function render(locale: Locale, message: Message<CoreMessageKey>): string {
  return createTranslator(locale, CORE_CATALOGS[locale]).message(message);
}

function messagesOf(finding: Finding): Message<CoreMessageKey>[] {
  return [
    finding.title,
    ...(finding.summary === undefined ? [] : [finding.summary]),
    ...finding.evidence.map((e) => e.label),
    ...finding.limitations,
    ...finding.nextChecks,
    ...finding.references.map((r) => r.title),
    ...(finding.table?.columns.map((c) => c.label) ?? []),
  ];
}

describe('core catalogs', () => {
  it.each(LOCALES)('%s: every message parses and renders every branch', (locale) => {
    const translator = createTranslator(locale, CORE_CATALOGS[locale]);
    for (const key of KEYS) {
      for (const count of [0, 1, 2, 3, 11, 100, 1000]) {
        for (const params of sampleParams(key, count)) {
          const text = translator.t(key, params);
          expect(text, `${locale} ${key}`).not.toMatch(/[{}]|undefined|NaN/);
          expect(text.trim(), `${locale} ${key}`).not.toBe('');
        }
      }
    }
  });

  it.each(TRANSLATIONS)('%s uses the same placeholders as English', (locale) => {
    const catalog = CORE_CATALOGS[locale];
    for (const key of KEYS) {
      const source = describeMessage(en[key]);
      const translation = describeMessage(catalog[key]);
      expect([...translation.arguments].sort(), `${locale} ${key}`).toEqual(
        [...source.arguments].sort(),
      );
      for (const [name, options] of source.selectOptions) {
        const translated = translation.selectOptions.get(name) ?? new Set<string>();
        for (const option of options) {
          expect(
            translated.has(option),
            `${locale} ${key}: select "${name}" lacks "${option}"`,
          ).toBe(true);
        }
      }
    }
  });

  it.each(TRANSLATIONS)('%s is translated rather than copied from English', (locale) => {
    const catalog = CORE_CATALOGS[locale];
    // Messages that are only placeholders or proper names may legitimately stay identical.
    const prose = KEYS.filter((key) => /\p{L}{4,}/u.test(en[key].replace(/\{[^}]*\}/g, '')));
    const copied = prose.filter((key) => catalog[key] === en[key]);
    expect(copied.length / prose.length, `${locale}: ${copied.join(', ')}`).toBeLessThan(0.05);
  });

  it('loads each catalog on demand', async () => {
    for (const locale of LOCALES) expect(await loadCoreCatalog(locale)).toBe(CORE_CATALOGS[locale]);
  });
});

describe('findings render in every language', () => {
  it('for a Search Console export with every kind of finding', async () => {
    const result = await importSearchConsole([
      datesFile(
        dailySeries({
          start: '2026-08-24',
          days: 90,
          clicks: 40,
          impressions: 1000,
          recentDays: 28,
          impressionGrowth: 1.25,
        }),
      ),
      queriesFile([
        ['a', 200, 1000, 2],
        ['b', 210, 1000, 2.2],
        ['c', 190, 1000, 1.8],
        ['d', 205, 1000, 2.5],
        ['e', 195, 1000, 3],
        ['weak title', 20, 1000, 2.1],
        ['close', 5, 400, 12.4],
      ]),
      csvFile(
        'Pages.csv',
        ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [['https://example.com/a', 0, 500, '0%', 7]],
      ),
      filtersFile([['Search type', 'Web']]),
    ]);
    if (!result.ok) throw new Error('fixture');
    const report = analyzeSearchConsole(result.value);
    const findings = [
      ...(report.headline === null ? [] : [report.headline]),
      ...report.findings,
      ...report.notes,
    ];
    expect(findings.length).toBeGreaterThan(5);
    for (const locale of LOCALES) {
      for (const finding of findings) {
        for (const message of messagesOf(finding)) {
          expect(render(locale, message), `${locale} ${message.key}`).not.toMatch(/[{}]/);
        }
      }
    }
  });

  it('for a page review with many issues', () => {
    const html =
      '<html><head><title>Hi</title><img src="x"><link rel="canonical" href="/a"></head>' +
      '<body><h1></h1><h3>Skip</h3><img src="a.png"><a href="javascript:void(0)"></a></body></html>';
    const result = reviewHtml(html, (h) => new JSDOM(h).window.document, {
      url: 'https://example.com/',
    });
    if (!result.ok) throw new Error('fixture');
    for (const locale of LOCALES) {
      for (const finding of result.value.findings) {
        for (const message of messagesOf(finding)) {
          expect(render(locale, message), `${locale} ${message.key}`).not.toMatch(/[{}]/);
        }
      }
    }
  });

  it('for a page fetched by its address with every server problem', () => {
    const base = {
      requestedUrl: 'http://example.com/',
      finalUrl: 'http://example.com/a',
      status: 404,
      redirects: [
        { url: 'http://example.com/', status: 301 },
        { url: 'http://example.com/b', status: 302 },
      ],
      elapsedMs: 1250,
      bytes: 1000,
      contentType: 'text/html',
      contentEncoding: null,
      xRobotsTag: 'noindex',
      hsts: false,
      robotsTxt: { found: true, allowsPage: false, rule: 'Disallow: /a', sitemaps: [] },
    };
    const findings = [
      ...reviewHttp(base),
      ...reviewHttp({ ...base, robotsTxt: null }),
      ...reviewHttp({
        ...base,
        finalUrl: 'https://example.com/',
        status: 200,
        xRobotsTag: null,
        robotsTxt: { found: false, allowsPage: true, rule: null, sitemaps: [] },
      }),
    ];
    expect(new Set(findings.map((f) => f.rule)).size).toBe(7);
    for (const locale of LOCALES) {
      for (const finding of findings) {
        for (const message of messagesOf(finding)) {
          expect(render(locale, message), `${locale} ${message.key}`).not.toMatch(/[{}]/);
        }
      }
    }
  });
});
