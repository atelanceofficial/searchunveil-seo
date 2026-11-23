import { describe, expect, it } from 'vitest';
import type { MetricTable } from '../gsc/model.ts';
import { comparePeriods, periodLength, type ComparisonThresholds } from './compare.ts';
import { addDays, buildDailySeries, MAX_SERIES_DAYS, type DailyPoint } from './series.ts';
import { median, signTest, sum, weightedMean } from './stats.ts';

const THRESHOLDS: ComparisonThresholds = {
  materialChange: 0.05,
  minClicks: 30,
  minImpressions: 300,
  minPositionChange: 0.3,
  consistencyLevel: 0.05,
};

/** Exact binomial tail with BigInt arithmetic, as an independent reference. */
function referenceSignTest(higher: number, lower: number): number {
  const n = higher + lower;
  const k = Math.min(higher, lower);
  let tail = 0n;
  let combination = 1n;
  for (let i = 0; i <= k; i++) {
    if (i > 0) combination = (combination * BigInt(n - i + 1)) / BigInt(i);
    tail += combination;
  }
  return Math.min(1, (2 * Number(tail)) / 2 ** n);
}

function points(
  values: readonly (readonly [clicks: number, impressions: number])[],
  start = '2026-09-07',
) {
  return values.map(([clicks, impressions], i): DailyPoint => ({
    date: addDays(start, i),
    clicks,
    impressions,
    position: 5,
    missing: false,
    incomplete: false,
  }));
}

function dateTable(rows: readonly (readonly [string, number, number])[]): MetricTable {
  return {
    kind: 'date',
    file: 'Dates.csv',
    dimensionHeader: 'Date',
    periods: null,
    identifiedBy: 'header',
    hasPosition: true,
    rows: rows.map(([key, clicks, impressions], i) => ({
      key,
      primary: {
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : null,
        position: 4,
      },
      comparison: null,
      line: i + 2,
    })),
  };
}

describe('stats', () => {
  it('computes sums, medians and weighted means', () => {
    expect(sum([1, 2, 3.5])).toBe(6.5);
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(weightedMean([2, 4, null], [1, 3, 10])).toBe(3.5);
    expect(weightedMean([2], [0])).toBeNull();
  });

  it('matches an exact binomial reference for the sign test', () => {
    expect(signTest(22, 6)).toBeCloseTo(0.003719, 6);
    for (const [higher, lower] of [
      [0, 0],
      [5, 5],
      [10, 0],
      [3, 12],
      [14, 14],
      [400, 340],
    ] as const) {
      expect(signTest(higher, lower)).toBeCloseTo(referenceSignTest(higher, lower), 10);
      expect(signTest(higher, lower)).toBe(signTest(lower, higher));
    }
  });
});

describe('buildDailySeries', () => {
  it('fills days the export left out with marked zeros', () => {
    const series = buildDailySeries(
      dateTable([
        ['2026-11-01', 3, 30],
        ['2026-11-04', 5, 50],
      ]),
      { incompleteShare: 0.5, incompleteMinMedian: 20 },
    );
    expect(series.map((p) => [p.date, p.clicks, p.missing])).toEqual([
      ['2026-11-01', 3, false],
      ['2026-11-02', 0, true],
      ['2026-11-03', 0, true],
      ['2026-11-04', 5, false],
    ]);
  });

  it('marks a sharp drop on the last days as incomplete, not as a decline', () => {
    const rows = Array.from({ length: 20 }, (_, i) => [addDays('2026-10-01', i), 10, 100] as const);
    const series = buildDailySeries(
      dateTable([...rows.slice(0, 18), [rows[18]?.[0] ?? '', 2, 30], [rows[19]?.[0] ?? '', 1, 12]]),
      { incompleteShare: 0.5, incompleteMinMedian: 20 },
    );
    expect(series.map((p) => p.incomplete)).toEqual([
      ...Array<boolean>(18).fill(false),
      true,
      true,
    ]);
  });

  it('does not flag a single low day earlier in the series', () => {
    const rows = Array.from(
      { length: 20 },
      (_, i) => [addDays('2026-10-01', i), 10, i === 18 ? 10 : 100] as const,
    );
    const series = buildDailySeries(dateTable(rows), {
      incompleteShare: 0.5,
      incompleteMinMedian: 20,
    });
    expect(series.some((p) => p.incomplete)).toBe(false);
  });

  it('limits the span of implausibly long tables', () => {
    const series = buildDailySeries(
      dateTable([
        ['1990-01-01', 1, 10],
        ['2026-11-01', 1, 10],
      ]),
      { incompleteShare: 0.5, incompleteMinMedian: 20 },
    );
    expect(series).toHaveLength(MAX_SERIES_DAYS);
    expect(series.at(-1)?.date).toBe('2026-11-01');
  });
});

