import type { DailyPoint } from '@searchunveil/core';

/** Pure chart calculations, kept apart from rendering so they can be tested directly. */

export type ChartMetric = 'clicks' | 'impressions' | 'ctr' | 'position';

/** Days in the trailing average: one full week, so weekly rhythm cancels out. */
export const WINDOW = 7;

interface Series {
  readonly daily: readonly (number | null)[];
  readonly average: readonly (number | null)[];
}

/** Daily values and a trailing 7-day average; ratios are recomputed from sums, not averaged. */
export function seriesFor(points: readonly DailyPoint[], metric: ChartMetric): Series {
  const daily = points.map((p) => {
    if (metric === 'clicks') return p.clicks;
    if (metric === 'impressions') return p.impressions;
    if (metric === 'ctr') return p.impressions > 0 ? p.clicks / p.impressions : null;
    return p.position;
  });
  const average = points.map((_, i) => {
    if (i < WINDOW - 1) return null;
    const window = points.slice(i - WINDOW + 1, i + 1);
    const impressions = window.reduce((sum, p) => sum + p.impressions, 0);
    if (metric === 'clicks') return window.reduce((sum, p) => sum + p.clicks, 0) / WINDOW;
    if (metric === 'impressions') return impressions / WINDOW;
    if (impressions === 0) return null;
    if (metric === 'ctr') return window.reduce((sum, p) => sum + p.clicks, 0) / impressions;
    // Weight only days that report a position; without any, there is no average to show.
    let weighted = 0;
    let weight = 0;
    for (const p of window) {
      if (p.position === null || p.impressions === 0) continue;
      weighted += p.position * p.impressions;
      weight += p.impressions;
    }
    return weight > 0 ? weighted / weight : null;
  });
  return { daily, average };
}

/** Round, evenly spaced axis ticks; the first is at or below `min`, the last at or above `max`. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const low = Math.min(min, max);
  const high = max === min ? max + 1 : Math.max(min, max);
  const rough = (high - low) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  const first = Math.floor(low / step) * step;
  const ticks: number[] = [];
  // Stepping by index (not by repeated addition) keeps values exact; the bound is a safety net.
  for (let i = 0; i <= 2 * count + 2; i++) {
    const value = Number((first + i * step).toFixed(10));
    ticks.push(value);
    if (value >= high) break;
  }
  return ticks;
}
