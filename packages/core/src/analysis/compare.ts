import type { DailyPoint } from './series.ts';
import { signTest, sum, weightedMean } from './stats.ts';

/**
 * Compares two equal, back-to-back periods of daily data.
 *
 * Both periods span whole weeks, so each day of the recent period lines up with the same
 * weekday in the previous one; weekly patterns (busy weekdays, quiet weekends) then cannot
 * masquerade as change. Days that look incomplete are left out.
 */

export type ComparedMetric = 'clicks' | 'impressions' | 'ctr' | 'position';

/**
 * - `up` / `down`: the value moved by at least the material threshold.
 * - `flat`: it moved less than that; described as "about the same".
 * - `insufficient`: too little data to say anything responsible.
 */
export type Direction = 'up' | 'down' | 'flat' | 'insufficient';

export interface PeriodTotals {
  readonly start: string;
  readonly end: string;
  readonly days: number;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number | null;
  readonly position: number | null;
}

/** How matching days compared, for counts: the evidence behind "steady" or "uneven". */
export interface DayByDay {
  readonly higher: number;
  readonly lower: number;
  readonly tied: number;
  /** Two-sided sign-test p-value. */
  readonly pValue: number;
  /** True when significantly more matching days moved in the direction of the total change. */
  readonly consistent: boolean;
}

export interface MetricChange {
  readonly metric: ComparedMetric;
  readonly previous: number | null;
  readonly current: number | null;
  /** `current - previous`. */
  readonly change: number | null;
  /** `change / previous`; `null` when the previous value is zero or missing. */
  readonly relativeChange: number | null;
  readonly direction: Direction;
  readonly dayByDay: DayByDay | null;
}

export interface PeriodComparison {
  readonly previous: PeriodTotals;
  readonly current: PeriodTotals;
  readonly clicks: MetricChange;
  readonly impressions: MetricChange;
  readonly ctr: MetricChange;
  readonly position: MetricChange;
}

export interface ComparisonThresholds {
  /** Smallest relative change described as a change (0.05 is 5%). */
  readonly materialChange: number;
  /** Clicks needed across both periods before clicks or CTR are compared. */
  readonly minClicks: number;
  /** Impressions needed across both periods before impressions or position are compared. */
  readonly minImpressions: number;
  /** Smallest change in average position described as a change. */
  readonly minPositionChange: number;
  /** Sign-test level below which a day-by-day pattern counts as consistent. */
  readonly consistencyLevel: number;
}

/**
 * Length of each period: four weeks when eight are available (Search Console's own
 * default comparison), otherwise the most whole weeks that fit twice. `null` below two weeks.
 */
export function periodLength(days: number): number | null {
  if (days >= 56) return 28;
  const weeks = Math.floor(days / 14);
  return weeks >= 1 ? weeks * 7 : null;
}

export function comparePeriods(
  points: readonly DailyPoint[],
  thresholds: ComparisonThresholds,
): PeriodComparison | null {
  let end = points.length;
  while (end > 0 && points[end - 1]?.incomplete === true) end--;
  const usable = points.slice(0, end);
  const length = periodLength(usable.length);
  if (length === null) return null;

  const current = usable.slice(-length);
  const previous = usable.slice(-2 * length, -length);
  const currentTotals = totals(current);
  const previousTotals = totals(previous);

  return {
    previous: previousTotals,
    current: currentTotals,
    clicks: countChange('clicks', previous, current, thresholds.minClicks, thresholds),
    impressions: countChange(
      'impressions',
      previous,
      current,
      thresholds.minImpressions,
      thresholds,
    ),
    ctr: ctrChange(previousTotals, currentTotals, thresholds),
    position: positionChange(previousTotals, currentTotals, thresholds),
  };
}

export function totals(points: readonly DailyPoint[]): PeriodTotals {
  const clicks = sum(points.map((p) => p.clicks));
  const impressions = sum(points.map((p) => p.impressions));
  return {
    start: points[0]?.date ?? '',
    end: points.at(-1)?.date ?? '',
    days: points.length,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    // Daily positions are impression-weighted averages, so weighting them by impressions
    // reproduces the period's average position.
    position: weightedMean(
      points.map((p) => p.position),
      points.map((p) => p.impressions),
    ),
  };
}

function countChange(
  metric: 'clicks' | 'impressions',
  previousDays: readonly DailyPoint[],
  currentDays: readonly DailyPoint[],
  minimum: number,
  thresholds: ComparisonThresholds,
): MetricChange {
  const previous = sum(previousDays.map((p) => p[metric]));
  const current = sum(currentDays.map((p) => p[metric]));
  const change = current - previous;
  const relativeChange = previous > 0 ? change / previous : null;

  let higher = 0;
  let lower = 0;
  let tied = 0;
  currentDays.forEach((day, i) => {
    const before = previousDays[i]?.[metric] ?? 0;
    if (day[metric] > before) higher++;
    else if (day[metric] < before) lower++;
    else tied++;
  });
  const pValue = signTest(higher, lower);

  let direction: Direction;
  if (previous + current < minimum) direction = 'insufficient';
  else if (relativeChange === null) direction = current > 0 ? 'up' : 'flat';
  else if (Math.abs(relativeChange) < thresholds.materialChange) direction = 'flat';
  else direction = change > 0 ? 'up' : 'down';

  const consistent =
    pValue < thresholds.consistencyLevel &&
    ((direction === 'up' && higher > lower) || (direction === 'down' && lower > higher));

  return {
    metric,
    previous,
    current,
    change,
    relativeChange,
    direction,
    dayByDay: { higher, lower, tied, pValue, consistent },
  };
}

function ctrChange(
  previous: PeriodTotals,
  current: PeriodTotals,
  thresholds: ComparisonThresholds,
): MetricChange {
  const enoughData =
    previous.impressions + current.impressions >= thresholds.minImpressions &&
    previous.clicks + current.clicks >= thresholds.minClicks;
  return ratioChange('ctr', previous.ctr, current.ctr, enoughData, thresholds.materialChange);
}

function positionChange(
  previous: PeriodTotals,
  current: PeriodTotals,
  thresholds: ComparisonThresholds,
): MetricChange {
  const before = previous.position;
  const after = current.position;
  if (
    before === null ||
    after === null ||
    previous.impressions + current.impressions < thresholds.minImpressions
  ) {
    return {
      metric: 'position',
      previous: before,
      current: after,
      change: before === null || after === null ? null : after - before,
      relativeChange: before === null || after === null ? null : (after - before) / before,
      direction: 'insufficient',
      dayByDay: null,
    };
  }
  const change = after - before;
  const smallest = Math.max(thresholds.minPositionChange, before * thresholds.materialChange);
  return {
    metric: 'position',
    previous: before,
    current: after,
    change,
    relativeChange: change / before,
    direction: Math.abs(change) < smallest ? 'flat' : change > 0 ? 'up' : 'down',
    dayByDay: null,
  };
}

function ratioChange(
  metric: ComparedMetric,
  previous: number | null,
  current: number | null,
  enoughData: boolean,
  materialChange: number,
): MetricChange {
  const change = previous === null || current === null ? null : current - previous;
  const relativeChange =
    change === null || previous === null || previous === 0 ? null : change / previous;
  let direction: Direction = 'insufficient';
  if (enoughData && change !== null) {
    if (relativeChange === null) direction = change > 0 ? 'up' : 'flat';
    else if (Math.abs(relativeChange) < materialChange) direction = 'flat';
    else direction = change > 0 ? 'up' : 'down';
  }
  return { metric, previous, current, change, relativeChange, direction, dayByDay: null };
}
