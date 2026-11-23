import {
  analyzeSearchConsole,
  importSearchConsole,
  reviewHtml,
  type SearchConsoleReport,
} from '@searchunveil/core';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL } from './page.ts';
import { sampleSearchConsoleFiles } from './search-console.ts';

async function sampleReport(today: string): Promise<SearchConsoleReport> {
  const imported = await importSearchConsole(sampleSearchConsoleFiles(today));
  if (!imported.ok) throw new Error(JSON.stringify(imported.diagnostics));
  expect(imported.diagnostics).toEqual([]);
  return analyzeSearchConsole(imported.value);
}

describe('sample Search Console export', () => {
  it('tells the README story through the real import', async () => {
    const report = await sampleReport('2026-11-23');
    expect(report.headline?.title.key).toBe('gsc.headline.flat-up');
    expect(report.comparison?.current.end).toBe('2026-11-20');
    expect(report.findings.map((f) => f.rule)).toEqual(
      expect.arrayContaining([
        'gsc.change.impressions',
        'gsc.change.ctr',
        'gsc.opportunity.low-ctr.query',
        'gsc.opportunity.near-top.query',
        'gsc.opportunity.zero-click-pages',
      ]),
    );
    expect(report.notes.map((n) => n.rule)).toEqual(
      expect.arrayContaining(['gsc.note.anonymized-queries', 'gsc.note.filters']),
    );
  });

  it('keeps the same story whatever the date', async () => {
    for (const today of ['2026-01-01', '2027-06-15', '2028-02-29']) {
      expect((await sampleReport(today)).headline?.title.key).toBe('gsc.headline.flat-up');
    }
  });
});

describe('sample page', () => {
  it('shows a realistic mix of issues', () => {
    const result = reviewHtml(SAMPLE_PAGE_HTML, (html) => new JSDOM(html).window.document, {
      url: SAMPLE_PAGE_URL,
    });
    if (!result.ok) throw new Error('sample page');
    expect(result.value.counts).toEqual({ attention: 3, review: 4, good: 5, info: 3 });
  });
});
