import type { DailyPoint } from '@searchunveil/core';
import { describe, expect, it } from 'vitest';
import { niceTicks, seriesFor } from './chart-math.ts';

function day(i: number, clicks: number, impressions: number, position: number | null): DailyPoint {
  return {
    date: new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10),
    clicks,
    impressions,
    position,
    missing: false,
    incomplete: false,
  };
}

describe('niceTicks', () => {
  it('produces round steps that cover the range', () => {
    expect(niceTicks(0, 73)).toEqual([0, 20, 40, 60, 80]);
    expect(niceTicks(0, 0.034)).toEqual([0, 0.01, 0.02, 0.03, 0.04]);
    expect(niceTicks(1.2, 9.7)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(niceTicks(5, 5)).toEqual([5, 5.25, 5.5, 5.75, 6]);
  });
});

describe('seriesFor', () => {
  const points = Array.from({ length: 8 }, (_, i) => day(i, 10 + i, 100, i % 2 === 0 ? 4 : 8));

  it('averages counts over a trailing week', () => {
    const { daily, average } = seriesFor(points, 'clicks');
    expect(daily[0]).toBe(10);
    expect(average.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(average[6]).toBe(13);
    expect(average[7]).toBe(14);
  });

  it('recomputes rates from sums instead of averaging them', () => {
    const skewed = [...Array.from({ length: 6 }, (_, i) => day(i, 0, 1, 5)), day(6, 70, 700, 5)];
    expect(seriesFor(skewed, 'ctr').average[6]).toBeCloseTo(70 / 706);
  });

  it('weights position by impressions and ignores days without one', () => {
    const mixed = Array.from({ length: 7 }, (_, i) =>
      day(i, 1, i === 0 ? 600 : 100, i === 0 ? 2 : null),
    );
    expect(seriesFor(mixed, 'position').average[6]).toBe(2);
    const none = Array.from({ length: 7 }, (_, i) => day(i, 1, 100, null));
    expect(seriesFor(none, 'position').average[6]).toBeNull();
  });
});
