# 0006. Our own analysis engine, on the device

**Status:** Proposed · **Date:** 2026-11-24 · **Builds on:** [0005](0005-optional-server-for-addresses-and-ai.md)

## Context

The AI analysis in [ADR 0005](0005-optional-server-for-addresses-and-ai.md) needs either an Anthropic API key on a server or the app opened inside Claude. Without one of those, people saw findings but no plan. People asked for an analysis of SearchUnveil's own, comparable to a frontier model.

Training a general language model at that level takes very large amounts of compute and data, and is not something a product team builds alongside its product. The job here is narrower: turn one page review into a ranked, explained plan. Much of that job is knowledge that can be written down.

## Decision

- Add **SearchUnveil Analyst** (`packages/core/src/analyst`), an analysis engine of documented rules and text statistics. It is not a language model.
- It reads the finished review, the page's visible text and, when the page was fetched, the server's answer. It produces the same shape as the AI analysis: a verdict and summary, ranked actions with impact, effort, why, exact steps and evidence, title and description ideas, notes and caveats.
- Language knowledge comes from the platform: `Intl.Segmenter` divides words and sentences (Chinese and Japanese included), Unicode script properties and short word lists tell twelve languages apart, `Intl.DisplayNames` names languages in the reader's language. No model files, no network.
- Ideas are assembled only from the page's own words: the subject from the main heading or the most repeated phrase, a place only when the text writes it as one, the brand only when the page names it, and description sentences taken from the page's lead. Nothing is invented.
- Every message is translated like the findings, into all seven languages. Thresholds are constants, tested, and listed in [FINDINGS.md](../FINDINGS.md#searchunveil-analyst).
- The analyst's plan is shown with every page review, at once. Claude Fable 5.2 stays available as an optional second opinion inside Claude ([ADR 0007](0007-no-api-keys.md)).

## Consequences

- Every review now comes with a plan: offline, instant, free, private, and identical for identical input.
- Every statement can be traced to a rule and a fact on the page; the analyst cannot misread a page the way a model might, but it also cannot understand meaning, judge tone, or write new copy. Its ideas are starting points, and it says so.
- Extending it means adding rules, messages in seven languages, and tests, the same discipline as findings.

---

Return to the [decision records](README.md).
