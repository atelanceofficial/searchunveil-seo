import { describe, expect, it } from 'vitest';
import { CORE_CATALOGS } from '../i18n/catalogs/all.ts';
import { createTranslator } from '../i18n/format.ts';
import { money } from '../i18n/message.ts';
import { answered, TEST_ENGINES, TEST_PLAN } from '../test-support/visibility-fixtures.ts';
import { actualCost, estimateCost } from './cost.ts';
import type { Answer, AnswerRequest, VisibilityPlan } from './plan.ts';
import {
  createVisibilityRecord,
  parseVisibilityRecord,
  readAnswer,
  serializeVisibilityRecord,
  ANSWER_LIMITS,
  type RecordedAnswer,
  type VisibilityRecord,
} from './record.ts';
import { cellStatus, presenceRate, visibilityReport } from './report.ts';
import { visibilityTrend } from './trend.ts';

const PROVIDER = {
  id: 'test-tools',
  label: 'Test Tools',
  currency: 'USD',
  chargesFailedCalls: false,
};

/** A finished check whose answers come from `answer`, every call made. */
function check(
  answer: (request: Omit<AnswerRequest, 'country' | 'language'> & { index: number }) => Answer,
  plan: VisibilityPlan = TEST_PLAN,
  startedAt = '2026-11-18T09:00:00.000Z',
): VisibilityRecord {
  const answers: RecordedAnswer[] = [];
  for (let attempt = 1; attempt <= plan.repeats; attempt++) {
    plan.questions.forEach((question, index) => {
      for (const engine of plan.engines) {
        answers.push({
          question: index,
          engine,
          attempt,
          answer: answer({ engine, question, attempt, index }),
        });
      }
    });
  }
  const engines = plan.engines.flatMap((id) => TEST_ENGINES.filter((engine) => engine.id === id));
  return createVisibilityRecord({
    plan,
    provider: PROVIDER,
    engines,
    answers,
    startedAt,
    finishedAt: startedAt.replace('09:00', '09:02'),
  });
}

/**
 * Question 0: Perplexity cites the brand second and names the rival; AI Overviews names the
 * brand without a link, except on the third try, which fails. Question 1: the rival is cited
 * and the brand is absent.
 */
const sample = check(({ engine, index, attempt }) => {
  if (index === 0 && engine === 'pplx') {
    return answered('Rakip ve diğerleri.', [
      'https://tr.wikipedia.org/wiki/Koşu',
      'https://www.ornekspor.com/kosu',
      'https://wikipedia.org/',
    ]);
  }
  if (index === 0) {
    return attempt === 3
      ? { ok: false, failure: 'timeout' }
      : answered('ÖRNEK SPOR’un modelleri', ['https://koşu.example/']);
  }
  return answered('Başka öneriler', ['https://rakip.com.tr/a', 'https://tr.wikipedia.org/']);
});

describe('visibilityReport', () => {
  const report = visibilityReport(sample);

  it('names the brands, own first', () => {
    expect(report.brands).toEqual([
      { site: 'ornekspor.com', label: 'Örnek Spor', own: true },
      { site: 'rakip.com.tr', label: 'Rakip', own: false },
    ]);
  });

  it('tallies each brand for each question and engine across repeats', () => {
    const [brand, rival] = report.cells[0]?.[0] ?? [];
    expect(brand).toEqual({ answers: 3, cited: 3, named: 0, bestPosition: 2, averagePosition: 2 });
    expect(rival).toMatchObject({ answers: 3, cited: 0, named: 3 });
    const overviews = report.cells[0]?.[1]?.[0];
    expect(overviews).toEqual({
      answers: 2,
      cited: 0,
      named: 2,
      bestPosition: null,
      averagePosition: null,
    });
    expect(report.cells[1]?.[0]?.map(cellStatus)).toEqual(['absent', 'cited']);
  });

  it('sums by engine, by question and overall', () => {
    expect(report.totals.map((tally) => [tally.answers, tally.cited, tally.named])).toEqual([
      [11, 3, 2],
      [11, 6, 3],
    ]);
    expect(report.byEngine.map((brands) => brands[0]?.cited)).toEqual([3, 0]);
    expect(report.byQuestion.map((brands) => brands[1]?.cited)).toEqual([0, 6]);
    const own = report.totals[0];
    expect(own === undefined ? null : presenceRate(own)).toBeCloseTo(5 / 11);
  });

  it('lists the sites cited instead, once per answer', () => {
    expect(report.otherSources).toEqual([
      { site: 'tr.wikipedia.org', answers: 9 },
      { site: 'wikipedia.org', answers: 3 },
      { site: 'xn--kou-tza.example', answers: 2 },
    ]);
  });

  it('counts calls and failures, and is always approximate', () => {
    expect(report.calls).toEqual({
      planned: 12,
      made: 12,
      answered: 11,
      failed: 1,
      interrupted: 0,
      failures: [{ failure: 'timeout', count: 1 }],
    });
    expect(report.complete).toBe(true);
    expect(report.approximate).toBe(true);
  });

  it('reads at a glance', () => {
    const none = { answers: 0, cited: 0, named: 0, bestPosition: null, averagePosition: null };
    expect(cellStatus(none)).toBe('no-answer');
    expect(presenceRate(none)).toBeNull();
    expect(cellStatus({ ...none, answers: 2, named: 1 })).toBe('named');
  });

  it('feeds the summary and cost messages in every language', () => {
    const own = report.totals[0];
    if (own === undefined) throw new Error('no totals');
    const params = { present: own.cited + own.named, answers: own.answers };
    const estimate = estimateCost(TEST_PLAN, { ...PROVIDER, engines: TEST_ENGINES });
    const amount = money(estimate.total, estimate.currency);
    const en = createTranslator('en', CORE_CATALOGS.en);
    const tr = createTranslator('tr', CORE_CATALOGS.tr);
    expect(en.t('visibility.summary', params)).toBe('You appear in 5 of 11 answers.');
    expect(tr.t('visibility.summary', params)).toBe('11 cevabın 5 tanesinde geçiyorsunuz.');
    expect(tr.t('visibility.cost.estimate', { calls: estimate.calls, amount })).toBe(
      'Tahmini maliyet: 12 çağrı, yaklaşık $0,0612.',
    );
    expect(en.t('visibility.cost.actual', { calls: 12, amount: money(0.05, 'USD') })).toBe(
      'This check made 12 calls and cost about $0.05.',
    );
    expect(actualCost(sample).total).toBe(0.056);
  });
});

