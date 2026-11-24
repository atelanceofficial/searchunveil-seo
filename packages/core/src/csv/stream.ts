import { failure, success, type Diagnostic, type Result } from '../diagnostics.ts';
import {
  chooseTextDecoder,
  ENCODING_SAMPLE_BYTES,
  type LegacyEncoding,
  type TextDecoderChoice,
} from '../text/decode.ts';
import { CsvReader, type CsvOptions, type CsvTable } from './parse.ts';

export interface CsvStreamOptions extends CsvOptions {
  /** Encoding assumed when the bytes are not valid UTF-8. */
  readonly legacyEncoding?: LegacyEncoding;
}

/**
 * Reads CSV from bytes of any length: they are decoded and parsed piece by piece, so only the
 * records themselves are ever held. `open` must start the bytes afresh on every call, because
 * a file that turns out not to be UTF-8 is read again in the legacy encoding.
 *
 * Reading stops early when the CSV breaks a rule that ends parsing, such as the row limit.
 */
export async function readCsv(
  open: () => AsyncIterable<Uint8Array>,
  options: CsvStreamOptions = {},
): Promise<Result<CsvTable>> {
  const strict = await readOnce(open, options, false);
  return strict === 'not-utf-8' ? readOnce(open, options, true).then(settled) : strict;
}

function settled(result: Result<CsvTable> | 'not-utf-8'): Result<CsvTable> {
  // A legacy decoder accepts every byte, so the second reading always settles.
  return result === 'not-utf-8' ? failure([]) : result;
}

async function readOnce(
  open: () => AsyncIterable<Uint8Array>,
  options: CsvStreamOptions,
  legacy: boolean,
): Promise<Result<CsvTable> | 'not-utf-8'> {
  const reader = new CsvReader(options);
  const decodeOptions = {
    legacy,
    ...(options.file === undefined ? {} : { file: options.file }),
    ...(options.legacyEncoding === undefined ? {} : { legacyEncoding: options.legacyEncoding }),
  };
  const head: Uint8Array[] = [];
  let headLength = 0;
  let choice: TextDecoderChoice | null = null;
  let notes: readonly Diagnostic[] = [];

  for await (const chunk of open()) {
    if (choice === null) {
      head.push(chunk);
      headLength += chunk.byteLength;
      if (headLength < ENCODING_SAMPLE_BYTES) continue;
      const bytes = concat(head, headLength);
      const chosen = chooseTextDecoder(bytes, decodeOptions);
      if (!chosen.ok) return failure(chosen.diagnostics);
      choice = chosen.value;
      notes = chosen.diagnostics;
      if (!feed(reader, choice, bytes, false)) return 'not-utf-8';
    } else if (!feed(reader, choice, chunk, false)) {
      return 'not-utf-8';
    }
    if (reader.failed) break;
  }
  if (choice === null) {
    // The whole file was shorter than the encoding sample.
    const bytes = concat(head, headLength);
    const chosen = chooseTextDecoder(bytes, decodeOptions);
    if (!chosen.ok) return failure(chosen.diagnostics);
    choice = chosen.value;
    notes = chosen.diagnostics;
    if (!feed(reader, choice, bytes, false)) return 'not-utf-8';
  }
  if (!feed(reader, choice, new Uint8Array(0), true)) return 'not-utf-8';

  const table = reader.finish();
  return table.ok
    ? success(table.value, [...notes, ...table.diagnostics])
    : failure([...notes, ...table.diagnostics]);
}

/** Decodes bytes into the reader; false when a strict UTF-8 decoder meets invalid bytes. */
function feed(
  reader: CsvReader,
  choice: TextDecoderChoice,
  bytes: Uint8Array,
  last: boolean,
): boolean {
  try {
    reader.push(choice.decoder.decode(bytes, { stream: !last }));
    return true;
  } catch {
    return false;
  }
}

function concat(chunks: readonly Uint8Array[], length: number): Uint8Array {
  if (chunks.length === 1 && chunks[0] !== undefined) return chunks[0];
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}
