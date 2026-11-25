/**
 * Characters that are invisible or reorder text, as the repository's source check defines them
 * (scripts/check-source-text.ts): they can make code read differently from how it runs. Bundling
 * turns escapes into the characters themselves, so the skill's bundle writes them back as escapes:
 * the code means the same, and reads as what it is.
 */
const RANGES: readonly (readonly [number, number])[] = [
  [0x0000, 0x0008],
  [0x000b, 0x000c],
  [0x000e, 0x001f],
  [0x007f, 0x009f],
  [0x00a0, 0x00a0],
  [0x00ad, 0x00ad],
  [0x061c, 0x061c],
  [0x115f, 0x1160],
  [0x17b4, 0x17b5],
  [0x180e, 0x180e],
  [0x2000, 0x200f],
  [0x2028, 0x202f],
  [0x205f, 0x206f],
  [0x3000, 0x3000],
  [0x3164, 0x3164],
  [0xfeff, 0xfeff],
  [0xffa0, 0xffa0],
];

export const isInvisible = (codePoint: number) =>
  RANGES.some(([low, high]) => codePoint >= low && codePoint <= high);

export function hasInvisible(text: string): boolean {
  for (const character of text) if (isInvisible(character.codePointAt(0) ?? 0)) return true;
  return false;
}

/** JavaScript source with every such character written as a `\uXXXX` escape instead. */
export function escapeInvisible(code: string): string {
  let escaped = '';
  for (const character of code) {
    const point = character.codePointAt(0) ?? 0;
    escaped += isInvisible(point)
      ? `\\u${point.toString(16).toUpperCase().padStart(4, '0')}`
      : character;
  }
  return escaped;
}
