import { diagnostic, failure, locate, success, type Result } from '../diagnostics.ts';
import { resolveLimits, toMegabytes, type InputLimits } from '../limits.ts';
import { crc32 } from './crc32.ts';

/**
 * A defensive reader for ZIP archives, such as the one Search Console downloads.
 *
 * Archives are untrusted, so the reader validates structure before decompressing anything:
 * entry counts, declared sizes, compression ratios and overlapping entries (a technique
 * used by decompression bombs). During extraction it stops as soon as output exceeds the
 * declared size, and it verifies every entry's CRC-32. Encrypted, multi-disk and ZIP64
 * archives are rejected because Search Console never produces them.
 */

export interface ZipDirectoryEntry {
  readonly name: string;
  readonly method: number;
  readonly crc32: number;
  readonly compressedSize: number;
  readonly uncompressedSize: number;
  /** Offset of the entry's data, after its local header. */
  readonly dataOffset: number;
}

export interface ZipArchive {
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

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const ZIP64_LOCATOR = 0x07064b50;
const EOCD_SIZE = 22;
const MAX_COMMENT = 0xffff;
const STORED = 0;
const DEFLATED = 8;
const FLAG_ENCRYPTED = 0x0001;
const FLAG_STRONG_ENCRYPTION = 0x0040;
const RATIO_CHECK_MIN_BYTES = 1024 * 1024;

/** True when the bytes start like a ZIP archive (including an empty one). */
export function isZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06))
  );
}

/** Reads and validates the archive's directory without decompressing any entry. */
export function openZip(
  bytes: Uint8Array,
  options: Pick<ZipReadOptions, 'file' | 'limits'> = {},
): Result<ZipArchive> {
  const limits = resolveLimits(options.limits);
  const where = locate(options.file);
  const invalid = () => failure<ZipArchive>([diagnostic('zip.invalid', 'error', {}, where)]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const eocd = findEndOfCentralDirectory(view);
  if (eocd === -1) return invalid();
  if (eocd >= 20 && view.getUint32(eocd - 20, true) === ZIP64_LOCATOR) {
    return failure([diagnostic('zip.zip64', 'error', {}, where)]);
  }

  const diskNumber = view.getUint16(eocd + 4, true);
  const directoryDisk = view.getUint16(eocd + 6, true);
  const entryCount = view.getUint16(eocd + 10, true);
  const directorySize = view.getUint32(eocd + 12, true);
  const directoryOffset = view.getUint32(eocd + 16, true);
  if (diskNumber !== 0 || directoryDisk !== 0) {
    return failure([diagnostic('zip.multi-disk', 'error', {}, where)]);
  }
  if (entryCount === 0xffff || directorySize === 0xffffffff || directoryOffset === 0xffffffff) {
    return failure([diagnostic('zip.zip64', 'error', {}, where)]);
  }
  if (entryCount > limits.maxZipEntries) {
    return failure([
      diagnostic('zip.too-many-entries', 'error', { limit: limits.maxZipEntries }, where),
    ]);
  }
  if (directoryOffset + directorySize > eocd) return invalid();

  const entries: ZipDirectoryEntry[] = [];
  const spans: { start: number; end: number }[] = [];
  let totalSize = 0;
  let cursor = directoryOffset;

  for (let index = 0; index < entryCount; index++) {
    if (cursor + 46 > eocd || view.getUint32(cursor, true) !== CENTRAL_HEADER) return invalid();
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const checksum = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const nameEnd = cursor + 46 + nameLength;
    if (nameEnd > eocd) return invalid();
    const name = decodeName(bytes.subarray(cursor + 46, nameEnd));
    cursor = nameEnd + extraLength + commentLength;

    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      return failure([diagnostic('zip.zip64', 'error', {}, where)]);
    }
    if ((flags & (FLAG_ENCRYPTED | FLAG_STRONG_ENCRYPTION)) !== 0) {
      return failure([diagnostic('zip.encrypted', 'error', { entry: name }, where)]);
    }

    // The local header repeats the name and may carry a different extra field.
    if (localOffset + 30 > directoryOffset || view.getUint32(localOffset, true) !== LOCAL_HEADER) {
      return invalid();
    }
    const dataOffset =
      localOffset +
      30 +
      view.getUint16(localOffset + 26, true) +
      view.getUint16(localOffset + 28, true);
    const dataEnd = dataOffset + compressedSize;
    if (dataEnd > directoryOffset) return invalid();
    spans.push({ start: localOffset, end: dataEnd });

    if (isDirectory(name)) continue;
    if (method !== STORED && method !== DEFLATED) {
      return failure([
        diagnostic('zip.unsupported-method', 'error', { entry: name, method }, where),
      ]);
    }
    if (method === STORED && compressedSize !== uncompressedSize) return invalid();
    if (uncompressedSize > limits.maxZipEntryBytes) {
      return failure([
        diagnostic(
          'zip.entry-too-large',
          'error',
          { entry: name, megabytes: toMegabytes(limits.maxZipEntryBytes) },
          where,
        ),
      ]);
    }
    if (
      uncompressedSize > RATIO_CHECK_MIN_BYTES &&
      uncompressedSize / Math.max(1, compressedSize) > limits.maxZipRatio
    ) {
      return failure([diagnostic('zip.suspicious-ratio', 'error', { entry: name }, where)]);
    }
    totalSize += uncompressedSize;
    if (totalSize > limits.maxZipTotalBytes) {
      return failure([
        diagnostic(
          'zip.total-too-large',
          'error',
          { megabytes: toMegabytes(limits.maxZipTotalBytes) },
          where,
        ),
      ]);
    }
    entries.push({ name, method, crc32: checksum, compressedSize, uncompressedSize, dataOffset });
  }

  spans.sort((a, b) => a.start - b.start);
  for (let i = 1; i < spans.length; i++) {
    if ((spans[i]?.start ?? 0) < (spans[i - 1]?.end ?? 0)) {
      return failure([diagnostic('zip.overlapping-entries', 'error', {}, where)]);
    }
  }
  return success({ entries });
}

