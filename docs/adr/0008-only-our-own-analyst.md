# 0008. Only our own analyst

**Status:** Proposed · **Date:** 2026-11-24 · **Amends:** [0005](0005-optional-server-for-addresses-and-ai.md), [0006](0006-built-in-analyst.md), [0007](0007-no-api-keys.md)

## Context

After [ADR 0007](0007-no-api-keys.md), Claude Fable 5.2 could still add a second opinion when the app was opened inside Claude. Every other copy of the app showed only SearchUnveil Analyst's plan. Two analyses that appear in some places and not others, written by different authors, made the product harder to explain.

## Decision

- SearchUnveil Analyst is the only analysis, in every build.
- The language-model second opinion is removed: the request and answer code in the engine, the claude.ai bridge in the app, its panel, texts and tests. The artifact preview no longer asks for the viewer's permission to use Claude.

## Consequences

- One analysis, the same everywhere: on the device, instant, free, without keys, accounts or outside services, and the same output for the same page.
- Nothing about a page leaves the device for analysis. In the server build, only the address of a page the person asks for reaches the server.
- The analysis is as good as its rules and statistics: it cannot read meaning or write new copy. Improving it means adding rules, messages and tests.

---

Return to the [decision records](README.md).
