# 0007. No API keys

**Status:** Proposed · **Date:** 2026-11-24 · **Amends:** [0005](0005-optional-server-for-addresses-and-ai.md) · **Amended by:** [0008](0008-only-our-own-analyst.md): the second opinion is removed

## Context

[ADR 0005](0005-optional-server-for-addresses-and-ai.md) let the optional server ask Claude Fable 5.2 for an analysis with an Anthropic API key. Since [ADR 0006](0006-built-in-analyst.md), every review already comes with a plan from SearchUnveil Analyst, our own engine, which needs no key. Requiring a key, even optionally, meant a secret to obtain, store, rotate and pay for, and a server endpoint to protect from abuse.

## Decision

- Nothing in SearchUnveil requires an API key, in any build.
- The server only downloads pages by address. The `/api/analyze` endpoint, its limits and the Anthropic SDK are removed.
- The analysis is SearchUnveil Analyst's, on the device, everywhere.
- Claude Fable 5.2 remains as a second opinion only where it needs no key: inside a claude.ai viewer, through the viewer's own Claude account and with their consent. Elsewhere the second opinion is not shown.

## Consequences

- The server is simpler to run: no secret, no paid usage, no analysis endpoint, one dependency fewer.
- People outside Claude get the analyst's plan only; a model's free-form reading needs the app opened inside Claude.
- Privacy statements lose the server-side AI item: the server build sends pages' addresses to its own server only.

---

Return to the [decision records](README.md).
