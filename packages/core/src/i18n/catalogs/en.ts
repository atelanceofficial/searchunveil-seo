import type { DiagnosticCode } from '../../diagnostics.ts';

/**
 * English messages for the analysis engine: findings, metrics and diagnostics.
 *
 * English is the source catalog: its keys define `CoreMessageKey`, and every other catalog
 * must provide exactly the same keys (enforced by the compiler) and the same placeholders
 * (enforced by tests). Messages use ICU MessageFormat; write apostrophes as ’ in prose.
 *
 * Writing rules (docs/DESIGN-PRINCIPLES.md): lead with the answer, one idea per sentence,
 * familiar words first, and say what the data cannot tell.
 */
const messages = {
  // Statuses
  'status.attention': 'Needs attention',
  'status.review': 'Worth a look',
  'status.good': 'Looks good',
  'status.info': 'Good to know',

  // Metrics
  'metric.clicks': 'Clicks',
  'metric.impressions': 'Impressions',
  'metric.ctr': 'Click-through rate',
  'metric.position': 'Average position',
  'metric.clicks.help': 'How many times people clicked through to your site from Google Search.',
  'metric.impressions.help':
    'How many times a link to your site appeared in search results someone saw.',
  'metric.ctr.help': 'The share of impressions that became clicks.',
  'metric.position.help':
    'Where your site usually appeared in results. Lower is better: 1 is the top of the page.',

  // Evidence and tables
  'evidence.recent-period': 'Recent period',
  'evidence.previous-period': 'Previous period',
  'evidence.period': '{range}',
  'evidence.change': 'Change',
  'evidence.first-day': 'First day',
  'evidence.last-day': 'Last day',
  'evidence.impressions-on': 'Impressions on {day}',
  'evidence.typical-impressions': 'Typical day',
  'evidence.head-breaker': 'Ended the head',
  'evidence.title': 'Title',
  'evidence.description': 'Description',
  'evidence.viewport': 'Viewport',
  'evidence.canonical': 'Canonical link',
  'evidence.heading': 'Heading',
  'evidence.heading-level': 'h{level}',
  'table.query': 'Query',
  'table.page': 'Page',
  'table.text': '{text}',
  'table.typical-ctr': 'Typical for your site',
  'table.primary-period': 'Main period',
  'table.comparison-period': 'Compared period',
  'table.tag': 'Tag',
  'table.image': 'Image',
  'table.link': 'Link',

  // References
  'ref.gsc-metrics': 'Search Console Help: what impressions, position and clicks mean',
  'ref.gsc-performance': 'Search Console Help: Performance report',
  'ref.title-links': 'Google Search Central: influencing title links',
  'ref.snippets': 'Google Search Central: snippets and meta descriptions',
  'ref.robots-meta': 'Google Search Central: robots meta tag',
  'ref.canonical': 'Google Search Central: canonical URLs',
  'ref.hreflang': 'Google Search Central: localized versions of pages',
  'ref.structured-data': 'Google Search Central: introduction to structured data',
  'ref.rich-results-test': 'Google Rich Results Test',
  'ref.images': 'Google Search Central: image best practices',
  'ref.valid-metadata': 'Google Search Central: use valid page metadata',
  'ref.crawlable-links': 'Google Search Central: make links crawlable',
  'ref.wcag-language': 'WCAG 2.2: Language of Page (3.1.1)',
  'ref.wcag-non-text': 'WCAG 2.2: Non-text Content (1.1.1)',
  'ref.wcag-resize': 'WCAG 2.2: Resize Text (1.4.4)',
  'ref.wcag-link-purpose': 'WCAG 2.2: Link Purpose (2.4.4)',
  'ref.wcag-structure': 'WCAG 2.2: Info and Relationships (1.3.1)',
  'ref.viewport': 'MDN: the viewport meta tag',
  'ref.open-graph': 'The Open Graph protocol',

  // Search Console: headline
  'gsc.headline.method':
    'We compared {current} with {previous}, matching each day with the same weekday.',
  'gsc.headline.up-up': 'More people found your pages and visited them.',
  'gsc.headline.up-flat': 'More people clicked through, while your pages appeared about as often.',
  'gsc.headline.up-down': 'Clicks rose even though your pages appeared less often.',
  'gsc.headline.flat-up':
    'Your pages appeared in search more often, but clicks stayed about the same.',
  'gsc.headline.flat-flat': 'Search performance stayed about the same.',
  'gsc.headline.flat-down': 'Your pages appeared less often, but clicks stayed about the same.',
  'gsc.headline.down-up': 'Your pages appeared more often, but fewer people clicked.',
  'gsc.headline.down-flat': 'Fewer people clicked, while your pages appeared about as often.',
  'gsc.headline.down-down': 'Your pages appeared less often and received fewer clicks.',
  'gsc.headline.impressions-up':
    'Your pages appeared in search more often. There are too few clicks to compare yet.',
  'gsc.headline.impressions-flat':
    'Your pages appeared about as often as before. There are too few clicks to compare yet.',
  'gsc.headline.impressions-down':
    'Your pages appeared in search less often. There are too few clicks to compare yet.',
  'gsc.headline.insufficient': 'There isn’t enough search data yet to compare periods reliably.',

  // Search Console: suggested checks
  'gsc.check.growth-drivers':
    'Find the pages and queries behind the growth, and keep that content accurate and up to date.',
  'gsc.check.queries-gained':
    'Compare queries between the two periods to see which gained impressions, and whether they match what your pages offer.',
  'gsc.check.titles':
    'Review the titles and descriptions of the pages involved. They are what people read before deciding to click.',
  'gsc.check.position-shift':
    'Check average position: new appearances often start lower on the page, where fewer people click.',
  'gsc.check.lost-visibility':
    'Find the pages and queries that lost impressions, and check that those pages still work and can be indexed.',
  'gsc.check.site-changes':
    'Think about recent changes to the site, such as a redesign, moved or deleted pages, or new robots rules.',
  'gsc.check.seasonality':
    'Compare with the same weeks a year earlier. Interest in many topics rises and falls with the seasons.',
  'gsc.check.serp-features':
    'Search for your main queries yourself. Ads, videos or AI-generated answers on the results page can draw clicks away.',
  'gsc.check.opportunities':
    'See the opportunities below for queries and pages that could earn more clicks.',
  'gsc.check.export-longer':
    'Export a longer date range from Search Console, ideally the last 3 months, for a clearer picture.',
  'gsc.check.focused-page':
    'Make sure one clear, up-to-date page answers each query, and link to it from related pages.',
  'gsc.check.search-intent':
    'Search for the queries these pages appear for, and check whether the pages answer what people want.',

  // Search Console: changes between periods
  'gsc.change.clicks.up': 'Clicks rose {change}, to {current}.',
  'gsc.change.clicks.down': 'Clicks fell {change}, to {current}.',
  'gsc.change.clicks.flat': 'Clicks stayed about the same, at {current}.',
  'gsc.change.clicks.started': 'Clicks went from none to {current}.',
  'gsc.change.impressions.up': 'Impressions rose {change}, to {current}.',
  'gsc.change.impressions.down': 'Impressions fell {change}, to {current}.',
  'gsc.change.impressions.flat': 'Impressions stayed about the same, at {current}.',
  'gsc.change.impressions.started': 'Impressions went from none to {current}.',
  'gsc.change.ctr.up': 'Click-through rate rose from {previous} to {current}.',
  'gsc.change.ctr.down': 'Click-through rate fell from {previous} to {current}.',
  'gsc.change.ctr.flat': 'Click-through rate stayed about the same, at {current}.',
  'gsc.change.position.better': 'Average position improved from {previous} to {current}.',
  'gsc.change.position.worse': 'Average position slipped from {previous} to {current}.',
  'gsc.change.position.flat': 'Average position stayed about the same, at {current}.',
  'gsc.daybyday.higher':
    'The value was higher on {count} of {days} days than on the same weekday of the previous period.',
  'gsc.daybyday.lower':
    'The value was lower on {count} of {days} days than on the same weekday of the previous period.',
  'gsc.daybyday.uneven':
    'Day by day, the change was uneven ({higher} days higher, {lower} days lower), so a few days may explain most of it.',

  // Search Console: limitations
  'gsc.limit.weekday-matching':
    'Each period covers whole weeks, so weekday and weekend patterns don’t distort the comparison.',
  'gsc.limit.ctr-features':
    'Click-through rate also depends on what else the results page shows, such as ads, videos or AI-generated answers.',
  'gsc.limit.position-mix':
    'Average position also changes when the mix of searches changes, not only when rankings move.',
  'gsc.limit.position-average':
    'Average position summarizes many searches. In individual searches, a page can appear higher or lower.',

  // Search Console: opportunities
  'gsc.opportunity.low-ctr.query':
    '{count, plural, one {# query gets} other {# queries get}} fewer clicks than similar results',
  'gsc.opportunity.low-ctr.page':
    '{count, plural, one {# page gets} other {# pages get}} fewer clicks than similar results',
  'gsc.opportunity.low-ctr.summary':
    'They appear among the top ten results, but their click-through rate is below {share} of what your other results at a similar position get.',
  'gsc.opportunity.near-top.query':
    '{count, plural, one {# query ranks} other {# queries rank}} just below the top ten',
  'gsc.opportunity.near-top.page':
    '{count, plural, one {# page ranks} other {# pages rank}} just below the top ten',
  'gsc.opportunity.near-top.summary':
    'Their average position is between {from} and {to}, and people search for them often. Improving the page that answers them could bring it into view.',
  'gsc.opportunity.zero-click-pages':
    '{count, plural, one {# page is seen but never clicked} other {# pages are seen but never clicked}}',
  'gsc.opportunity.zero-click-pages.summary':
    'Each appeared in search results at least {min} times without a single click.',
  'gsc.movers.gains':
    '{kind, select, page {Pages} other {Queries}} with the biggest gains in clicks',
  'gsc.movers.losses':
    '{kind, select, page {Pages} other {Queries}} with the biggest losses in clicks',

  // Search Console: notes
  'gsc.note.no-dates': 'This export has no daily data, so trends can’t be shown.',
  'gsc.note.short-range':
    'This export covers {days, plural, one {# day} other {# days}}: too short to compare two periods.',
  'gsc.note.missing-days': '{count, plural, one {# day has no data} other {# days have no data}}',
  'gsc.note.missing-days.summary':
    'Days without a row usually had no impressions. We counted them as zero.',
  'gsc.note.incomplete-days':
    '{count, plural, one {The last day looks incomplete} other {The last # days look incomplete}}',
  'gsc.note.incomplete-days.summary':
    'Search Console may still be processing recent data. We left {count, plural, one {this day} other {these days}} out of the comparison.',
  'gsc.note.anonymized-queries': 'The Queries table accounts for {share} of all clicks',
  'gsc.note.anonymized-queries.summary':
    'Search Console doesn’t list rare queries, to protect searchers’ privacy, and exports at most {limit} rows. Totals from the Queries table are therefore lower than the chart totals.',
  'gsc.note.row-limit':
    '{kind, select, query {The Queries table} page {The Pages table} country {The Countries table} other {A table}} reached {limit} rows',
  'gsc.note.row-limit.summary':
    'That is Search Console’s export limit, so less frequent {kind, select, query {queries} page {pages} country {countries} other {rows}} may be missing.',
  'gsc.note.partial-totals':
    'Totals come from the {kind, select, query {Queries} page {Pages} country {Countries} device {Devices} other {exported}} table',
  'gsc.note.partial-totals.summary':
    '{kind, select, query {Rare queries are hidden for privacy, so these totals are lower than your site’s real totals.} page {When several of your pages appear in the same search, each one counts, so these totals can differ from your site’s totals.} other {They can differ from your site’s totals. Include the Dates table for complete totals.}}',
  'gsc.note.comparison-export': 'This export compares “{primary}” with “{comparison}”.',
  'gsc.note.comparison-export.unlabeled': 'This export compares two date ranges.',
  'gsc.note.filters': 'Export settings',

  // Page review
  'page.limit.source':
    'We reviewed the HTML you provided. Content that JavaScript adds after the page loads isn’t included.',
  'page.limit.scope':
    'HTTP headers, robots.txt, speed and links from other sites also matter for search. They aren’t part of this review.',
  'page.limit.width':
    'Search results measure width in pixels, not characters, so this is an estimate.',
  'page.head.ok': 'Important tags are all inside the head',
  'page.head.broken':
    '{count, plural, one {# important tag ended up} other {# important tags ended up}} outside the head',
  'page.head.broken.summary':
    'Something that doesn’t belong in the head appeared before {count, plural, one {this tag} other {these tags}}, so the browser ended the head early. Search engines ignore these tags outside the head.',
  'page.head.noscript':
    '{count, plural, one {# tag after a noscript block may be ignored} other {# tags after a noscript block may be ignored}}',
  'page.head.noscript.summary':
    'An image or similar element inside noscript in the head ends the head for tools that don’t run JavaScript. Browsers that run JavaScript aren’t affected.',
  'page.check.head': 'Move the unexpected element below the head, or move these tags above it.',
  'page.check.noscript':
    'Move the noscript block to the end of the head, after the important tags.',
  'page.robots.noindex': 'The page asks search engines not to show it in results',
  'page.robots.noindex.summary':
    'Pages marked noindex don’t appear in search results. That’s right for private or duplicate pages, and a costly mistake anywhere else.',
  'page.check.robots':
    'If this page should appear in search, remove noindex from its robots meta tag.',
  'page.robots.nofollow': 'The page asks search engines not to follow its links',
  'page.robots.nofollow.summary':
    'Search engines won’t use the links on this page to discover other pages.',
  'page.robots.limited': 'The page limits how search engines may show it',
  'page.robots.limited.summary':
    'Rules such as nosnippet or max-snippet change how the page appears in results.',
  'page.robots.indexable': 'Nothing in the HTML blocks indexing',
  'page.robots.indexable.summary':
    'We found no noindex rule in the page. Rules can also come from HTTP headers or robots.txt, which the HTML doesn’t show.',
  'page.title.why':
    'Search engines usually show the title as the link to your page, and browsers show it in tabs and bookmarks.',
  'page.check.title':
    'Write a short, unique title that says what the page offers, with the most important words first.',
  'page.title.missing': 'The page has no title',
  'page.title.empty': 'The page’s title is empty',
  'page.title.multiple': 'The page has {count} titles',
  'page.title.multiple.summary':
    'Browsers use the first one, and search engines may use either. Keep exactly one.',
  'page.title.short': 'The title is very short',
  'page.title.short.summary': 'A title like “Home” rarely tells searchers what the page offers.',
  'page.title.long': 'The title may be shortened in search results',
  'page.title.long.summary':
    'Its length is about {length} characters. Around {fit} usually fit before search results cut it.',
  'page.title.ok': 'The title is present and a sensible length',
  'page.description.why':
    'A meta description is optional, and Google often writes its own snippet. A good one can still help people choose your result.',
  'page.check.description':
    'Write one or two sentences that summarize the page for someone deciding whether to click.',
  'page.description.missing': 'The page has no meta description',
  'page.description.empty': 'The meta description is empty',
  'page.description.multiple': 'The page has {count} meta descriptions',
  'page.description.multiple.summary': 'Keep exactly one, so it’s clear which one to use.',
  'page.description.long': 'The description may be shortened in search results',
  'page.description.long.summary':
    'Its length is about {length} characters. Around {fit} usually fit in a snippet.',
  'page.description.ok': 'The page has a meta description',
  'page.lang.missing': 'The page doesn’t declare its language',
  'page.lang.invalid': 'The language code {value} isn’t valid',
  'page.lang.why':
    'Screen readers use the language to pronounce text correctly, and browsers use it to offer translation.',
  'page.check.lang': 'Add a lang attribute to the html element, such as lang="en" or lang="tr".',
  'page.lang.ok': 'The page declares its language: {value}',
  'page.viewport.missing': 'The page isn’t set up for phones',
  'page.viewport.why':
    'Without a viewport meta tag, phones show the page zoomed out, like a desktop page. Google mainly uses the mobile version of pages for indexing.',
  'page.check.viewport':
    'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the head.',
  'page.viewport.zoom-blocked': 'The page stops visitors from zooming',
  'page.viewport.zoom-blocked.summary':
    'Blocking zoom makes text hard to read for people with low vision. Remove user-scalable=no and any maximum-scale below 2.',
  'page.viewport.ok': 'The page is set up for phones',
  'page.canonical.missing': 'The page has no canonical link',
  'page.canonical.missing.summary':
    'That’s fine for most pages. If the same content is available at several addresses, a canonical link tells search engines which one you prefer.',
  'page.canonical.multiple': 'The page has {count} canonical links that disagree',
  'page.canonical.multiple.summary':
    'When canonical links point to different pages, search engines may ignore all of them.',
  'page.canonical.invalid': 'The canonical link {href} isn’t a valid address',
  'page.canonical.relative': 'The canonical link uses a relative address',
  'page.canonical.relative.summary':
    'It works, but a full address starting with https:// avoids mistakes, and Google recommends one.',
  'page.canonical.other-site': 'The canonical link points to another website: {host}',
  'page.canonical.other-site.summary':
    'Search engines may show that site’s page instead of this one. That’s only intended if this page is a copy.',
  'page.canonical.other-page': 'The canonical link points to a different page',
  'page.canonical.other-page.summary':
    'Search engines may treat this page as a duplicate and show the other page instead.',
  'page.canonical.self': 'The canonical link points to this page',
  'page.canonical.present': 'The page has one canonical link',
  'page.h1.missing': 'The page has no main heading (h1)',
  'page.h1.why':
    'A main heading tells visitors, including people using screen readers, what the page is about.',
  'page.h1.multiple': 'The page has {count} main headings (h1)',
  'page.h1.multiple.summary':
    'That’s allowed. Still, one main heading usually makes the structure clearer.',
  'page.headings.skipped': 'Heading levels skip from h{from} to h{to}',
  'page.headings.skipped.summary':
    'Many screen reader users move through a page by its headings. A skipped level can suggest that content is missing.',
  'page.headings.empty': '{count, plural, one {# heading is} other {# headings are}} empty',
  'page.headings.empty.summary': 'Screen readers announce empty headings, but they say nothing.',
  'page.headings.ok':
    '{count, plural, one {The heading forms} other {The # headings form}} a clear outline',
  'page.images.missing-alt':
    '{count, plural, one {# image has} other {# images have}} no text alternative',
  'page.images.missing-alt.summary':
    'Screen readers can’t describe these images, and search engines understand them less well. Describe each image in its alt attribute, or use an empty alt for purely decorative images.',
  'page.images.ok':
    '{count, plural, one {The image has} other {All # images have}} a text alternative',
  'page.links.unnamed': '{count, plural, one {# link has} other {# links have}} no text',
  'page.links.unnamed.summary':
    'Screen readers announce these links without saying where they go. Add visible text, or an aria-label for icon links.',
  'page.links.javascript':
    '{count, plural, one {# link runs} other {# links run}} JavaScript instead of pointing to an address',
  'page.links.javascript.summary':
    'Search engines can’t follow these links. Put a real address in each link’s href.',
  'page.links.summary':
    'The page links to {total, plural, one {# address} other {# addresses}}: {internal} on this site and {external} elsewhere',
  'page.links.nofollow': '{count, plural, one {# link is} other {# links are}} marked nofollow.',
  'page.structured-data.invalid':
    '{count, plural, one {# structured data block can’t be read} other {# structured data blocks can’t be read}}',
  'page.structured-data.invalid.summary':
    'Search engines ignore structured data that isn’t valid JSON.',
  'page.structured-data.found': 'The page has structured data: {types}',
  'page.structured-data.untyped': 'The page has structured data without a type',
  'page.structured-data.found.summary':
    'We checked that it can be read. Google’s Rich Results Test shows whether it qualifies for rich results.',
  'page.hreflang.invalid': 'Some language annotations use invalid codes: {values}',
  'page.hreflang.invalid.summary':
    'Use language codes such as en, en-GB or zh-Hans, or x-default. The code for the United Kingdom is GB, not UK.',
  'page.hreflang.no-self': 'The language annotations don’t include this page',
  'page.hreflang.no-self.summary':
    'Each language version should list itself as well as the others.',
  'page.hreflang.ok':
    'The page lists {count, plural, one {# language version} other {# language versions}}',
  'page.hreflang.limit':
    'We can only check this page. Every page it lists must link back to it, or search engines ignore the annotations.',
  'page.charset.missing': 'The page doesn’t declare its character encoding',
  'page.charset.missing.summary':
    'Unless the server declares it, browsers may guess wrong and garble characters. Add <meta charset="utf-8"> at the start of the head.',
  'page.charset.legacy': 'The page uses the {value} character encoding',
  'page.charset.legacy.summary': 'UTF-8 is recommended for the web; it covers every language.',
  'page.charset.ok': 'The page declares UTF-8 encoding',
  'page.social.missing': 'Link previews may be incomplete: {tags} missing',
  'page.social.missing.summary':
    'Social networks and chat apps use Open Graph tags to build link previews. They don’t affect search rankings.',
  'page.social.ok': 'The page has link preview tags',

  // AI mention log
  'mentions.kind.citation': 'Cited with a link',
  'mentions.kind.mention': 'Named without a link',
  'mentions.method.own-check': 'I asked the assistant myself',
  'mentions.method.shared-with-me': 'Someone shared it with me',
  'mentions.method.screenshot': 'From a screenshot',
  'mentions.method.other': 'Another way',
  'mentions.certainty.confirmed': 'Confirmed',
  'mentions.certainty.uncertain': 'Uncertain',
  'mentions.error.required': 'This is required.',
  'mentions.error.too-long': 'Use at most {max} characters.',
  'mentions.error.invalid-url': 'Enter a full web address that starts with https:// or http://.',
  'mentions.error.invalid-date': 'Enter a valid date.',
  'mentions.error.future-date': 'The date can’t be in the future.',
  'mentions.error.invalid-choice': 'Choose one of the options.',
  'mentions.limit.scope':
    'These are the mentions you recorded. They show where you have seen your site, not how often AI assistants mention it overall.',

  // Diagnostics: files
  'diagnostic.input.empty': 'This file is empty.',
  'diagnostic.input.too-large': 'This file is too large. Files can be up to {megabytes} MB.',
  'diagnostic.input.binary':
    'This isn’t a text file. Choose a CSV file, or the ZIP file Search Console downloads.',
  'diagnostic.input.spreadsheet':
    'This is a spreadsheet workbook. Save it as CSV, or use the original ZIP file from Search Console.',
  'diagnostic.input.unsupported-type': 'This type of file isn’t supported.',
  'diagnostic.encoding.legacy-fallback':
    'This file isn’t saved as UTF-8, so we read it as {encoding}. If letters look wrong, export the file again from Search Console without opening it in a spreadsheet first.',
  'diagnostic.encoding.utf16-without-bom':
    'This file uses {encoding} text. We detected it automatically.',
  'diagnostic.csv.no-header': 'This file has no header row.',
  'diagnostic.csv.unterminated-quote': 'A value that starts with a quotation mark never ends.',
  'diagnostic.csv.stray-quote': 'A quotation mark appears inside a value. We kept it as written.',
  'diagnostic.csv.text-after-quote':
    'Text follows a closing quotation mark. We kept it as part of the value.',
  'diagnostic.csv.field-count': 'This row has {actual} values, but the header has {expected}.',
  'diagnostic.csv.too-many-rows': 'This file has more than {limit} rows, the most we can read.',
  'diagnostic.csv.too-many-columns': 'A row has more than {limit} columns, the most we can read.',
  'diagnostic.csv.field-too-long':
    'A value is longer than {limit} characters, the most we can read.',
  'diagnostic.zip.invalid': 'This ZIP file is damaged or incomplete. Try downloading it again.',
  'diagnostic.zip.multi-disk': 'This ZIP file is split into several parts, which isn’t supported.',
  'diagnostic.zip.zip64':
    'This ZIP file uses the ZIP64 format for very large archives, which isn’t supported.',
  'diagnostic.zip.encrypted':
    'This ZIP file is password-protected. Use an export without a password.',
  'diagnostic.zip.unsupported-method':
    '“{entry}” in this ZIP file uses a compression method we can’t read.',
  'diagnostic.zip.too-many-entries': 'This ZIP file contains more than {limit} files.',
  'diagnostic.zip.entry-too-large':
    '“{entry}” in this ZIP file is larger than {megabytes} MB when unpacked.',
  'diagnostic.zip.total-too-large': 'This ZIP file unpacks to more than {megabytes} MB.',
  'diagnostic.zip.suspicious-ratio':
    '“{entry}” in this ZIP file is compressed so much that unpacking it may be unsafe, so we stopped.',
  'diagnostic.zip.overlapping-entries':
    'The files in this ZIP archive overlap, a sign of a damaged or unsafe archive, so we stopped.',
  'diagnostic.zip.corrupt-entry': '“{entry}” in this ZIP file is damaged.',
  'diagnostic.zip.checksum-mismatch': '“{entry}” in this ZIP file failed its integrity check.',
  'diagnostic.zip.no-csv': 'This ZIP file contains no CSV files.',

  // Diagnostics: Search Console exports
  'diagnostic.gsc.no-tables': 'We couldn’t find Search Console data in the files you chose.',
  'diagnostic.gsc.unrecognized-table':
    'This file doesn’t look like a Search Console performance export.',
  'diagnostic.gsc.duplicate-table':
    'You chose more than one {kind, select, date {Dates} query {Queries} page {Pages} country {Countries} device {Devices} searchAppearance {Search appearance} other {matching}} table. We used the first.',
  'diagnostic.gsc.columns-inferred':
    'We didn’t recognize the column names, so we matched the columns by Search Console’s standard order and checked their values.',
  'diagnostic.gsc.dimension-inferred':
    'We didn’t recognize the first column’s name. {kind, select, date {Its values are dates.} page {Its values are page addresses.} other {We show its values as they are.}}',
  'diagnostic.gsc.missing-columns':
    'This table has no {metric, select, clicks {Clicks} impressions {Impressions} ctr {CTR} position {Position} other {{metric}}} column.',
  'diagnostic.gsc.invalid-number': '“{value}” isn’t a valid number.',
  'diagnostic.gsc.invalid-date': '“{value}” isn’t a valid date.',
  'diagnostic.gsc.ambiguous-dates':
    'We can’t tell whether these dates start with the day or the month. Export the file again from Search Console without editing it.',
  'diagnostic.gsc.mixed-decimal-separators':
    'The column “{column}” mixes decimal points and decimal commas.',
  'diagnostic.gsc.decimal-comma': 'The column “{column}” uses a comma as the decimal separator.',
  'diagnostic.gsc.ctr-as-fraction': 'The column “{column}” gives CTR as a fraction: 0.05 means 5%.',
  'diagnostic.gsc.clicks-exceed-impressions':
    'This row has more clicks ({clicks}) than impressions ({impressions}), which Search Console never reports.',
  'diagnostic.gsc.columns-swapped':
    'Most rows have more clicks than impressions. The two columns may be swapped, so we didn’t use this table.',
  'diagnostic.gsc.ctr-mismatch':
    'On {rows, plural, one {# row} other {# rows}}, CTR doesn’t match clicks divided by impressions. The file may have been edited.',
  'diagnostic.gsc.position-out-of-range':
    '“{value}” isn’t a valid average position. Positions start at 1.',
  'diagnostic.gsc.duplicate-key': '“{key}” appears more than once. We used the first row.',
  'diagnostic.gsc.empty-key': 'This row’s first column is empty, so we skipped it.',
  'diagnostic.gsc.empty-table': 'This table has no rows we could use.',

  // Diagnostics: AI mention logs
  'diagnostic.mentions.invalid-json': 'This file isn’t valid JSON.',
  'diagnostic.mentions.invalid-format': 'This file isn’t a SearchUnveil mention log.',
  'diagnostic.mentions.unsupported-version':
    'This mention log was made by a newer version of SearchUnveil (format {version}).',
  'diagnostic.mentions.too-many': 'This log has more than {limit} mentions, the most we can read.',
  'diagnostic.mentions.invalid-field': 'Entry {index}: “{field}” is missing or invalid.',
  'diagnostic.mentions.duplicate-id': 'Entry {index} repeats an earlier entry. We kept the first.',

  // Diagnostics: page review
  'diagnostic.page.empty': 'Paste a page’s HTML, or choose an HTML file, to review it.',
  'diagnostic.page.too-large':
    'This HTML is longer than {limit} characters, the most we can review.',
  'diagnostic.page.not-html':
    'This doesn’t look like HTML. Paste the page’s source code, not its address.',
  'diagnostic.page.invalid-url':
    '“{value}” isn’t a full web address, so checks that compare links with the page were skipped.',

  'diagnostic.diagnostic.more':
    '…and {count, plural, one {# more like this} other {# more like this}}.',
};

export const en = messages satisfies Readonly<Record<`diagnostic.${DiagnosticCode}`, string>> &
  Readonly<Record<string, string>>;

export type CoreMessageKey = keyof typeof en;

export type CoreCatalog = Readonly<Record<CoreMessageKey, string>>;
