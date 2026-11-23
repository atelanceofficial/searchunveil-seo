/**
 * Locale-tolerant parsing of the values in Search Console exports.
 *
 * Exports and spreadsheets re-saved in other languages write numbers differently: `1,234.5`,
 * `1.234,5`, `1 234,5` with a no-break space, `%12,3` in Turkish, `١٢٣٫٤` with Arabic-Indic
 * digits. Ambiguity is resolved per column, from all of its values, never per cell, so one
 * column is always read one way.
 */

export type Cell = number | 'empty' | 'invalid';

export type DecimalSeparator = '.' | ',';

const DIGIT_BLOCKS = [0x0660, 0x06f0, 0xff10]; // Arabic-Indic, Extended Arabic-Indic, fullwidth.
const DASHES = new Set(['-', '–', '—', '−', 'n/a', 'N/A']);
const SPACES = /[\s\u00A0\u202F\u2009'’]/gu;
/** Invisible direction marks that localized number formats insert (for example in Arabic). */
const BIDI_CONTROLS = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/gu;
const PERCENT = /^[%٪％﹪]|[%٪％﹪]$/gu;

/** Converts digits from other scripts to ASCII and Arabic separators to their Latin forms. */
export function normalizeDigits(text: string): string {
  let result = '';
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    const block = DIGIT_BLOCKS.find((start) => code >= start && code <= start + 9);
    if (block !== undefined) result += String(code - block);
    else if (character === '٫') result += '.';
    else if (character === '٬') result += ',';
    else result += character;
  }
  return result;
}

function clean(raw: string): string {
  return normalizeDigits(raw.replace(BIDI_CONTROLS, '')).trim();
}

/** Parses a whole, non-negative count such as clicks or impressions. */
export function parseCount(raw: string): Cell {
  const text = clean(raw);
  if (text === '' || DASHES.has(text)) return 'empty';
  const compact = text.replace(SPACES, ' ');
  let digits: string | null = null;
  if (/^\d+$/.test(compact)) digits = compact;
  else if (/^\d{1,3}(?:([,. ])\d{3})(?:\1\d{3})*$/.test(compact))
    digits = compact.replace(/\D/g, '');
  else if (/^\d+[.,]0+$/.test(compact)) digits = compact.replace(/[.,]0+$/, '');
  if (digits === null) return 'invalid';
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : 'invalid';
}

/** Splits a percentage into its number and whether it carried a percent sign. */
export function stripPercent(raw: string): { readonly text: string; readonly percent: boolean } {
  const text = clean(raw);
  const stripped = text.replace(PERCENT, '').trim();
  return { text: stripped, percent: stripped !== text };
}

/**
 * Decides which character a column uses as its decimal separator. A value that contains
 * both `.` and `,` decides on its own (the last one is decimal); a character repeated within
 * one value is a group separator; otherwise a lone separator is decimal, because the columns
 * read this way (CTR and position) hold small numbers.
 */
export function detectDecimalSeparator(values: readonly string[]): DecimalSeparator | 'mixed' {
  let dot = 0;
  let comma = 0;
  for (const raw of values) {
    const text = stripPercent(raw).text;
    const dots = text.split('.').length - 1;
    const commas = text.split(',').length - 1;
    if (dots > 0 && commas > 0) {
      if (text.lastIndexOf('.') > text.lastIndexOf(',')) dot++;
      else comma++;
    } else if (dots > 0) {
      if (dots > 1) comma++;
      else dot++;
    } else if (commas > 0) {
      if (commas > 1) dot++;
      else comma++;
    }
  }
  if (dot > 0 && comma > 0) return 'mixed';
  return comma > 0 ? ',' : '.';
}

/** Parses a decimal number written with the given decimal separator. */
export function parseDecimal(raw: string, separator: DecimalSeparator): Cell {
  const text = clean(raw);
  if (text === '' || DASHES.has(text)) return 'empty';
  const group = separator === '.' ? ',' : '.';
  let compact = text.replace(SPACES, '');
  if (compact.includes(group)) {
    const [integer = '', ...rest] = compact.split(separator);
    if (rest.length > 1 || !/^\d{1,3}(?:[.,]\d{3})+$/.test(integer)) return 'invalid';
    compact = [integer.replaceAll(group, ''), ...rest].join(separator);
  }
  if (separator === ',') compact = compact.replace(',', '.');
  if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(compact)) return 'invalid';
  return Number(compact);
}

