import { fold } from '../text/fold.ts';
import { siteKey } from './match.ts';
import type { Brand } from './plan.ts';
import type { RecordedAnswer, VisibilityRecord } from './record.ts';
import { describeBrand, visibilityReport, type ReportBrand, type Tally } from './report.ts';

/**
 * How visibility changed from one check to the next, such as week by week.
 *
 * Checks are compared only on what they share: the questions every check asked, and the AI
 * products (engine families) every check asked them of. Checks for another site, country or
 * language than the latest one are left out, since their answers are not comparable.
 */

export interface BrandTrend extends ReportBrand {
  /** One tally per check, oldest first; `null` where the brand was not looked for. */
  readonly points: readonly (Tally | null)[];
}

export interface VisibilityTrend {
  /** When each compared check started, oldest first. */
  readonly checks: readonly string[];
  /** The questions every compared check asked, as the latest check wrote them. */
  readonly questions: readonly string[];
  /** The engine families every compared check asked. */
  readonly families: readonly string[];
  /** The person's own brand first, then competitors as the latest check lists them. */
  readonly brands: readonly BrandTrend[];
  /** Checks left out for being about another site, country or language. */
  readonly skipped: number;
}

const brandKey = (brand: Brand) => siteKey(brand.site) ?? `name:${fold(brand.name)}`;

/** Keeps of a check only what every compared check shares. */
function restrict(
  record: VisibilityRecord,
  questions: ReadonlySet<string>,
  families: ReadonlySet<string>,
): VisibilityRecord {
  const kept = record.plan.questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => questions.has(fold(question)));
  const renumber = new Map(kept.map(({ index }, position) => [index, position]));
  const engines = record.engines.filter((engine) => families.has(engine.family));
  const engineIds = new Set(engines.map((engine) => engine.id));
  const answers = record.answers.flatMap((answer): RecordedAnswer[] => {
    const question = renumber.get(answer.question);
    return question === undefined || !engineIds.has(answer.engine) ? [] : [{ ...answer, question }];
  });
  return {
    ...record,
    plan: {
      ...record.plan,
      questions: kept.map(({ question }) => question),
      engines: engines.map((engine) => engine.id),
    },
    engines,
    answers,
  };
}

function shared(lists: readonly (readonly string[])[]): Set<string> {
  const [first = [], ...rest] = lists;
  return new Set(first.filter((item) => rest.every((list) => list.includes(item))));
}

export function visibilityTrend(records: readonly VisibilityRecord[]): VisibilityTrend {
  const sorted = [...records].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const latest = sorted.at(-1);
  if (latest === undefined) {
    return { checks: [], questions: [], families: [], brands: [], skipped: 0 };
  }
  const reference = (record: VisibilityRecord) =>
    [brandKey(record.plan.brand), record.plan.country, record.plan.language.toLowerCase()].join(
      ' ',
    );
  const compared = sorted.filter((record) => reference(record) === reference(latest));
  const questions = shared(compared.map((record) => record.plan.questions.map(fold)));
  const families = shared(compared.map((record) => record.engines.map((engine) => engine.family)));

  const reports = compared.map((record) => {
    const report = visibilityReport(restrict(record, questions, families));
    const brands = [record.plan.brand, ...record.plan.competitors];
    return new Map(brands.map((brand, index) => [brandKey(brand), report.totals[index] ?? null]));
  });

  // Brands of the latest check first, in its order, then those only earlier checks looked for.
  const brands = new Map<string, ReportBrand>();
  for (const record of [...compared].reverse()) {
    [record.plan.brand, ...record.plan.competitors].forEach((brand, index) => {
      const key = brandKey(brand);
      if (!brands.has(key)) brands.set(key, describeBrand(brand, index === 0));
    });
  }

  return {
    checks: compared.map((record) => record.startedAt),
    questions: latest.plan.questions.filter((question) => questions.has(fold(question))),
    families: latest.engines
      .map((engine) => engine.family)
      .filter((family, index, all) => families.has(family) && all.indexOf(family) === index),
    brands: [...brands.entries()].map(([key, brand]) => ({
      ...brand,
      points: reports.map((totals) => totals.get(key) ?? null),
    })),
    skipped: sorted.length - compared.length,
  };
}
