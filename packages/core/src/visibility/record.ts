import { DiagnosticCollector, diagnostic, failure, success, type Result } from '../diagnostics.ts';
import {
  ANSWER_FAILURES,
  callCount,
  normalizePlan,
  validatePlan,
  type Answer,
  type AnswerEngine,
  type AnswerFailure,
  type AnswerProvider,
  type Brand,
  type VisibilityPlan,
} from './plan.ts';

/**
 * A check as it happened: the plan, the engines with the prices stated at the time, and every
 * answer exactly as it came. Reports, costs and trends are worked out from it when needed and
 * never stored in its place, so a better matcher can read old checks again.
 */
export const VISIBILITY_RECORD_FORMAT = 'searchunveil.ai-visibility';
export const VISIBILITY_RECORD_VERSION = 1;

/** What one answer may hold. Longer text and lists are cut, so no answer can exhaust memory. */
export const ANSWER_LIMITS = Object.freeze({
  textLength: 100_000,
  sources: 100,
  sourceLength: 2048,
});

export interface RecordedAnswer {
  /** The question's place in the plan's list, from 0. */
  readonly question: number;
  readonly engine: string;
  /** Which time the question was asked of this engine, from 1. */
  readonly attempt: number;
  readonly answer: Answer;
}

/** Who asked the questions and billed them. */
export type ProviderInfo = Pick<AnswerProvider, 'id' | 'label' | 'currency' | 'chargesFailedCalls'>;

