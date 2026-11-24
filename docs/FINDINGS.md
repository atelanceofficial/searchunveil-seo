# Finding rules

> **Early prototype · Rules may change**
>
> This is the reference for every rule the prototype applies: when it fires, the exact thresholds, and why. The thresholds live in code as `SEARCH_CONSOLE_THRESHOLDS` and `PAGE_THRESHOLDS` in `packages/core`; tests pin them down.

Each finding names its rule, so anyone can trace a statement back to this page.

## Search Console exports

### How periods are compared

| Step | What happens | Why |
| :--- | :--- | :--- |
| Daily series | The daily table becomes one point per calendar day. Days without a row are counted as zero and reported. | Days without a row usually had no impressions. |
| Incomplete days | The last one or two days are left out when their impressions are below 50% of the median of the two weeks before them (only when that median is at least 20). | Recent data can still be processing; a half-counted day would look like a drop. |
| Period length | 28 days when 56 complete days exist; otherwise the most whole weeks that fit twice. Fewer than 14 days: no comparison. | Whole weeks line up each day with the same weekday, so weekend dips cannot pose as change. |
| Totals | Clicks and impressions are summed. CTR is total clicks ÷ total impressions. Position is weighted by impressions. | Averaging daily CTRs or positions would give quiet days the same weight as busy ones. |
| Direction | A metric is "up" or "down" when it moved at least 5%; otherwise "about the same". Clicks need at least 30 across both periods; impressions, CTR and position need at least 300 impressions. | Small numbers move a lot by chance. |
| Position | Changes smaller than 0.3, or 5% of the previous value, count as "about the same". A lower number is better. | Position is an average over many searches. |
| Day by day | For clicks and impressions, matching days are compared. An exact two-sided sign test below 0.05 makes the change "steady"; otherwise it is called "uneven". | It answers, in plain words, whether most days moved together or a few days explain the change. |

### Rules

| Rule | Appears when | Status |
| :--- | :--- | :--- |
| `gsc.headline` | Two periods can be compared. One of nine sentences from the direction of clicks and impressions, a variant when clicks are too few, or a statement that data is insufficient. | Clicks up, or impressions up when clicks are too few: looks good. Impressions up while clicks hold: worth a look. Clicks down, or impressions down when clicks are too few: needs attention. Otherwise: good to know. |
| `gsc.change.clicks`, `gsc.change.impressions` | The metric has enough data. States the change and the day-by-day pattern. | Up: looks good. Clicks down: needs attention. Impressions down: worth a look. |
| `gsc.change.ctr` | Enough clicks and impressions. | Up: looks good. Down: worth a look, with title and snippet checks. |
| `gsc.change.position` | Enough impressions and a position column. Always notes that the mix of searches moves the average. | Better: looks good. Worse: worth a look. |
| `gsc.opportunity.low-ctr.query`, `.page` | A row in the top ten has at least 100 impressions and a CTR below 50% of its position group's CTR. Groups are positions 1–3, 4–6 and 7–10, each needing at least 5 rows and 1,000 impressions. The comparison is with the site's own results, never an industry curve. | Worth a look |
| `gsc.opportunity.near-top.query`, `.page` | Average position above 10 and at most 20, with at least 50 impressions. | Worth a look |
| `gsc.opportunity.zero-click-pages` | A page has at least 100 impressions and no clicks. | Worth a look |
| `gsc.movers.gains`, `gsc.movers.losses` | A comparison export: rows whose clicks changed by at least 5, the five largest each way. Period labels are shown exactly as exported. | Gains: looks good. Losses: worth a look. |

Lists show at most ten rows.

### Notes about the data

| Rule | Appears when |
| :--- | :--- |
| `gsc.note.no-dates` | The export has no daily table, so no trend can be shown. |
| `gsc.note.short-range` | The daily table is too short to compare two periods. |
| `gsc.note.missing-days` | Days inside the range had no row. |
| `gsc.note.incomplete-days` | Final days were left out as incomplete. |
| `gsc.note.anonymized-queries` | The Queries table holds less than 99% of the daily table's clicks. Search Console hides rare queries and exports at most 1,000 rows. |
| `gsc.note.row-limit` | A table reached 1,000 rows, Search Console's export limit. |
| `gsc.note.partial-totals` | Totals had to come from a table other than the daily one. |
| `gsc.note.comparison-export` | The export compares two date ranges. |
| `gsc.note.filters` | The export's `Filters.csv` settings, shown as written. |

