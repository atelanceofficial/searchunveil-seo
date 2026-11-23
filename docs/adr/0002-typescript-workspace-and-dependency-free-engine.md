# 0002. A TypeScript workspace with a dependency-free engine

**Status:** Proposed · **Date:** 2026-11-23

## Context

The application stack was an open question. The product needs the same analysis in a browser today and possibly in other places later (a command-line tool, a server that fetches pages). It must handle untrusted files carefully and be easy to audit.

## Decision

- An npm workspace with two packages: `packages/core` (the engine) and `apps/web` (the interface).
- The engine is TypeScript with **no runtime dependencies**. It relies only on web-platform APIs that browsers and Node.js share: `TextDecoder`, `DecompressionStream`, `Intl` and standard DOM interfaces. Parsing, statistics and message formatting are implemented in small, tested modules.
- Source imports use real `.ts` extensions and only erasable TypeScript syntax, so the same files run under bundlers, under Vitest and directly in Node.js with its built-in type stripping, with no build step.
- The interface uses Preact (about 4 kB, no dependencies of its own) with Vite. Page HTML is parsed with the browser's own `DOMParser`, which follows the HTML standard exactly.
- Strict compiler settings throughout, including `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`, plus type-aware linting.

## Consequences

- The engine is small enough to read in full, and its behavior is the same in every environment.
- Some well-known libraries (for CSV, ZIP or message formatting) are replaced by focused implementations, which carry their own test suites, including property-based tests.
- Tests that need a DOM outside the browser use jsdom, a development-only dependency.

---

Return to the [decision records](README.md).