describe('comparePeriods', () => {
  it('uses whole weeks: four when eight are available', () => {
    expect(periodLength(13)).toBeNull();
    expect(periodLength(14)).toBe(7);
    expect(periodLength(30)).toBe(14);
    expect(periodLength(55)).toBe(21);
    expect(periodLength(90)).toBe(28);
  });

  it('compares matching weekdays and reports a steady rise', () => {
    // Previous: 10 clicks a day. Recent: 12 a day. Every matching day is higher.
    const series = points([
      ...Array.from({ length: 28 }, () => [10, 200] as const),
      ...Array.from({ length: 28 }, () => [12, 200] as const),
    ]);
    const result = comparePeriods(series, THRESHOLDS);
    expect(result?.current).toMatchObject({ start: '2026-10-05', end: '2026-11-01', days: 28 });
    expect(result?.clicks).toMatchObject({
      previous: 280,
      current: 336,
      change: 56,
      direction: 'up',
      dayByDay: { higher: 28, lower: 0, tied: 0, consistent: true },
    });
    expect(result?.clicks.relativeChange).toBeCloseTo(0.2);
    expect(result?.impressions.direction).toBe('flat');
    expect(result?.ctr.direction).toBe('up');
    expect(result?.position.direction).toBe('flat');
  });

  it('calls a change driven by a single spike uneven', () => {
    const before = Array.from({ length: 28 }, () => [10, 200] as const);
    const after = Array.from(
      { length: 28 },
      (_, i) => [i === 3 ? 150 : i % 2 === 0 ? 9 : 11, 200] as const,
    );
    const result = comparePeriods(points([...before, ...after]), THRESHOLDS);
    expect(result?.clicks.direction).toBe('up');
    expect(result?.clicks.dayByDay?.consistent).toBe(false);
  });

  it('describes changes below 5% as about the same', () => {
    const series = points([
      ...Array.from({ length: 7 }, () => [100, 1000] as const),
      ...Array.from({ length: 7 }, () => [104, 1030] as const),
    ]);
    const result = comparePeriods(series, THRESHOLDS);
    expect(result?.clicks.direction).toBe('flat');
    expect(result?.impressions.direction).toBe('flat');
  });

  it('refuses to compare too little data', () => {
    const series = points([
      ...Array.from({ length: 7 }, () => [1, 10] as const),
      ...Array.from({ length: 7 }, () => [3, 30] as const),
    ]);
    const result = comparePeriods(series, THRESHOLDS);
    expect(result?.clicks.direction).toBe('insufficient');
    expect(result?.impressions.direction).toBe('insufficient');
    expect(result?.ctr.direction).toBe('insufficient');
    expect(result?.position.direction).toBe('insufficient');
  });

  it('leaves incomplete days out of the recent period', () => {
    const series = points(Array.from({ length: 16 }, () => [10, 100] as const)).map((p, i) =>
      i >= 14 ? { ...p, incomplete: true } : p,
    );
    const result = comparePeriods(series, THRESHOLDS);
    expect(result?.current.end).toBe(series[13]?.date);
    expect(result?.current.days).toBe(7);
  });

  it('weights position by impressions and treats a lower number as better', () => {
    const previous = Array.from({ length: 7 }, (_, i): DailyPoint => ({
      date: addDays('2026-11-02', i),
      clicks: 10,
      impressions: 100,
      position: 9,
      missing: false,
      incomplete: false,
    }));
    const current = previous.map((p, i) => ({ ...p, date: addDays('2026-11-09', i), position: 6 }));
    const result = comparePeriods([...previous, ...current], THRESHOLDS);
    expect(result?.position).toMatchObject({
      previous: 9,
      current: 6,
      change: -3,
      direction: 'down',
    });
  });

  it('treats growth from zero as a rise', () => {
    const series = points([
      ...Array.from({ length: 7 }, () => [0, 0] as const),
      ...Array.from({ length: 7 }, () => [10, 100] as const),
    ]);
    const result = comparePeriods(series, THRESHOLDS);
    expect(result?.clicks).toMatchObject({ direction: 'up', relativeChange: null });
  });
});
