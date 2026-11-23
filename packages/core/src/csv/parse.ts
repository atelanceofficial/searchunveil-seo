import {
  DiagnosticCollector,
  diagnostic,
  failure,
  locate,
  success,
  type Diagnostic,
  type Result,
} from '../diagnostics.ts';
import { DEFAULT_LIMITS } from '../limits.ts';

/**
 * An RFC 4180 CSV reader that also accepts what spreadsheet software really produces:
 * semicolon- and tab-separated files, CR, LF and CRLF line breaks, Excel's `sep=` hint,
 * and blank rows. Malformed quoting is reported with its line number instead of guessed at.
 */

export type CsvDelimiter = ',' | ';' | '\t' | '|';

const DELIMITERS: readonly CsvDelimiter[] = [',', ';', '\t', '|'];

export interface CsvOptions {
  /** Field separator. Detected from the content when omitted. */
  readonly delimiter?: CsvDelimiter;
  /** File name used to locate diagnostics. */
  readonly file?: string;
  readonly maxRows?: number;
  readonly maxColumns?: number;
  readonly maxFieldLength?: number;
}

export interface CsvRecord {
  readonly fields: readonly string[];
  /** 1-based physical line on which the record starts. */
  readonly line: number;
}

export interface CsvTable {
  readonly delimiter: CsvDelimiter;
  readonly header: CsvRecord;
  readonly records: readonly CsvRecord[];
}

interface Limits {
  readonly maxRecords: number;
  readonly maxColumns: number;
  readonly maxFieldLength: number;
}

interface TokenizeResult {
  readonly records: CsvRecord[];
  readonly error: Diagnostic | null;
}

const QUOTE = 0x22;
const CR = 0x0d;
const LF = 0x0a;
const SNIFF_SAMPLE_LENGTH = 64 * 1024;
const SNIFF_RECORDS = 30;

export function parseCsv(text: string, options: CsvOptions = {}): Result<CsvTable> {
  const { file } = options;
  // A byte order mark that survived decoding would otherwise become part of the first header.
  let start = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let firstLine = 1;
  let delimiter = options.delimiter;

  const hint = /^sep=([,;\t|])\r?\n/i.exec(text.slice(start, start + 8));
  if (hint !== null) {
    delimiter ??= hint[1] as CsvDelimiter;
    start += hint[0].length;
    firstLine = 2;
  }
  delimiter ??= sniffDelimiter(text, start);

  const collector = new DiagnosticCollector();
  const limits: Limits = {
    maxRecords: (options.maxRows ?? DEFAULT_LIMITS.maxRows) + 1, // plus the header row
    maxColumns: options.maxColumns ?? DEFAULT_LIMITS.maxColumns,
    maxFieldLength: options.maxFieldLength ?? DEFAULT_LIMITS.maxFieldLength,
  };
  const { records, error } = tokenize(text, delimiter, start, firstLine, limits, file, (d) => {
    collector.add(d);
  });
  if (error !== null) return failure([...collector.toArray(), error]);

  const [header, ...data] = records;
  if (header === undefined)
    return failure([diagnostic('csv.no-header', 'error', {}, locate(file))]);

  for (const record of data) {
    if (record.fields.length !== header.fields.length) {
      collector.add(
        diagnostic(
          'csv.field-count',
          'warning',
          { expected: header.fields.length, actual: record.fields.length },
          locate(file, record.line),
        ),
      );
    }
  }
  return success({ delimiter, header, records: data }, collector.toArray());
}

/**
 * Chooses the delimiter that splits the first records into the most consistent number of
 * fields, preferring more fields on ties. Single-column files default to a comma.
 */
