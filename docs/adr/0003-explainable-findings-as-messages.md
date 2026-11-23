# 0003. Findings are explainable messages, not prose

**Status:** Proposed · **Date:** 2026-11-23

## Context

SearchUnveil's principles ask for clear language, visible sources and honest limits, in seven languages. Analysis code that writes English sentences cannot be translated well, tested reliably or audited, and it tends to hide its reasoning.

## Decision

- The engine returns **findings**: a stable rule identifier, a status, a title and summary as message keys with typed parameters, and lists of evidence, limitations, next checks and references.
- Every rule and threshold is documented in [FINDINGS.md](../FINDINGS.md) and defined in one place in code.
- Statistics stay explainable in one sentence. Period comparisons use whole weeks aligned by weekday, and consistency is described with an exact sign test ("higher on 22 of 28 days").
- The analysis never produces scores it cannot justify. In particular, the AI mention log has no visibility score.
- Messages use a small ICU MessageFormat subset (plural and select). Values are formatted per locale with `Intl`, dates in UTC, and people's own text is isolated for right-to-left reading.

## Consequences

- Translators work with complete sentences and real plural rules, including Arabic's six forms.
- Tests assert behavior through rule identifiers and parameters, not wording, and separately check that every message renders in every language.
- Adding a rule means adding its messages to all seven catalogs; the compiler and the catalog tests make a missing translation impossible to overlook.

---

Return to the [decision records](README.md).
