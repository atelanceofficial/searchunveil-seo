# Design principles

> **Design direction · Work in progress**
>
> These principles guide SearchUnveil's identity and intended interface. The cover art in this repository is real; the product UI described below is not yet released.

## The idea

**Make complex information feel clear.**

A user should be able to understand what SearchUnveil is for, what a chart shows, and what to do next without reading a manual.

## What the experience should feel like

| Principle | What it means |
| :--- | :--- |
| **Clarity** | Use short sentences, familiar words, and descriptive headings. |
| **Calm confidence** | Prioritize useful information over decoration or loud claims. |
| **Visual order** | Make the most important action and finding easy to spot. |
| **Honest feedback** | Explain loading, errors, missing data, and uncertainty. |
| **Accessibility** | Never rely on color alone; support keyboard and screen reader users. |
| **Respect for attention** | Avoid unnecessary motion, popups, and crowded dashboards. |

## Visual direction

The cover uses the letter shapes and engraved lines of the original gold SearchUnveil wordmark. The outlines stay still while the pattern moves inside the letters. The phone layout gives the wordmark room to read at a glance. Both layouts show a still image when a reader prefers reduced motion. [Original animation](../assets/searchunveil-approved-wordmark.gif) · [Cover rendering script](../scripts/render_cover.py)

| Role | Reference tone | Hex |
| :--- | :--- | :--- |
| Dark canvas | Deep blue-black | `#0B1319` |
| Main text on dark | Soft ivory | `#F7F6F0` |
| Accent | Warm champagne | `#D6C49E` |
| Secondary detail | Mist green | `#A5D5CF` |

These are **brand references**, not final app color tokens. Interactive interface colors must be tested for contrast in every state. A good visual impression does not replace accessibility tests.

## Writing rules

1. Lead with the answer, not the method.
2. Keep one main idea per sentence.
3. Use familiar terms before introducing technical terms.
4. Explain the meaning of metrics near the metric itself.
5. Say *planned*, *experimental*, or *available* precisely.
6. Describe a limitation before it can mislead someone.

**Prefer:** “Your pages appeared in search more often.”

**Avoid:** “A significant increase in cumulative search engine impression volume has been detected.”

## Charts and data

Each chart should include:

- A title that describes the question it answers.
- Clear axis labels, units, and date range.
- The source and update date when known.
- An accessible text summary or table.
- A visible empty state for missing or incomplete data.

Use progressive disclosure: show the important point first, with deeper detail available on demand.

## Responsive experience

Start design reviews with a narrow mobile viewport, then test larger screens. Avoid large diagram labels and horizontal scrolling for basic reading. Keep touch targets comfortable and visible focus indicators intact.

## Language and localization

Seven languages are planned: English, Spanish, German, French, Turkish, Simplified Chinese, and Arabic.

- Translate meaning, not just individual words.
- Review headings, buttons, and error messages in context.
- Leave enough room for longer text.
- Design Arabic screens with proper right-to-left flow.
- Format dates, numbers, and units for each locale.

## Quality checklist

Before approving a screen, ask:

- Can a first-time visitor explain it after one read?
- Is the next action obvious?
- Are claims and status accurate?
- Is it usable with a keyboard?
- Does it work on a narrow screen?
- Does its color contrast remain readable?
- Can the same information be understood without the chart?

If the answer is no, simplify and test again.

---

**SearchUnveil · An Atelance project**  
Return to the [project overview](../README.md).
