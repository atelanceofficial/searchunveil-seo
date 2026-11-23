/**
 * Writes the interface's decorative pattern files from their source in apps/web/src/patterns.
 *
 *   npm run patterns
 *
 * The output is deterministic, and a unit test fails when a committed file differs from what
 * this script would write, so the drawings can never drift from the code that defines them.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { PATTERN_FILES } from '../apps/web/src/patterns/assets.ts';

const directory = new URL('../apps/web/src/assets/patterns/', import.meta.url);
mkdirSync(directory, { recursive: true });

for (const [name, render] of Object.entries(PATTERN_FILES)) {
  const svg = render();
  writeFileSync(new URL(name, directory), svg);
  process.stdout.write(`${name}: ${String(Buffer.byteLength(svg))} bytes\n`);
}
