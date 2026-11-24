import {
  diagnostic,
  failure,
  locate,
  success,
  type Diagnostic,
  type Result,
} from '../diagnostics.ts';
import { resolveLimits, toMegabytes, type InputLimits } from '../limits.ts';
import { bytesSource, chunksOf, type ByteSource } from '../source.ts';
import { updateCrc32 } from './crc32.ts';

/**
 * A defensive reader for ZIP archives of any size.
 *
 * It reads an archive the way the format is laid out: the end record from the file's tail,
 * then the central directory, then only the entries a caller asks for. The rest of the file,
 * however large, is never read, so a 5 GB site backup costs no more to open than its list of
 * files. ZIP64 archives, which anything past 4 GB or 65,535 entries needs, are supported;
 * encrypted and multi-disk archives are not.
 *
 * Archives are untrusted. Before anything is decompressed the directory is validated: entry
 * counts, the directory's size, and entries that overlap (the trick behind non-recursive zip
 * bombs). Each entry a caller opens is checked again: its local header must agree, its
 * compression ratio must be plausible, decompression stops as soon as output passes the
 * declared size, and its CRC-32 is verified.
 */

export interface ZipDirectoryEntry {
  readonly name: string;
  readonly method: number;
  readonly flags: number;
  readonly crc32: number;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
  /** Offset of the entry's local header. */
  readonly localOffset: number;
  /** Where the next entry or the central directory begins; the entry's data ends before it. */
  readonly end: number;
}

export interface ZipArchive {
  /** Every file in the archive, in directory order. Folders are left out. */
  readonly entries: readonly ZipDirectoryEntry[];
}

export interface ZipEntry {
  readonly name: string;
  readonly bytes: Uint8Array;
}

export interface ZipReadOptions {
  /** Archive name used to locate diagnostics. */
  readonly file?: string;
  readonly limits?: Partial<InputLimits>;
  /** Extract only entries whose name passes this test. */
  readonly include?: (name: string) => boolean;
}

export interface ZipEntryOptions {
  /** Archive name used to locate diagnostics. */
  readonly file?: string;
  readonly limits?: Partial<InputLimits>;
}

/** Raised while streaming an entry that turns out unsupported, damaged or tampered with. */
export class ZipEntryError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(problem: Diagnostic) {
    super(problem.code);
    this.name = 'ZipEntryError';
    this.diagnostic = problem;
  }
}

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP64_END_OF_CENTRAL_DIRECTORY = 0x06064b50;
const ZIP64_LOCATOR = 0x07064b50;
const ZIP64_EXTRA_FIELD = 0x0001;
const EOCD_SIZE = 22;
const ZIP64_LOCATOR_SIZE = 20;
const ZIP64_EOCD_SIZE = 56;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const MAX_COMMENT = 0xffff;
const MAX_16 = 0xffff;
const MAX_32 = 0xffffffff;
const STORED = 0;
const DEFLATED = 8;
const FLAG_ENCRYPTED = 0x0001;
const FLAG_STRONG_ENCRYPTION = 0x0040;
const RATIO_CHECK_MIN_BYTES = 1024 * 1024;

/** True when bytes (a file's first four are enough) start like a ZIP archive, even an empty one. */
export function isZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06))
  );
}

