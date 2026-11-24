import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fetchPage } from './fetch-page.ts';
import { createApp } from './server.ts';

/**
 * Starts SearchUnveil with its server. It needs no API key. Settings come from the environment:
 *
 *   PORT          port to listen on (8787)
 *   HOST          interface to listen on (127.0.0.1; 0.0.0.0 to accept others)
 *   TRUST_PROXY=1 read visitors' addresses from X-Forwarded-For (behind a proxy)
 */

const env = process.env;
const port = Number(env['PORT'] ?? 8787);
const host = env['HOST'] ?? '127.0.0.1';
const staticDir = fileURLToPath(new URL('../../web/dist-server/', import.meta.url));

if (!existsSync(new URL('index.html', `file://${staticDir}`))) {
  process.stderr.write('The web app is not built yet. Run `npm run build:server` first.\n');
  process.exit(1);
}

const server = createApp({
  staticDir,
  fetchPage: (address, signal) => fetchPage(address, { signal }),
  trustProxy: env['TRUST_PROXY'] === '1',
});

server.listen(port, host, () => {
  process.stdout.write(
    `SearchUnveil is running at http://${host.includes(':') ? `[${host}]` : host}:${String(port)}\n`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeAllConnections();
  });
}