## Page review

The review sees only the HTML it is given. Every report states that content added by JavaScript, speed and links from other sites are outside its scope, and so are HTTP headers and robots.txt unless the page was fetched by its address.

Every report also lists **what search engines see**: a sketch of the search result (title, address and description, which Google may rewrite), the facts the rules read (language, canonical address, robots rules, words, headings, images, links, structured data, link preview, language versions), the heading outline and, for pages fetched by address, the server's answer.

A **site review** applies exactly these rules to every web page in a ZIP of the site's files (a backup or a static export, of any size) or in several HTML files. It adds no rules of its own: it groups the findings that need attention or a closer look by rule and wording, and shows on how many pages each appears, with an example. When the site's address is given, each page's address follows from its path, and `index.html` stands for its folder, as web servers serve it.

| Rule | What it checks | Status when it fails |
| :--- | :--- | :--- |
| `page.head` | Important tags (title, description, robots, viewport, canonical, hreflang) that the HTML parser moved out of `<head>` because something invalid came first. | Needs attention; worth a look when a `<noscript>` block caused it, because only tools without JavaScript are affected. |
| `page.robots.noindex` | A `robots`, `googlebot`, `googlebot-news` or `bingbot` meta tag with `noindex` or `none`. | Needs attention |
| `page.robots.nofollow` | The same tags with `nofollow` or `none`. | Worth a look |
| `page.robots.limited` | `nosnippet`, `noimageindex`, `notranslate`, `max-snippet:0` or `unavailable_after`. | Good to know |
| `page.title` | Exactly one non-empty title in `<head>` (SVG titles are ignored). Shorter than 10 or wider than 60 display units is flagged; wide characters such as Chinese count double. | Missing or empty: needs attention. Several, short or long: worth a look. |
| `page.description` | One non-empty meta description; wider than 160 display units may be shortened. | Missing, empty or several: worth a look. Long: good to know. |
| `page.lang` | A valid language tag on `<html>`. `UK` is rejected as a region: the code is `GB`. | Needs attention |
| `page.viewport` | A viewport meta tag that does not block zoom (`user-scalable=no`, or `maximum-scale` below 2). | Needs attention |
| `page.canonical` | Canonical links in `<head>`: agreement, validity, absolute addresses, and whether they point to this page, another page or another site. | Disagreeing or invalid: needs attention. Relative or another site: worth a look. Missing or another page: good to know. |
| `page.headings.h1`, `.order`, `.empty` | One main heading, no skipped levels, no empty headings. | Missing h1, skipped level or empty heading: worth a look. Several h1: good to know. |
| `page.images.alt` | Every perceivable image has an `alt` attribute; images hidden from assistive technology are exempt, and an empty `alt` is correct for decoration. | Needs attention |
| `page.links.name` | Every link has an accessible name. | Needs attention |
| `page.links.crawlable` | Links with `javascript:` addresses. | Worth a look |
| `page.links.summary` | With the page address given: links on this site, elsewhere, and marked nofollow. | Good to know |
| `page.structured-data.valid`, `.types` | JSON-LD blocks parse; the types found, including inside `@graph`. Eligibility for rich results is left to Google's own test. | Unreadable block: needs attention. |
| `page.hreflang` | Valid language codes or `x-default`, and that the page lists itself. Return links can't be checked from one page, and the finding says so. | Invalid code: needs attention. Missing self-reference: worth a look. |
| `page.charset` | A declared character encoding, preferably UTF-8. | Missing: worth a look. Legacy: good to know. |
| `page.social` | `og:title`, `og:description` and `og:image` for link previews. Stated plainly: they do not affect rankings. | Good to know |

### Server response

