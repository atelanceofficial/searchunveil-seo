import { defineConfig, type Plugin } from 'vite';
import { escapeInvisible } from './scripts/invisible.ts';

/** Writes invisible characters back as escapes, in the file that ships. */
function invisibleAsEscapes(): Plugin {
  return {
    name: 'invisible-characters-as-escapes',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') file.code = escapeInvisible(file.code);
      }
    },
  };
}

/**
 * Bundles the command line into one readable JavaScript file for Node.js 20 or later: the
 * engine, the parser and the words, with nothing to install. Not minified, so that buyers and
 * marketplace reviews can read what runs.
 */
export default defineConfig({
  plugins: [invisibleAsEscapes()],
  build: {
    ssr: 'src/main.ts',
    outDir: 'dist/searchunveil/scripts',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    target: 'node20',
    rolldownOptions: {
      output: {
        entryFileNames: 'searchunveil.mjs',
        format: 'es',
        codeSplitting: false,
        banner:
          '// SearchUnveil command line, by Atelance. Built from the SearchUnveil sources; do not edit.',
      },
    },
  },
  ssr: { noExternal: true, target: 'node' },
});
