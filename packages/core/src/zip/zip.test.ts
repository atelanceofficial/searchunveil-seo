import { describe, expect, it } from 'vitest';
import { blobSource, bytesSource, type ByteSource } from '../source.ts';
import { createZip, deflateRaw } from '../test-support/zip-writer.ts';
import { crc32, updateCrc32 } from './crc32.ts';
import {
  baseName,
  entryChunks,
  extractEntry,
  isMetadataEntry,
  isZip,
  openZip,
  readZip,
} from './read.ts';

/** A source that counts the bytes read from it, to prove what a reader leaves untouched. */
function counted(source: ByteSource): ByteSource & { readonly bytesRead: () => number } {
  let total = 0;
  return {
    size: source.size,
    async read(start, end) {
      const bytes = await source.read(start, end);
      total += bytes.length;
      return bytes;
    },
    stream(start, end) {
      total += Math.max(0, Math.min(end, source.size) - start);
      return source.stream(start, end);
    },
    bytesRead: () => total,
  };
}

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
const codes = (result: { diagnostics: readonly { code: string }[] }) =>
  result.diagnostics.map((d) => d.code);

describe('crc32', () => {
  it('matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('continues across chunks', () => {
    const bytes = new TextEncoder().encode('123456789');
    expect(updateCrc32(updateCrc32(0, bytes.subarray(0, 4)), bytes.subarray(4))).toBe(0xcbf43926);
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

  it('reads ZIP64 archives, as archives past 4 GB or 65,535 entries are written', async () => {
    const zip = await createZip(
      [
        { name: 'site/index.html', data: '<title>Home</title>' },
        { name: 'site/Dates.csv', data: 'Date,Clicks\n2026-01-01,1\n', method: 'stored' },
      ],
      { zip64: true },
    );
    const result = await readZip(zip);
    expect(result.ok && result.value.map((e) => [e.name, text(e.bytes)])).toEqual([
      ['site/index.html', '<title>Home</title>'],
      ['site/Dates.csv', 'Date,Clicks\n2026-01-01,1\n'],
    ]);
  });

  it('rejects a ZIP64 locator that points nowhere', async () => {
    const zip = await createZip([{ name: 'a.csv', data: 'a' }], { zip64Locator: true });
    expect(codes(await readZip(zip))).toEqual(['zip.invalid']);
  });

  it('reads only the directory and the entries it is asked for, whatever the size', async () => {
    // A large photo next to a small table: opening the archive and reading the table never
    // touches the photo's bytes.
    const photo = new Uint8Array(8 * 1024 * 1024).map((_, i) => (i * 2654435761) >>> 24);
    const zip = await createZip([
      { name: 'export/photo.jpg', data: photo, method: 'stored' },
      { name: 'export/Dates.csv', data: 'Date,Clicks\n2026-01-01,1\n' },
    ]);
    const source = counted(blobSource(new Blob([zip.slice()])));
    const archive = await openZip(source);
    expect(archive.ok).toBe(true);
    if (!archive.ok) return;
    const table = archive.value.entries.find((entry) => entry.name.endsWith('.csv'));
    expect(table).toBeDefined();
    if (table === undefined) return;
    const extracted = await extractEntry(source, table);
    expect(extracted.ok && text(extracted.value)).toBe('Date,Clicks\n2026-01-01,1\n');
    expect(source.bytesRead()).toBeLessThan(100 * 1024);
    expect(source.size).toBeGreaterThan(8 * 1024 * 1024);
  });

  it('streams an entry in pieces and checks it at the end', async () => {
    const rows = Array.from({ length: 100_000 }, (_, i) => `row ${i},${(i * 7919) % 104729}`);
    const data = ['Key,Clicks', ...rows].join('\n');
    const zip = await createZip([{ name: 'Dates.csv', data }]);
    const archive = await openZip(bytesSource(zip));
    const entry = archive.ok ? archive.value.entries[0] : undefined;
    if (entry === undefined) throw new Error('no entry');
    let length = 0;
    let pieces = 0;
    for await (const chunk of entryChunks(zip, entry)) {
      length += chunk.length;
      pieces++;
    }
    expect(length).toBe(data.length);
    expect(pieces).toBeGreaterThan(1);
  });

  it('enforces entry-count and entry-size limits before decompressing', async () => {
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
    expect(codes(await openZip(zip))).toEqual(['zip.overlapping-entries']);
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

describe('isMetadataEntry', () => {
  it('recognizes what macOS adds to archives', () => {
    expect(isMetadataEntry('__MACOSX/export/._Dates.csv')).toBe(true);
    expect(isMetadataEntry('export/._Dates.csv')).toBe(true);
    expect(isMetadataEntry('export/Dates.csv')).toBe(false);
  });
});
