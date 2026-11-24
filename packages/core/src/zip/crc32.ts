/** CRC-32 (ISO 3309, polynomial 0xEDB88320), as used by ZIP archives to verify each entry. */

let table: Uint32Array | undefined;

function crcTable(): Uint32Array {
  if (table !== undefined) return table;
  table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

export function crc32(bytes: Uint8Array): number {
  return updateCrc32(0, bytes);
}

/**
 * Continues a checksum with more bytes, so a stream can be checked chunk by chunk:
 * `updateCrc32(updateCrc32(0, a), b)` equals `crc32` of `a` followed by `b`.
 */
export function updateCrc32(previous: number, bytes: Uint8Array): number {
  const t = crcTable();
  let crc = (previous ^ 0xffffffff) >>> 0;
  for (const byte of bytes) crc = (t[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
