import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_MODEL } from '@searchunveil/core';
import { claudeAnalyzer } from './analyze.ts';
import { fetchPage } from './fetch-page.ts';
import { createApp, DEFAULT_SERVER_LIMITS } from './server.ts';

/**
 * Starts SearchUnveil with its server. Settings come from the environment:
 *
 *   PORT                    port to listen on (8787)
 *   HOST                    interface to listen on (127.0.0.1; 0.0.0.0 to accept others)
 *   ANTHROPIC_API_KEY       turns on the AI analysis; it never leaves this server
 *   TRUST_PROXY=1           read visitors' addresses from X-Forwarded-For (behind a proxy)
 *   ANALYSES_PER_DAY        ceiling on analyses for everyone per day (200)
 */

const env = process.env;
const port = Number(env['PORT'] ?? 8787);
const host = env['HOST'] ?? '127.0.0.1';
const staticDir = fileURLToPath(new URL('../../web/dist-server/', import.meta.url));
const hasKey = (env['ANTHROPIC_API_KEY'] ?? '') !== '';
const analysesPerDay = Number(env['ANALYSES_PER_DAY'] ?? DEFAULT_SERVER_LIMITS.analysesPerDay);

if (!existsSync(new URL('index.html', `file://${staticDir}`))) {
  process.stderr.write('The web app is not built yet. Run `npm run build:server` first.\n');
  process.exit(1);
}

const server = createApp({
  staticDir,
  fetchPage: (address, signal) => fetchPage(address, { signal }),
  // The client reads ANTHROPIC_API_KEY from the environment itself.
  analyze: hasKey ? claudeAnalyzer(new Anthropic()) : null,
  trustProxy: env['TRUST_PROXY'] === '1',
  limits: Number.isFinite(analysesPerDay) ? { analysesPerDay } : {},
});

server.listen(port, host, () => {
  process.stdout.write(
    [
      `SearchUnveil is running at http://${host.includes(':') ? `[${host}]` : host}:${String(port)}`,
      hasKey
        ? `AI analysis: on, with ${ANALYSIS_MODEL}.`
        : 'AI analysis: off. Set ANTHROPIC_API_KEY to turn it on.',
      '',
    ].join('\n'),
  );
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeAllConnections();
  });
}