export function sniffDelimiter(text: string, start = 0): CsvDelimiter {
  const sample = text.slice(start, start + SNIFF_SAMPLE_LENGTH);
  const truncated = text.length - start > SNIFF_SAMPLE_LENGTH;
  const limits: Limits = {
    maxRecords: SNIFF_RECORDS,
    maxColumns: DEFAULT_LIMITS.maxColumns,
    maxFieldLength: SNIFF_SAMPLE_LENGTH,
  };

  let best: CsvDelimiter = ',';
  let bestScore = 0;
  for (const candidate of DELIMITERS) {
    const { records } = tokenize(sample, candidate, 0, 1, limits, undefined, () => undefined);
    // A sample cut mid-record would make its last record look inconsistent.
    if (truncated && records.length > 1) records.pop();
    const width = records[0]?.fields.length ?? 0;
    if (width < 2) continue;
    const consistency = records.filter((r) => r.fields.length === width).length / records.length;
    const score = Math.round(consistency * 1000) * 1000 + width;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function tokenize(
  text: string,
  delimiter: CsvDelimiter,
  start: number,
  firstLine: number,
  limits: Limits,
  file: string | undefined,
  report: (d: Diagnostic) => void,
): TokenizeResult {
  const delimiterCode = delimiter.charCodeAt(0);
  const length = text.length;
  const records: CsvRecord[] = [];
  const fail = (code: Diagnostic['code'], line: number, params = {}): TokenizeResult => ({
    records,
    error: diagnostic(code, 'error', params, locate(file, line)),
  });
  let i = start;
  let line = firstLine;

  while (i < length) {
    const recordLine = line;
    const fields: string[] = [];

    for (;;) {
      let value: string;
      if (text.charCodeAt(i) === QUOTE) {
        const openingLine = line;
        let chunkStart = i + 1;
        value = '';
        for (;;) {
          const quote = text.indexOf('"', chunkStart);
          if (quote === -1) return fail('csv.unterminated-quote', openingLine);
          line += countLineBreaks(text, chunkStart, quote);
          if (text.charCodeAt(quote + 1) === QUOTE) {
            value += text.slice(chunkStart, quote + 1); // An escaped quote: keep one of the two.
            chunkStart = quote + 2;
            continue;
          }
          value += text.slice(chunkStart, quote);
          i = quote + 1;
          break;
        }
        if (i < length && !isFieldEnd(text.charCodeAt(i), delimiterCode)) {
          const end = findFieldEnd(text, i, delimiterCode);
          report(diagnostic('csv.text-after-quote', 'warning', {}, locate(file, line)));
          value += text.slice(i, end);
          i = end;
        }
      } else {
        const end = findFieldEnd(text, i, delimiterCode);
        value = text.slice(i, end);
        if (value.includes('"')) {
          report(diagnostic('csv.stray-quote', 'warning', {}, locate(file, line)));
        }
        i = end;
      }

      if (value.length > limits.maxFieldLength) {
        return fail('csv.field-too-long', line, { limit: limits.maxFieldLength });
      }
      fields.push(value);
      if (fields.length > limits.maxColumns) {
        return fail('csv.too-many-columns', line, { limit: limits.maxColumns });
      }

      if (i >= length) break;
      const code = text.charCodeAt(i);
      if (code === delimiterCode) {
        i++;
        if (i >= length) {
          fields.push(''); // A delimiter at the very end of the file ends an empty field.
          break;
        }
        continue;
      }
      // A line break ends the record: CRLF, LF or a lone CR.
      i += code === CR && text.charCodeAt(i + 1) === LF ? 2 : 1;
      line++;
      break;
    }

    // Blank lines and rows of empty cells carry no data.
    if (!fields.some((field) => field !== '')) continue;
    records.push({ fields, line: recordLine });
    if (records.length > limits.maxRecords) {
      return fail('csv.too-many-rows', recordLine, { limit: limits.maxRecords - 1 });
    }
  }
  return { records, error: null };
}

function isFieldEnd(code: number, delimiterCode: number): boolean {
  return code === delimiterCode || code === CR || code === LF;
}

function findFieldEnd(text: string, from: number, delimiterCode: number): number {
  let i = from;
  while (i < text.length && !isFieldEnd(text.charCodeAt(i), delimiterCode)) i++;
  return i;
}

function countLineBreaks(text: string, from: number, to: number): number {
  let count = 0;
  for (let i = from; i < to; i++) {
    const code = text.charCodeAt(i);
    if (code === LF || (code === CR && text.charCodeAt(i + 1) !== LF)) count++;
  }
  return count;
}
