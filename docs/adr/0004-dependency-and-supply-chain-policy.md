# 0004. Dependency and supply-chain policy

**Status:** Proposed · **Date:** 2026-11-23

## Context

Software supply-chain attacks increasingly arrive through package updates and install scripts. SearchUnveil asks people to trust it with their data, so its own dependencies must be few, known and reviewed.

## Decision

- **Few dependencies.** The engine has none at runtime; the interface depends on Preact and a self-hosted font. Everything else is a development tool.
- **Exact versions** in `package.json` (`save-exact`) and a committed lockfile; CI installs with `npm ci`.
- **A 14-day release cooldown.** New versions are adopted only after they have been public for two weeks (for example with `npm install --before=<date>`), so compromised releases have time to be caught. Security fixes are the exception and are adopted promptly.
- **No install scripts.** `.npmrc` sets `ignore-scripts=true`; a dependency that needs one must be reviewed first.
- **Pinned CI actions.** Workflows reference actions by full commit SHA, run with read-only permissions and do not persist credentials.
- **Supported Node.js:** 22.22 and later 22.x releases, or 24.15 and later.

## Consequences

- Updates take deliberate effort: bump, wait for the cooldown, review the changelog, run the full check.
- When a tool's peer dependency would install a second copy of a package, an `overrides` entry keeps one version (currently `playwright-core`, matched to `@playwright/test`).

---

Return to the [decision records](README.md).
