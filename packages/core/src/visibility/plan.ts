import { isValidLanguageTag } from '../audit/review.ts';
import { fold } from '../text/fold.ts';
import { siteKey } from './match.ts';

/**
 * What an AI visibility check asks, and of which AI answer engines.
 *
 * The check asks each question of each chosen engine, several times because AI answers vary
 * from one time to the next, then looks in every answer for the person's site and brand and
 * for their competitors'. Only asking costs money, and only the answer provider asks: it is
 * the one part that changes from one platform to another. Everything else runs here.
 */

export interface Brand {
  /** The site's address, written any way people write it: `example.com`, `https://www.example.com/`. */
  readonly site: string;
  /** The name the brand goes by, such as "Example Sports"; empty to look for the address only. */
  readonly name: string;
  /** Other ways the name is written, such as an abbreviation. */
  readonly aliases?: readonly string[];
}

export interface VisibilityPlan {
  /** The person's own site and brand. */
  readonly brand: Brand;
  /** Competitors looked for in the same answers. They cost nothing: no call is made for them. */
  readonly competitors: readonly Brand[];
  /** What people ask, such as "best running shoes for beginners". */
  readonly questions: readonly string[];
  /** The ids of the answer engines to ask, as their provider lists them. */
  readonly engines: readonly string[];
  /** How many times each question is asked of each engine. */
  readonly repeats: number;
  /** Where people ask from: an ISO 3166-1 region code such as `TR`. */
  readonly country: string;
  /** The language people ask in: a BCP 47 tag such as `tr`. */
  readonly language: string;
}

export const VISIBILITY_LIMITS = Object.freeze({
  questions: 50,
  questionLength: 300,
  competitors: 5,
  aliases: 5,
  nameLength: 100,
  engines: 10,
  repeats: 5,
});

/** One AI product a provider can ask, such as an AI search engine answering with one model. */
export interface AnswerEngine {
  /** Stable id within its provider. */
  readonly id: string;
  /** The name people know it by, such as "Perplexity" or "Google AI Overviews". */
  readonly label: string;
  /**
   * The AI product it stands for. Engines of one family are one product asked through
   * different models, at different prices; checks over time are compared by family.
   */
  readonly family: string;
  /** The model that answers, when the provider names it. */
  readonly model?: string;
  /** The price of one call in the provider's currency; `null` when the provider states none. */
  readonly pricePerCall: number | null;
}

export interface AnswerRequest {
  readonly engine: string;
  readonly question: string;
  readonly country: string;
  readonly language: string;
  /** Which time this question is asked of this engine, from 1. */
  readonly attempt: number;
}

/** Why a call brought no answer. `stopped`: the person stopped the check while it ran. */
export const ANSWER_FAILURES = [
  'unavailable',
  'rate-limited',
  'refused',
  'no-balance',
  'timeout',
  'error',
  'stopped',
] as const;

export type AnswerFailure = (typeof ANSWER_FAILURES)[number];

export type Answer =
  | {
      readonly ok: true;
      /** The answer's text as the engine wrote it. */
      readonly text: string;
      /** The addresses of the answer's sources, in the order the answer gave them. */
      readonly sources: readonly string[];
      /** What the provider says this call cost, when it says. */
      readonly cost?: number;
    }
  | {
      readonly ok: false;
      readonly failure: AnswerFailure;
      /** What the provider says this call cost, when it says. */
      readonly cost?: number;
    };

/**
 * Asks the questions: the only part of a check that costs money, and the only part that
 * changes from one platform to another, such as a tool marketplace's paid tools or a person's
 * own accounts with AI services.
 */
export interface AnswerProvider {
  readonly id: string;
  /** Who bills the calls, as people know it. */
  readonly label: string;
  /** The ISO 4217 currency of its prices, such as `USD`. */
  readonly currency: string;
  readonly engines: readonly AnswerEngine[];
  /** Whether calls that fail are billed too. */
  readonly chargesFailedCalls: boolean;
  /**
   * Asks one question. Resolves with the answer, or with the reason there is none; a
   * rejection counts as `error`. `signal` aborts when the person stops the check.
   */
  ask(request: AnswerRequest, signal: AbortSignal): Promise<Answer>;
}

