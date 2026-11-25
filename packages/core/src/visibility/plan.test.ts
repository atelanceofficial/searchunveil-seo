import { describe, expect, it } from 'vitest';
import { TEST_ENGINES, TEST_PLAN } from '../test-support/visibility-fixtures.ts';
import { actualCost, estimateCost } from './cost.ts';
import {
  callCount,
  defaultEngines,
  normalizePlan,
  requestsOf,
  validatePlan,
  VISIBILITY_LIMITS,
  type Answer,
  type VisibilityPlan,
} from './plan.ts';
import type { RecordedAnswer } from './record.ts';

const plan = (changes: Partial<VisibilityPlan>): VisibilityPlan => ({ ...TEST_PLAN, ...changes });
const codes = (changes: Partial<VisibilityPlan>) =>
  validatePlan(plan(changes), TEST_ENGINES).map((error) =>
    [error.field, error.code, error.index].filter((part) => part !== undefined).join(' '),
  );

describe('normalizePlan', () => {
  it('trims text, drops blanks and repeats, and capitalizes the region', () => {
    const normalized = normalizePlan(
      plan({
        brand: { site: ' ornekspor.com ', name: '  Örnek   Spor ', aliases: ['ÖS', 'ös', ' '] },
        competitors: [{ site: '', name: ' ' }, TEST_PLAN.competitors[0] ?? { site: '', name: '' }],
        questions: [' best  shoes ', 'Best shoes?', '', 'trail shoes'],
        engines: ['pplx', ' pplx ', 'aio', ''],
        country: ' tr ',
        language: ' tr ',
      }),
    );
    expect(normalized.brand).toEqual({
      site: 'ornekspor.com',
      name: 'Örnek Spor',
      aliases: ['ÖS'],
    });
    expect(normalized.competitors).toHaveLength(1);
    expect(normalized.questions).toEqual(['best shoes', 'trail shoes']);
    expect(normalized.engines).toEqual(['pplx', 'aio']);
    expect(normalized.country).toBe('TR');
    expect(normalized.language).toBe('tr');
  });
});

describe('validatePlan', () => {
  it('accepts a complete plan', () => {
    expect(validatePlan(TEST_PLAN, TEST_ENGINES)).toEqual([]);
  });

  it('needs a site for the brand and each competitor', () => {
    expect(codes({ brand: { site: ' ', name: 'Örnek' } })).toEqual(['brand.site required']);
    expect(codes({ brand: { site: 'localhost', name: 'Örnek' } })).toEqual(['brand.site invalid']);
    expect(codes({ competitors: [{ site: '', name: 'Rakip' }] })).toEqual([
      'competitor.site required 1',
    ]);
  });

  it('rejects competitors that repeat the brand or each other', () => {
    expect(
      codes({
        competitors: [
          { site: 'https://www.ornekspor.com/', name: 'Again' },
          { site: 'rakip.com.tr', name: 'Rakip' },
          { site: 'www.rakip.com.tr/shop', name: 'Rakip 2' },
        ],
      }),
    ).toEqual(['competitor.site same-as-brand 1', 'competitor.site duplicate 3']);
  });

  it('enforces the limits', () => {
    const many = <T>(count: number, make: (i: number) => T): T[] =>
      Array.from({ length: count }, (_, i) => make(i));
    const long = 'x'.repeat(VISIBILITY_LIMITS.nameLength + 1);
    expect(
      codes({
        brand: { site: 'ornekspor.com', name: long, aliases: many(6, (i) => `alias ${i}`) },
        competitors: many(6, (i) => ({ site: `rival${i}.com`, name: '', aliases: [long] })),
        questions: many(VISIBILITY_LIMITS.questions + 1, (i) => `question ${i}`),
      }),
    ).toEqual([
      'brand.name too-long',
      'brand.aliases too-many',
      'competitors too-many',
      ...many(6, (i) => `competitor.aliases too-long ${i + 1}`),
      'questions too-many',
    ]);
    expect(codes({ questions: ['x'.repeat(VISIBILITY_LIMITS.questionLength + 1)] })).toEqual([
      'questions too-long 1',
    ]);
    expect(codes({ engines: many(11, (i) => `engine-${i}`) })).toContain('engines too-many');
  });

  it('needs questions, known engines and a valid number of repeats', () => {
    expect(codes({ questions: [' ', ''] })).toEqual(['questions required']);
    expect(codes({ engines: [] })).toEqual(['engines required']);
    expect(codes({ engines: ['pplx', 'gemini'] })).toEqual(['engines unknown-engine 2']);
    for (const repeats of [0, 6, 1.5, Number.NaN]) {
      expect(codes({ repeats }), String(repeats)).toEqual(['repeats out-of-range']);
    }
  });

  it('needs a region code and a language tag', () => {
    expect(codes({ country: '' })).toEqual(['country required']);
    expect(codes({ country: 'TUR' })).toEqual(['country invalid']);
    expect(codes({ language: '' })).toEqual(['language required']);
    expect(codes({ language: 'en-UK' })).toEqual(['language invalid']);
  });
});

