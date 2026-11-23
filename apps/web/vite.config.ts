import { defineConfig, type Plugin } from 'vite';

/**
 * The production Content Security Policy, delivered as a meta tag so it travels with the
 * static files to any host.
 *
 * `connect-src 'none'` is the privacy guarantee made verifiable: once loaded, the page cannot
 * send data anywhere. Trusted Types restrict HTML parsing to one named policy, used only to
 * parse pasted pages into inert documents. (The development server needs a looser policy
 * for hot reloading, so the tag is added to builds only.)
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "require-trusted-types-for 'script'",
  'trusted-types searchunveil-inert-html',
].join('; ');

const CHARSET = '<meta charset="utf-8" />';

/**
 * Inserts the policy directly after the charset declaration: as early as possible, because a
 * meta policy only governs what follows it, while the charset must stay first.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'searchunveil:content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      if (!html.includes(CHARSET)) {
        // Never ship a build without its security policy.
        throw new Error(`index.html must contain ${CHARSET} for the security policy to be added.`);
      }
      const policy = `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
      return html.replace(CHARSET, `${CHARSET}\n    ${policy}`);
    },
  };
}

export default defineConfig({
  // Relative asset URLs let the static build run from any folder or subpath.
  base: './',
  plugins: [contentSecurityPolicy()],
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  build: {
    target: 'es2022',
    // Keep the build self-contained: no inlined data: scripts, every asset a real file.
    assetsInlineLimit: 0,
  },
});