/** Reads and validates the archive's directory, reading nothing else from the file. */
export async function openZip(
  input: ByteSource | Uint8Array,
  options: Pick<ZipReadOptions, 'file' | 'limits'> = {},
): Promise<Result<ZipArchive>> {
  const source = input instanceof Uint8Array ? bytesSource(input) : input;
  const limits = resolveLimits(options.limits);
  const where = locate(options.file);
  const invalid = () => failure<ZipArchive>([diagnostic('zip.invalid', 'error', {}, where)]);
  const multiDisk = () => failure<ZipArchive>([diagnostic('zip.multi-disk', 'error', {}, where)]);
  const tooMany = () =>
    failure<ZipArchive>([
      diagnostic('zip.too-many-entries', 'error', { limit: limits.maxZipEntries }, where),
    ]);

  // The end record is the last thing in the file, followed only by a comment of up to 65,535
  // bytes; a ZIP64 locator sits right before it.
  const tailStart = Math.max(0, source.size - EOCD_SIZE - MAX_COMMENT - ZIP64_LOCATOR_SIZE);
  const tail = await source.read(tailStart, source.size);
  const tailView = viewOf(tail);
  const endInTail = findEndOfCentralDirectory(tailView);
  if (endInTail === -1) return invalid();

  let diskNumber = tailView.getUint16(endInTail + 4, true);
  let directoryDisk = tailView.getUint16(endInTail + 6, true);
  let entryCount = tailView.getUint16(endInTail + 10, true);
  let directorySize = tailView.getUint32(endInTail + 12, true);
  let directoryOffset = tailView.getUint32(endInTail + 16, true);
  // The directory must end where the records after it begin.
  let directoryEnd = tailStart + endInTail;

  const locatorInTail = endInTail - ZIP64_LOCATOR_SIZE;
  if (locatorInTail >= 0 && tailView.getUint32(locatorInTail, true) === ZIP64_LOCATOR) {
    const recordDisk = tailView.getUint32(locatorInTail + 4, true);
    const recordOffset = safeNumber(tailView.getBigUint64(locatorInTail + 8, true));
    const totalDisks = tailView.getUint32(locatorInTail + 16, true);
    if (recordDisk !== 0 || totalDisks > 1) return multiDisk();
    if (recordOffset === null || recordOffset + ZIP64_EOCD_SIZE > tailStart + locatorInTail) {
      return invalid();
    }
    const record = viewOf(await source.read(recordOffset, recordOffset + ZIP64_EOCD_SIZE));
    if (
      record.byteLength < ZIP64_EOCD_SIZE ||
      record.getUint32(0, true) !== ZIP64_END_OF_CENTRAL_DIRECTORY
    ) {
      return invalid();
    }
    diskNumber = record.getUint32(16, true);
    directoryDisk = record.getUint32(20, true);
    const count = safeNumber(record.getBigUint64(32, true));
    const size = safeNumber(record.getBigUint64(40, true));
    const offset = safeNumber(record.getBigUint64(48, true));
    if (count === null || size === null || offset === null) return invalid();
    entryCount = count;
    directorySize = size;
    directoryOffset = offset;
    directoryEnd = recordOffset;
  } else if (entryCount === MAX_16 || directorySize === MAX_32 || directoryOffset === MAX_32) {
    // These values mark ZIP64 fields, but the record that holds them is missing.
    return invalid();
  }

  if (diskNumber !== 0 || directoryDisk !== 0) return multiDisk();
  if (entryCount > limits.maxZipEntries || directorySize > limits.maxZipDirectoryBytes) {
    return tooMany();
  }
  if (directoryOffset + directorySize > directoryEnd) return invalid();
  if (entryCount * CENTRAL_HEADER_SIZE > directorySize) return invalid();

  const directory = await source.read(directoryOffset, directoryOffset + directorySize);
  const view = viewOf(directory);
  const found: Omit<ZipDirectoryEntry, 'end'>[] = [];
  let cursor = 0;

  for (let index = 0; index < entryCount; index++) {
    if (
      cursor + CENTRAL_HEADER_SIZE > directory.length ||
      view.getUint32(cursor, true) !== CENTRAL_HEADER
    ) {
      return invalid();
    }
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const checksum = view.getUint32(cursor + 16, true);
    let compressedSize = view.getUint32(cursor + 20, true);
    let uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    let startDisk = view.getUint16(cursor + 34, true);
    let localOffset = view.getUint32(cursor + 42, true);
    const nameEnd = cursor + CENTRAL_HEADER_SIZE + nameLength;
    const extraEnd = nameEnd + extraLength;
    if (extraEnd + commentLength > directory.length) return invalid();
    const name = decodeName(directory.subarray(cursor + CENTRAL_HEADER_SIZE, nameEnd));

    // Values too large for their fields move to the ZIP64 extra field, in this fixed order.
    if (
      uncompressedSize === MAX_32 ||
      compressedSize === MAX_32 ||
      localOffset === MAX_32 ||
      startDisk === MAX_16
    ) {
      const field = findExtraField(view, nameEnd, extraEnd, ZIP64_EXTRA_FIELD);
      if (field === null) return invalid();
      let at = field.start;
      const next64 = (): number | null => {
        if (at + 8 > field.end) return null;
        const value = safeNumber(view.getBigUint64(at, true));
        at += 8;
        return value;
      };
      if (uncompressedSize === MAX_32) {
        const value = next64();
        if (value === null) return invalid();
        uncompressedSize = value;
      }
      if (compressedSize === MAX_32) {
        const value = next64();
        if (value === null) return invalid();
        compressedSize = value;
      }
      if (localOffset === MAX_32) {
        const value = next64();
        if (value === null) return invalid();
        localOffset = value;
      }
      if (startDisk === MAX_16) {
        if (at + 4 > field.end) return invalid();
        startDisk = view.getUint32(at, true);
      }
    }
    if (startDisk !== 0) return multiDisk();
    cursor = extraEnd + commentLength;
    found.push({
      name,
      method,
      flags,
      crc32: checksum,
      compressedSize,
      uncompressedSize,
      localOffset,
    });
  }

  // Each entry's local header (30 bytes at least) and data must end before the next entry
  // begins. Entries that share bytes are how non-recursive zip bombs multiply their output.
  const order = found.map((_, index) => index);
  order.sort((a, b) => (found[a]?.localOffset ?? 0) - (found[b]?.localOffset ?? 0));
  const ends = new Array<number>(found.length);
  for (let position = 0; position < order.length; position++) {
    const index = order[position] ?? 0;
    const entry = found[index];
    if (entry === undefined) return invalid();
    const nextIndex = order[position + 1];
    const next = nextIndex === undefined ? directoryOffset : (found[nextIndex]?.localOffset ?? 0);
    if (entry.localOffset + LOCAL_HEADER_SIZE + entry.compressedSize > next) {
      if (nextIndex === undefined) return invalid();
      return failure([diagnostic('zip.overlapping-entries', 'error', {}, where)]);
    }
    ends[index] = next;
  }

  const entries: ZipDirectoryEntry[] = [];
  found.forEach((entry, index) => {
    if (!isDirectory(entry.name)) entries.push({ ...entry, end: ends[index] ?? directoryOffset });
  });
  return success({ entries });
}

