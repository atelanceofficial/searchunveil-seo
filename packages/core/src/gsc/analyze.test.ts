import { describe, expect, it } from 'vitest';
import {
  addDays,
  csvFile,
  dailySeries,
  datesFile,
  filtersFile,
  queriesFile,
} from '../test-support/gsc-fixtures.ts';
import {
  analyzeSearchConsole,
  SEARCH_CONSOLE_THRESHOLDS,
  type SearchConsoleReport,
} from './analyze.ts';
import { importSearchConsole, type InputFile } from './import.ts';

async function analyze(files: readonly InputFile[]): Promise<SearchConsoleReport> {
  const result = await importSearchConsole(files);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return analyzeSearchConsole(result.value);
}

const rules = (report: SearchConsoleReport) => report.findings.map((f) => f.rule);
const noteRules = (report: SearchConsoleReport) => report.notes.map((f) => f.rule);

describe('analyzeSearchConsole: what happened', () => {
  it('tells the README story: appearing more often while clicks stay the same', async () => {
    const report = await analyze([
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
    ]);
    expect(report.headline).toMatchObject({
      rule: 'gsc.headline',
      status: 'review',
      title: { key: 'gsc.headline.flat-up' },
      nextChecks: [
        { key: 'gsc.check.queries-gained' },
        { key: 'gsc.check.titles' },
        { key: 'gsc.check.position-shift' },
      ],
    });
    expect(report.comparison?.current).toMatchObject({
      start: '2026-10-25',
      end: '2026-11-21',
      days: 28,
    });
    expect(report.comparison?.impressions.direction).toBe('up');
    expect(report.comparison?.impressions.dayByDay?.consistent).toBe(true);
    expect(report.comparison?.clicks.direction).toBe('flat');

    const impressions = report.findings.find((f) => f.rule === 'gsc.change.impressions');
    expect(impressions).toMatchObject({
      status: 'good',
      title: { key: 'gsc.change.impressions.up' },
      summary: { key: 'gsc.daybyday.higher', params: { count: 28, days: 28 } },
    });
    expect(report.findings.find((f) => f.rule === 'gsc.change.ctr')).toMatchObject({
      status: 'review',
      title: { key: 'gsc.change.ctr.down' },
    });
    expect(report.overview).toMatchObject({
      source: 'date',
      dateRange: { start: '2026-08-24', end: '2026-11-21' },
    });
    expect(report.series).toHaveLength(90);
  });

  it('reports growth when people find and visit the pages more', async () => {
    const report = await analyze([
      datesFile(
        dailySeries({
          start: '2026-09-01',
          days: 56,
          clicks: 50,
          impressions: 1000,
          recentDays: 28,
          impressionGrowth: 1.3,
          clickGrowth: 1.3,
        }),
      ),
    ]);
    expect(report.headline).toMatchObject({ status: 'good', title: { key: 'gsc.headline.up-up' } });
    expect(report.findings.find((f) => f.rule === 'gsc.change.clicks')).toMatchObject({
      status: 'good',
      title: { key: 'gsc.change.clicks.up' },
    });
  });

  it('puts a decline first and suggests where to look', async () => {
    const report = await analyze([
      datesFile(
        dailySeries({
          start: '2026-09-01',
          days: 56,
          clicks: 50,
          impressions: 1000,
          recentDays: 28,
          impressionGrowth: 0.7,
          clickGrowth: 0.7,
        }),
      ),
    ]);
    expect(report.headline).toMatchObject({
      status: 'attention',
      title: { key: 'gsc.headline.down-down' },
    });
    expect(report.findings[0]).toMatchObject({ rule: 'gsc.change.clicks', status: 'attention' });
  });

  it('says so when there is too little data to compare', async () => {
    const report = await analyze([
      datesFile(dailySeries({ start: '2026-09-01', days: 28, clicks: 0.2, impressions: 5 })),
    ]);
    expect(report.headline).toMatchObject({
      status: 'info',
      title: { key: 'gsc.headline.insufficient' },
      nextChecks: [{ key: 'gsc.check.export-longer' }],
    });
    expect(rules(report)).not.toContain('gsc.change.clicks');
  });

  it('compares impressions alone when clicks are too few', async () => {
    const report = await analyze([
      datesFile(
        dailySeries({
          start: '2026-09-01',
          days: 28,
          clicks: 0.5,
          impressions: 200,
          recentDays: 14,
          impressionGrowth: 1.5,
        }),
      ),
    ]);
    expect(report.headline?.title.key).toBe('gsc.headline.impressions-up');
  });
});