These rules run only when the [optional server](adr/0005-optional-server-for-addresses-and-ai.md) fetched the page by its address. robots.txt is read the way Googlebot reads it ([RFC 9309](https://www.rfc-editor.org/rfc/rfc9309)): its own group or the `*` group, the longest matching rule, `Allow` winning a tie, `*` and `$` in paths, and the first 500 KiB.

| Rule | What it checks | Status when it fails |
| :--- | :--- | :--- |
| `http.status` | The final answer, after redirects, is a success (2xx). | Needs attention |
| `http.https` | The final address uses HTTPS. | Needs attention |
| `http.x-robots-tag` | The `X-Robots-Tag` header carries `noindex` or `none`, for all crawlers or one. | Needs attention |
| `http.robots-txt` | robots.txt lets Googlebot crawl the page; the deciding rule is shown. A missing file (4xx) allows everything. | Needs attention |
| `http.robots-txt.unreadable` | robots.txt answered with a server error or 429, or not at all. Google then stops crawling the site until it can read the file. | Worth a look |
| `http.redirects` | Two or more redirects before the page; each one is listed. | Worth a look |
| `http.ok` | All of the above pass. Shows the status and the time the page took to arrive. | Looks good |

## SearchUnveil Analyst

The analyst turns a finished review into a ranked plan, on the device ([ADR 0006](adr/0006-built-in-analyst.md)). Thresholds live in code as `ANALYST_THRESHOLDS`.

**Reading the page.** The text's language is told from its writing system (Arabic, Chinese, Japanese, Korean, Cyrillic, Greek, Hebrew, Thai, Devanagari) or, for Latin letters, from the share of each language's most common words (English, Turkish, German, Spanish, French, Italian, Portuguese, Dutch). Words and sentences are divided by `Intl.Segmenter`; Turkish endings after an apostrophe and French elisions are set aside. Key phrases are counted with weights (title, main heading and link-preview title 3 or 2, section headings 2, description 2, text 1); phrases of two or three words count 1.6 and 2 times as much as their words, and must appear twice unless a title or heading uses them.

**Actions.** Each finding that needs attention or a closer look becomes an action with an impact and an effort. Actions are ranked by impact, then by lower effort; at most seven are shown. The analyst adds its own:

| Action | When | Impact · effort |
| :--- | :--- | :--- |
| `language-mismatch` | The declared language differs from the text's language, detected with at least 0.6 confidence. | Medium · low |
| `generic-heading` | The main heading is a greeting or a word such as "Home" in any of the supported languages. | Medium · low |
| `title` | The title is such a generic word. | High · low |
| `thin` | Fewer than 150 words of text. | Medium · medium |

**Ideas.** A title idea names the subject (the main heading when it says something, else the top phrase), a place when the page writes one as a place (after "in", "à", "en"…, or with a Turkish locative ending) in its first two sentences or twice, and the brand when the page names it (`og:site_name`, or a title part that matches the address). Ideas stay within 60 display units. A description idea is a sentence from the page's lead that mentions its main phrases, joined with the next one while under 110 units; ideas stay within 155 units, and sentences with phone numbers or boilerplate are left out.

**Notes.** The main phrase missing from the title, main heading or description; a brand missing from the title; 150 to 299 words; sentences averaging more than 25 words; title and description identical, or a description under 70 characters; no section headings on a page of 300 words or more; no internal links; contact details without LocalBusiness or Organization data; prices without Product or Offer data; and, for fetched pages, HTML taking more than 1.5 seconds, uncompressed HTML over 30 KB, HTML over 1 MB, HTTPS without HSTS, and a robots.txt without a sitemap.

**Verdict.** Weak when the page is kept out of search (noindex, a blocking robots.txt rule or header, an error status) or has three or more findings that need attention; fair with one or more, or with three findings worth a look; otherwise strong.

## Claude’s second opinion

The second opinion is not a rule: it is a reading of a finished review by Claude Fable 5.2, offered only inside Claude, on the viewer’s own account, and only when the person asks. No API key is involved. It receives the findings (in English, as evidence), the page facts, the server's answer when there is one, and the start of the page's visible text (at most 6,000 characters). It is asked to rank changes by their effect on being found and chosen in search and on accessibility, to point to the evidence for each, to give exact steps, to write title and description ideas in the page's own language and everything else in the reader's, and to say what it cannot know. The answer must be JSON of a fixed shape; anything else is discarded, and long fields are cut to fixed lengths.

## AI mention log

The log records observations; it does not measure anything.

- **Required:** the date seen (not in the future, in the person's own calendar), the assistant's name, the type, how it was seen and how sure the person is. A citation also requires the cited page.
- **Addresses** must be complete `http` or `https` URLs without embedded credentials.
- **Limits:** assistant 80 characters; prompt and notes 2,000; excerpt 5,000; addresses 2,048; at most 10,000 mentions per log.
- **Summaries** count what was recorded: totals, citations, uncertain entries, by assistant, by month and by cited page. There is deliberately no share, rate or score, because a personal log cannot measure how often AI assistants mention a site overall.

---

**SearchUnveil · An Atelance project**  
Return to the [project overview](../README.md).
