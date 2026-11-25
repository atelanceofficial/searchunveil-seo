import { describe, expect, it } from 'vitest';
import { createTranslator, isolate, MessageSyntaxError, parseMessage } from './format.ts';
import { matchLocale } from './locales.ts';
import { code, date, dateRange, decimal, list, money, percent, text } from './message.ts';

const strip = (text: string) => text.replace(/[\u2068\u2069]/g, '');
/** ICU chooses between several space characters by version; compare them as plain spaces. */
const spaces = (text: string) => text.replace(/[\s\u00A0\u202F\u2009]/g, ' ');

function translate(locale: Parameters<typeof createTranslator>[0], source: string, params = {}) {
  return createTranslator(locale, { m: source }).t('m', params);
}

describe('message syntax', () => {
  it('formats arguments and numbers for the locale', () => {
    expect(translate('en', 'Clicks: {n}', { n: 1234 })).toBe('Clicks: 1,234');
    expect(translate('de', 'Klicks: {n}', { n: 1234.5 })).toBe('Klicks: 1.234,5');
  });

  it('chooses plural forms with each language’s rules', () => {
    const days = '{n, plural, =0 {no days} one {# day} other {# days}}';
    expect(translate('en', days, { n: 0 })).toBe('no days');
    expect(translate('en', days, { n: 1 })).toBe('1 day');
    expect(translate('en', days, { n: 1200 })).toBe('1,200 days');

    const arabic =
      '{n, plural, zero {لا أيام} one {يوم واحد} two {يومان} few {# أيام} many {# يومًا} other {# يوم}}';
    expect(translate('ar', arabic, { n: 0 })).toBe('لا أيام');
    expect(translate('ar', arabic, { n: 2 })).toBe('يومان');
    expect(translate('ar', arabic, { n: 3 })).toMatch(/أيام$/);
    expect(translate('ar', arabic, { n: 11 })).toMatch(/يومًا$/);
  });

  it('supports plural offsets and nested select', () => {
    const source =
      '{n, plural, offset:1 =0 {nobody} =1 {{who}} one {{who} and # other} other {{who} and # others}}';
    expect(strip(translate('en', source, { n: 1, who: 'Ada' }))).toBe('Ada');
    expect(strip(translate('en', source, { n: 2, who: 'Ada' }))).toBe('Ada and 1 other');
    expect(strip(translate('en', source, { n: 4, who: 'Ada' }))).toBe('Ada and 3 others');

    const nested =
      '{kind, select, page {{n, plural, one {# page} other {# pages}}} other {# items}}';
    expect(translate('en', nested, { kind: 'page', n: 2 })).toBe('2 pages');
    expect(translate('en', nested, { kind: 'x', n: 2 })).toBe('# items');
  });

  it('follows ICU apostrophe rules', () => {
    expect(translate('fr', "l'impression d'abord")).toBe("l'impression d'abord");
    expect(translate('en', "It''s {n}", { n: 2 })).toBe("It's 2");
    expect(translate('en', "Literal '{braces}' here")).toBe('Literal {braces} here');
    expect(translate('en', "{n, plural, other {'#' is # }}", { n: 3 })).toBe('# is 3 ');
  });

  it('keeps a missing parameter visible instead of failing', () => {
    expect(translate('en', 'Hello {name}')).toBe('Hello {name}');
  });

  it('rejects malformed messages', () => {
    for (const bad of ['{', '}', '{n, plural, one {x}}', '{n, number}', '{n, select, other {x}']) {
      expect(() => parseMessage(bad)).toThrow(MessageSyntaxError);
    }
  });
});

describe('value formatting', () => {
  it('formats percentages with sensible precision and explicit signs', () => {
    const en = createTranslator('en', {});
    expect(en.value(percent(0.0523))).toBe('5.2%');
    expect(en.value(percent(0.25))).toBe('25%');
    expect(en.value(percent(0.12, true))).toBe('+12%');
    expect(en.value(percent(-0.034, true))).toBe('-3.4%');
    expect(createTranslator('tr', {}).value(percent(0.25))).toBe('%25');
    expect(spaces(createTranslator('fr', {}).value(percent(0.25)))).toBe('25 %');
  });

  it('formats decimals with fixed digits', () => {
    expect(createTranslator('en', {}).value(decimal(8.25, 1))).toBe('8.3');
    expect(createTranslator('de', {}).value(decimal(8, 1))).toBe('8,0');
    expect(createTranslator('en', {}).value(decimal(-5, 0, true))).toBe('-5');
  });

  it('formats money, keeping fractions of a cent visible', () => {
    const en = createTranslator('en', {});
    expect(en.value(money(0.468, 'USD'))).toBe('$0.468');
    expect(en.value(money(0.0052, 'USD'))).toBe('$0.0052');
    expect(en.value(money(0, 'USD'))).toBe('$0.00');
    expect(en.value(money(12.5, 'USD'))).toBe('$12.50');
    expect(createTranslator('tr', {}).value(money(0.468, 'USD'))).toBe('$0,468');
    expect(spaces(createTranslator('de', {}).value(money(12.5, 'EUR')))).toBe('12,50 €');
    expect(en.value(money(3, 'not a currency'))).toBe('3 not a currency');
  });

  it('formats calendar dates in UTC so they never shift by a day', () => {
    expect(createTranslator('en', {}).value(date('2026-11-01'))).toBe('Nov 1, 2026');
    expect(createTranslator('zh-CN', {}).value(date('2026-11-01'))).toBe('2026年11月1日');
    expect(spaces(createTranslator('en', {}).value(dateRange('2026-10-05', '2026-11-01')))).toBe(
      'Oct 5 – Nov 1, 2026',
    );
  });

  it('isolates text written by people so mixed directions stay readable', () => {
    const ar = createTranslator('ar', {});
    expect(ar.value('running shoes')).toBe(isolate('running shoes'));
    expect(ar.value(code('<title>'))).toBe(isolate('<title>'));
    // The interface's own, already translated words are inserted as they are.
    expect(ar.value(text('النقرات'))).toBe('النقرات');
    expect(strip(createTranslator('en', {}).value(list(['a', 'b', 'c'])))).toBe('a, b, and c');
  });

  it('exposes the writing direction', () => {
    expect(createTranslator('ar', {}).dir).toBe('rtl');
    expect(createTranslator('tr', {}).dir).toBe('ltr');
  });
});

describe('matchLocale', () => {
  it('matches preferences in order, by language', () => {
    expect(matchLocale(['tr-TR', 'en-US'])).toBe('tr');
    expect(matchLocale(['pt-BR', 'es-MX'])).toBe('es');
    expect(matchLocale(['ar-EG'])).toBe('ar');
    expect(matchLocale(['ja-JP'])).toBe('en');
    expect(matchLocale(['not a tag', 'de'])).toBe('de');
  });

  it('serves Simplified Chinese only to Simplified Chinese preferences', () => {
    expect(matchLocale(['zh'])).toBe('zh-CN');
    expect(matchLocale(['zh-SG'])).toBe('zh-CN');
    expect(matchLocale(['zh-Hans-HK'])).toBe('zh-CN');
    expect(matchLocale(['zh-TW', 'fr'])).toBe('fr');
    expect(matchLocale(['zh-HK'], 'en')).toBe('en');
  });
});
