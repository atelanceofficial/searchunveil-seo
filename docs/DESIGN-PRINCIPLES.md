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

The interface is an observing instrument at night: the cover's deep blue-black, brass for what matters, mist green for data.

Type comes in three voices, all bundled with the app and licensed under the SIL Open Font License, so every device renders the same letters:

| Voice | Typeface | Where |
| :--- | :--- | :--- |
| **Display** | Instrument Sans, slightly condensed, semibold | The wordmark, headings and large figures. |
| **Text** | Inter, with open digits | Everything people read: sentences, buttons, chart labels. |
| **Readout** | IBM Plex Mono, medium | Short labels engraved like an instrument's scale: tool names, metric names, table headers. |

Typography rules:

- Nothing people need to read is smaller than 13 pixels, lighter than regular weight, or set in capitals with wide spacing.
- Every text colour reaches 4.5:1 against what is really behind it, including placeholders and unavailable buttons, which use quieter colours instead of transparency.
- The home title is sized to its own column, so whole phrases stay together on any screen.
- The page's ground, text colour and colour scheme sit outside the stylesheet's cascade layers. A page that wraps the app with its own reset, as the artifact preview does, therefore cannot turn text black on the dark theme; a browser test checks this.
- Arabic and Chinese keep their own system typefaces at every level, without condensed widths or negative spacing.

| Element | Where it appears | What it is for |
| :--- | :--- | :--- |
| **Mark** | Header, footer, favicon | One thread of light drawn as an S: a gold strand with a dark line running through it, around a mist-green bead at its centre. |
| **Threads** | The home page's cover, the sample section's far corner, the footer's far edge on wide screens | Threads of light lifted from a photograph without its ground: loops beside the title, strands dissolving towards the page's edge. They never pass behind words. |
| **Ruler** | Under the cover and every page title, along the footer | Marks where content begins, like the scale on an instrument. |
| **Graph paper** | The drop zone | A sheet for data to land on, with a heavier line every fifth square. |
| **Hatching** | The chart's earlier period, the sample data label | Tells the two periods apart without relying on colour. |
| **Dark plates** | The cover, the sample section, the headline finding, the footer | These stay dark in both themes, so the threads always shine on night blue. |

Rules for every decorative element:

- Decoration stays behind content and never carries meaning on its own.
- Status is always an icon and words, then colour; the chart's periods also have labels and hatching.
- No glows, gradients on text, glass effects, accent rails on cards or looping motion.
- Text colours are tested for contrast in both themes and on the dark plates.
- Decoration disappears in forced-colour modes, when more contrast is requested, and in print.

Figures use tabular numbers so that columns line up, and a metric's number shrinks to fit its tile rather than wrapping.

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
