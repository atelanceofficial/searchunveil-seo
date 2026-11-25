import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  actualCost,
  actualCostNotice,
  AI_PRODUCTS,
  callCount,
  cellStatus,
  costNotice,
  date,
  defaultEngines,
  engineOptions,
  estimateCost,
  list,
  money,
  normalizePlan,
  createVisibilityRecord,
  parseVisibilityRecord,
  readAnswer,
  readEngine,
  readPlan,
  requestsOf,
  serializeVisibilityRecord,
  trialNotice,
  unavailableNotice,
  unavailableProducts,
  validatePlan,
  visibilityReport,
  visibilityTrend,
  type AnswerEngine,
  type Billing,
  type PlanError,
  type ProviderInfo,
  type RecordedAnswer,
  type Tally,
  type VisibilityPlan,
  type VisibilityRecord,
} from '@searchunveil/core';
import { InputError } from './errors.ts';
import { plain, table, type Words } from './text.ts';

/**
 * The AI visibility check inside an assistant. The assistant asks the AI engines with the tools
 * it has, such as a marketplace's paid tools; this tool plans, prices, checks the answers and
 * keeps the record. It never calls a paid tool, and it lists the calls to make only once the
 * person has agreed to the cost.
 */

export { InputError };

/** Who answers and bills: what the assistant knows about its tools, written to a JSON file. */
export interface ProviderFile extends ProviderInfo {
  readonly billing: Billing;
  readonly engines: readonly AnswerEngine[];
}

/** Questions are asked three times by default: answers vary, and repeats turn them into rates. */
export const DEFAULT_REPEATS = 3;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

