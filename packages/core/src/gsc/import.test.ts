import { describe, expect, it } from 'vitest';
import {
  csvFile,
  dailySeries,
  datesFile,
  filtersFile,
  queriesFile,
  zipFile,
} from '../test-support/gsc-fixtures.ts';
import { createZip } from '../test-support/zip-writer.ts';
import { importSearchConsole, type InputFile } from './import.ts';
import { findTable, type SearchConsoleExport } from './model.ts';

async function imported(files: readonly InputFile[], options = {}): Promise<SearchConsoleExport> {
  const result = await importSearchConsole(files, options);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics, null, 2));
  return result.value;
}

const codes = (result: { diagnostics: readonly { code: string }[] }) =>
  result.diagnostics.map((d) => d.code);

describe('importSearchConsole', () => {
  it('reads every table of the ZIP archive Search Console downloads', async () => {
    const archive = await zipFile('example.com-Performance-on-Search-2026-11-20.zip', [
      queriesFile([
        ['running shoes', 120, 2400, 3.2],
        ['trail shoes', 40, 1900, 9.8],
      ]),
      csvFile(
        'Pages.csv',
        ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [['https://example.com/shoes', 150, 3800, '3.95%', 5.1]],
      ),
      csvFile(
        'Countries.csv',
        ['Country', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [['Türkiye', 90, 2000, '4.5%', 6]],
      ),
      csvFile(
        'Devices.csv',
        ['Device', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [['Mobile', 100, 3000, '3.33%', 6.2]],
      ),
      csvFile(
        'Search appearance.csv',
        ['Search Appearance', 'Clicks', 'Impressions', 'CTR', 'Position'],
        [['Review snippet', 10, 300, '3.33%', 4]],
      ),
      datesFile(dailySeries({ start: '2026-10-01', days: 14, clicks: 10, impressions: 300 })),
      filtersFile([
        ['Search type', 'Web'],
        ['Date', 'Last 28 days'],
      ]),
    ]);

    const result = await importSearchConsole([archive]);
    expect(codes(result)).toEqual([]);
    const data = result.ok ? result.value : null;
    expect(data?.tables.map((t) => t.kind)).toEqual([
      'query',
      'page',
      'country',
      'device',
      'searchAppearance',
      'date',
    ]);
    expect(data?.filters).toEqual([
      { name: 'Search type', value: 'Web' },
      { name: 'Date', value: 'Last 28 days' },
    ]);
    expect(data?.files).toContain('Queries.csv');

    const queries = data === null ? undefined : findTable(data, 'query');
    expect(queries?.rows[0]).toEqual({
      key: 'running shoes',
      primary: { clicks: 120, impressions: 2400, ctr: 0.05, position: 3.2 },
      comparison: null,
      line: 2,
    });
    expect(queries?.identifiedBy).toBe('header');
  });

  it('sorts dates oldest first, as analysis expects', async () => {
    const data = await imported([
      datesFile(dailySeries({ start: '2026-10-01', days: 3, clicks: 5, impressions: 50 })),
    ]);
    expect(findTable(data, 'date')?.rows.map((r) => r.key)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
  });

  it('reads comparison exports and keeps their date-range labels verbatim', async () => {
    const file = csvFile(
      'Queries.csv',
      [
        'Top queries',
        'Last 28 days Clicks',
        'Previous 28 days Clicks',
        'Last 28 days Impressions',
        'Previous 28 days Impressions',
        'Last 28 days CTR',
        'Previous 28 days CTR',
        'Last 28 days Position',
        'Previous 28 days Position',
      ],
      [
        ['running shoes', 120, 80, 2400, 2000, '5%', '4%', 3.2, 4.1],
        ['new query', 12, '', 300, '', '4%', '', 7, ''],
      ],
    );
    const table = findTable(await imported([file]), 'query');
    expect(table?.periods).toEqual({ primary: 'Last 28 days', comparison: 'Previous 28 days' });
    expect(table?.rows[0]?.comparison).toEqual({
      clicks: 80,
      impressions: 2000,
      ctr: 0.04,
      position: 4.1,
    });
    expect(table?.rows[1]?.comparison).toEqual({
      clicks: 0,
      impressions: 0,
      ctr: null,
      position: null,
    });
  });

  it('reads German exports re-saved by a spreadsheet: semicolons, decimal commas, grouping', async () => {
    const file = csvFile(
      'Suchanfragen.csv',
      ['Häufigste Suchanfragen', 'Klicks', 'Impressionen', 'CTR', 'Position'],
      [
        ['laufschuhe', '1.234', '24.680', '5 %', '3,2'],
        ['trailschuhe', '40', '1.900', '2,11 %', '9,8'],
      ],
      ';',
    );
    const result = await importSearchConsole([file]);
    expect(codes(result)).toEqual(['gsc.decimal-comma', 'gsc.decimal-comma']);
    const table = result.ok ? findTable(result.value, 'query') : undefined;
    expect(table?.rows.map((r) => r.primary)).toEqual([
      { clicks: 1234, impressions: 24680, ctr: 1234 / 24680, position: 3.2 },
      { clicks: 40, impressions: 1900, ctr: 40 / 1900, position: 9.8 },
    ]);
  });

  it('reads Turkish headers with prefixed percent signs', async () => {
    const file = csvFile(
      'Sorgular.csv',
      ['En çok yapılan sorgular', 'Tıklamalar', 'Gösterimler', 'TO', 'Konum'],
      [['koşu ayakkabısı', '1.200', '24.000', '%5', '3,2']],
    );
    const table = findTable(await imported([file]), 'query');
    expect(table?.identifiedBy).toBe('header');
    expect(table?.rows[0]?.primary).toEqual({
      clicks: 1200,
      impressions: 24000,
      ctr: 0.05,
      position: 3.2,
    });
  });

  it('reads Arabic headers with Arabic-Indic digits', async () => {
    const file = csvFile(
      'Queries.csv',
      ['أهم طلبات البحث', 'النقرات', 'مرات الظهور', 'نسبة النقر إلى الظهور', 'الموضع'],
      [['أحذية الجري', '١٢٠', '٢٬٤٠٠', '٥٪', '٣٫٢']],
    );
    const table = findTable(await imported([file]), 'query');
    expect(table?.rows[0]?.primary).toEqual({
      clicks: 120,
      impressions: 2400,
      ctr: 0.05,
      position: 3.2,
    });
  });

  it('identifies columns by Search Console’s order when names are not recognized', async () => {
    const file = csvFile(
      '日付.csv',
      ['日付', 'クリック数', '表示回数', 'CTR', '掲載順位'],
      [
        ['2026-11-01', 10, 100, '10%', 4.2],
        ['2026-11-02', 12, 110, '10.91%', 4.0],
      ],
    );
    const result = await importSearchConsole([file]);
    expect(codes(result)).toEqual(['gsc.columns-inferred', 'gsc.dimension-inferred']);
    const table = result.ok ? result.value.tables[0] : undefined;
    expect(table).toMatchObject({ kind: 'date', identifiedBy: 'order' });
  });

  it('infers page tables from URL values', async () => {
    const file = csvFile(
      'export.csv',
      ['ページ', 'a', 'b', 'c', 'd'],
      [['https://example.com/', 10, 100, '10%', 4.2]],
    );
    expect((await imported([file])).tables[0]?.kind).toBe('page');
  });

  it('reads CTR written as a fraction and says so', async () => {
    const file = csvFile(
      'Queries.csv',
      ['query', 'clicks', 'impressions', 'ctr', 'position'],
      [['shoes', 5, 100, 0.05, 3]],
    );
    const result = await importSearchConsole([file]);
    expect(codes(result)).toEqual(['gsc.ctr-as-fraction']);
  });

  it('warns when CTR disagrees with clicks divided by impressions', async () => {
    const file = csvFile(
      'Queries.csv',
      ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'],
      [
        ['a', 5, 100, '9%', 3],
        ['b', 5, 100, '9%', 3],
        ['c', 5, 100, '9%', 3],
      ],
    );
    expect(codes(await importSearchConsole([file]))).toEqual(['gsc.ctr-mismatch']);
  });

  it('tolerates the rounding Search Console applies to CTR', async () => {
    const file = csvFile(
      'Queries.csv',
      ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'],
      [
        ['a', 1, 3, '33.33%', 3],
        ['b', 2, 3, '66.67%', 3],
        ['c', 1, 7, '14%', 3],
      ],
    );
    expect(codes(await importSearchConsole([file]))).toEqual([]);
  });

  it('refuses tables whose clicks exceed impressions on most rows (swapped columns)', async () => {
    const file = csvFile(
      'Queries.csv',
      ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'],
      [
        ['a', 100, 5, '5%', 3],
        ['b', 100, 5, '5%', 3],
        ['c', 100, 5, '5%', 3],
      ],
    );
    const result = await importSearchConsole([file]);
    expect(result.ok).toBe(false);
    expect(codes(result)).toContain('gsc.columns-swapped');
    expect(codes(result).at(-1)).toBe('gsc.no-tables');
  });

  it('skips rows with invalid values and reports their lines', async () => {
    const file = csvFile(
      'Queries.csv',
      ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'],
      [
        ['ok', 1, 10, '10%', 2],
        ['bad', 'many', 10, '10%', 2],
        ['', 1, 10, '10%', 2],
      ],
    );
    const result = await importSearchConsole([file]);
    expect(result.ok && result.value.tables[0]?.rows.map((r) => r.key)).toEqual(['ok']);
    expect(result.diagnostics).toContainEqual({
      code: 'gsc.invalid-number',
      severity: 'error',
      params: { value: 'many' },
      location: { file: 'Queries.csv', line: 3, column: 'Clicks' },
    });
    expect(codes(result)).toContain('gsc.empty-key');
  });

  it('reports duplicate keys and keeps the first row', async () => {
    const file = queriesFile([
      ['shoes', 1, 10, 2],
      ['shoes', 5, 50, 2],
    ]);
    const result = await importSearchConsole([file]);
    expect(codes(result)).toEqual(['gsc.duplicate-key']);
    expect(result.ok && result.value.tables[0]?.rows[0]?.primary.clicks).toBe(1);
  });

  it('names each missing metric', async () => {
    const file = csvFile('Queries.csv', ['Top queries', 'Clicks', 'CTR'], [['a', 1, '1%']]);
    const result = await importSearchConsole([file]);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'gsc.missing-columns', params: { metric: 'impressions' } }),
    );
  });

  it('rejects files that are not Search Console exports', async () => {
    const file = csvFile('products.csv', ['sku', 'price'], [['A1', '9.99']]);
    expect(codes(await importSearchConsole([file]))).toEqual([
      'gsc.unrecognized-table',
      'gsc.no-tables',
    ]);
  });

  it('asks for CSV instead of spreadsheet workbooks', async () => {
    const xlsx = {
      name: 'export.xlsx',
      bytes: await createZip([{ name: '[Content_Types].xml', data: '<x/>' }]),
    };
    const xls = {
      name: 'export.dat',
      bytes: new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
    };
    const named = { name: 'export.xlsx', bytes: new Uint8Array([1, 2, 3]) };
    for (const file of [xlsx, xls, named]) {
      expect(codes(await importSearchConsole([file]))).toEqual([
        'input.spreadsheet',
        'gsc.no-tables',
      ]);
    }
  });

  it('reports archives without CSV files', async () => {
    const archive = { name: 'a.zip', bytes: await createZip([{ name: 'readme.txt', data: 'hi' }]) };
    expect(codes(await importSearchConsole([archive]))).toEqual(['zip.no-csv', 'gsc.no-tables']);
  });

  it('enforces the file size limit', async () => {
    const file = queriesFile([['a', 1, 10, 2]]);
    const result = await importSearchConsole([file], { limits: { maxFileBytes: 10 } });
    expect(result.diagnostics[0]).toMatchObject({
      code: 'input.too-large',
      params: { megabytes: 0 },
    });
  });

  it('keeps good files when another file is broken', async () => {
    const broken = {
      name: 'Pages.csv',
      bytes: new TextEncoder().encode('Top pages,Clicks\n"open'),
    };
    const result = await importSearchConsole([queriesFile([['a', 1, 10, 2]]), broken]);
    expect(result.ok).toBe(true);
    expect(codes(result)).toEqual(['csv.unterminated-quote']);
  });

  it('warns about a second table of the same kind', async () => {
    const result = await importSearchConsole([
      queriesFile([['a', 1, 10, 2]]),
      queriesFile([['b', 1, 10, 2]], 'Queries (1).csv'),
    ]);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'gsc.duplicate-table', params: { kind: 'query' } }),
    );
  });

  it('refuses dates whose day and month cannot be told apart', async () => {
    const file = csvFile(
      'Dates.csv',
      ['Date', 'Clicks', 'Impressions', 'CTR', 'Position'],
      [['03/04/2026', 1, 10, '10%', 2]],
    );
    expect(codes(await importSearchConsole([file]))).toEqual([
      'gsc.ambiguous-dates',
      'gsc.no-tables',
    ]);
    expect((await importSearchConsole([file], { dateOrder: 'dmy' })).ok).toBe(true);
  });

  it('decodes legacy encodings using the reader’s language', async () => {
    // "Sorgu,Tıklamalar,..." saved by Excel on a Turkish system (Windows-1254): ı is 0xFD.
    const header = 'Sorgu,Týklamalar,Gösterimler,TO,Konum\nayakkabý,1,10,%10,2\n';
    const bytes = Uint8Array.from(header, (c) => c.charCodeAt(0));
    const result = await importSearchConsole([{ name: 'Sorgular.csv', bytes }], {
      legacyEncoding: 'windows-1254',
    });
    expect(codes(result)).toEqual(['encoding.legacy-fallback']);
    expect(result.ok && result.value.tables[0]?.rows[0]?.key).toBe('ayakkabı');
  });
});
