/**
 * Small, explainable statistics. Every function here can be described in one plain sentence,
 * which is a requirement for anything SearchUnveil shows to people.
 */

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

/** Average of `values` weighted by `weights`, ignoring pairs with a missing value or weight 0. */
export function weightedMean(
  values: readonly (number | null)[],
  weights: readonly number[],
): number | null {
  let weighted = 0;
  let total = 0;
  values.forEach((value, i) => {
    const weight = weights[i] ?? 0;
    if (value === null || weight <= 0) return;
    weighted += value * weight;
    total += weight;
  });
  return total > 0 ? weighted / total : null;
}

/**
 * Two-sided exact sign test: how likely is a split at least this uneven between "higher"
 * and "lower" days if each were equally likely? Ties carry no direction and are excluded.
 *
 * In plain words: if clicks were higher on 22 of 28 matching days, how often would chance
 * alone produce a split that lopsided?
 */
export function signTest(higher: number, lower: number): number {
  const n = higher + lower;
  if (n === 0) return 1;
  const k = Math.min(higher, lower);
  // P(X <= k) for X ~ Binomial(n, 1/2), accumulated in log space to stay accurate for large n.
  let logTerm = -n * Math.LN2; // log P(X = 0)
  let tail = Math.exp(logTerm);
  for (let i = 1; i <= k; i++) {
    logTerm += Math.log((n - i + 1) / i);
    tail += Math.exp(logTerm);
  }
  return Math.min(1, 2 * tail);
}