describe('calls', () => {
  it('counts questions × engines × repeats; competitors add none', () => {
    expect(callCount(TEST_PLAN)).toBe(12);
    expect(callCount(plan({ competitors: [] }))).toBe(12);
  });

  it('asks every question once before asking any again', () => {
    const requests = requestsOf(normalizePlan(TEST_PLAN));
    expect(requests).toHaveLength(12);
    expect(requests.slice(0, 4).map((r) => [r.question, r.engine, r.attempt])).toEqual([
      ['en iyi koşu ayakkabısı', 'pplx', 1],
      ['en iyi koşu ayakkabısı', 'aio', 1],
      ['yeni başlayanlar için koşu ayakkabısı', 'pplx', 1],
      ['yeni başlayanlar için koşu ayakkabısı', 'aio', 1],
    ]);
    expect(requests.at(-1)).toEqual({
      engine: 'aio',
      question: 'yeni başlayanlar için koşu ayakkabısı',
      country: 'TR',
      language: 'tr',
      attempt: 3,
    });
  });

  it('starts with the cheapest priced engine of each family', () => {
    expect(defaultEngines(TEST_ENGINES)).toEqual(['pplx', 'aio']);
    expect(defaultEngines([])).toEqual([]);
  });
});

describe('estimateCost', () => {
  const terms = { currency: 'USD', engines: TEST_ENGINES, chargesFailedCalls: false };

  it('multiplies each engine’s price by its calls, exactly', () => {
    const estimate = estimateCost(TEST_PLAN, terms);
    expect(estimate).toEqual({
      currency: 'USD',
      calls: 12,
      engines: [
        { engine: 'pplx', calls: 6, pricePerCall: 0.005, cost: 0.03 },
        { engine: 'aio', calls: 6, pricePerCall: 0.0052, cost: 0.0312 },
      ],
      total: 0.0612,
      unpricedCalls: 0,
      chargesFailedCalls: false,
    });
  });

  it('works out the example in the notes: 10 questions × 3 AIs × 3 repeats', () => {
    const questions = Array.from({ length: 10 }, (_, i) => `question ${i}`);
    const engines = [
      { id: 'a', label: 'A', family: 'a', pricePerCall: 0.0052 },
      { id: 'b', label: 'B', family: 'b', pricePerCall: 0.0052 },
      { id: 'c', label: 'C', family: 'c', pricePerCall: 0.0052 },
    ];
    const estimate = estimateCost(plan({ questions, engines: ['a', 'b', 'c'] }), {
      ...terms,
      engines,
    });
    expect(estimate.calls).toBe(90);
    expect(estimate.total).toBe(0.468);
  });

  it('leaves calls without a stated price out of the total, and says how many', () => {
    const estimate = estimateCost(plan({ engines: ['pplx', 'chat'] }), terms);
    expect(estimate.total).toBe(0.03);
    expect(estimate.unpricedCalls).toBe(6);
    expect(estimate.engines[1]).toEqual({
      engine: 'chat',
      calls: 6,
      pricePerCall: null,
      cost: null,
    });
  });
});

describe('actualCost', () => {
  const recorded = (engine: string, answer: Answer, attempt = 1): RecordedAnswer => ({
    question: 0,
    engine,
    attempt,
    answer,
  });
  const ok: Answer = { ok: true, text: '', sources: [] };
  const provider = { id: 't', label: 'T', currency: 'USD', chargesFailedCalls: false };
  const answers = [
    recorded('pplx', ok),
    recorded('pplx', { ok: false, failure: 'timeout' }, 2),
    recorded('aio', ok),
    recorded('aio', { ok: false, failure: 'stopped' }, 2),
    recorded('chat', ok),
  ];

  it('bills answered calls at their price, and failed calls only if the provider does', () => {
    expect(actualCost({ answers, engines: TEST_ENGINES, provider })).toEqual({
      currency: 'USD',
      calls: 5,
      answered: 3,
      failed: 1,
      interrupted: 1,
      billed: 3,
      total: 0.0102,
      unpricedCalls: 1,
      reported: false,
      chargesFailedCalls: false,
    });
    const billing = { ...provider, chargesFailedCalls: true };
    const charged = actualCost({ answers, engines: TEST_ENGINES, provider: billing });
    expect([charged.billed, charged.total]).toEqual([4, 0.0152]);
  });

  it('uses the cost the provider reports, even zero', () => {
    const reported = [
      recorded('pplx', { ...ok, cost: 0.004 }),
      recorded('aio', { ...ok, cost: 0 }),
      recorded('aio', { ok: false, failure: 'stopped', cost: 0.0052 }, 2),
    ];
    expect(actualCost({ answers: reported, engines: TEST_ENGINES, provider })).toMatchObject({
      billed: 2,
      total: 0.0092,
      interrupted: 1,
      reported: true,
    });
  });
});
