/**
 * Fails when a tracked text file contains invisible, control or bidirectional formatting
 * characters. Such characters can make code read differently from how it runs ("Trojan
 * Source", CVE-2021-42574) and hide in diffs. In this repository they may appear in source
 * only as escape sequences.
 *
 * Usage: node scripts/check-source-text.ts
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const TEXT_FILE = /\.(?:[cm]?[jt]sx?|json|css|html|md|ya?ml|svg|txt)$/i;

/** Code point ranges that are invisible or reorder text; tab, LF and CR are allowed. */
const SUSPICIOUS: readonly (readonly [number, number])[] = [
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

const isSuspicious = (codePoint: number) =>
  SUSPICIOUS.some(([low, high]) => codePoint >= low && codePoint <= high);

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((file) => TEXT_FILE.test(file));

const findings: string[] = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const character of line) {
      const codePoint = character.codePointAt(0) ?? 0;
      if (isSuspicious(codePoint)) {
        const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
        findings.push(`${file}:${index + 1}: U+${hex}`);
      }
    }
  });
}

if (findings.length > 0) {
  process.stderr.write(
    `Invisible or control characters found. Write them as escape sequences instead:\n${findings.join('\n')}\n`,
  );
  process.exit(1);
}
process.stdout.write(`Checked ${files.length} files: no invisible or control characters.\n`);
