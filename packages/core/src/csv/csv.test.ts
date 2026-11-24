import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatCsv } from './format.ts';
import { CsvReader, parseCsv, sniffDelimiter, type CsvTable } from './parse.ts';
import { readCsv } from './stream.ts';

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

describe('CsvReader', () => {
  /** Parses text split at the given positions, as a stream would deliver it. */
  function pieces(text: string, cuts: readonly number[]) {
    const reader = new CsvReader();
    let previous = 0;
    for (const cut of [...cuts].sort((a, b) => a - b)) {
      reader.push(text.slice(previous, cut));
      previous = cut;
    }
    reader.push(text.slice(previous));
    return reader.finish();
  }

  const tricky =
    '\uFEFFsep=;\r\nq;n\r\n"a; b";1\r\n"say ""hi""";2\r\n"two\r\nlines";3\r\n\r\nlast;4\rlone;5\nx"y;6\n';

  it('gives the same result however the text is cut, even inside quotes and CRLFs', () => {
    const whole = parseCsv(tricky);
    for (let cut = 0; cut <= tricky.length; cut++) {
      expect(pieces(tricky, [cut])).toEqual(whole);
    }
  });

  it('matches whole-text parsing for arbitrary text cut anywhere', () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(fc.string({ unit: fc.constantFrom('a', ',', '"', '\n', '\r', ' ') }))),
        fc.array(fc.nat()),
        (cells, positions) => {
          const text = cells.map((row) => row.join(',')).join('\r\n');
          const cuts = positions.map((p) => p % (text.length + 1));
          expect(pieces(text, cuts)).toEqual(parseCsv(text));
        },
      ),
      { numRuns: 300 },
    );
  });

  it('parses long files as they arrive and stops at the row limit', () => {
    // Parsing starts once there is enough text to choose the delimiter from (64 KB).
    const reader = new CsvReader({ maxRows: 1000 });
    reader.push('Key,Clicks\n');
    let pushed = 0;
    while (pushed < 50_000 && !reader.failed) reader.push(`row ${String(pushed++)},1\n`);
    expect(reader.failed).toBe(true);
    expect(pushed).toBeLessThan(10_000);
    const result = reader.finish();
    expect(result.ok).toBe(false);
    expect(result.diagnostics.at(-1)).toMatchObject({ code: 'csv.too-many-rows' });
  });
});

describe('readCsv', () => {
  const encoder = new TextEncoder();
  function streamOf(bytes: Uint8Array, size = 7): () => AsyncIterable<Uint8Array> {
    return async function* () {
      for (let i = 0; i < bytes.length; i += size) {
        await Promise.resolve(); // As a real stream would, between pieces.
        yield bytes.slice(i, i + size);
      }
    };
  }

  it('decodes and parses bytes as they stream in, keeping characters split across pieces', async () => {
    const result = await readCsv(streamOf(encoder.encode('Sorgu,Tıklama\nayakkabı,12\nçizme,3\n')));
    expect(result.ok && rows(result.value)).toEqual([
      ['ayakkabı', '12'],
      ['çizme', '3'],
    ]);
  });

  it('reads the file again in the legacy encoding when it is not UTF-8', async () => {
    // "ğ" (0xF0) and "ı" (0xFD) in Windows-1254, after enough ASCII that UTF-8 seemed fine.
    const ascii = encoder.encode('Key,Clicks\n' + 'plain,1\n'.repeat(1000));
    const bytes = new Uint8Array([
      ...ascii,
      0x64,
      0x61,
      0xf0,
      0x2c,
      0x32,
      0x0a,
      0x6b,
      0xfd,
      0x2c,
      0x33,
    ]);
    const result = await readCsv(streamOf(bytes, 512), { legacyEncoding: 'windows-1254' });
    expect(result.ok && rows(result.value).slice(-2)).toEqual([
      ['dağ', '2'],
      ['kı', '3'],
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'encoding.legacy-fallback',
      params: { encoding: 'windows-1254' },
    });
  });

  it('rejects empty and binary files', async () => {
    expect((await readCsv(streamOf(new Uint8Array()))).diagnostics[0]?.code).toBe('input.empty');
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49,
    ]);
    expect((await readCsv(streamOf(png))).diagnostics[0]?.code).toBe('input.binary');
  });

  it('stops reading once the CSV breaks a limit', async () => {
    let served = 0;
    const many = encoder.encode('Key,Clicks\n' + 'row,1\n'.repeat(100_000));
    const open = async function* () {
      for (let i = 0; i < many.length; i += 1024) {
        await Promise.resolve();
        served += 1024;
        yield many.slice(i, i + 1024);
      }
    };
    const result = await readCsv(open, { maxRows: 10 });
    expect(result.ok).toBe(false);
    // It stops after the first 64 KB sample instead of reading all 600 KB.
    expect(served).toBeLessThan(many.length / 5);
  });
});
