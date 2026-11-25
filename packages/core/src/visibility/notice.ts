import type { CoreMessage } from '../findings.ts';
import { list, message, money } from '../i18n/message.ts';
import { PRICING } from '../pricing.ts';
import type { ActualCost, CostEstimate } from './cost.ts';
import {
  normalizePlan,
  type AnswerEngine,
  type ProviderTerms,
  type VisibilityPlan,
} from './plan.ts';

/**
 * What the person reads about money, as messages: before a check, after it, and when a free
 * trial starts. Composed here so that no screen or assistant can leave a sentence out.
 */

/**
 * How the calls are paid: `balance`, from a balance the person holds with the provider, such
 * as a tool marketplace's; `account`, by the person's own account with an AI service.
 */
export type Billing = 'balance' | 'account';

export interface NoticeTerms {
  /** Who bills the calls, as people know it. */
  readonly provider: string;
  readonly billing: Billing;
}

/**
 * Everything to show before a check, in order, ending with the question. The check may start
 * only after the person answers yes to it.
 */
export function costNotice(estimate: CostEstimate, terms: NoticeTerms): CoreMessage[] {
  const { provider, billing } = terms;
  return [
    message('visibility.paid-tools', { provider }),
    message('visibility.cost.estimate', {
      calls: estimate.calls,
      amount: money(estimate.total, estimate.currency),
    }),
    ...(estimate.unpricedCalls === 0
      ? []
      : [message('visibility.cost.unpriced', { calls: estimate.unpricedCalls })]),
    message('visibility.cost.billing', { billing, provider, trialDays: PRICING.freeTrialDays }),
    message(
      estimate.chargesFailedCalls
        ? 'visibility.cost.failed-charged'
        : 'visibility.cost.failed-free',
    ),
    message('visibility.cost.confirm'),
  ];
}

/** What a check cost, to show when it ends. */
export function actualCostNotice(actual: ActualCost, provider: string): CoreMessage[] {
  const failedFree = actual.chargesFailedCalls ? 0 : actual.failed;
  return [
    message('visibility.cost.actual', {
      calls: actual.calls,
      amount: money(actual.total, actual.currency),
    }),
    ...(actual.unpricedCalls === 0
      ? []
      : [message('visibility.cost.actual.unpriced', { calls: actual.unpricedCalls })]),
    ...(failedFree === 0
      ? []
      : [message('visibility.cost.failed-free-count', { calls: failedFree })]),
    ...(actual.interrupted === 0
      ? []
      : [message('visibility.cost.interrupted', { calls: actual.interrupted, provider })]),
  ];
}

/**
 * The warning to show when a free trial starts: "free" covers the subscription, not the
 * provider's paid tools, which are billed during the trial too.
 */
export function trialNotice(provider: string): CoreMessage {
  return message('pricing.trial', { provider, trialDays: PRICING.freeTrialDays });
}

/** The AI products people ask about most, by engine family, as people know them. */
export const AI_PRODUCTS: Readonly<Record<string, string>> = Object.freeze({
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  copilot: 'Microsoft Copilot',
  gemini: 'Gemini',
  'google-ai-mode': 'Google AI Mode',
  'google-ai-overviews': 'Google AI Overviews',
  perplexity: 'Perplexity',
});

/**
 * The AI products that cannot be checked with these engines, by name, so the person is told
 * plainly rather than left to wonder why one is missing.
 */
export function unavailableProducts(
  engines: readonly AnswerEngine[],
  wanted: readonly string[] = Object.keys(AI_PRODUCTS),
): string[] {
  const offered = new Set(engines.map((engine) => engine.family));
  return wanted
    .filter((family) => !offered.has(family))
    .map((family) => AI_PRODUCTS[family] ?? family);
}

/** The message telling the person which AI products this provider cannot check. */
export function unavailableNotice(
  products: readonly string[],
  provider: string,
): CoreMessage | null {
  return products.length === 0
    ? null
    : message('visibility.engine.unavailable', {
        products: list(products),
        count: products.length,
        provider,
      });
}

export interface EngineOption {
  readonly engine: AnswerEngine;
  /** What this engine adds to the plan: its price × questions × repeats; `null` when unpriced. */
  readonly cost: number | null;
  /** Whether the plan uses it. */
  readonly chosen: boolean;
  /** Whether it is the cheapest priced engine of its family, the one suggested by default. */
  readonly cheapest: boolean;
}

/**
 * Every engine the person can choose, grouped by family in the provider's order, with what
 * each would cost for this plan, so that a choice of model shows its price.
 */
export function engineOptions(input: VisibilityPlan, terms: ProviderTerms): EngineOption[] {
  const plan = normalizePlan(input);
  const calls = plan.questions.length * plan.repeats;
  const cheapest = new Map<string, number>();
  for (const { family, pricePerCall } of terms.engines) {
    if (pricePerCall === null) continue;
    cheapest.set(family, Math.min(cheapest.get(family) ?? Infinity, pricePerCall));
  }
  const families = [...new Set(terms.engines.map((engine) => engine.family))];
  return families.flatMap((family) =>
    terms.engines
      .filter((engine) => engine.family === family)
      .map((engine) => ({
        engine,
        cost:
          engine.pricePerCall === null
            ? null
            : (Math.round(engine.pricePerCall * 1_000_000) * calls) / 1_000_000,
        chosen: plan.engines.includes(engine.id),
        cheapest: engine.pricePerCall !== null && engine.pricePerCall === cheapest.get(family),
      })),
  );
}