/**
 * Streams one entry's decompressed bytes. Fails with a {@link ZipEntryError} when the entry is
 * encrypted, uses another compression method, looks like a decompression bomb, is damaged,
 * inflates past its declared size or fails its checksum.
 */
export async function* entryChunks(
  input: ByteSource | Uint8Array,
  entry: ZipDirectoryEntry,
  options: ZipEntryOptions = {},
): AsyncGenerator<Uint8Array> {
  const source = input instanceof Uint8Array ? bytesSource(input) : input;
  const limits = resolveLimits(options.limits);
  const where = locate(options.file);
  const problem = checkEntry(entry, limits, where);
  if (problem !== null) throw new ZipEntryError(problem);
  const fail = (code: 'zip.corrupt-entry' | 'zip.checksum-mismatch') =>
    new ZipEntryError(diagnostic(code, 'error', { entry: entry.name }, where));

  const start = await dataStart(source, entry);
  if (start === null) throw new ZipEntryError(diagnostic('zip.invalid', 'error', {}, where));
  let stream: ReadableStream<Uint8Array<ArrayBuffer>> = source.stream(
    start,
    start + entry.compressedSize,
  );
  if (entry.method === DEFLATED) {
    stream = stream.pipeThrough(new DecompressionStream('deflate-raw'));
  }

  let checksum = 0;
  let written = 0;
  try {
    for await (const chunk of chunksOf(stream)) {
      written += chunk.byteLength;
      // More output than declared: stop at once instead of trusting the stream.
      if (written > entry.uncompressedSize) throw fail('zip.corrupt-entry');
      checksum = updateCrc32(checksum, chunk);
      yield chunk;
    }
  } catch (error) {
    if (error instanceof ZipEntryError) throw error;
    throw fail('zip.corrupt-entry'); // The decompressor rejected the data.
  }
  if (written !== entry.uncompressedSize) throw fail('zip.corrupt-entry');
  if (checksum !== entry.crc32) throw fail('zip.checksum-mismatch');
}

/**
 * Decompresses one whole entry into memory, for entries that must be held at once such as
 * a web page. Entries larger than `maxZipEntryBytes` are refused; stream those instead.
 */
export async function extractEntry(
  input: ByteSource | Uint8Array,
  entry: ZipDirectoryEntry,
  options: ZipEntryOptions = {},
): Promise<Result<Uint8Array>> {
  const limits = resolveLimits(options.limits);
  if (entry.uncompressedSize > limits.maxZipEntryBytes) {
    return failure([
      diagnostic(
        'zip.entry-too-large',
        'error',
        { entry: entry.name, megabytes: toMegabytes(limits.maxZipEntryBytes) },
        locate(options.file),
      ),
    ]);
  }
  const problem = checkEntry(entry, limits, locate(options.file));
  if (problem !== null) return failure([problem]);
  const output = new Uint8Array(entry.uncompressedSize);
  let offset = 0;
  try {
    for await (const chunk of entryChunks(input, entry, options)) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }
  } catch (error) {
    if (error instanceof ZipEntryError) return failure([error.diagnostic]);
    throw error;
  }
  return success(output);
}

