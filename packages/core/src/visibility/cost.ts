import { callCount, normalizePlan, type ProviderTerms, type VisibilityPlan } from './plan.ts';
import type { VisibilityRecord } from './record.ts';

/**
 * What a check costs: estimated before it runs, so the person can agree to it or change the
 * plan, and worked out after, from the calls actually made.
 *
 * Amounts are added up in millionths of the currency's unit, so sums of small prices stay
 * exact: 90 calls at 0.0052 are 0.468, not 0.46799999999999997.
 */
const MICROS = 1_000_000;
const micros = (amount: number) => Math.round(amount * MICROS);

export interface EngineEstimate {
  readonly engine: string;
  readonly calls: number;
  /** `null` when the provider states no price for this engine. */
  readonly pricePerCall: number | null;
  readonly cost: number | null;
}

export interface CostEstimate {
  readonly currency: string;
  /** Calls the check makes: questions × engines × repeats. */
  readonly calls: number;
  readonly engines: readonly EngineEstimate[];
  /** What the calls with a stated price cost together. */
  readonly total: number;
  /** Calls without a stated price, which the total leaves out. */
  readonly unpricedCalls: number;
  /** Whether failed calls are billed too. When they are not, the total is the most it costs. */
  readonly chargesFailedCalls: boolean;
}

/**
 * The cost of a plan before it runs: each engine's price per call times the calls made with
 * it. Fewer questions, engines or repeats cost less; competitors cost nothing.
 */
export function estimateCost(input: VisibilityPlan, terms: ProviderTerms): CostEstimate {
  const plan = normalizePlan(input);
  const calls = plan.questions.length * plan.repeats;
  let total = 0;
  let unpricedCalls = 0;
  const engines = plan.engines.map((engine): EngineEstimate => {
    const pricePerCall = terms.engines.find(({ id }) => id === engine)?.pricePerCall ?? null;
    if (pricePerCall === null) {
      unpricedCalls += calls;
      return { engine, calls, pricePerCall, cost: null };
    }
    const cost = micros(pricePerCall) * calls;
    total += cost;
    return { engine, calls, pricePerCall, cost: cost / MICROS };
  });
  return {
    currency: terms.currency,
    calls: callCount(plan),
    engines,
    total: total / MICROS,
    unpricedCalls,
    chargesFailedCalls: terms.chargesFailedCalls,
  };
}

export interface ActualCost {
  readonly currency: string;
  /** Calls made, answered or not. */
  readonly calls: number;
  readonly answered: number;
  /** Calls that brought no answer, not counting those cut off by stopping the check. */
  readonly failed: number;
  /** Calls cut off when the person stopped the check. The provider may still bill them. */
  readonly interrupted: number;
  /** Calls billed: answered ones, and failed ones when the provider bills those. */
  readonly billed: number;
  /** What the billed calls cost, as the provider reported it or from its stated prices. */
  readonly total: number;
  /** Billed calls with neither a reported cost nor a stated price, which the total leaves out. */
  readonly unpricedCalls: number;
  /** Whether the provider reported every billed call's cost itself. */
  readonly reported: boolean;
}

/**
 * What a check cost, from the calls it made. A cost the provider reports for a call is used as
 * given, even zero; otherwise answered calls are billed at the stated price, and failed calls
 * only when the provider bills them.
 */
export function actualCost(
  record: Pick<VisibilityRecord, 'answers' | 'engines' | 'provider'>,
): ActualCost {
  const prices = new Map(record.engines.map((engine) => [engine.id, engine.pricePerCall]));
  let answered = 0;
  let failed = 0;
  let interrupted = 0;
  let billed = 0;
  let total = 0;
  let unpricedCalls = 0;
  let reported = true;
  for (const { engine, answer } of record.answers) {
    const stopped = !answer.ok && answer.failure === 'stopped';
    if (answer.ok) answered++;
    else if (stopped) interrupted++;
    else failed++;
    const charged =
      answer.cost === undefined
        ? answer.ok || (!stopped && record.provider.chargesFailedCalls)
        : answer.cost > 0;
    if (!charged) continue;
    billed++;
    if (answer.cost !== undefined) {
      total += micros(answer.cost);
      continue;
    }
    reported = false;
    const price = prices.get(engine) ?? null;
    if (price === null) unpricedCalls++;
    else total += micros(price);
  }
  return {
    currency: record.provider.currency,
    calls: record.answers.length,
    answered,
    failed,
    interrupted,
    billed,
    total: total / MICROS,
    unpricedCalls,
    reported,
  };
}
