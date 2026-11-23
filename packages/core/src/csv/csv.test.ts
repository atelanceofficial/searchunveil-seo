import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatCsv } from './format.ts';
import { parseCsv, sniffDelimiter, type CsvTable } from './parse.ts';

function table(text: string, options?: Parameters<typeof parseCsv>[1]): CsvTable {
  const result = parseCsv(text, options);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.value;
}

const rows = (t: CsvTable) => t.records.map((r) => r.fields);

describe('parseCsv', () => {
  it('reads a simple comma-separated table', () => {
    const t = table('Top queries,Clicks\nshoes,12\nboots,3\n');
    expect(t.delimiter).toBe(',');
    expect(t.header).toEqual({ fields: ['Top queries', 'Clicks'], line: 1 });
    expect(rows(t)).toEqual([
      ['shoes', '12'],
      ['boots', '3'],
    ]);
  });

  it('handles quoted delimiters, escaped quotes and line breaks inside quotes', () => {
    const t = table('q,n\r\n"a, b",1\r\n"say ""hi""",2\r\n"two\r\nlines",3\r\nlast,4');
    expect(rows(t)).toEqual([
      ['a, b', '1'],
      ['say "hi"', '2'],
      ['two\r\nlines', '3'],
      ['last', '4'],
    ]);
    // Records keep the physical line they start on, even after a multi-line field.
    expect(t.records.map((r) => r.line)).toEqual([2, 3, 4, 6]);
  });

  it('accepts lone carriage returns as line breaks', () => {
    expect(rows(table('a,b\r1,2\r3,4'))).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('keeps empty fields, including one ended by a final delimiter', () => {
    expect(rows(table('a,b,c\n1,,3\n4,5,'))).toEqual([
      ['1', '', '3'],
      ['4', '5', ''],
    ]);
  });

  it('skips blank lines and rows of empty cells', () => {
    const t = table('\n\na,b\n\n1,2\n,,\n\n3,4\n\n');
    expect(t.header.line).toBe(3);
    expect(rows(t)).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('ignores a byte order mark left in the text', () => {
    expect(table('\uFEFFDate,Clicks\n2026-01-01,1').header.fields).toEqual(['Date', 'Clicks']);
  });

  it('honours Excel’s sep= hint', () => {
    const t = table('sep=;\nDate;Clicks\n2026-01-01;1');
    expect(t.delimiter).toBe(';');
    expect(t.header).toEqual({ fields: ['Date', 'Clicks'], line: 2 });
  });

  it('detects semicolons in files that use decimal commas', () => {
    const t = table('Top queries;Clicks;CTR;Position\nshoes;12;10,5 %;3,2\nboots;3;1,2 %;8,9');
    expect(t.delimiter).toBe(';');
    expect(rows(t)[0]).toEqual(['shoes', '12', '10,5 %', '3,2']);
  });

  it('detects tabs and pipes', () => {
    expect(table('a\tb\n1\t2').delimiter).toBe('\t');
    expect(table('a|b|c\n1|2|3').delimiter).toBe('|');
  });

  it('prefers the delimiter with consistent rows over one that merely appears often', () => {
    const text = 'query,clicks\n"a;b;c",1\n"d;e;f",2\n"g;h;i",3';
    expect(sniffDelimiter(text)).toBe(',');
  });

  it('defaults to a comma for single-column files', () => {
    expect(table('url\nhttps://example.com/').delimiter).toBe(',');
  });

  it('reports an unterminated quote at the line where it opened', () => {
    const result = parseCsv('a,b\n1,2\n"open,3\n4,5', { file: 'Pages.csv' });
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContainEqual({
      code: 'csv.unterminated-quote',
      severity: 'error',
      params: {},
      location: { file: 'Pages.csv', line: 3 },
    });
  });

  it('keeps reading malformed quotes but warns about them', () => {
    const result = parseCsv('a,b\nsay "hi",1\n"quoted"tail,2');
    expect(result.ok && rows(result.value)).toEqual([
      ['say "hi"', '1'],
      ['quotedtail', '2'],
    ]);
    expect(result.diagnostics.map((d) => [d.code, d.location?.line])).toEqual([
      ['csv.stray-quote', 2],
      ['csv.text-after-quote', 3],
    ]);
  });

  it('warns about rows whose field count differs from the header', () => {
    const result = parseCsv('a,b,c\n1,2\n1,2,3');
    expect(result.diagnostics).toEqual([
      {
        code: 'csv.field-count',
        severity: 'warning',
        params: { expected: 3, actual: 2 },
        location: { line: 2 },
      },
    ]);
  });

  it('summarizes repeated warnings instead of flooding', () => {
    const text = ['a,b', ...Array.from({ length: 12 }, () => '1')].join('\n');
    const codes = parseCsv(text).diagnostics.map((d) => d.code);
    expect(codes.filter((c) => c === 'csv.field-count')).toHaveLength(5);
    expect(codes.at(-1)).toBe('diagnostic.more');
  });

  it('rejects input without a header row', () => {
    expect(parseCsv('\n\n').diagnostics.map((d) => d.code)).toEqual(['csv.no-header']);
  });

  it('enforces row, column and field-length limits explicitly', () => {
    const tooManyRows = parseCsv('a\n1\n2\n3', { maxRows: 2 });
    expect(tooManyRows.ok).toBe(false);
    expect(tooManyRows.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'csv.too-many-rows', params: { limit: 2 } }),
    );

    const tooManyColumns = parseCsv('a,b,c\n1,2,3', { maxColumns: 2 });
    expect(tooManyColumns.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'csv.too-many-columns', params: { limit: 2 } }),
    );

    const tooLong = parseCsv(`a\n"${'x'.repeat(20)}"`, { maxFieldLength: 10 });
    expect(tooLong.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'csv.field-too-long', location: { line: 2 } }),
    );
  });

  it('allows exactly the maximum number of rows', () => {
    expect(parseCsv('a\n1\n2\n\n', { maxRows: 2 }).ok).toBe(true);
  });
});