/** The parts of a provider that pricing and planning read. */
export type ProviderTerms = Pick<AnswerProvider, 'currency' | 'engines' | 'chargesFailedCalls'>;

export type PlanField =
  | 'brand.site'
  | 'brand.name'
  | 'brand.aliases'
  | 'competitors'
  | 'competitor.site'
  | 'competitor.name'
  | 'competitor.aliases'
  | 'questions'
  | 'engines'
  | 'repeats'
  | 'country'
  | 'language';

export type PlanErrorCode =
  | 'required'
  | 'invalid'
  | 'too-many'
  | 'too-long'
  | 'out-of-range'
  | 'unknown-engine'
  | 'same-as-brand'
  | 'duplicate';

export interface PlanError {
  readonly field: PlanField;
  readonly code: PlanErrorCode;
  /** The item's place in its list, from 1, for errors about one competitor, question or engine. */
  readonly index?: number;
  /** The limit that was passed. */
  readonly max?: number;
}

const clean = (text: string) => text.trim().replace(/\s+/g, ' ');

/** Keeps the first of the values that fold to the same text. */
function unique(values: readonly string[], key: (value: string) => string): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const folded = key(value);
    if (value === '' || seen.has(folded)) return false;
    seen.add(folded);
    return true;
  });
}

function normalizeBrand(brand: Brand): Brand {
  return {
    site: brand.site.trim(),
    name: clean(brand.name),
    aliases: unique((brand.aliases ?? []).map(clean), fold),
  };
}

/**
 * The plan as it will run: text trimmed, blank entries and repeated questions and engines
 * dropped, and the region code in capitals. Costs are always estimated on this form.
 */
export function normalizePlan(plan: VisibilityPlan): VisibilityPlan {
  return {
    brand: normalizeBrand(plan.brand),
    competitors: plan.competitors
      .map(normalizeBrand)
      .filter((brand) => brand.site !== '' || brand.name !== ''),
    questions: unique(plan.questions.map(clean), fold),
    engines: unique(
      plan.engines.map((engine) => engine.trim()),
      (engine) => engine,
    ),
    repeats: plan.repeats,
    country: plan.country.trim().toUpperCase(),
    language: plan.language.trim(),
  };
}

function brandErrors(
  brand: Brand,
  fields: { site: PlanField; name: PlanField; aliases: PlanField },
  index?: number,
): PlanError[] {
  const at = index === undefined ? {} : { index };
  const errors: PlanError[] = [];
  if (brand.site.trim() === '') errors.push({ field: fields.site, code: 'required', ...at });
  else if (siteKey(brand.site) === null)
    errors.push({ field: fields.site, code: 'invalid', ...at });
  const max = VISIBILITY_LIMITS.nameLength;
  if (brand.name.length > max) errors.push({ field: fields.name, code: 'too-long', max, ...at });
  const aliases = brand.aliases ?? [];
  if (aliases.length > VISIBILITY_LIMITS.aliases) {
    errors.push({ field: fields.aliases, code: 'too-many', max: VISIBILITY_LIMITS.aliases, ...at });
  } else if (aliases.some((alias) => alias.length > max)) {
    errors.push({ field: fields.aliases, code: 'too-long', max, ...at });
  }
  return errors;
}

/**
 * What stops the plan from running, checked on its normalized form against the engines the
 * provider offers. An empty list means it can run.
 */
