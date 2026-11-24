import { diagnostic, failure, success, type Result } from '../diagnostics.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * Legacy encodings that spreadsheet software uses when it saves a "CSV" file without
 * choosing UTF-8. Which one applies depends on the operating system's language.
 */
export type LegacyEncoding = 'windows-1252' | 'windows-1254' | 'windows-1256' | 'gb18030';

export type TextEncoding = 'utf-8' | 'utf-16le' | 'utf-16be' | LegacyEncoding;

export interface DecodedText {
  readonly text: string;
  readonly encoding: TextEncoding;
  readonly byteOrderMark: boolean;
}

export interface DecodeOptions {
  /** File name used to locate diagnostics. */
  readonly file?: string;
  /** Encoding assumed when the bytes are not valid UTF-8. See {@link legacyEncodingFor}. */
  readonly legacyEncoding?: LegacyEncoding;
}

/**
 * The legacy encoding a spreadsheet application most likely used on a computer set to the
 * given language. Turkish, Arabic and Chinese systems do not use Windows-1252.
 */
export function legacyEncodingFor(locale: Locale): LegacyEncoding {
  switch (locale) {
    case 'tr':
      return 'windows-1254';
    case 'ar':
      return 'windows-1256';
    case 'zh-CN':
      return 'gb18030';
    case 'en':
    case 'es':
    case 'de':
    case 'fr':
      return 'windows-1252';
  }
}

/** How many bytes from a file's start are enough to choose its encoding. */
export const ENCODING_SAMPLE_BYTES = 4096;

export interface TextDecoderChoice {
  /** Decodes the whole file; with `{ stream: true }` it accepts the file in pieces. */
  readonly decoder: TextDecoder;
  readonly encoding: TextEncoding;
  readonly byteOrderMark: boolean;
  /**
   * True for UTF-8 without a byte order mark: the decoder throws on invalid bytes, and the
   * file should then be decoded again with `legacy: true`.
   */
  readonly strict: boolean;
}

/**
 * Chooses how to decode a file from its first bytes ({@link ENCODING_SAMPLE_BYTES} are
 * enough), in order: its byte order mark, a UTF-16 pattern check, strict UTF-8, and with
 * `legacy` a legacy encoding (reported as a warning, because it is a guess). Binary files are
 * rejected instead of being decoded into noise.
 */
export function chooseTextDecoder(
  head: Uint8Array,
  options: DecodeOptions & { readonly legacy?: boolean } = {},
): Result<TextDecoderChoice> {
  const location = options.file === undefined ? undefined : { file: options.file };
  if (head.length === 0) return failure([diagnostic('input.empty', 'error', {}, location)]);

  // TextDecoder removes a matching byte order mark by default.
  const bom = detectByteOrderMark(head);
  if (bom !== null) {
    return success({
      decoder: new TextDecoder(bom),
      encoding: bom,
      byteOrderMark: true,
      strict: false,
    });
  }

  const utf16 = detectUtf16WithoutBom(head);
  if (utf16 !== null) {
    return success(
      { decoder: new TextDecoder(utf16), encoding: utf16, byteOrderMark: false, strict: false },
      [diagnostic('encoding.utf16-without-bom', 'info', { encoding: utf16 }, location)],
    );
  }

  if (containsNul(head)) return failure([diagnostic('input.binary', 'error', {}, location)]);

  if (options.legacy === true) {
    const encoding = options.legacyEncoding ?? 'windows-1252';
    return success(
      { decoder: new TextDecoder(encoding), encoding, byteOrderMark: false, strict: false },
      [diagnostic('encoding.legacy-fallback', 'warning', { encoding }, location)],
    );
  }
  return success({
    decoder: new TextDecoder('utf-8', { fatal: true }),
    encoding: 'utf-8',
    byteOrderMark: false,
    strict: true,
  });
}

/** Decodes a whole text file already in memory; see {@link chooseTextDecoder}. */
export function decodeText(bytes: Uint8Array, options: DecodeOptions = {}): Result<DecodedText> {
  let choice = chooseTextDecoder(bytes, options);
  for (;;) {
    if (!choice.ok) return choice;
    const { decoder, encoding, byteOrderMark, strict } = choice.value;
    try {
      return success({ text: decoder.decode(bytes), encoding, byteOrderMark }, choice.diagnostics);
    } catch (error) {
      if (!strict) throw error;
      choice = chooseTextDecoder(bytes, { ...options, legacy: true });
    }
  }
}

function detectByteOrderMark(bytes: Uint8Array): 'utf-8' | 'utf-16le' | 'utf-16be' | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'utf-8';
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
  return null;
}

/**
 * Text saved as UTF-16 without a byte order mark shows a strong pattern: mostly-ASCII content
 * leaves every other byte zero. Real UTF-8 text and binary formats do not look like this.
 */
function detectUtf16WithoutBom(bytes: Uint8Array): 'utf-16le' | 'utf-16be' | null {
  const length = Math.min(bytes.length, ENCODING_SAMPLE_BYTES) & ~1;
  if (length < 4) return null;
  let evenZeros = 0;
  let oddZeros = 0;
  for (let i = 0; i < length; i += 2) {
    if (bytes[i] === 0) evenZeros++;
    if (bytes[i + 1] === 0) oddZeros++;
  }
  const pairs = length / 2;
  if (oddZeros / pairs > 0.3 && evenZeros / pairs < 0.05) return 'utf-16le';
  if (evenZeros / pairs > 0.3 && oddZeros / pairs < 0.05) return 'utf-16be';
  return null;
}

function containsNul(bytes: Uint8Array): boolean {
  const length = Math.min(bytes.length, ENCODING_SAMPLE_BYTES);
  for (let i = 0; i < length; i++) if (bytes[i] === 0) return true;
  return false;
}
