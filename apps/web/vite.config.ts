import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * The production Content Security Policy, delivered as a meta tag so it travels with the
 * static files to any host.
 *
 * In the static and standalone builds, `connect-src 'none'` is the privacy guarantee made
 * verifiable: once loaded, the page cannot send data anywhere. Trusted Types restrict HTML parsing to one named policy, used only to
 * parse pasted pages into inert documents. (The development server needs a looser policy
 * for hot reloading, so the tag is added to builds only.)
 */
const SHARED_POLICY = [
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "require-trusted-types-for 'script'",
  'trusted-types searchunveil-inert-html',
];

/**
 * The hosted policy. The server build (`--mode server`, served by `apps/server`) may connect to
 * its own origin and nowhere else: it asks its server to fetch pages and to run the AI analysis.
 */
function hostedPolicy(server: boolean): string {
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "manifest-src 'self'",
    server ? "connect-src 'self'" : "connect-src 'none'",
    ...SHARED_POLICY,
  ].join('; ');
}

const CHARSET = '<meta charset="utf-8" />';

/**
 * Inserts a policy directly after the charset declaration: as early as possible, because a
 * meta policy only governs what follows it, while the charset must stay first.
 */
function withPolicy(html: string, policy: string): string {
  if (!html.includes(CHARSET)) {
    // Never ship a build without its security policy.
    throw new Error(`index.html must contain ${CHARSET} for the security policy to be added.`);
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
  return html.replace(CHARSET, `${CHARSET}\n    ${meta}`);
}

function contentSecurityPolicy(server: boolean): Plugin {
  return {
    name: 'searchunveil:content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      return withPolicy(html, hostedPolicy(server));
    },
  };
}

/** Text that cannot close or confuse the element it is inlined into. */
function inlineSafe(code: string, tag: 'script' | 'style'): string {
  return code.replaceAll(new RegExp(`</(${tag})`, 'gi'), '<\\/$1').replaceAll('<!--', '<\\!--');
}

const sha256 = (text: string) =>
  `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

/**
 * The standalone build: one HTML file holding the script, the styles, the fonts and the
 * images, so the app opens straight from disk, without a server. The policy stays as strict
 * as the hosted one: the inline script and styles are allowed by their hashes alone, and
 * the page still cannot connect anywhere.
 */
function singleFile(): Plugin {
  return {
    name: 'searchunveil:single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      // Last, so the bundler's own finishing touches (such as import helpers) are already in.
      order: 'post',
      handler(_options, bundle) {
        const page = bundle['index.html'];
        if (page?.type !== 'asset' || typeof page.source !== 'string') {
          throw new Error('The standalone build needs index.html in the bundle.');
        }
        let html = page.source;
        const scripts: string[] = [];
        const styles: string[] = [];

        for (const [name, file] of Object.entries(bundle)) {
          if (file.type === 'chunk') {
            const tag = new RegExp(`<script type="module" crossorigin src="\\./${name}"></script>`);
            if (!tag.test(html)) throw new Error(`No script tag found for ${name}.`);
            const code = inlineSafe(file.code, 'script');
            scripts.push(code);
            html = html.replace(tag, () => `<script type="module">${code}</script>`);
            Reflect.deleteProperty(bundle, name); // now inlined in the page
          } else if (name.endsWith('.css') && typeof file.source === 'string') {
            const tag = new RegExp(`<link rel="stylesheet" crossorigin href="\\./${name}">`);
            if (!tag.test(html)) throw new Error(`No stylesheet link found for ${name}.`);
            const css = inlineSafe(file.source, 'style');
            styles.push(css);
            html = html.replace(tag, () => `<style>${css}</style>`);
            Reflect.deleteProperty(bundle, name); // now inlined in the page
          }
        }
        if (scripts.length !== 1 || styles.length !== 1) {
          throw new Error('The standalone build must have exactly one script and one stylesheet.');
        }

        const icon = readFileSync(new URL('public/favicon.svg', import.meta.url), 'utf8');
        html = html.replace(
          'href="./favicon.svg"',
          `href="data:image/svg+xml,${encodeURIComponent(icon)}"`,
        );

        const policy = [
          "default-src 'none'",
          `script-src ${scripts.map(sha256).join(' ')}`,
          `style-src ${styles.map(sha256).join(' ')}`,
          'img-src data:',
          'font-src data:',
          "connect-src 'none'",
          ...SHARED_POLICY,
        ].join('; ');

        delete bundle['index.html'];
        this.emitFile({
          type: 'asset',
          fileName: 'searchunveil.html',
          source: withPolicy(html, policy),
        });
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  const server = mode === 'server';
  return {
    // Relative asset URLs let the static build run from any folder or subpath.
    base: './',
    plugins: [standalone ? singleFile() : contentSecurityPolicy(server)],
    oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
    ...(standalone ? { publicDir: false as const } : {}),
    build: standalone
      ? {
          target: 'es2022',
          outDir: 'dist-standalone',
          // Everything goes inside the one file: fonts and images as data: URLs,
          // every language in the single script.
          assetsInlineLimit: () => true,
          cssCodeSplit: false,
          modulePreload: false,
          rolldownOptions: { output: { codeSplitting: false } },
        }
      : {
          target: 'es2022',
          ...(server ? { outDir: 'dist-server' } : {}),
          // Keep the build self-contained: no inlined data: scripts, every asset a real file.
          assetsInlineLimit: 0,
        },
  };
});