/** Number of digits after the decimal separator, used to derive rounding tolerances. */
export function decimalPlaces(raw: string, separator: DecimalSeparator): number {
  const text = stripPercent(raw).text;
  const index = text.lastIndexOf(separator);
  return index === -1 ? 0 : text.length - index - 1;
}

export type DateOrder = 'ymd' | 'dmy' | 'mdy';

export interface DateColumn {
  /** ISO dates (`YYYY-MM-DD`), or `null` where a value is not a valid date. */
  readonly dates: readonly (string | null)[];
  /** Order of day and month in non-ISO values; `null` when every value was ISO-like. */
  readonly order: DateOrder | null;
  /** True when day and month could not be told apart. */
  readonly ambiguous: boolean;
}

interface DateParts {
  readonly year: number;
  readonly first: number;
  readonly second: number;
  readonly separator: string;
  readonly yearFirst: boolean;
}

const TIME_SUFFIX = /[ T]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;

function splitDate(raw: string): DateParts | null {
  const text = clean(raw).replace(TIME_SUFFIX, '');
  let match = /^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/.exec(text);
  if (match !== null) {
    return {
      year: Number(match[1]),
      first: Number(match[3]),
      second: Number(match[4]),
      separator: match[2] ?? '-',
      yearFirst: true,
    };
  }
  match = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(text) ?? /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  if (match !== null) {
    return {
      year: Number(match[1]),
      first: Number(match[2]),
      second: Number(match[3]),
      separator: '',
      yearFirst: true,
    };
  }
  match = /^(\d{1,2})([-/.])(\d{1,2})\2(\d{4}|\d{2})$/.exec(text);
  if (match !== null) {
    const year = Number(match[4]);
    return {
      year: (match[4] ?? '').length === 2 ? 2000 + year : year,
      first: Number(match[1]),
      second: Number(match[3]),
      separator: match[2] ?? '/',
      yearFirst: false,
    };
  }
  return null;
}

/** Builds an ISO date if the parts name a real calendar day. */
export function isoDate(year: number, month: number, day: number): string | null {
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Parses a column of dates. ISO dates are read directly. For day/month/year values the
 * order is decided from the whole column: a component above 12 settles it; dot-separated
 * dates are day-first in every locale that uses them; otherwise the order under which the
 * dates form a run of consecutive days wins, as they do in Search Console's daily table.
 */
export function parseDateColumn(values: readonly string[], preferred?: 'dmy' | 'mdy'): DateColumn {
  const parts = values.map(splitDate);
  const ambiguousParts = parts.filter((p): p is DateParts => p !== null && !p.yearFirst);
  let order: DateOrder | null = null;
  let ambiguous = false;

  if (ambiguousParts.length > 0) {
    const dayFirstPossible = !ambiguousParts.some((p) => p.second > 12);
    const monthFirstPossible = !ambiguousParts.some((p) => p.first > 12);
    if (dayFirstPossible && !monthFirstPossible) order = 'dmy';
    else if (monthFirstPossible && !dayFirstPossible) order = 'mdy';
    else if (dayFirstPossible && monthFirstPossible) {
      if (ambiguousParts.every((p) => p.separator === '.')) order = 'dmy';
      else if (preferred !== undefined) order = preferred;
      else {
        const dmyRun = consecutiveSteps(ambiguousParts, 'dmy');
        const mdyRun = consecutiveSteps(ambiguousParts, 'mdy');
        if (dmyRun > mdyRun) order = 'dmy';
        else if (mdyRun > dmyRun) order = 'mdy';
        else ambiguous = true;
      }
    }
  }

  const dates = parts.map((p) => {
    if (p === null) return null;
    if (p.yearFirst) return isoDate(p.year, p.first, p.second);
    if (order === 'dmy') return isoDate(p.year, p.second, p.first);
    if (order === 'mdy') return isoDate(p.year, p.first, p.second);
    return null;
  });
  return { dates, order: ambiguousParts.length === 0 ? null : order, ambiguous };
}

function consecutiveSteps(parts: readonly DateParts[], order: 'dmy' | 'mdy'): number {
  const days = parts
    .map((p) =>
      order === 'dmy' ? isoDate(p.year, p.second, p.first) : isoDate(p.year, p.first, p.second),
    )
    .filter((d): d is string => d !== null)
    .map((d) => Date.parse(d) / 86_400_000)
    .sort((a, b) => a - b);
  let steps = 0;
  for (let i = 1; i < days.length; i++) if ((days[i] ?? 0) - (days[i - 1] ?? 0) === 1) steps++;
  return steps;
}