/** Decompresses one entry and verifies its size and checksum. */
export async function extractEntry(
  bytes: Uint8Array,
  entry: ZipDirectoryEntry,
  options: Pick<ZipReadOptions, 'file'> = {},
): Promise<Result<Uint8Array>> {
  const where = locate(options.file);
  const data = bytes.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
  const output =
    entry.method === STORED ? data.slice() : await inflateRaw(data, entry.uncompressedSize);
  if (output === null) {
    return failure([diagnostic('zip.corrupt-entry', 'error', { entry: entry.name }, where)]);
  }
  if (crc32(output) !== entry.crc32) {
    return failure([diagnostic('zip.checksum-mismatch', 'error', { entry: entry.name }, where)]);
  }
  return success(output);
}

/** Opens an archive and extracts the entries selected by `options.include`. */
export async function readZip(
  bytes: Uint8Array,
  options: ZipReadOptions = {},
): Promise<Result<readonly ZipEntry[]>> {
  const archive = openZip(bytes, options);
  if (!archive.ok) return archive;
  const include = options.include ?? (() => true);
  const entries: ZipEntry[] = [];
  for (const entry of archive.value.entries) {
    if (!include(entry.name)) continue;
    const extracted = await extractEntry(bytes, entry, options);
    if (!extracted.ok) return extracted;
    entries.push({ name: entry.name, bytes: extracted.value });
  }
  return success(entries);
}

/** The file name without folders, for matching entries such as `Queries.csv`. */
export function baseName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
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

function decodeName(bytes: Uint8Array): string {
  // Names without the UTF-8 flag are nominally CP437. ASCII names decode identically, and
  // modern tools write UTF-8 even when they omit the flag, so UTF-8 is the useful reading.
  return new TextDecoder('utf-8').decode(bytes).replaceAll('\\', '/');
}

function isDirectory(name: string): boolean {
  return name.endsWith('/');
}

async function inflateRaw(data: Uint8Array, expectedSize: number): Promise<Uint8Array | null> {
  const output = new Uint8Array(expectedSize);
  let written = 0;
  const reader = new Blob([data.slice()])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
    .getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (written + value.byteLength > expectedSize) {
        // More output than declared: stop immediately instead of trusting the stream.
        await reader.cancel();
        return null;
      }
      output.set(value, written);
      written += value.byteLength;
    }
  } catch {
    return null;
  }
  return written === expectedSize ? output : null;
}