describe('formatCsv', () => {
  it('quotes only when needed and uses CRLF line endings with a BOM', () => {
    expect(formatCsv([['plain', 'a,b', 'say "hi"', 'two\nlines', ' padded', 42, null]])).toBe(
      '\uFEFFplain,"a,b","say ""hi""","two\nlines"," padded",42,\r\n',
    );
  });

  it('neutralizes spreadsheet formulas in text cells (CSV injection)', () => {
    const output = formatCsv(
      [['=HYPERLINK("http://evil.example")', '+1', '-2', '@SUM(A1)', '＝1', 'safe', -3]],
      { byteOrderMark: false },
    );
    expect(output).toBe(
      `"'=HYPERLINK(""http://evil.example"")",'+1,'-2,'@SUM(A1),'＝1,safe,-3\r\n`,
    );
  });

  it('writes non-finite numbers as empty cells', () => {
    expect(formatCsv([[Number.NaN, Number.POSITIVE_INFINITY]], { byteOrderMark: false })).toBe(
      ',\r\n',
    );
  });

  it('round-trips arbitrary text through the parser', () => {
    const cell = fc
      .string({ unit: 'binary', maxLength: 12 })
      .filter((s) => !/^[=+\-@\t\r＝＋－＠]/.test(s));
    const record = fc.array(cell, { minLength: 1, maxLength: 5 });
    fc.assert(
      fc.property(fc.array(record, { minLength: 1, maxLength: 8 }), (input) => {
        const width = Math.max(...input.map((r) => r.length));
        // Every row carries one non-empty marker cell: rows of empty cells are skipped by design.
        const data = input.map((r, i) => [
          `#${i}`,
          ...r,
          ...Array<string>(width - r.length).fill(''),
        ]);
        const parsed = parseCsv(formatCsv(data), { delimiter: ',' });
        expect(parsed.ok).toBe(true);
        if (parsed.ok) expect([parsed.value.header.fields, ...rows(parsed.value)]).toEqual(data);
      }),
      { numRuns: 300 },
    );
  });
});