/** Opens an archive and extracts the entries selected by `options.include`. */
export async function readZip(
  input: ByteSource | Uint8Array,
  options: ZipReadOptions = {},
): Promise<Result<readonly ZipEntry[]>> {
  const source = input instanceof Uint8Array ? bytesSource(input) : input;
  const archive = await openZip(source, options);
  if (!archive.ok) return archive;
  const include = options.include ?? (() => true);
  const entries: ZipEntry[] = [];
  for (const entry of archive.value.entries) {
    if (!include(entry.name)) continue;
    const extracted = await extractEntry(source, entry, options);
    if (!extracted.ok) return extracted;
    entries.push({ name: entry.name, bytes: extracted.value });
  }
  return success(entries);
}

/** The file name without folders, for matching entries such as `Queries.csv`. */
export function baseName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

/** True for the metadata files macOS and other tools add to archives, which hold no content. */
export function isMetadataEntry(path: string): boolean {
  return path.startsWith('__MACOSX/') || baseName(path).startsWith('._');
}

function checkEntry(
  entry: ZipDirectoryEntry,
  limits: InputLimits,
  where: ReturnType<typeof locate>,
): Diagnostic | null {
  if ((entry.flags & (FLAG_ENCRYPTED | FLAG_STRONG_ENCRYPTION)) !== 0) {
    return diagnostic('zip.encrypted', 'error', { entry: entry.name }, where);
  }
  if (entry.method !== STORED && entry.method !== DEFLATED) {
    return diagnostic(
      'zip.unsupported-method',
      'error',
      { entry: entry.name, method: entry.method },
      where,
    );
  }
  if (entry.method === STORED && entry.compressedSize !== entry.uncompressedSize) {
    return diagnostic('zip.corrupt-entry', 'error', { entry: entry.name }, where);
  }
  if (
    entry.uncompressedSize > RATIO_CHECK_MIN_BYTES &&
    entry.uncompressedSize / Math.max(1, entry.compressedSize) > limits.maxZipRatio
  ) {
    return diagnostic('zip.suspicious-ratio', 'error', { entry: entry.name }, where);
  }
  return null;
}

/** Finds where an entry's data begins, from its own local header, or `null` if it disagrees. */
async function dataStart(source: ByteSource, entry: ZipDirectoryEntry): Promise<number | null> {
  const header = await source.read(entry.localOffset, entry.localOffset + LOCAL_HEADER_SIZE);
  if (header.length < LOCAL_HEADER_SIZE) return null;
  const view = viewOf(header);
  if (view.getUint32(0, true) !== LOCAL_HEADER) return null;
  // The local header repeats the name and may carry a different extra field.
  const start =
    entry.localOffset + LOCAL_HEADER_SIZE + view.getUint16(26, true) + view.getUint16(28, true);
  return start + entry.compressedSize <= entry.end ? start : null;
}

function findEndOfCentralDirectory(view: DataView): number {
  const last = view.byteLength - EOCD_SIZE;
  const first = Math.max(0, last - MAX_COMMENT);
  for (let offset = last; offset >= first; offset--) {
    if (
      view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY &&
      offset + EOCD_SIZE + view.getUint16(offset + 20, true) <= view.byteLength
    ) {
      return offset;
    }
  }
  return -1;
}

function findExtraField(
  view: DataView,
  start: number,
  end: number,
  id: number,
): { start: number; end: number } | null {
  let at = start;
  while (at + 4 <= end) {
    const fieldId = view.getUint16(at, true);
    const size = view.getUint16(at + 2, true);
    const dataEnd = at + 4 + size;
    if (dataEnd > end) return null;
    if (fieldId === id) return { start: at + 4, end: dataEnd };
    at = dataEnd;
  }
  return null;
}

/** A 64-bit value as a number, or `null` beyond what a number can hold exactly. */
function safeNumber(value: bigint): number | null {
  return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
}

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function decodeName(bytes: Uint8Array): string {
  // Names without the UTF-8 flag are nominally CP437. ASCII names decode identically, and
  // modern tools write UTF-8 even when they omit the flag, so UTF-8 is the useful reading.
  return new TextDecoder('utf-8').decode(bytes).replaceAll('\\', '/');
}

function isDirectory(name: string): boolean {
  return name.endsWith('/');
}
