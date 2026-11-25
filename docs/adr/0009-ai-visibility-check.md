# 0009. An AI visibility check that asks before it spends

**Status:** Proposed · **Date:** 2026-11-25 · **Extends:** [0007](0007-no-api-keys.md)

## Context

The AI mention log records what people saw themselves. People also want to check on purpose: ask AI answer engines the questions their customers ask, and see whether the answers cite their site or name their brand, and their competitors'.

Asking AI engines is not free. Depending on the platform, the calls are billed by a tool marketplace or by the person's own accounts with AI services, on top of any SearchUnveil subscription. A check multiplies quickly: 10 questions × 3 engines × 3 repeats is 90 calls. AI answers also vary from one call to the next, and what a program receives can differ from what people see in the apps.

## Decision

- **The engine owns the check, except the asking.** Planning, cost, matching, reports, saved records and trends live in `packages/core/src/visibility`. Asking is a separate, swappable `AnswerProvider`, the only part that differs between platforms.
- **Nothing is spent without agreement.** The runner estimates the cost of the normalized plan per engine and hands it to a `confirm` callback. It makes no call unless that callback returns `true`.
- **Costs are shown before and after, honestly.** The estimate says which calls have no stated price. The actual cost uses the cost the provider reports when there is one, says when failed calls are not billed, and counts calls cut off by stopping apart. Amounts are added in millionths so small prices sum exactly.
- **Cheap by default.** The default choice is the cheapest priced model of each AI product, and never an engine without a stated price. Competitors add no calls.
- **Results are rates over a stated sample, marked approximate.** Repeats turn single answers into rates over the person's own questions, engines and repeats. A report never gives a market-wide visibility score, keeping the rule in the [technical direction](../TECHNICAL-DIRECTION.md#ai-mention-log).
- **Raw answers are kept and summaries derived.** A record keeps every answer as it came. Reports and trends are worked out from records, and trends compare only the questions and AI products that checks share.
- **Providers are untrusted.** Their answers are validated and capped, failures are recorded rather than retried, and stopping keeps everything received.

## Consequences

- The person always sees the price first, can lower it, and pays only for what they agreed to.
- A new platform needs only a new provider; matching and reports stay the same and stay tested.
- The page review keeps working without any key, as [ADR 0007](0007-no-api-keys.md) decided. The visibility check is the one feature that needs a paid service. Whether that service is a marketplace's tools or the person's own accounts is decided per platform, with the person's agreement to pay.
- No provider or screen exists yet, so the check cannot run in any build until both are written and the provider's prices are confirmed. Until then the builds' privacy promises are unchanged.

---

Return to the [decision records](README.md).
