import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  decimalPlaces,
  detectDecimalSeparator,
  isoDate,
  normalizeDigits,
  parseCount,
  parseDateColumn,
  parseDecimal,
  stripPercent,
} from './values.ts';

/** Locales whose number formats appear in exports, including Arabic-Indic digits. */
const NUMBER_LOCALES = ['en', 'es', 'de', 'fr', 'tr', 'zh-CN', 'ar', 'ar-EG', 'de-CH'];

describe('normalizeDigits', () => {
  it('converts Arabic-Indic, Extended Arabic-Indic and fullwidth digits', () => {
    expect(normalizeDigits('١٢٣٫٤٥')).toBe('123.45');
    expect(normalizeDigits('۱۲۳٬۴۵۶')).toBe('123,456');
    expect(normalizeDigits('１２３')).toBe('123');
  });
});

describe('parseCount', () => {
  it.each([
    ['0', 0],
    ['1234', 1234],
    ['1,234', 1234],
    ['1.234', 1234],
    ['1 234 567', 1_234_567],
    ['12.0', 12],
    [' 42 ', 42],
  ])('reads %j as %d', (raw, expected) => {
    expect(parseCount(raw)).toBe(expected);
  });

  it.each(['', '-', '—'])('reads %j as empty', (raw) => {
    expect(parseCount(raw)).toBe('empty');
  });

  it.each(['1.5', '1,23', '-3', '12a', '1,234.567,8', '99999999999999999999'])(
    'rejects %j',
    (raw) => {
      expect(parseCount(raw)).toBe('invalid');
    },
  );

  it('round-trips counts formatted in every supported locale', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2_000_000_000 }),
        fc.constantFrom(...NUMBER_LOCALES),
        (value, locale) => {
          expect(parseCount(new Intl.NumberFormat(locale).format(value))).toBe(value);
        },
      ),
      { numRuns: 500 },
    );
  });
});

describe('decimal columns', () => {
  it('detects the decimal separator from the whole column', () => {
    expect(detectDecimalSeparator(['3.5', '12', '7.25'])).toBe('.');
    expect(detectDecimalSeparator(['3,5', '12', '7,25'])).toBe(',');
    expect(detectDecimalSeparator(['1.234,5', '7'])).toBe(',');
    expect(detectDecimalSeparator(['1,234.5', '7'])).toBe('.');
    expect(detectDecimalSeparator(['12', '7'])).toBe('.');
    expect(detectDecimalSeparator(['3.5', '4,2'])).toBe('mixed');
  });

  it('parses decimals with grouping', () => {
    expect(parseDecimal('1,234.5', '.')).toBe(1234.5);
    expect(parseDecimal('1.234,5', ',')).toBe(1234.5);
    expect(parseDecimal('4,25', ',')).toBe(4.25);
    expect(parseDecimal('.5', '.')).toBe(0.5);
    expect(parseDecimal('', '.')).toBe('empty');
    expect(parseDecimal('1,23.4', '.')).toBe('invalid');
    expect(parseDecimal('abc', '.')).toBe('invalid');
  });

  it('strips percent signs written before or after the number', () => {
    expect(stripPercent('12.3%')).toEqual({ text: '12.3', percent: true });
    expect(stripPercent('%12,3')).toEqual({ text: '12,3', percent: true });
    expect(stripPercent('12,3\u00A0%')).toEqual({ text: '12,3', percent: true });
    expect(stripPercent('١٢٫٣٪')).toEqual({ text: '12.3', percent: true });
    expect(stripPercent('0.123')).toEqual({ text: '0.123', percent: false });
  });

  it('counts printed decimal places to derive rounding tolerance', () => {
    expect(decimalPlaces('12.34%', '.')).toBe(2);
    expect(decimalPlaces('%5', ',')).toBe(0);
  });

  it('round-trips CTR and position values formatted in every supported locale', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 999, noNaN: true }), { minLength: 1, maxLength: 20 }),
        fc.constantFrom(...NUMBER_LOCALES),
        (values, locale) => {
          const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
          const column = values.map((v) => format.format(v));
          const separator = detectDecimalSeparator(column);
          expect(separator).not.toBe('mixed');
          if (separator === 'mixed') return;
          column.forEach((text, i) => {
            const expected = Number((values[i] ?? 0).toFixed(2));
            expect(parseDecimal(text, separator)).toBeCloseTo(expected, 6);
          });
        },
      ),
      { numRuns: 400 },
    );
  });

  it('reads percentages formatted in every supported locale', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.constantFrom(...NUMBER_LOCALES),
        (fraction, locale) => {
          const text = new Intl.NumberFormat(locale, {
            style: 'percent',
            maximumFractionDigits: 2,
          }).format(fraction);
          const stripped = stripPercent(text);
          expect(stripped.percent).toBe(true);
          const separator = detectDecimalSeparator([text]);
          if (separator === 'mixed') throw new Error(text);
          const value = parseDecimal(stripped.text, separator);
          expect(value).toBeCloseTo(Number((fraction * 100).toFixed(2)), 6);
        },
      ),
      { numRuns: 400 },
    );
  });
});

describe('isoDate', () => {
  it('accepts real calendar days only', () => {
    expect(isoDate(2028, 2, 29)).toBe('2028-02-29');
    expect(isoDate(2026, 2, 29)).toBeNull();
    expect(isoDate(2026, 13, 1)).toBeNull();
  });
});

describe('parseDateColumn', () => {
  it('reads ISO dates, timestamps, compact and CJK dates', () => {
    expect(
      parseDateColumn([
        '2026-11-20',
        '2026-11-21T00:00:00Z',
        '20261122',
        '2026年11月23日',
        '2026/11/24',
      ]).dates,
    ).toEqual(['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24']);
  });

  it('settles day and month order when a component exceeds 12', () => {
    expect(parseDateColumn(['11/20/2026', '11/21/2026'])).toEqual({
      dates: ['2026-11-20', '2026-11-21'],
      order: 'mdy',
      ambiguous: false,
    });
    expect(parseDateColumn(['20/11/2026', '21/11/2026']).order).toBe('dmy');
  });

  it('treats dot-separated dates as day-first', () => {
    expect(parseDateColumn(['01.02.2026', '02.02.2026']).dates).toEqual([
      '2026-02-01',
      '2026-02-02',
    ]);
  });

  it('uses the run of consecutive days to resolve otherwise ambiguous dates', () => {
    const november = ['11/01/2026', '11/02/2026', '11/03/2026', '11/04/2026'];
    expect(parseDateColumn(november).order).toBe('mdy');
    const february = ['01/02/2026', '02/02/2026', '03/02/2026'];
    expect(parseDateColumn(february).order).toBe('dmy');
  });

  it('reports dates that remain ambiguous unless an order is preferred', () => {
    expect(parseDateColumn(['03/04/2026'])).toEqual({
      dates: [null],
      order: null,
      ambiguous: true,
    });
    expect(parseDateColumn(['03/04/2026'], 'dmy').dates).toEqual(['2026-04-03']);
  });

  it('expands two-digit years and rejects impossible dates', () => {
    expect(parseDateColumn(['20/11/26']).dates).toEqual(['2026-11-20']);
    expect(parseDateColumn(['2026-02-30', 'yesterday']).dates).toEqual([null, null]);
  });
});