export function validatePlan(input: VisibilityPlan, engines: readonly AnswerEngine[]): PlanError[] {
  const plan = normalizePlan(input);
  const errors = brandErrors(plan.brand, {
    site: 'brand.site',
    name: 'brand.name',
    aliases: 'brand.aliases',
  });

  const own = siteKey(plan.brand.site);
  if (plan.competitors.length > VISIBILITY_LIMITS.competitors) {
    errors.push({ field: 'competitors', code: 'too-many', max: VISIBILITY_LIMITS.competitors });
  }
  const fields = {
    site: 'competitor.site',
    name: 'competitor.name',
    aliases: 'competitor.aliases',
  } as const;
  const sites = new Set<string>();
  plan.competitors.forEach((competitor, i) => {
    const index = i + 1;
    errors.push(...brandErrors(competitor, fields, index));
    const key = siteKey(competitor.site);
    if (key === null) return;
    if (key === own) errors.push({ field: 'competitor.site', code: 'same-as-brand', index });
    else if (sites.has(key)) errors.push({ field: 'competitor.site', code: 'duplicate', index });
    sites.add(key);
  });

  if (plan.questions.length === 0) errors.push({ field: 'questions', code: 'required' });
  else if (plan.questions.length > VISIBILITY_LIMITS.questions) {
    errors.push({ field: 'questions', code: 'too-many', max: VISIBILITY_LIMITS.questions });
  }
  plan.questions.forEach((question, i) => {
    if (question.length > VISIBILITY_LIMITS.questionLength) {
      errors.push({
        field: 'questions',
        code: 'too-long',
        index: i + 1,
        max: VISIBILITY_LIMITS.questionLength,
      });
    }
  });

  const offered = new Set(engines.map((engine) => engine.id));
  if (plan.engines.length === 0) errors.push({ field: 'engines', code: 'required' });
  else if (plan.engines.length > VISIBILITY_LIMITS.engines) {
    errors.push({ field: 'engines', code: 'too-many', max: VISIBILITY_LIMITS.engines });
  }
  plan.engines.forEach((engine, i) => {
    if (!offered.has(engine))
      errors.push({ field: 'engines', code: 'unknown-engine', index: i + 1 });
  });

  if (
    !Number.isInteger(plan.repeats) ||
    plan.repeats < 1 ||
    plan.repeats > VISIBILITY_LIMITS.repeats
  ) {
    errors.push({ field: 'repeats', code: 'out-of-range', max: VISIBILITY_LIMITS.repeats });
  }
  if (plan.country === '') errors.push({ field: 'country', code: 'required' });
  else if (!/^[A-Z]{2}$/.test(plan.country)) errors.push({ field: 'country', code: 'invalid' });
  if (plan.language === '') errors.push({ field: 'language', code: 'required' });
  else if (!isValidLanguageTag(plan.language)) errors.push({ field: 'language', code: 'invalid' });
  return errors;
}

/** How many calls a plan makes: questions × engines × repeats. Competitors add none. */
export function callCount(plan: VisibilityPlan): number {
  return plan.questions.length * plan.engines.length * plan.repeats;
}

/**
 * Every call of a plan, in the order they are made: all questions once on every engine, then
 * again for each repeat. A check stopped halfway has then asked every question at least once
 * before it asks any a second time.
 */
export function requestsOf(plan: VisibilityPlan): AnswerRequest[] {
  const requests: AnswerRequest[] = [];
  for (let attempt = 1; attempt <= plan.repeats; attempt++) {
    for (const question of plan.questions) {
      for (const engine of plan.engines) {
        requests.push({
          engine,
          question,
          country: plan.country,
          language: plan.language,
          attempt,
        });
      }
    }
  }
  return requests;
}

/**
 * The engines a check starts with: in each family, the cheapest engine with a stated price.
 * Dearer models are left for the person to add: the dearest model is not the truest measure,
 * since what counts is the answer people actually get. Families with no stated price are left
 * out too, so that nothing is billed at an unknown price unless the person chooses it.
 */
export function defaultEngines(engines: readonly AnswerEngine[]): string[] {
  const cheapest = new Map<string, { readonly id: string; readonly price: number }>();
  for (const { id, family, pricePerCall: price } of engines) {
    if (price === null) continue;
    const current = cheapest.get(family);
    if (current === undefined || price < current.price) cheapest.set(family, { id, price });
  }
  return [...cheapest.values()].map((engine) => engine.id);
}
