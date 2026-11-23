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
  readonly zip64Locator?: boolean;
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

    let localOffset = offset;
    if (entry.reuseLocalHeaderOf === undefined) {
      const local = new Uint8Array(30 + name.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, flags, true);
      view.setUint16(8, methodCode, true);
      view.setUint32(14, checksum, true);
      view.setUint32(18, payload.length, true);
      view.setUint32(22, size, true);
      view.setUint16(26, name.length, true);
      local.set(name, 30);
      parts.push(local, payload);
      offset += local.length + payload.length;
    } else {
      localOffset = localOffsets[entry.reuseLocalHeaderOf] ?? 0;
    }
    localOffsets.push(localOffset);

    const record = new Uint8Array(46 + name.length);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, flags, true);
    view.setUint16(10, methodCode, true);
    view.setUint32(16, checksum, true);
    view.setUint32(20, payload.length, true);
    view.setUint32(24, size, true);
    view.setUint16(28, name.length, true);
    view.setUint32(42, localOffset, true);
    record.set(name, 46);
    central.push(record);
  }

  const directoryOffset = offset;
  const directorySize = central.reduce((sum, record) => sum + record.length, 0);
  const comment = encoder.encode(options.comment ?? '');
  const locator = options.zip64Locator === true ? new Uint8Array(20) : new Uint8Array(0);
  if (locator.length > 0) new DataView(locator.buffer).setUint32(0, 0x07064b50, true);
  const end = new Uint8Array(22 + comment.length);
  const endView = new DataView(end.buffer);
  const total = options.totalEntriesOverride ?? entries.length;
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, total, true);
  endView.setUint16(10, total, true);
  endView.setUint32(12, directorySize, true);
  endView.setUint32(16, directoryOffset, true);
  endView.setUint16(20, comment.length, true);
  end.set(comment, 22);

  return concat([...parts, ...central, locator, end]);
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
