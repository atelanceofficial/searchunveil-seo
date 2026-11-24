# Development guide

> **Early prototype**
>
> How to run, test and change the code in this repository. Usage and contribution terms have not been published yet; see the [project overview](../README.md#availability-and-license).

## Requirements

- Node.js 22.22 or later 22.x, or 24.15 or later (`.nvmrc` names the recommended version).
- npm 10 or later.

## Get started

```sh
npm ci          # install exact, locked versions (install scripts are disabled)
npm run dev     # start the app at http://localhost:5173
```

Choose **Try sample data** on the Search Console page, or **Try a sample page** on the page review, to see the prototype with fictional data.

To try the production build, including its Content Security Policy:

```sh
npm run build
npm run preview # serves apps/web/dist at http://localhost:4173
```

The build is a folder of static files with relative paths; it can be served from any host or subfolder.

## Commands

| Command | What it does |
| :--- | :--- |
| `npm run check` | Everything CI checks: hidden characters, formatting, lint, types, and unit tests with coverage thresholds. |
| `npm test` | Unit tests for the engine and the app. |
| `npm run test:watch` | Unit tests in watch mode. |
| `npm run test:coverage` | Unit tests with coverage (at least 90% of lines, statements and functions, 85% of branches). |
| `npm run test:e2e` | Browser tests against the production build. Run `npx playwright install chromium` in `apps/web` once first. |
| `npm run lint` / `npm run typecheck` | Type-aware ESLint / TypeScript for every project. |
| `npm run format` | Format code with Prettier (Markdown is formatted by hand). |
| `npm run build:standalone` | One self-contained file, `apps/web/dist-standalone/searchunveil.html`, that opens in a browser without a server. |
| `npm run check:links` | Check that every cited source still resolves (needs network access). |

## Project layout

| Path | Contents |
| :--- | :--- |
| `packages/core/src/csv`, `zip`, `text` | File reading: CSV, ZIP and text encodings. |
| `packages/core/src/gsc` | Search Console import (`import.ts`, `columns.ts`, `values.ts`) and analysis (`analyze.ts`). |
| `packages/core/src/analysis` | Daily series, period comparison and statistics. |
| `packages/core/src/audit` | Page snapshot and review rules. |
| `packages/core/src/mentions` | The AI mention log. |
| `packages/core/src/i18n` | Message format, locales and the seven engine catalogs. |
| `packages/core/src/references.ts` | Every external source the findings cite. |
| `apps/web/src/views` | One component per page of the app. |
| `apps/web/src/messages` | Interface text in seven languages. |
| `apps/web/src/styles/app.css` | Design tokens and styles; contrast is tested in `contrast.test.ts`. |
| `apps/web/e2e` | Browser tests with Playwright and axe-core. |

## Common changes

### Change interface or engine text

1. Edit the English source catalog: `apps/web/src/messages/en.ts` for interface text, `packages/core/src/i18n/catalogs/en.ts` for findings and diagnostics.
2. Run `npm run typecheck`: it lists every language that lacks the key.
3. Add the translation to each catalog, keeping placeholders such as `{count}` exactly as in English. Use ICU plural forms where nouns follow numbers.
4. Run `npm test`: catalog tests check placeholders and render every message in every language.

Write apostrophes in prose as ’ so that they never act as ICU quoting characters. Translations are drafts until a native speaker reviews them.

### Add or change a finding rule

1. Implement it in `packages/core` with its thresholds in the module's threshold constant.
2. Add its message keys to all seven engine catalogs.
3. Cite sources through `references.ts` only.
4. Test it with realistic inputs, including the cases where it must stay silent.
5. Document it in [FINDINGS.md](FINDINGS.md).

### Change the cover art

The threads on the cover are `apps/web/src/assets/hero/threads.webp`: light threads on a transparent ground, lifted from a photograph by separating them from its black background. A replacement must also be transparent, with nothing but the drawing in it, because the stylesheet places it on the dark plates of both themes and lets it run off the page's edge.

Keep decoration behind content: it must never carry meaning or pass behind words, and it disappears in forced colors, when more contrast is requested, and in print. Run `npm run test:e2e` afterwards: the accessibility checks cover the home page in both themes.

### Update dependencies

Follow [ADR 0004](adr/0004-dependency-and-supply-chain-policy.md): pick versions at least 14 days old (security fixes excepted), install with `--save-exact`, review the changes, and run `npm run check` and `npm run test:e2e`. Keep `@playwright/test` and the `playwright-core` override in step.

---

**SearchUnveil · An Atelance project**  
Return to the [project overview](../README.md).
