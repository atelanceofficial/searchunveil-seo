import { describe, expect, it } from 'vitest';
import { createZip, deflateRaw } from '../test-support/zip-writer.ts';
import { crc32 } from './crc32.ts';
import { baseName, isZip, openZip, readZip } from './read.ts';

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
const codes = (result: { diagnostics: readonly { code: string }[] }) =>
  result.diagnostics.map((d) => d.code);

describe('crc32', () => {
  it('matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });
});

describe('readZip', () => {
  it('extracts stored and deflated entries, skipping folders', async () => {
    const zip = await createZip(
      [
        { name: 'export/', data: '', method: 'stored' },
        { name: 'export/Queries.csv', data: 'Top queries,Clicks\nshoes,3\n', method: 'deflate' },
        { name: 'export/Filters.csv', data: 'Filter,Value\nSearch type,Web\n', method: 'stored' },
        { name: 'export/Sorgular – özet.csv', data: 'ç,ğ\n1,2', method: 'deflate' },
      ],
      { comment: 'Created by a test' },
    );
    expect(isZip(zip)).toBe(true);
    const result = await readZip(zip);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => [e.name, text(e.bytes)])).toEqual([
      ['export/Queries.csv', 'Top queries,Clicks\nshoes,3\n'],
      ['export/Filters.csv', 'Filter,Value\nSearch type,Web\n'],
      ['export/Sorgular – özet.csv', 'ç,ğ\n1,2'],
    ]);
  });

  it('extracts only the selected entries', async () => {
    const zip = await createZip([
      { name: 'Dates.csv', data: 'Date,Clicks' },
      { name: 'notes.txt', data: 'ignore me' },
    ]);
    const result = await readZip(zip, { include: (name) => name.endsWith('.csv') });
    expect(result.ok && result.value.map((e) => e.name)).toEqual(['Dates.csv']);
  });

  it('rejects data that is not a ZIP archive', async () => {
    const bytes = new TextEncoder().encode('Top queries,Clicks\nshoes,3');
    expect(isZip(bytes)).toBe(false);
    expect(codes(await readZip(bytes, { file: 'x.zip' }))).toEqual(['zip.invalid']);
  });

  it('rejects truncated archives', async () => {
    const zip = await createZip([{ name: 'Dates.csv', data: 'Date,Clicks\n2026-01-01,1' }]);
    expect(codes(await readZip(zip.subarray(0, zip.length - 30)))).toEqual(['zip.invalid']);
  });

  it('rejects encrypted entries', async () => {
    const zip = await createZip([{ name: 'secret.csv', data: 'a', flags: 0x0001 }]);
    expect(codes(await readZip(zip))).toEqual(['zip.encrypted']);
  });

  it('rejects compression methods other than stored and deflate', async () => {
    const zip = await createZip([
      { name: 'bzip.csv', data: 'a', method: 12, payload: new Uint8Array([1]) },
    ]);
    const result = await readZip(zip);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'zip.unsupported-method',
      params: { entry: 'bzip.csv', method: 12 },
    });
  });

  it('rejects ZIP64 archives', async () => {
    const zip = await createZip([{ name: 'a.csv', data: 'a' }], { zip64Locator: true });
    expect(codes(await readZip(zip))).toEqual(['zip.zip64']);
  });

  it('enforces entry-count and size limits before decompressing', async () => {
    const zip = await createZip([
      { name: 'a.csv', data: 'x'.repeat(100) },
      { name: 'b.csv', data: 'y'.repeat(100) },
    ]);
    expect(codes(await readZip(zip, { limits: { maxZipEntries: 1 } }))).toEqual([
      'zip.too-many-entries',
    ]);
    expect(codes(await readZip(zip, { limits: { maxZipEntryBytes: 99 } }))).toEqual([
      'zip.entry-too-large',
    ]);
    expect(codes(await readZip(zip, { limits: { maxZipTotalBytes: 150 } }))).toEqual([
      'zip.total-too-large',
    ]);
  });

  it('rejects compression ratios typical of decompression bombs', async () => {
    const zeros = new Uint8Array(2 * 1024 * 1024);
    const zip = await createZip([{ name: 'bomb.csv', data: zeros }]);
    expect(codes(await readZip(zip))).toEqual(['zip.suspicious-ratio']);
    // The same archive passes when the policy allows it.
    expect((await readZip(zip, { limits: { maxZipRatio: 100_000 } })).ok).toBe(true);
  });

  it('rejects entries that overlap (non-recursive zip bombs)', async () => {
    const zip = await createZip([
      { name: 'a.csv', data: 'shared data' },
      { name: 'b.csv', data: 'shared data', reuseLocalHeaderOf: 0 },
    ]);
    expect(codes(openZip(zip))).toEqual(['zip.overlapping-entries']);
  });

  it('detects checksum mismatches', async () => {
    const zip = await createZip([{ name: 'a.csv', data: 'hello', crc32: 1234 }]);
    expect(codes(await readZip(zip))).toEqual(['zip.checksum-mismatch']);
  });

  it('stops when an entry inflates beyond its declared size', async () => {
    const zip = await createZip([{ name: 'a.csv', data: 'x'.repeat(1000), uncompressedSize: 10 }]);
    expect(codes(await readZip(zip))).toEqual(['zip.corrupt-entry']);
  });

  it('reports corrupt compressed data', async () => {
    const payload = await deflateRaw(new TextEncoder().encode('hello world'));
    const corrupt = payload.map((byte, i) => (i === 0 ? byte ^ 0xff : byte));
    const zip = await createZip([{ name: 'a.csv', data: 'hello world', payload: corrupt }]);
    expect(codes(await readZip(zip))).toEqual(['zip.corrupt-entry']);
  });

  it('rejects a directory that claims more entries than it holds', async () => {
    const zip = await createZip([{ name: 'a.csv', data: 'a' }], { totalEntriesOverride: 2 });
    expect(codes(await readZip(zip))).toEqual(['zip.invalid']);
  });
});

describe('baseName', () => {
  it('drops folders', () => {
    expect(baseName('export/2026/Queries.csv')).toBe('Queries.csv');
    expect(baseName('Queries.csv')).toBe('Queries.csv');
  });
});