async function readJson(path: string, what: string): Promise<unknown> {
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new InputError(`Cannot read the ${what} file: ${path}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new InputError(`The ${what} file is not valid JSON: ${path}`);
  }
}

export function readProviderFile(value: unknown): ProviderFile {
  if (!isObject(value)) throw new InputError('The provider file must hold a JSON object.');
  const { id, label, currency, chargesFailedCalls, billing, engines } = value;
  if (typeof id !== 'string' || id === '') throw new InputError('provider.id must be text.');
  if (typeof label !== 'string' || label === '')
    throw new InputError('provider.label must be text.');
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    throw new InputError('provider.currency must be an ISO 4217 code, such as USD.');
  }
  if (typeof chargesFailedCalls !== 'boolean') {
    throw new InputError('provider.chargesFailedCalls must be true or false.');
  }
  if (billing !== 'balance' && billing !== 'account') {
    throw new InputError('provider.billing must be "balance" or "account".');
  }
  if (!Array.isArray(engines) || engines.length === 0) {
    throw new InputError('provider.engines must list the engines the tools can ask.');
  }
  const read = engines.map((engine: unknown, index) => {
    const parsed = readEngine(engine);
    if (parsed === null) {
      throw new InputError(
        `provider.engines[${index}] needs id, label, family and pricePerCall (a number or null).`,
      );
    }
    return parsed;
  });
  const ids = new Set(read.map((engine) => engine.id));
  if (ids.size !== read.length) throw new InputError('provider.engines repeats an id.');
  return { id, label, currency, chargesFailedCalls, billing, engines: read };
}

function describeError(error: PlanError): string {
  const where = error.index === undefined ? error.field : `${error.field} #${error.index}`;
  const limit = error.max === undefined ? '' : ` (limit ${error.max})`;
  return `${where}: ${error.code}${limit}`;
}

/**
 * Reads a plan, filling what people leave out: no competitors, three repeats, and the cheapest
 * priced engine of each AI product. Throws with every problem when it cannot run.
 */
export function readPlanFile(value: unknown, provider: ProviderFile): VisibilityPlan {
  if (!isObject(value)) throw new InputError('The plan file must hold a JSON object.');
  const filled = {
    competitors: [],
    engines: [],
    repeats: DEFAULT_REPEATS,
    ...value,
  };
  const read = readPlan(filled);
  if (read === null) {
    throw new InputError(
      'The plan needs brand {site, name}, questions (a list of text), country and language.',
    );
  }
  const engines = read.engines.length === 0 ? defaultEngines(provider.engines) : read.engines;
  const plan = normalizePlan({ ...read, engines });
  const errors = validatePlan(plan, provider.engines);
  if (errors.length > 0) {
    throw new InputError(
      `The plan cannot run:\n${errors.map((e) => `- ${describeError(e)}`).join('\n')}`,
    );
  }
  return plan;
}

export async function loadInputs(
  planPath: string,
  providerPath: string,
): Promise<{ plan: VisibilityPlan; provider: ProviderFile }> {
  const provider = readProviderFile(await readJson(providerPath, 'provider'));
  const plan = readPlanFile(await readJson(planPath, 'plan'), provider);
  return { plan, provider };
}

const engineName = (engine: AnswerEngine) =>
  engine.model === undefined ? engine.label : `${engine.label} · ${engine.model}`;

/** The choice of engines with their prices, then the notice the person must answer. */
export function estimateMarkdown(plan: VisibilityPlan, provider: ProviderFile, t: Words): string {
  const estimate = estimateCost(plan, provider);
  const options = engineOptions(plan, provider).map(({ engine, cost, chosen, cheapest }) => {
    const price =
      engine.pricePerCall === null || cost === null
        ? t.t('visibility.engine.unpriced')
        : t.t('visibility.engine.price', {
            price: money(engine.pricePerCall, provider.currency),
            cost: money(cost, provider.currency),
          });
    const marks = [
      ...(cheapest ? [t.t('visibility.engine.cheapest')] : []),
      ...(chosen ? [t.t('visibility.engine.chosen')] : []),
    ];
    return `- **${engineName(engine)}**: ${[price, ...marks].join(' · ')}`;
  });
  const missing = unavailableNotice(unavailableProducts(provider.engines), provider.label);
  const notice = costNotice(estimate, { provider: provider.label, billing: provider.billing })
    .map((m) => t.message(m))
    .join(' ');
  const parts = [
    `## ${t.t('visibility.heading.engines')}`,
    options.join('\n'),
    ...(missing === null ? [] : [t.message(missing)]),
    `## ${t.t('visibility.heading.cost')}`,
    t.t('visibility.cost.calls', {
      questions: plan.questions.length,
      engines: plan.engines.length,
      repeats: plan.repeats,
      calls: callCount(plan),
    }),
    `> ${notice}`,
    '<!-- For the assistant: show the notice above exactly as written and call no paid tool ' +
      'until the person answers yes. Then list the calls with `visibility calls ... --agreed`. -->',
  ];
  return plain(parts.join('\n\n'));
}

/**
 * The calls to make, one JSON line each, in order, once the person has agreed. The assistant
 * adds each answer's fields to its line and saves the lines as the answers file.
 */
export function callLines(plan: VisibilityPlan, provider: ProviderFile, agreed: boolean): string {
  if (!agreed) {
    throw new InputError(
      'Show the cost notice from `visibility estimate` first, and wait until the person ' +
        'answers yes. Then run this command again with --agreed.',
    );
  }
  const engines = new Map(provider.engines.map((engine) => [engine.id, engine]));
  return requestsOf(plan)
    .map((request) => {
      const engine = engines.get(request.engine);
      return JSON.stringify({
        question: plan.questions.indexOf(request.question),
        ask: request.question,
        engine: request.engine,
        ...(engine === undefined ? {} : { tool: engineName(engine) }),
        attempt: request.attempt,
        country: request.country,
        language: request.language,
      });
    })
    .join('\n');
}

export interface AnswerLine {
  /** The line's number in the file, from 1. */
  readonly line: number;
  readonly value: Record<string, unknown>;
}

/** Reads the answers file: one JSON object per line, each a planned call and its answer. */
export function readAnswerLines(text: string): { entries: AnswerLine[]; problems: string[] } {
  const entries: AnswerLine[] = [];
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((content, index) => {
    if (content.trim() === '') return;
    const line = index + 1;
    try {
      const value: unknown = JSON.parse(content);
      if (isObject(value)) entries.push({ line, value });
      else problems.push(`Line ${line} is not a JSON object.`);
    } catch {
      problems.push(`Line ${line} is not valid JSON.`);
    }
  });
  return { entries, problems };
}

const callKey = (question: unknown, engine: unknown, attempt: unknown) =>
  JSON.stringify([question, engine, attempt]);

/**
 * Builds the record of a check from the plan, the provider and the answers. Every answer must
 * be one of the planned calls, once; a line that is not is reported and left out, so one
 * mistake never costs the person the answers they paid for.
 */
export function buildRecord(
  plan: VisibilityPlan,
  provider: ProviderFile,
  entries: readonly AnswerLine[],
  now: Date,
): { record: VisibilityRecord; problems: string[] } {
  const planned = new Set(
    requestsOf(plan).map((request) =>
      callKey(plan.questions.indexOf(request.question), request.engine, request.attempt),
    ),
  );
  const seen = new Set<string>();
  const answers: RecordedAnswer[] = [];
  const problems: string[] = [];
  for (const { line, value } of entries) {
    const { question, engine, attempt } = value;
    const key = callKey(question, engine, attempt);
    if (
      !planned.has(key) ||
      typeof question !== 'number' ||
      typeof engine !== 'string' ||
      typeof attempt !== 'number'
    ) {
      problems.push(
        `Line ${line} is not one of the planned calls: keep question, engine and attempt as listed.`,
      );
      continue;
    }
    if (seen.has(key)) {
      problems.push(`Line ${line} repeats an earlier call; the first was kept.`);
      continue;
    }
    const answer = readAnswer(value);
    if (answer === null) {
      problems.push(
        `Line ${line} has no answer: add "ok": true with "text" and "sources", or "ok": false with a "failure".`,
      );
      continue;
    }
    seen.add(key);
    answers.push({ question, engine, attempt, answer });
  }
  const stamp = now.toISOString();
  const record = createVisibilityRecord({
    plan,
    provider,
    engines: plan.engines.flatMap((id) => provider.engines.filter((engine) => engine.id === id)),
    answers,
    startedAt: stamp,
    finishedAt: stamp,
  });
  return { record, problems };
}

function cellText(tally: Tally, t: Words): string {
  const rate = (count: number) => t.t('visibility.cell.rate', { count, answers: tally.answers });
  switch (cellStatus(tally)) {
    case 'no-answer':
      return t.t('visibility.cell.no-answer');
    case 'absent':
      return t.t('visibility.cell.absent');
    case 'named':
      return `${t.t('visibility.cell.named')} (${rate(tally.named)})`;
    case 'cited': {
      const cited = `${t.t('visibility.cell.cited')} (${rate(tally.cited)}), ${t.t('visibility.cell.position', { position: tally.bestPosition ?? 0 })}`;
      return tally.named === 0
        ? cited
        : `${cited}; ${t.t('visibility.cell.named')} (${rate(tally.named)})`;
    }
  }
}

/** The report of a check, as Markdown: summary, a table per brand, other sources and cost. */
export function reportMarkdown(record: VisibilityRecord, provider: ProviderInfo, t: Words): string {
  const report = visibilityReport(record);
  const parts = [`## ${t.t('visibility.approximate')}`, `_${t.t('visibility.approximate.why')}_`];
  if (!record.complete) parts.push(t.t('visibility.stopped'));

  const summaries = report.brands.map((brand, index) => {
    const tally = report.totals[index];
    if (tally === undefined) return '';
    const params = { present: tally.cited + tally.named, answers: tally.answers };
    return brand.own
      ? t.t('visibility.summary', params)
      : t.t('visibility.summary.competitor', { ...params, name: brand.label });
  });
  parts.push(report.calls.answered === 0 ? t.t('visibility.summary.none') : summaries.join('\n'));

  report.brands.forEach((brand, b) => {
    parts.push(`### ${brand.label}`);
    parts.push(
      table(
        [t.t('visibility.column.question'), ...report.engines.map(engineName)],
        report.questions.map((question, q) => [
          question,
          ...report.engines.map((_, e) => {
            const tally = report.cells[q]?.[e]?.[b];
            return tally === undefined ? '' : cellText(tally, t);
          }),
        ]),
      ),
    );
  });

  if (report.otherSources.length > 0) {
    parts.push(`### ${t.t('visibility.other-sources')}`);
    parts.push(
      report.otherSources
        .map(
          (source) =>
            `- ${t.t('visibility.source.count', { site: source.site, count: source.answers })}`,
        )
        .join('\n'),
    );
  }

  parts.push(`### ${t.t('visibility.heading.cost')}`);
  const cost = actualCostNotice(actualCost(record), provider.label).map((m) => t.message(m));
  const unanswered = report.calls.failed + report.calls.interrupted;
  if (unanswered > 0) {
    const reasons = report.calls.failures.map(
      ({ failure, count }) => `${t.t('visibility.failure', { reason: failure })} (${count})`,
    );
    cost.push(t.t('visibility.calls.failed', { count: unanswered, reasons: list(reasons) }));
  }
  parts.push(cost.join('\n'));
  return plain(parts.join('\n\n'));
}

/** Saves a record under `folder`, named by its date and site, never overwriting another. */
export async function saveRecord(record: VisibilityRecord, folder: string): Promise<string> {
  await mkdir(folder, { recursive: true });
  const site = record.plan.brand.site.replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]+/gi, '-');
  const stem = `${record.startedAt.slice(0, 10)}-${site}`.replace(/-+$/, '');
  for (let n = 1; ; n++) {
    const path = join(folder, n === 1 ? `${stem}.json` : `${stem}-${n}.json`);
    try {
      await writeFile(path, serializeVisibilityRecord(record), { flag: 'wx' });
      return path;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
}

/** Reads saved checks; files that are not checks are reported and left out. */
export async function loadRecords(
  paths: readonly string[],
): Promise<{ records: VisibilityRecord[]; problems: string[] }> {
  const records: VisibilityRecord[] = [];
  const problems: string[] = [];
  for (const path of paths) {
    let text: string;
    try {
      text = await readFile(path, 'utf8');
    } catch {
      problems.push(`Cannot read ${path}.`);
      continue;
    }
    const result = parseVisibilityRecord(text);
    if (result.ok) records.push(result.value);
    else problems.push(`${path}: ${result.diagnostics.map((d) => d.code).join(', ')}`);
  }
  return { records, problems };
}

/** How each brand's visibility changed from check to check. */
export function trendMarkdown(records: readonly VisibilityRecord[], t: Words): string {
  const trend = visibilityTrend(records);
  const parts = [`## ${t.t('visibility.trend.title')}`, `_${t.t('visibility.approximate.why')}_`];
  if (trend.checks.length === 0) {
    parts.push(t.t('visibility.summary.none'));
    return plain(parts.join('\n\n'));
  }
  parts.push(
    table(
      ['', ...trend.checks.map((check) => t.value(date(check.slice(0, 10))))],
      trend.brands.map((brand) => [
        brand.label,
        ...brand.points.map((point) =>
          point === null
            ? t.t('visibility.trend.not-checked')
            : t.t('visibility.cell.rate', {
                count: point.cited + point.named,
                answers: point.answers,
              }),
        ),
      ]),
    ),
  );
  parts.push(
    t.t('visibility.trend.basis', {
      questions: trend.questions.length,
      products: list(trend.families.map((family) => AI_PRODUCTS[family] ?? family)),
    }),
  );
  if (trend.skipped > 0) parts.push(t.t('visibility.trend.skipped', { count: trend.skipped }));
  return plain(parts.join('\n\n'));
}

/** The warning for the start of a free trial: the paid tools are billed during it too. */
export function trialMarkdown(provider: string, t: Words): string {
  return plain(t.message(trialNotice(provider)));
}
