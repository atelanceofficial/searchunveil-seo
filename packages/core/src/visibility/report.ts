import { brandMatcher, onSite, siteKey } from './match.ts';
import {
  ANSWER_FAILURES,
  callCount,
  type AnswerEngine,
  type AnswerFailure,
  type Brand,
} from './plan.ts';
import type { VisibilityRecord } from './record.ts';

/**
 * What a check found: for every question and engine, whether each brand was cited among the
 * answer's sources, named without a link, or absent, across repeats; then the same by engine,
 * by question and overall, and which other sites the answers cited instead.
 *
 * Results are approximate by nature: answers asked by a program can differ from what people
 * see in the apps, and answers change from day to day. Repeats turn them into rates.
 */

export interface ReportBrand {
  /** The site as its host without `www.`, or as written when it is not a valid address. */
  readonly site: string;
  /** What to call it: the brand's name, or its site when it has none. */
  readonly label: string;
  /** Whether it is the person's own brand rather than a competitor. */
  readonly own: boolean;
}

/** How one brand fared in a set of answers. */
export interface Tally {
  /** Answers received; calls that failed are not counted. */
  readonly answers: number;
  /** Answers citing the site among their sources. */
  readonly cited: number;
  /** Answers naming the brand, or writing its address, without citing the site. */
  readonly named: number;
  /** The site's best place among the sources, from 1; `null` when it was never cited. */
  readonly bestPosition: number | null;
  /** Its average place when cited, to one decimal; `null` when it was never cited. */
  readonly averagePosition: number | null;
}

/** A brand in one question's answers from one engine, read at a glance. */
export type CellStatus = 'cited' | 'named' | 'absent' | 'no-answer';

export function cellStatus(tally: Tally): CellStatus {
  if (tally.answers === 0) return 'no-answer';
  if (tally.cited > 0) return 'cited';
  return tally.named > 0 ? 'named' : 'absent';
}

/** The share of answers that cite or name the brand, from 0 to 1; `null` without answers. */
export function presenceRate(tally: Tally): number | null {
  return tally.answers === 0 ? null : (tally.cited + tally.named) / tally.answers;
}

export interface SourceCount {
  readonly site: string;
  /** Answers citing it. */
  readonly answers: number;
}

export interface CallSummary {
  readonly planned: number;
  readonly made: number;
  readonly answered: number;
  /** Calls that brought no answer, not counting those cut off by stopping the check. */
  readonly failed: number;
  readonly interrupted: number;
  /** Failed and interrupted calls by reason, most frequent first. */
  readonly failures: readonly { readonly failure: AnswerFailure; readonly count: number }[];
}

export interface VisibilityReport {
  /** The person's own brand first, then each competitor. */
  readonly brands: readonly ReportBrand[];
  readonly questions: readonly string[];
  readonly engines: readonly AnswerEngine[];
  /** `cells[q][e][b]`: brand `b` in what engine `e` answered to question `q`. */
  readonly cells: readonly (readonly (readonly Tally[])[])[];
  /** `totals[b]`: brand `b` across every answer. */
  readonly totals: readonly Tally[];
  /** `byEngine[e][b]`: brand `b` across engine `e`'s answers. */
  readonly byEngine: readonly (readonly Tally[])[];
  /** `byQuestion[q][b]`: brand `b` across the answers to question `q`. */
  readonly byQuestion: readonly (readonly Tally[])[];
  /** The sites the answers cited most, other than the brands': who is cited instead. */
  readonly otherSources: readonly SourceCount[];
  readonly calls: CallSummary;
  /** `false` when the check was stopped before every call was made. */
  readonly complete: boolean;
  /** Always `true`: these results estimate visibility, they do not measure what people see. */
  readonly approximate: true;
}

/** How many other cited sites a report lists. */
export const OTHER_SOURCES_LISTED = 10;

interface Counts {
  answers: number;
  cited: number;
  named: number;
  positions: number[];
}

