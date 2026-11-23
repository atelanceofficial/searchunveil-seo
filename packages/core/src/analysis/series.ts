import type { MetricTable } from '../gsc/model.ts';
import { median } from './stats.ts';

export interface DailyPoint {
  /** ISO date, `YYYY-MM-DD`. */
  readonly date: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly position: number | null;
  /** The export had no row for this day; counted as zero. */
  readonly missing: boolean;
  /** The day looks partly processed; left out of comparisons. */
  readonly incomplete: boolean;
}

export const DAY_MS = 86_400_000;

/**
 * Search Console keeps 16 months of data. A date table spanning more than this many days
 * cannot come from it unchanged; only its most recent days are charted and compared.
 */
export const MAX_SERIES_DAYS = 1100;

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS);
}

export interface SeriesOptions {
  /** A final day below this share of the preceding median looks incomplete. */
  readonly incompleteShare: number;
  /** Median daily impressions needed before a low final day is called incomplete. */
  readonly incompleteMinMedian: number;
}

/**
 * Turns a date table into one point per calendar day. Days the export left out are filled
 * with zeros and marked, because a gap usually means the site had no impressions that day.
 *
 * The most recent one or two days are marked incomplete when they fall far below the
 * median of the two weeks before them: Search Console keeps processing recent data, and a
 * half-counted day would otherwise look like a sudden drop.
 */
export function buildDailySeries(table: MetricTable, options: SeriesOptions): DailyPoint[] {
  const byDate = new Map(table.rows.map((row) => [row.key, row.primary]));
  const earliest = table.rows[0]?.key;
  const last = table.rows.at(-1)?.key;
  if (earliest === undefined || last === undefined) return [];
  const limit = addDays(last, -(MAX_SERIES_DAYS - 1));
  const first = earliest < limit ? limit : earliest;

  const points: DailyPoint[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) {
    const metrics = byDate.get(day);
    points.push(
      metrics === undefined
        ? { date: day, clicks: 0, impressions: 0, position: null, missing: true, incomplete: false }
        : {
            date: day,
            clicks: metrics.clicks,
            impressions: metrics.impressions,
            position: metrics.position,
            missing: false,
            incomplete: false,
          },
    );
  }

  const reference = median(points.slice(-16, -2).map((p) => p.impressions));
  if (reference !== null && reference >= options.incompleteMinMedian && points.length >= 16) {
    const threshold = reference * options.incompleteShare;
    for (let offset = 1; offset <= 2; offset++) {
      const index = points.length - offset;
      const point = points[index];
      if (point === undefined || point.impressions >= threshold) break;
      points[index] = { ...point, incomplete: true };
    }
  }
  return points;
}