describe('analyzeSearchConsole: notes that keep the reading honest', () => {
  it('explains when there is no daily data and where totals come from', async () => {
    const report = await analyze([queriesFile([['shoes', 10, 100, 3]])]);
    expect(report.headline).toBeNull();
    expect(report.comparison).toBeNull();
    expect(report.overview).toMatchObject({
      source: 'query',
      clicks: 10,
      impressions: 100,
      dateRange: null,
    });
    expect(noteRules(report)).toEqual(['gsc.note.no-dates', 'gsc.note.partial-totals']);
  });

  it('explains when the date range is too short to compare', async () => {
    const report = await analyze([
      datesFile(dailySeries({ start: '2026-11-01', days: 10, clicks: 10, impressions: 100 })),
    ]);
    expect(report.notes[0]).toMatchObject({
      rule: 'gsc.note.short-range',
      title: { params: { days: 10 } },
    });
  });

  it('counts days the export left out', async () => {
    const days = dailySeries({ start: '2026-10-01', days: 20, clicks: 10, impressions: 100 });
    const report = await analyze([datesFile(days.filter((_, i) => i !== 5 && i !== 6))]);
    expect(report.notes.find((n) => n.rule === 'gsc.note.missing-days')).toMatchObject({
      title: { params: { count: 2 } },
      evidence: [
        { value: { kind: 'date', value: '2026-10-06' } },
        { value: { kind: 'date', value: '2026-10-07' } },
      ],
    });
  });

  it('leaves a half-processed final day out of the comparison and says so', async () => {
    const days = dailySeries({ start: '2026-10-01', days: 29, clicks: 20, impressions: 400 });
    const last = days.at(-1);
    if (last === undefined) throw new Error('fixture');
    const report = await analyze([
      datesFile([...days.slice(0, -1), { ...last, clicks: 2, impressions: 60 }]),
    ]);
    expect(noteRules(report)).toContain('gsc.note.incomplete-days');
    expect(report.comparison?.current.end).toBe(addDays(last.date, -1));
  });

  it('explains why the Queries table adds up to less than the chart', async () => {
    const report = await analyze([
      datesFile(dailySeries({ start: '2026-10-01', days: 14, clicks: 10, impressions: 100 })),
      queriesFile([['shoes', 20, 300, 4]]),
    ]);
    expect(report.notes.find((n) => n.rule === 'gsc.note.anonymized-queries')).toMatchObject({
      title: { params: { share: { kind: 'percent' } } },
    });
  });

  it('warns that a table may be cut off at Search Console’s export limit', async () => {
    const rows = Array.from({ length: 1000 }, (_, i) => [`query ${i}`, 1, 10, 5] as const);
    const report = await analyze([queriesFile(rows)]);
    expect(report.notes.find((n) => n.rule === 'gsc.note.row-limit')).toMatchObject({
      title: { params: { kind: 'query', limit: 1000 } },
    });
  });

  it('shows the export’s own settings', async () => {
    const report = await analyze([
      queriesFile([['shoes', 1, 10, 3]]),
      filtersFile([['Search type', 'Web']]),
    ]);
    expect(report.notes.find((n) => n.rule === 'gsc.note.filters')?.evidence).toEqual([
      { label: { key: 'table.text', params: { text: 'Search type' } }, value: 'Web' },
    ]);
    expect(report.filters).toEqual([{ name: 'Search type', value: 'Web' }]);
  });
});