describe('visibility records', () => {
  it('survive saving and reading back', () => {
    const read = parseVisibilityRecord(serializeVisibilityRecord(sample));
    expect(read).toEqual({ ok: true, value: sample, diagnostics: [] });
  });

  it('put answers in planned order and know when they are complete', () => {
    const reversed = createVisibilityRecord({ ...sample, answers: [...sample.answers].reverse() });
    expect(reversed.answers).toEqual(sample.answers);
    expect(createVisibilityRecord({ ...sample, answers: sample.answers.slice(1) }).complete).toBe(
      false,
    );
    const cut = sample.answers.map((entry, index) =>
      index === 0 ? { ...entry, answer: { ok: false, failure: 'stopped' } as const } : entry,
    );
    expect(createVisibilityRecord({ ...sample, answers: cut }).complete).toBe(false);
  });

  it('refuse files that are not records', () => {
    const codes = (text: string) => {
      const result = parseVisibilityRecord(text);
      return result.ok ? [] : result.diagnostics.map((d) => [d.code, d.params]);
    };
    const saved = JSON.parse(serializeVisibilityRecord(sample)) as Record<string, unknown>;
    const changed = (changes: Record<string, unknown>) => JSON.stringify({ ...saved, ...changes });
    expect(codes('{')).toEqual([['visibility.invalid-json', {}]]);
    expect(codes('[]')).toEqual([['visibility.invalid-format', {}]]);
    expect(codes(changed({ version: 'one' }))).toEqual([['visibility.invalid-format', {}]]);
    expect(codes(changed({ version: 2 }))).toEqual([
      ['visibility.unsupported-version', { version: 2 }],
    ]);
    const field = (name: string) => [['visibility.invalid-field', { field: name }]];
    expect(codes(changed({ startedAt: 'yesterday' }))).toEqual(field('startedAt'));
    expect(codes(changed({ finishedAt: 1 }))).toEqual(field('finishedAt'));
    expect(codes(changed({ provider: { id: 'x' } }))).toEqual(field('provider'));
    expect(codes(changed({ engines: [{ id: 'pplx' }] }))).toEqual(field('engines'));
    expect(codes(changed({ engines: 'pplx' }))).toEqual(field('engines'));
    expect(codes(changed({ plan: { ...TEST_PLAN, repeats: 9 } }))).toEqual(field('plan'));
    expect(codes(changed({ plan: { ...TEST_PLAN, competitors: [7] } }))).toEqual(field('plan'));
    expect(codes(changed({ plan: { ...TEST_PLAN, engines: ['chat'] } }))).toEqual(field('plan'));
    expect(codes(changed({ plan: null }))).toEqual(field('plan'));
    expect(codes(changed({ answers: [...sample.answers, ...sample.answers] }))).toEqual(
      field('answers'),
    );
  });

  it('read engines and brands in every form they are saved in', () => {
    const saved = JSON.parse(serializeVisibilityRecord(sample)) as Record<string, unknown>;
    const engines = [
      { id: 'pplx', label: 'Perplexity', family: 'perplexity', pricePerCall: null },
      { id: 'aio', label: 'AIO', family: 'aio', model: 7, pricePerCall: 1 },
    ];
    expect(parseVisibilityRecord(JSON.stringify({ ...saved, engines })).ok).toBe(false);
    const brand = { site: 'ornekspor.com', name: 'Örnek Spor', aliases: ['ÖS'] };
    const withAliases = { ...saved, plan: { ...TEST_PLAN, brand } };
    const read = parseVisibilityRecord(JSON.stringify(withAliases));
    expect(read.ok && read.value.plan.brand).toEqual(brand);
    const badAliases = { ...saved, plan: { ...TEST_PLAN, brand: { ...brand, aliases: 'ÖS' } } };
    expect(parseVisibilityRecord(JSON.stringify(badAliases)).ok).toBe(false);
  });

  it('leave out damaged or repeated answers and say so', () => {
    const saved = JSON.parse(serializeVisibilityRecord(sample)) as Record<string, unknown>;
    const [first, second] = sample.answers;
    const answers = [
      first,
      first,
      { ...second, attempt: 9 },
      { ...second, engine: 'chat' },
      { ...second, answer: { ok: 'maybe' } },
      'not an answer',
    ];
    const result = parseVisibilityRecord(JSON.stringify({ ...saved, answers }));
    if (!result.ok) throw new Error('not read');
    expect(result.value.answers).toHaveLength(1);
    expect(result.value.complete).toBe(false);
    expect(result.diagnostics.map((d) => [d.code, d.params['index']])).toEqual([
      ['visibility.duplicate-answer', 2],
      ['visibility.invalid-answer', 3],
      ['visibility.invalid-answer', 4],
      ['visibility.invalid-answer', 5],
      ['visibility.invalid-answer', 6],
    ]);
  });

  it('keep answers within limits', () => {
    const long = readAnswer({
      ok: true,
      text: 'x'.repeat(ANSWER_LIMITS.textLength + 5),
      sources: [...Array.from({ length: ANSWER_LIMITS.sources + 5 }, () => 'https://a.com'), 3],
      cost: -1,
    });
    expect(long?.ok === true && [long.text.length, long.sources.length, long.cost]).toEqual([
      ANSWER_LIMITS.textLength,
      ANSWER_LIMITS.sources,
      undefined,
    ]);
    expect(readAnswer({ ok: true, text: 'a', sources: [3, 'https://a.com'] })).toEqual({
      ok: true,
      text: 'a',
      sources: ['', 'https://a.com'],
    });
    expect(readAnswer({ ok: false, failure: 'meltdown', cost: 0.01 })).toEqual({
      ok: false,
      failure: 'error',
      cost: 0.01,
    });
    expect(readAnswer(null)).toBeNull();
    expect(readAnswer({ ok: true, text: 'a' })).toBeNull();
  });
});

