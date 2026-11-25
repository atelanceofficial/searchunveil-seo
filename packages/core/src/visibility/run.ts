import { estimateCost, type CostEstimate } from './cost.ts';
import {
  normalizePlan,
  requestsOf,
  validatePlan,
  type Answer,
  type AnswerEngine,
  type AnswerProvider,
  type AnswerRequest,
  type PlanError,
  type VisibilityPlan,
} from './plan.ts';
import {
  createVisibilityRecord,
  readAnswer,
  type RecordedAnswer,
  type VisibilityRecord,
} from './record.ts';

export interface CheckProgress {
  /** Calls finished, answered or not. */
  readonly done: number;
  /** Calls planned. */
  readonly total: number;
  /** Finished calls that brought no answer. */
  readonly failed: number;
}

export interface CheckOptions {
  /**
   * Shown the estimated cost before any call is made. The check starts only when it returns
   * `true`: this is where the person agrees to pay.
   */
  readonly confirm: (estimate: CostEstimate) => boolean | Promise<boolean>;
  /** Stops the check: no new call starts, and calls under way are told to stop. */
  readonly signal?: AbortSignal;
  /** How many calls may run at once. */
  readonly concurrency?: number;
  readonly onProgress?: (progress: CheckProgress) => void;
  /** The clock for the record's timestamps. */
  readonly now?: () => Date;
}

export type CheckOutcome =
  | { readonly status: 'invalid'; readonly errors: readonly PlanError[] }
  | { readonly status: 'declined'; readonly estimate: CostEstimate }
  | {
      readonly status: 'done' | 'stopped';
      readonly estimate: CostEstimate;
      readonly record: VisibilityRecord;
    };

export const DEFAULT_CONCURRENCY = 2;
export const MAX_CONCURRENCY = 8;

/** One call, never rejecting: whatever goes wrong becomes a failed answer. */
async function ask(
  provider: AnswerProvider,
  request: AnswerRequest,
  signal: AbortSignal,
): Promise<Answer> {
  let answer: Answer | null;
  try {
    answer = readAnswer(await provider.ask(request, signal));
  } catch {
    answer = null;
  }
  // An answer that arrived is kept even when the person stopped meanwhile: it is paid for.
  if (answer?.ok === true) return answer;
  if (signal.aborted) {
    return answer?.cost === undefined
      ? { ok: false, failure: 'stopped' }
      : { ok: false, failure: 'stopped', cost: answer.cost };
  }
  return answer ?? { ok: false, failure: 'error' };
}

/**
 * Runs an AI visibility check: validates the plan, estimates its cost, and asks the questions
 * only once the person has agreed to that cost. Nothing is sent to the provider before
 * `confirm` returns `true`.
 *
 * Calls run a few at a time, all questions once before any is repeated. Failed calls are
 * recorded, never retried here: whether to retry, and at what cost, is the provider's to say.
 * Stopping keeps every answer received so far.
 */
export async function runVisibilityCheck(
  input: VisibilityPlan,
  provider: AnswerProvider,
  options: CheckOptions,
): Promise<CheckOutcome> {
  const errors = validatePlan(input, provider.engines);
  if (errors.length > 0) return { status: 'invalid', errors };
  const plan = normalizePlan(input);
  const estimate = estimateCost(plan, provider);
  const agreed: unknown = await options.confirm(estimate);
  if (agreed !== true) return { status: 'declined', estimate };

  const now = options.now ?? (() => new Date());
  const signal = options.signal ?? new AbortController().signal;
  const startedAt = now().toISOString();
  const requests = requestsOf(plan);
  const questionIndex = new Map(plan.questions.map((question, index) => [question, index]));
  const concurrency = Math.min(
    Math.max(Math.trunc(options.concurrency ?? DEFAULT_CONCURRENCY), 1),
    MAX_CONCURRENCY,
  );

  const results: RecordedAnswer[] = [];
  let next = 0;
  let failed = 0;
  const work = async () => {
    while (!signal.aborted) {
      const request = requests[next++];
      if (request === undefined) return;
      const answer = await ask(provider, request, signal);
      results.push({
        question: questionIndex.get(request.question) ?? 0,
        engine: request.engine,
        attempt: request.attempt,
        answer,
      });
      if (!answer.ok) failed++;
      try {
        options.onProgress?.({ done: results.length, total: requests.length, failed });
      } catch {
        // A display that fails must not stop calls the person has paid for.
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, requests.length) }, work));

  const engines = plan.engines
    .map((id) => provider.engines.find((engine) => engine.id === id))
    .filter((engine): engine is AnswerEngine => engine !== undefined);
  const record = createVisibilityRecord({
    plan,
    provider,
    engines,
    answers: results,
    startedAt,
    finishedAt: now().toISOString(),
  });
  return { status: record.complete ? 'done' : 'stopped', estimate, record };
}
