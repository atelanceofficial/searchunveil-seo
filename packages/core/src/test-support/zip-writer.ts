/**
 * Builds ZIP archives in tests, including deliberately broken ones. Generating archives in
 * code keeps binary fixtures out of the repository and documents exactly what each test feeds
 * the reader.
 */

export interface TestZipEntry {
  readonly name: string;
  readonly data: string | Uint8Array;
  readonly method?: 'stored' | 'deflate' | number;
  readonly flags?: number;
  /** Overrides the CRC-32 written to the central directory. */
  readonly crc32?: number;
  /** Overrides the uncompressed size written to the central directory. */
  readonly uncompressedSize?: number;
  /** Replaces the compressed payload written to the archive. */
  readonly payload?: Uint8Array;
  /** Points the central directory record at another entry's local header. */
  readonly reuseLocalHeaderOf?: number;
}

export interface TestZipOptions {
  readonly comment?: string;
  readonly totalEntriesOverride?: number;
  /** Writes a ZIP64 locator that points nowhere, as a damaged archive would. */
  readonly zip64Locator?: boolean;
  /** Writes every size and offset in ZIP64 form, as archives past 4 GB must. */
  readonly zip64?: boolean;
}

const encoder = new TextEncoder();

export async function createZip(
  entries: readonly TestZipEntry[],
  options: TestZipOptions = {},
): Promise<Uint8Array> {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  const localOffsets: number[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const raw = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const methodCode =
      entry.method === undefined || entry.method === 'deflate'
        ? 8
        : entry.method === 'stored'
          ? 0
          : entry.method;
    const payload = entry.payload ?? (methodCode === 8 ? await deflateRaw(raw) : raw);
    const checksum = entry.crc32 ?? crc32(raw);
    const size = entry.uncompressedSize ?? raw.length;
    const flags = (entry.flags ?? 0) | 0x0800;

    const zip64 = options.zip64 === true;
    let localOffset = offset;
    if (entry.reuseLocalHeaderOf === undefined) {
      const localExtra = zip64 ? 20 : 0;
      const local = new Uint8Array(30 + name.length + localExtra);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, zip64 ? 45 : 20, true);
      view.setUint16(6, flags, true);
      view.setUint16(8, methodCode, true);
      view.setUint32(14, checksum, true);
      view.setUint32(18, zip64 ? 0xffffffff : payload.length, true);
      view.setUint32(22, zip64 ? 0xffffffff : size, true);
      view.setUint16(26, name.length, true);
      view.setUint16(28, localExtra, true);
      local.set(name, 30);
      if (zip64) {
        const at = 30 + name.length;
        view.setUint16(at, 0x0001, true);
        view.setUint16(at + 2, 16, true);
        view.setBigUint64(at + 4, BigInt(size), true);
        view.setBigUint64(at + 12, BigInt(payload.length), true);
      }
      parts.push(local, payload);
      offset += local.length + payload.length;
    } else {
      localOffset = localOffsets[entry.reuseLocalHeaderOf] ?? 0;
    }
    localOffsets.push(localOffset);

    const centralExtra = zip64 ? 28 : 0;
    const record = new Uint8Array(46 + name.length + centralExtra);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, zip64 ? 45 : 20, true);
    view.setUint16(6, zip64 ? 45 : 20, true);
    view.setUint16(8, flags, true);
    view.setUint16(10, methodCode, true);
    view.setUint32(16, checksum, true);
    view.setUint32(20, zip64 ? 0xffffffff : payload.length, true);
    view.setUint32(24, zip64 ? 0xffffffff : size, true);
    view.setUint16(28, name.length, true);
    view.setUint16(30, centralExtra, true);
    view.setUint32(42, zip64 ? 0xffffffff : localOffset, true);
    record.set(name, 46);
    if (zip64) {
      const at = 46 + name.length;
      view.setUint16(at, 0x0001, true);
      view.setUint16(at + 2, 24, true);
      view.setBigUint64(at + 4, BigInt(size), true);
      view.setBigUint64(at + 12, BigInt(payload.length), true);
      view.setBigUint64(at + 20, BigInt(localOffset), true);
    }
    central.push(record);
  }

  const directoryOffset = offset;
  const directorySize = central.reduce((sum, record) => sum + record.length, 0);
  const comment = encoder.encode(options.comment ?? '');
  const total = options.totalEntriesOverride ?? entries.length;

  // ZIP64: a record with 64-bit counts and offsets, and a locator that points to it.
  let record64 = new Uint8Array(0);
  let locator = new Uint8Array(0);
  if (options.zip64 === true) {
    record64 = new Uint8Array(56);
    const view = new DataView(record64.buffer);
    view.setUint32(0, 0x06064b50, true);
    view.setBigUint64(4, 44n, true);
    view.setUint16(12, 45, true);
    view.setUint16(14, 45, true);
    view.setBigUint64(24, BigInt(total), true);
    view.setBigUint64(32, BigInt(total), true);
    view.setBigUint64(40, BigInt(directorySize), true);
    view.setBigUint64(48, BigInt(directoryOffset), true);
    locator = new Uint8Array(20);
    const locatorView = new DataView(locator.buffer);
    locatorView.setUint32(0, 0x07064b50, true);
    locatorView.setBigUint64(8, BigInt(directoryOffset + directorySize), true);
    locatorView.setUint32(16, 1, true);
  } else if (options.zip64Locator === true) {
    locator = new Uint8Array(20);
    new DataView(locator.buffer).setUint32(0, 0x07064b50, true);
  }

  const end = new Uint8Array(22 + comment.length);
  const endView = new DataView(end.buffer);
  const zip64 = options.zip64 === true;
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, zip64 ? 0xffff : total, true);
  endView.setUint16(10, zip64 ? 0xffff : total, true);
  endView.setUint32(12, zip64 ? 0xffffffff : directorySize, true);
  endView.setUint32(16, zip64 ? 0xffffffff : directoryOffset, true);
  endView.setUint16(20, comment.length, true);
  end.set(comment, 22);

  return concat([...parts, ...central, record64, locator, end]);
}

export async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data.slice()])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function concat(chunks: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