const emptyCounts = (): Counts => ({ answers: 0, cited: 0, named: 0, positions: [] });

function tally(groups: readonly Counts[]): Tally {
  let answers = 0;
  let cited = 0;
  let named = 0;
  const positions: number[] = [];
  for (const group of groups) {
    answers += group.answers;
    cited += group.cited;
    named += group.named;
    positions.push(...group.positions);
  }
  const sum = positions.reduce((total, position) => total + position, 0);
  return {
    answers,
    cited,
    named,
    bestPosition: positions.length === 0 ? null : Math.min(...positions),
    averagePosition: positions.length === 0 ? null : Math.round((sum / positions.length) * 10) / 10,
  };
}

/** How a report names a brand. */
export function describeBrand(brand: Brand, own: boolean): ReportBrand {
  const site = siteKey(brand.site) ?? brand.site;
  return { site, label: brand.name === '' ? site : brand.name, own };
}

export function visibilityReport(record: VisibilityRecord): VisibilityReport {
  const { plan, engines } = record;
  const brands = [plan.brand, ...plan.competitors];
  const matchers = brands.map(brandMatcher);
  const keys = brands.flatMap((brand) => siteKey(brand.site) ?? []);
  const engineIndex = new Map(engines.map((engine, index) => [engine.id, index]));
  const counts = plan.questions.map(() => engines.map(() => brands.map(emptyCounts)));
  const others = new Map<string, number>();
  const failures = new Map<AnswerFailure, number>();
  let answered = 0;

  for (const { question, engine, answer } of record.answers) {
    if (!answer.ok) {
      failures.set(answer.failure, (failures.get(answer.failure) ?? 0) + 1);
      continue;
    }
    answered++;
    const cell = counts[question]?.[engineIndex.get(engine) ?? -1];
    matchers.forEach((match, b) => {
      const group = cell?.[b];
      if (group === undefined) return;
      const found = match(answer);
      group.answers++;
      if (found.presence === 'named') group.named++;
      if (found.presence === 'cited' && found.position !== null) {
        group.cited++;
        group.positions.push(found.position);
      }
    });
    const cited = new Set<string>();
    for (const source of answer.sources) {
      const host = siteKey(source);
      if (host !== null && !keys.some((key) => onSite(host, key))) cited.add(host);
    }
    for (const host of cited) others.set(host, (others.get(host) ?? 0) + 1);
  }

  const interrupted = failures.get('stopped') ?? 0;
  const failedCalls = [...failures.values()].reduce((total, count) => total + count, 0);
  return {
    brands: brands.map((brand, index) => describeBrand(brand, index === 0)),
    questions: plan.questions,
    engines,
    cells: counts.map((row) => row.map((cell) => cell.map((group) => tally([group])))),
    totals: brands.map((_, b) => tally(counts.flat().flatMap((cell) => cell[b] ?? []))),
    byEngine: engines.map((_, e) =>
      brands.map((_brand, b) => tally(counts.flatMap((row) => row[e]?.[b] ?? []))),
    ),
    byQuestion: counts.map((row) =>
      brands.map((_, b) => tally(row.flatMap((cell) => cell[b] ?? []))),
    ),
    otherSources: [...others.entries()]
      .map(([site, answers]) => ({ site, answers }))
      .sort((a, b) => b.answers - a.answers || a.site.localeCompare(b.site))
      .slice(0, OTHER_SOURCES_LISTED),
    calls: {
      planned: callCount(plan),
      made: record.answers.length,
      answered,
      failed: failedCalls - interrupted,
      interrupted,
      failures: ANSWER_FAILURES.flatMap((failure) => {
        const count = failures.get(failure) ?? 0;
        return count === 0 ? [] : [{ failure, count }];
      }).sort((a, b) => b.count - a.count),
    },
    complete: record.complete,
    approximate: true,
  };
}