describe('analyzeSearchConsole: opportunities', () => {
  it('finds results near the top that get far fewer clicks than similar ones', async () => {
    const report = await analyze([
      queriesFile([
        ['a', 200, 1000, 2],
        ['b', 210, 1000, 2.2],
        ['c', 190, 1000, 1.8],
        ['d', 205, 1000, 2.5],
        ['e', 195, 1000, 3],
        ['weak title', 20, 1000, 2.1],
      ]),
    ]);
    const lowCtr = report.findings.find((f) => f.rule === 'gsc.opportunity.low-ctr.query');
    expect(lowCtr).toMatchObject({ status: 'review', title: { params: { count: 1 } } });
    expect(lowCtr?.table?.rows[0]?.[0]).toBe('weak title');
  });

  it('needs enough similar results before judging a click-through rate', async () => {
    const report = await analyze([
      queriesFile([
        ['a', 200, 1000, 2],
        ['weak title', 20, 1000, 2.1],
      ]),
    ]);
    expect(rules(report)).not.toContain('gsc.opportunity.low-ctr.query');
  });

  it('finds queries just below the top ten, most searched first', async () => {
    const report = await analyze([
      queriesFile([
        ['top', 50, 500, 3],
        ['close', 5, 400, 12.4],
        ['closer', 9, 900, 10.8],
        ['far', 1, 900, 35],
        ['rare', 0, 10, 14],
      ]),
    ]);
    const nearTop = report.findings.find((f) => f.rule === 'gsc.opportunity.near-top.query');
    expect(nearTop?.table?.rows.map((r) => r[0])).toEqual(['closer', 'close']);
    expect(nearTop?.summary).toMatchObject({
      params: {
        from: SEARCH_CONSOLE_THRESHOLDS.nearTop.minPosition,
        to: SEARCH_CONSOLE_THRESHOLDS.nearTop.maxPosition,
      },
    });
  });

  it('finds pages that are seen but never clicked', async () => {
    const report = await analyze([
      csvFile(
        'Pages.csv',
        ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [
          ['https://example.com/a', 0, 500, '0%', 7],
          ['https://example.com/b', 3, 500, '0.6%', 7],
          ['https://example.com/c', 0, 50, '0%', 7],
        ],
      ),
    ]);
    const zero = report.findings.find((f) => f.rule === 'gsc.opportunity.zero-click-pages');
    expect(zero?.table?.rows).toEqual([
      ['https://example.com/a', 500, { kind: 'decimal', value: 7, digits: 1 }],
    ]);
  });

  it('lists the biggest movers in comparison exports, with the export’s period labels', async () => {
    const file = csvFile(
      'Queries.csv',
      [
        'Top queries',
        'Last 28 days Clicks',
        'Previous 28 days Clicks',
        'Last 28 days Impressions',
        'Previous 28 days Impressions',
        'Last 28 days CTR',
        'Previous 28 days CTR',
        'Last 28 days Position',
        'Previous 28 days Position',
      ],
      [
        ['rising', 50, 10, 500, 300, '10%', '3.33%', 3, 6],
        ['falling', 5, 40, 300, 500, '1.67%', '8%', 9, 4],
        ['steady', 20, 19, 400, 400, '5%', '4.75%', 5, 5],
      ],
    );
    const report = await analyze([file]);
    const gains = report.findings.find((f) => f.rule === 'gsc.movers.gains');
    const losses = report.findings.find((f) => f.rule === 'gsc.movers.losses');
    expect(gains?.table?.columns[1]?.label).toEqual({
      key: 'table.text',
      params: { text: 'Last 28 days' },
    });
    expect(gains?.table?.rows).toEqual([
      ['rising', 50, 10, { kind: 'decimal', value: 40, digits: 0, signed: true }],
    ]);
    expect(losses?.table?.rows.map((r) => r[0])).toEqual(['falling']);
    expect(noteRules(report)).toContain('gsc.note.comparison-export');
  });

  it('orders findings by status: attention, review, good, info', async () => {
    const report = await analyze([
      datesFile(
        dailySeries({
          start: '2026-09-01',
          days: 56,
          clicks: 50,
          impressions: 1000,
          recentDays: 28,
          impressionGrowth: 1.4,
          clickGrowth: 0.8,
        }),
      ),
    ]);
    const order = ['attention', 'review', 'good', 'info'];
    const statuses = report.findings.map((f) => order.indexOf(f.status));
    expect(statuses).toEqual([...statuses].sort((a, b) => a - b));
  });
});
