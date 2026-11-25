# Architecture decision records

Short records of significant technical decisions: the context, the decision and its consequences. They answer the open questions in the [technical direction](../TECHNICAL-DIRECTION.md#open-technical-questions).

All nine are **proposed**: they describe how the prototype works and why, and they are open to review before anything is released.

| Record | Decision |
| :--- | :--- |
| [0001](0001-local-first-processing.md) | Process everything on the person's device; store almost nothing. |
| [0002](0002-typescript-workspace-and-dependency-free-engine.md) | A TypeScript workspace with a dependency-free engine and a small Preact app. |
| [0003](0003-explainable-findings-as-messages.md) | Findings are structured messages with evidence and limits, never prose. |
| [0004](0004-dependency-and-supply-chain-policy.md) | Few dependencies, exact versions, a release cooldown and no install scripts. |
| [0005](0005-optional-server-for-addresses-and-ai.md) | An optional server reviews pages by address and runs the AI analysis; the static app stays local. |
| [0006](0006-built-in-analyst.md) | SearchUnveil Analyst, our own rule-based analysis engine, writes a ranked plan on the device. |
| [0007](0007-no-api-keys.md) | Nothing requires an API key. |
| [0008](0008-only-our-own-analyst.md) | SearchUnveil Analyst is the only analysis; the language-model second opinion is removed. |
| [0009](0009-ai-visibility-check.md) | The AI visibility check shows its cost and asks before it spends; asking AI engines is a swappable provider. |

---

**SearchUnveil · An Atelance project**  
Return to the [project overview](../../README.md).