export interface VisibilityRecord {
  readonly format: typeof VISIBILITY_RECORD_FORMAT;
  readonly version: typeof VISIBILITY_RECORD_VERSION;
  /** When the check started and ended, as ISO 8601 timestamps in UTC. */
  readonly startedAt: string;
  readonly finishedAt: string;
  /** `false` when the check was stopped before every planned call was answered or failed. */
  readonly complete: boolean;
  readonly plan: VisibilityPlan;
  readonly provider: ProviderInfo;
  /** The engines asked, with the prices stated when the check ran. */
  readonly engines: readonly AnswerEngine[];
  /** Every call made, in the order the calls were planned. */
  readonly answers: readonly RecordedAnswer[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFailure = (value: unknown): value is AnswerFailure =>
  typeof value === 'string' && (ANSWER_FAILURES as readonly string[]).includes(value);

/**
 * An answer in the form a record keeps it, or `null` when `value` is not an answer. Text and
 * sources are cut to `ANSWER_LIMITS`; a source that is not text keeps its place as an empty
 * entry, so positions still match the list the answer gave.
 */
export function readAnswer(value: unknown): Answer | null {
  if (!isObject(value)) return null;
  const cost = value['cost'];
  const charged = typeof cost === 'number' && Number.isFinite(cost) && cost >= 0 ? { cost } : {};
  if (value['ok'] === true) {
    const text = value['text'];
    const sources = value['sources'];
    if (typeof text !== 'string' || !Array.isArray(sources)) return null;
    return {
      ok: true,
      text: text.slice(0, ANSWER_LIMITS.textLength),
      sources: sources
        .slice(0, ANSWER_LIMITS.sources)
        .map((source: unknown) =>
          typeof source === 'string' ? source.slice(0, ANSWER_LIMITS.sourceLength) : '',
        ),
      ...charged,
    };
  }
  if (value['ok'] === false) {
    const reason = value['failure'];
    return { ok: false, failure: isFailure(reason) ? reason : 'error', ...charged };
  }
  return null;
}

/** The plain data of an engine, without anything else its provider attached to it. */
function engineData(engine: AnswerEngine): AnswerEngine {
  const { id, label, family, model, pricePerCall } = engine;
  return model === undefined
    ? { id, label, family, pricePerCall }
    : { id, label, family, model, pricePerCall };
}

export interface RecordInput {
  readonly plan: VisibilityPlan;
  readonly provider: ProviderInfo;
  readonly engines: readonly AnswerEngine[];
  readonly answers: readonly RecordedAnswer[];
  readonly startedAt: string;
  readonly finishedAt: string;
}

/**
 * Makes a record from a check's parts, such as answers collected by an assistant through its
 * own tools. Answers are put in planned order; the record is complete when every planned call
 * was made and none was cut off.
 */
export function createVisibilityRecord(input: RecordInput): VisibilityRecord {
  const plan = normalizePlan(input.plan);
  const engineOrder = new Map(plan.engines.map((id, index) => [id, index]));
  const order = (answer: RecordedAnswer) =>
    ((answer.attempt - 1) * plan.questions.length + answer.question) * plan.engines.length +
    (engineOrder.get(answer.engine) ?? 0);
  const answers = [...input.answers].sort((a, b) => order(a) - order(b));
  const complete =
    answers.length === callCount(plan) &&
    answers.every(({ answer }) => answer.ok || answer.failure !== 'stopped');
  const { id, label, currency, chargesFailedCalls } = input.provider;
  return {
    format: VISIBILITY_RECORD_FORMAT,
    version: VISIBILITY_RECORD_VERSION,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    complete,
    plan,
    provider: { id, label, currency, chargesFailedCalls },
    engines: input.engines.map(engineData),
    answers,
  };
}

export function serializeVisibilityRecord(record: VisibilityRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`;
}

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

const isText = (value: unknown): value is string => typeof value === 'string';
const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isText);

function readBrand(value: unknown): Brand | null {
  if (!isObject(value)) return null;
  const { site, name, aliases } = value;
  if (!isText(site) || !isText(name)) return null;
  if (aliases === undefined) return { site, name };
  return isTextList(aliases) ? { site, name, aliases } : null;
}

/** A plan in the shape a record keeps it, or `null` when `value` is not one. Not validated. */
export function readPlan(value: unknown): VisibilityPlan | null {
  if (!isObject(value)) return null;
  const brand = readBrand(value['brand']);
  const competitors = value['competitors'];
  const { questions, engines, repeats, country, language } = value;
  if (brand === null || !Array.isArray(competitors)) return null;
  const rivals = competitors.map(readBrand);
  if (
    rivals.includes(null) ||
    !isTextList(questions) ||
    !isTextList(engines) ||
    typeof repeats !== 'number' ||
    !isText(country) ||
    !isText(language)
  ) {
    return null;
  }
  return {
    brand,
    competitors: rivals.filter((rival) => rival !== null),
    questions,
    engines,
    repeats,
    country,
    language,
  };
}

/** An engine in the shape a record keeps it, or `null` when `value` is not one. */
export function readEngine(value: unknown): AnswerEngine | null {
  if (!isObject(value)) return null;
  const { id, label, family, model, pricePerCall } = value;
  if (!isText(id) || !isText(label) || !isText(family)) return null;
  if (model !== undefined && !isText(model)) return null;
  const price =
    pricePerCall === null ||
    (typeof pricePerCall === 'number' && Number.isFinite(pricePerCall) && pricePerCall >= 0)
      ? pricePerCall
      : undefined;
  if (price === undefined) return null;
  return engineData(
    model === undefined
      ? { id, label, family, pricePerCall: price }
      : { id, label, family, model, pricePerCall: price },
  );
}

function readProvider(value: unknown): ProviderInfo | null {
  if (!isObject(value)) return null;
  const { id, label, currency, chargesFailedCalls } = value;
  return isText(id) && isText(label) && isText(currency) && typeof chargesFailedCalls === 'boolean'
    ? { id, label, currency, chargesFailedCalls }
    : null;
}

/**
 * Reads a check saved by SearchUnveil. A damaged answer is reported and left out, so one bad
 * entry never costs a person the rest of the check; a damaged plan makes the file unreadable,
 * since no answer can be understood without it.
 */
export function parseVisibilityRecord(text: string): Result<VisibilityRecord> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return failure([diagnostic('visibility.invalid-json', 'error')]);
  }
  if (!isObject(data) || data['format'] !== VISIBILITY_RECORD_FORMAT) {
    return failure([diagnostic('visibility.invalid-format', 'error')]);
  }
  const version = data['version'];
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    return failure([diagnostic('visibility.invalid-format', 'error')]);
  }
  if (version > VISIBILITY_RECORD_VERSION) {
    return failure([diagnostic('visibility.unsupported-version', 'error', { version })]);
  }

  const invalid = (field: string) =>
    failure([diagnostic('visibility.invalid-field', 'error', { field })]);
  const { startedAt, finishedAt } = data;
  if (!isText(startedAt) || !TIMESTAMP.test(startedAt)) return invalid('startedAt');
  if (!isText(finishedAt) || !TIMESTAMP.test(finishedAt)) return invalid('finishedAt');
  const provider = readProvider(data['provider']);
  if (provider === null) return invalid('provider');
  const listed = data['engines'];
  const engines = Array.isArray(listed) ? listed.map(readEngine) : [null];
  if (engines.includes(null)) return invalid('engines');
  const offered = engines.filter((engine) => engine !== null);
  const read = readPlan(data['plan']);
  if (read === null || validatePlan(read, offered).length > 0) return invalid('plan');
  const plan = normalizePlan(read);
  const entries = data['answers'];
  if (!Array.isArray(entries) || entries.length > callCount(plan)) return invalid('answers');

  const collector = new DiagnosticCollector();
  const answers: RecordedAnswer[] = [];
  const seen = new Set<string>();
  const engineIds = new Set(plan.engines);
  entries.forEach((entry: unknown, i) => {
    const index = i + 1;
    const answer = isObject(entry) ? readAnswer(entry['answer']) : null;
    const question = isObject(entry) ? entry['question'] : undefined;
    const engine = isObject(entry) ? entry['engine'] : undefined;
    const attempt = isObject(entry) ? entry['attempt'] : undefined;
    if (
      answer === null ||
      typeof question !== 'number' ||
      !Number.isInteger(question) ||
      question < 0 ||
      question >= plan.questions.length ||
      !isText(engine) ||
      !engineIds.has(engine) ||
      typeof attempt !== 'number' ||
      !Number.isInteger(attempt) ||
      attempt < 1 ||
      attempt > plan.repeats
    ) {
      collector.add(diagnostic('visibility.invalid-answer', 'warning', { index }));
      return;
    }
    const key = JSON.stringify([question, engine, attempt]);
    if (seen.has(key)) {
      collector.add(diagnostic('visibility.duplicate-answer', 'warning', { index }));
      return;
    }
    seen.add(key);
    answers.push({ question, engine, attempt, answer });
  });

  const record = createVisibilityRecord({
    plan,
    provider,
    engines: offered,
    answers,
    startedAt,
    finishedAt,
  });
  return success(record, collector.toArray());
}
