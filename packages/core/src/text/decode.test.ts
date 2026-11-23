import { describe, expect, it } from 'vitest';
import { decodeText, legacyEncodingFor } from './decode.ts';

const utf8 = (text: string) => new TextEncoder().encode(text);

function utf16(text: string, littleEndian: boolean, bom: boolean): Uint8Array {
  const bytes = new Uint8Array((text.length + (bom ? 1 : 0)) * 2);
  const view = new DataView(bytes.buffer);
  let offset = 0;
  if (bom) {
    view.setUint16(0, 0xfeff, littleEndian);
    offset = 2;
  }
  for (let i = 0; i < text.length; i++)
    view.setUint16(offset + i * 2, text.charCodeAt(i), littleEndian);
  return bytes;
}

describe('decodeText', () => {
  it('rejects empty input', () => {
    const result = decodeText(new Uint8Array(), { file: 'Queries.csv' });
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'input.empty',
      severity: 'error',
      location: { file: 'Queries.csv' },
    });
  });

  it('reads UTF-8 with a byte order mark and removes the mark', () => {
    const result = decodeText(new Uint8Array([0xef, 0xbb, 0xbf, ...utf8('Top queries')]));
    expect(result).toMatchObject({
      ok: true,
      value: { text: 'Top queries', encoding: 'utf-8', byteOrderMark: true },
      diagnostics: [],
    });
  });

  it.each([
    ['utf-16le', true],
    ['utf-16be', false],
  ] as const)('reads %s with a byte order mark', (encoding, littleEndian) => {
    const result = decodeText(utf16('Date,Clicks', littleEndian, true));
    expect(result).toMatchObject({ ok: true, value: { text: 'Date,Clicks', encoding } });
  });

  it.each([
    ['utf-16le', true],
    ['utf-16be', false],
  ] as const)('recognizes %s without a byte order mark', (encoding, littleEndian) => {
    const result = decodeText(utf16('Date,Clicks\n2026-01-01,4', littleEndian, false));
    expect(result.ok && result.value).toMatchObject({
      text: 'Date,Clicks\n2026-01-01,4',
      encoding,
    });
    expect(result.diagnostics.map((d) => d.code)).toEqual(['encoding.utf16-without-bom']);
  });

  it('reads multilingual UTF-8 without warnings', () => {
    const text = 'Sorgu,Clics\nçiçek,1\n搜索,2\nبحث,3';
    expect(decodeText(utf8(text))).toEqual({
      ok: true,
      value: { text, encoding: 'utf-8', byteOrderMark: false },
      diagnostics: [],
    });
  });

  it('falls back to the legacy encoding for the reader’s language and says so', () => {
    // "Şişli" saved by a spreadsheet on a Turkish Windows system (code page 1254).
    const bytes = new Uint8Array([0xde, 0x69, 0xfe, 0x6c, 0x69]);
    const result = decodeText(bytes, { legacyEncoding: 'windows-1254', file: 'Sorgular.csv' });
    expect(result.ok && result.value.text).toBe('Şişli');
    expect(result.diagnostics).toEqual([
      {
        code: 'encoding.legacy-fallback',
        severity: 'warning',
        params: { encoding: 'windows-1254' },
        location: { file: 'Sorgular.csv' },
      },
    ]);
  });

  it('defaults to Windows-1252 when no legacy encoding is given', () => {
    const result = decodeText(new Uint8Array([0x43, 0x61, 0x66, 0xe9])); // "Café"
    expect(result.ok && result.value).toMatchObject({ text: 'Café', encoding: 'windows-1252' });
  });

  it('rejects binary files instead of decoding noise', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
    expect(decodeText(png).diagnostics.map((d) => d.code)).toEqual(['input.binary']);
  });
});

describe('legacyEncodingFor', () => {
  it('matches the code page used by each language’s spreadsheet software', () => {
    expect(legacyEncodingFor('en')).toBe('windows-1252');
    expect(legacyEncodingFor('de')).toBe('windows-1252');
    expect(legacyEncodingFor('tr')).toBe('windows-1254');
    expect(legacyEncodingFor('ar')).toBe('windows-1256');
    expect(legacyEncodingFor('zh-CN')).toBe('gb18030');
  });
});
