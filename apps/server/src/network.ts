import { isIP } from 'node:net';

/**
 * Which IP addresses the server may connect to when it fetches a page for someone.
 *
 * Only the public internet: never this machine, the private network it sits in, cloud
 * metadata services, or ranges reserved for documentation, testing and multicast. Without
 * this check anyone could ask the server to read pages that only it can reach (server-side
 * request forgery).
 */

type Range = readonly [prefix: readonly number[], bits: number];

const BLOCKED_V4: readonly Range[] = [
  [[0], 8], // "this network"
  [[10], 8], // private
  [[100, 64], 10], // carrier-grade NAT
  [[127], 8], // loopback
  [[169, 254], 16], // link-local, including cloud metadata services
  [[172, 16], 12], // private
  [[192, 0, 0], 24], // IETF protocol assignments
  [[192, 0, 2], 24], // documentation
  [[192, 88, 99], 24], // deprecated 6to4 relays
  [[192, 168], 16], // private
  [[198, 18], 15], // benchmarking
  [[198, 51, 100], 24], // documentation
  [[203, 0, 113], 24], // documentation
  [[224], 4], // multicast
  [[240], 4], // reserved, including broadcast
];

/** Global unicast (2000::/3) is the only public IPv6 space; these parts of it are not public. */
const BLOCKED_GLOBAL_V6: readonly Range[] = [
  [[0x20, 0x01, 0x00], 23], // IETF protocol assignments, including Teredo
  [[0x20, 0x01, 0x0d, 0xb8], 32], // documentation
  [[0x3f, 0xff, 0x00], 20], // documentation
];

export function isPublicAddress(address: string): boolean {
  switch (isIP(address)) {
    case 4:
      return isPublicV4(v4Bytes(address));
    case 6:
      return isPublicV6(v6Bytes(address));
    default:
      return false;
  }
}

function isPublicV4(bytes: readonly number[]): boolean {
  return !BLOCKED_V4.some((range) => inRange(bytes, range));
}

function isPublicV6(bytes: readonly number[]): boolean {
  // IPv4 inside IPv6: mapped (::ffff:0:0/96), NAT64 (64:ff9b::/96) and 6to4 (2002::/16).
  if (inRange(bytes, [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff], 96])) {
    return isPublicV4(bytes.slice(12));
  }
  if (inRange(bytes, [[0, 0x64, 0xff, 0x9b, 0, 0, 0, 0, 0, 0, 0, 0], 96])) {
    return isPublicV4(bytes.slice(12));
  }
  if (inRange(bytes, [[0x20, 0x02], 16])) return isPublicV4(bytes.slice(2, 6));
  if (!inRange(bytes, [[0x20], 3])) return false;
  return !BLOCKED_GLOBAL_V6.some((range) => inRange(bytes, range));
}

function inRange(bytes: readonly number[], [prefix, bits]: Range): boolean {
  for (let bit = 0; bit < bits; bit++) {
    const index = bit >> 3;
    const mask = 0x80 >> (bit & 7);
    if (((bytes[index] ?? 0) & mask) !== ((prefix[index] ?? 0) & mask)) return false;
  }
  return true;
}

function v4Bytes(address: string): number[] {
  return address.split('.').map(Number);
}

/** The 16 bytes of a valid IPv6 address, which may end in dotted IPv4 and carry a zone. */
function v6Bytes(address: string): number[] {
  let text = address.split('%')[0] ?? '';
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(text)?.[1];
  if (dotted !== undefined) {
    const [a = 0, b = 0, c = 0, d = 0] = v4Bytes(dotted);
    text = `${text.slice(0, -dotted.length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head = '', tail] = text.split('::');
  const groups = (part: string) => (part === '' ? [] : part.split(':').map((g) => parseInt(g, 16)));
  const front = groups(head);
  const back = tail === undefined ? [] : groups(tail);
  const words = [...front, ...Array<number>(8 - front.length - back.length).fill(0), ...back];
  return words.flatMap((word) => [word >> 8, word & 0xff]);
}
