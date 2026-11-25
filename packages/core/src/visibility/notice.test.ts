import { describe, expect, it } from 'vitest';
import type { CoreMessage } from '../findings.ts';
import { CORE_CATALOGS } from '../i18n/catalogs/all.ts';
import { createTranslator } from '../i18n/format.ts';
import type { Locale } from '../i18n/locales.ts';
import { PRICING } from '../pricing.ts';
import { TEST_ENGINES, TEST_PLAN } from '../test-support/visibility-fixtures.ts';
import { estimateCost, type ActualCost } from './cost.ts';
import {
  actualCostNotice,
  costNotice,
  engineOptions,
  trialNotice,
  unavailableNotice,
  unavailableProducts,
} from './notice.ts';
import type { VisibilityPlan } from './plan.ts';

const PROVIDER = 'Example Tools';
const TERMS = { currency: 'USD', engines: TEST_ENGINES, chargesFailedCalls: false };

/** Rendered text without the marks that keep inserted names' direction. */
function read(locale: Locale, messages: readonly CoreMessage[]) {
  const t = createTranslator(locale, CORE_CATALOGS[locale]);
  return messages.map((m) => t.message(m).replace(/[⁨⁩]/g, '')).join(' ');
}

/** The example in the notes: 10 questions × 3 engines × 3 repeats at 0.0052 USD a call. */
const ninety: VisibilityPlan = {
  ...TEST_PLAN,
  questions: Array.from({ length: 10 }, (_, i) => `question ${i}`),
  engines: ['a', 'b', 'c'],
};
const flat = ['a', 'b', 'c'].map((id) => ({ id, label: id, family: id, pricePerCall: 0.0052 }));

describe('costNotice', () => {
  const estimate = estimateCost(ninety, { ...TERMS, engines: flat });

  it('reads like the drafted notice, with the free trial', () => {
    const notice = costNotice(estimate, { provider: PROVIDER, billing: 'balance' });
    expect(read('en', notice)).toBe(
      'This check uses paid tools on Example Tools. Estimated cost: 90 calls, about $0.468. ' +
        'This fee is not included in your SearchUnveil subscription or 14-day free trial and is ' +
        'charged to your Example Tools balance. Failed calls are not charged. ' +
        'Do you want to continue?',
    );
    expect(read('tr', notice)).toBe(
      'Bu kontrol, Example Tools üzerindeki ücretli araçları kullanır. Tahmini maliyet: 90 çağrı, ' +
        'yaklaşık $0,468. Bu ücret SearchUnveil aboneliğinize ve 14 günlük ücretsiz deneme ' +
        'sürenize dahil değildir ve Example Tools bakiyenizden kesilir. Başarısız çağrılar ' +
        'ücretlendirilmez. Devam etmek istiyor musunuz?',
    );
  });

  it('names the trial in every language', () => {
    const notice = costNotice(estimate, { provider: PROVIDER, billing: 'balance' });
    for (const locale of Object.keys(CORE_CATALOGS) as Locale[]) {
      const text = read(locale, notice);
      expect(text, locale).toMatch(/14/);
      expect(text, locale).not.toMatch(/[{}]/);
    }
  });

  it('says when prices are missing, when failed calls are billed, and whose account pays', () => {
    const unpriced = estimateCost({ ...TEST_PLAN, engines: ['pplx', 'chat'] }, TERMS);
    const notice = costNotice(
      { ...unpriced, chargesFailedCalls: true },
      { provider: PROVIDER, billing: 'account' },
    );
    expect(read('en', notice)).toContain(
      '6 calls have no stated price, so the estimate leaves them out.',
    );
    expect(read('en', notice)).toContain('charged to your own Example Tools account.');
    expect(read('en', notice)).toContain('Failed calls are charged too.');
    expect(notice.at(-1)?.key).toBe('visibility.cost.confirm');
  });
});

describe('actualCostNotice', () => {
  const actual: ActualCost = {
    currency: 'USD',
    calls: 12,
    answered: 9,
    failed: 2,
    interrupted: 1,
    billed: 9,
    total: 0.0466,
    unpricedCalls: 1,
    reported: false,
    chargesFailedCalls: false,
  };

  it('tells what was spent, what was free and what may still be billed', () => {
    expect(read('en', actualCostNotice(actual, PROVIDER))).toBe(
      'This check made 12 calls and cost about $0.0466. ' +
        '1 billed call had no stated price and is not included. ' +
        '2 calls failed and were not charged. ' +
        '1 call was cut off when you stopped the check; Example Tools may still charge for it.',
    );
  });

  it('says nothing more when everything was answered at a stated price', () => {
    const clean = { ...actual, failed: 0, interrupted: 0, unpricedCalls: 0 };
    expect(actualCostNotice(clean, PROVIDER)).toHaveLength(1);
    const billedFailures = { ...clean, failed: 2, chargesFailedCalls: true };
    expect(actualCostNotice(billedFailures, PROVIDER)).toHaveLength(1);
  });
});

describe('trialNotice', () => {
  it('warns that the trial does not cover the paid tools', () => {
    expect(PRICING.freeTrialDays).toBe(14);
    expect(read('tr', [trialNotice(PROVIDER)])).toBe(
      '14 günlük ücretsiz deneme yalnızca SearchUnveil aboneliğini kapsar. Yapay zekâ ' +
        'görünürlüğü kontrolü Example Tools üzerindeki ücretli araçları kullanır ve bu araçların ' +
        'ücreti deneme süresinde de Example Tools bakiyenizden kesilir.',
    );
  });
});

describe('unavailable AI products', () => {
  it('lists the products no engine can check', () => {
    expect(unavailableProducts(TEST_ENGINES)).toEqual([
      'Claude',
      'Microsoft Copilot',
      'Gemini',
      'Google AI Mode',
    ]);
    expect(unavailableProducts(TEST_ENGINES, ['chatgpt', 'claude', 'other-ai'])).toEqual([
      'Claude',
      'other-ai',
    ]);
  });

  it('says so plainly, or not at all', () => {
    expect(unavailableNotice([], PROVIDER)).toBeNull();
    const one = unavailableNotice(['Claude'], PROVIDER);
    const two = unavailableNotice(['ChatGPT', 'Claude'], PROVIDER);
    if (one === null || two === null) throw new Error('no notice');
    expect(read('en', [one])).toBe(
      'Claude can’t be checked on Example Tools: it offers no tool for it.',
    );
    expect(read('tr', [two])).toBe(
      'ChatGPT ve Claude Example Tools üzerinde kontrol edilemiyor: bunlar için araç sunulmuyor.',
    );
  });
});

describe('engineOptions', () => {
  it('prices every model for this plan, by family, marking the cheapest', () => {
    expect(
      engineOptions(TEST_PLAN, TERMS).map(({ engine, cost, chosen, cheapest }) => [
        engine.id,
        cost,
        chosen,
        cheapest,
      ]),
    ).toEqual([
      ['pplx', 0.03, true, true],
      ['pplx-pro', 0.078, false, false],
      ['aio', 0.0312, true, true],
      ['chat', null, false, false],
    ]);
  });
});
