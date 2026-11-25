/**
 * Puts the skill together for a marketplace: SKILL.md and its references next to the bundled
 * command line in dist/searchunveil, then a ZIP of that folder.
 *
 * The marketplace takes text files only: at most 5 MB zipped, 200 files besides SKILL.md and
 * 6 million characters. The build fails rather than make a package it would refuse. The ZIP is
 * then read back with the engine's own reader, to be sure it opens.
 *
 * Usage: node scripts/package.ts (after `vite build`)
 */
import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';
import { readZip } from '@searchunveil/core';
import { hasInvisible } from './invisible.ts';

export const PACKAGE_LIMITS = Object.freeze({
  zipBytes: 5 * 1024 * 1024,
  otherFiles: 200,
  characters: 6_000_000,
});

const TEXT_FILE = /\.(?:md|mjs|js|json|txt)$/;
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE = join(ROOT, 'skill');
const OUT = join(ROOT, 'dist', 'searchunveil');
const ZIP = join(ROOT, 'dist', 'searchunveil-skill.zip');

async function filesIn(folder: string, prefix = ''): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesIn(join(folder, entry.name), path)));
    else found.push(path);
  }
  return found.sort();
}

/** A ZIP of deflated entries with a fixed date, so the same files always give the same bytes. */
function zipOf(entries: readonly { name: string; data: Uint8Array }[]): Buffer {
  const parts: Buffer[] = [];
  const directory: Buffer[] = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const path = Buffer.from(name, 'utf8');
    const compressed = deflateRawSync(data, { level: 9 });
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // names are UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12); // 1980-01-01
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(path.length, 26);
    local.writeUInt16LE(0, 28);
    parts.push(local, path, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4); // made by Unix, version 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(path.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // a regular file, rw-r--r--
    central.writeUInt32LE(offset, 42);
    directory.push(central, path);
    offset += local.length + path.length + compressed.length;
  }
  const size = directory.reduce((total, part) => total + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(size, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, ...directory, end]);
}

await cp(SOURCE, OUT, { recursive: true });
const paths = await filesIn(OUT);
const problems: string[] = [];
let characters = 0;
const entries: { name: string; data: Uint8Array }[] = [];
for (const path of paths) {
  if (!TEXT_FILE.test(path)) problems.push(`Not a text file: ${path}`);
  const data = await readFile(join(OUT, path));
  const text = data.toString('utf8');
  characters += text.length;
  if (hasInvisible(text)) problems.push(`Invisible or control characters in ${path}`);
  entries.push({ name: `searchunveil/${path}`, data });
}
const others = paths.filter((path) => !path.endsWith('SKILL.md')).length;
if (others > PACKAGE_LIMITS.otherFiles) problems.push(`${others} files besides SKILL.md`);
if (characters > PACKAGE_LIMITS.characters) problems.push(`${characters} characters`);
const zip = zipOf(entries);
if (zip.length > PACKAGE_LIMITS.zipBytes) problems.push(`The ZIP is ${zip.length} bytes`);

const reread = await readZip(new Uint8Array(zip));
if (!reread.ok || reread.value.length !== entries.length)
  problems.push('The ZIP does not read back.');

if (problems.length > 0) {
  process.stderr.write(
    `The skill package breaks the marketplace's limits:\n- ${problems.join('\n- ')}\n`,
  );
  process.exit(1);
}
await writeFile(ZIP, zip);
process.stdout.write(
  `Skill package: ${ZIP}\n${entries.length} files, ${characters.toLocaleString('en')} characters, ` +
    `${(zip.length / 1024).toFixed(0)} KB zipped.\n`,
);
