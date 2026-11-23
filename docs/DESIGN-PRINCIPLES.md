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

The current GitHub cover uses a deep blue-black background, soft off-white typography, warm metallic accents, and fine geometric lines.

| Role | Reference tone | Hex |
| :--- | :--- | :--- |
| Dark canvas | Deep blue-black | `#0B1319` |
| Main text on dark | Soft ivory | `#F7F6F0` |
| Accent | Warm champagne | `#D6C49E` |
| Secondary detail | Mist green | `#A5D5CF` |

These are **brand references**, not final app color tokens. Interactive interface colors must be tested for contrast in every state. A good visual impression does not replace accessibility tests.

### How the prototype uses it

The interface borrows the cover's own elements rather than adding new ones.

| Element | Where it appears | What it is for |
| :--- | :--- | :--- |
| **Lens rings** | Home page, page headings, the main finding, the drop zone, the footer | The brand's signature. Generated from the same equations as the cover's wire lens. |
| **Measurement grid** | Page headings, the home page lens | Structure and precision, faded at the edges. |
| **Dot grid** | The drop zone and the tool pictures | Graph paper for places where data arrives. |
| **Hatching** | The chart's earlier period, the sample data label | Tells the two periods apart without relying on color. |
| **Gold rule** | Eyebrow labels, the current page in the menu, the header's edge | The cover's short metallic line, used to mark what matters. |
| **Grain and ambient light** | The page background | Keeps large gradients from banding and gives the canvas depth. |

Rules for every decorative element:

- Decoration stays behind content and never carries meaning on its own.
- Status is always an icon and words, then color; the chart's periods also have labels and hatching.
- Decoration disappears in forced-color modes, when more contrast is requested, and in print.
- Nothing moves in a loop. When motion is welcome, the home page lens draws itself once, in under two seconds.
- Patterns are generated from code (`npm run patterns`) and tested, so they can be rebuilt exactly.

Type is Inter with optical sizes: large headings use its display design and numbers use tabular figures, so columns of figures line up.

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
