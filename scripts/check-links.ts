/**
 * Confirms that every page SearchUnveil cites still resolves. Findings point people to
 * primary sources, so a dead link is a defect. Runs on a schedule in CI, where the network
 * is available.
 *
 * Usage: node scripts/check-links.ts
 */
import { REFERENCES } from '../packages/core/src/references.ts';

const TIMEOUT_MS = 20_000;
const RETRY_WITH_GET = new Set([403, 405, 501]);

async function problemWith(url: string): Promise<string | null> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': 'SearchUnveil link check' },
      });
      if (response.ok) return null;
      // Some sites refuse HEAD requests; try once more with GET before reporting.
      if (method === 'GET' || !RETRY_WITH_GET.has(response.status)) {
        return `HTTP ${response.status}`;
      }
    } catch (error) {
      if (method === 'GET') return error instanceof Error ? error.message : String(error);
    }
  }
  return 'unreachable';
}

const results = await Promise.all(
  Object.entries(REFERENCES).map(async ([name, reference]) => ({
    name,
    url: reference.url,
    problem: await problemWith(reference.url),
  })),
);

for (const { name, url, problem } of results) {
  process.stdout.write(
    `${problem === null ? 'ok  ' : 'FAIL'}  ${name.padEnd(18)} ${url}${problem === null ? '' : `  (${problem})`}\n`,
  );
}
const failed = results.filter((result) => result.problem !== null);
if (failed.length > 0) {
  process.stderr.write(`\n${failed.length} of ${results.length} references failed.\n`);
  process.exit(1);
}
process.stdout.write(`\nAll ${results.length} references resolve.\n`);