describe('visibilityTrend', () => {
  const week = (day: string, cited: boolean, plan: VisibilityPlan = TEST_PLAN) =>
    check(
      () => answered('Öneriler', cited ? ['https://ornekspor.com/'] : ['https://rakip.com.tr/']),
      plan,
      `2026-11-${day}T09:00:00.000Z`,
    );

  it('follows each brand from check to check, oldest first', () => {
    const trend = visibilityTrend([week('25', true), week('11', false), week('18', true)]);
    expect(trend.checks).toEqual([
      '2026-11-11T09:00:00.000Z',
      '2026-11-18T09:00:00.000Z',
      '2026-11-25T09:00:00.000Z',
    ]);
    expect(trend.questions).toEqual(TEST_PLAN.questions);
    expect(trend.families).toEqual(['perplexity', 'google-ai-overviews']);
    expect(trend.brands.map((brand) => brand.label)).toEqual(['Örnek Spor', 'Rakip']);
    expect(trend.brands[0]?.points.map((point) => point?.cited)).toEqual([0, 12, 12]);
    expect(trend.brands[1]?.points.map((point) => point?.cited)).toEqual([12, 0, 0]);
    expect(trend.skipped).toBe(0);
  });

  it('compares only the questions and AI products every check shares', () => {
    const wider = {
      ...TEST_PLAN,
      questions: [...TEST_PLAN.questions, 'trail ayakkabısı'],
      engines: ['pplx-pro', 'aio', 'chat'],
      competitors: [],
    };
    const trend = visibilityTrend([week('11', true), week('18', true, wider)]);
    expect(trend.questions).toEqual(TEST_PLAN.questions);
    expect(trend.families).toEqual(['perplexity', 'google-ai-overviews']);
    expect(trend.brands[0]?.points.map((point) => point?.answers)).toEqual([12, 12]);
    // The rival was looked for only in the older check.
    expect(trend.brands[1]?.points.map((point) => point?.answers ?? null)).toEqual([12, null]);
  });

  it('leaves out checks for another site, country or language', () => {
    const elsewhere = { ...TEST_PLAN, country: 'de', language: 'de' };
    const trend = visibilityTrend([week('11', true, elsewhere), week('18', true)]);
    expect(trend.checks).toEqual(['2026-11-18T09:00:00.000Z']);
    expect(trend.skipped).toBe(1);
  });

  it('is empty without checks', () => {
    expect(visibilityTrend([])).toEqual({
      checks: [],
      questions: [],
      families: [],
      brands: [],
      skipped: 0,
    });
  });
});
