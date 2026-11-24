import { diagnostic, failure, success, type Diagnostic, type Result } from '../diagnostics.ts';
import {
  finding,
  sortFindings,
  STATUS_ORDER,
  type CoreMessage,
  type Evidence,
  type Finding,
  type FindingStatus,
} from '../findings.ts';
import { code, list, message } from '../i18n/message.ts';
import { resolveLimits, type InputLimits } from '../limits.ts';
import { REFERENCES } from '../references.ts';
import { reviewHttp, type HttpFacts } from './http.ts';
import { extractSnapshot, type Heading, type PageSnapshot } from './snapshot.ts';

/**
 * Reviews one page's HTML for common search and accessibility issues.
 *
 * Every rule here is deterministic and documented in docs/FINDINGS.md. The review only knows
 * the HTML it is given: it says so in its limitations instead of guessing about JavaScript,
 * HTTP headers, robots.txt or anything else it cannot see.
 */

export const PAGE_THRESHOLDS = Object.freeze({
  /** Titles narrower than this (in display units, see `displayWidth`) say too little. */
  titleShort: 10,
  /** Titles wider than this are often shortened in results (roughly 600 pixels). */
  titleLong: 60,
  /** Descriptions wider than this are often shortened in results. */
  descriptionLong: 160,
  /** Most rows listed in one finding. */
  listSize: 10,
});

export interface PageReviewOptions {
  /** The page's address. Optional; it enables checks that compare links with the page. */
  readonly url?: string;
  /** How the server answered, when the page was fetched by its address. */
  readonly http?: HttpFacts;
  readonly limits?: Partial<InputLimits>;
}

/** What the page tells search engines and visitors, as plain facts for an overview. */
export interface PageFacts {
  readonly title: string | null;
  readonly description: string | null;
  readonly lang: string | null;
  readonly canonical: string | null;
  /** The robots directives as written, such as `noindex, follow`; `null` when there are none. */
  readonly robots: string | null;
  /** The page's headings in order; at most {@link FACT_HEADINGS}. */
  readonly headings: readonly Heading[];
  readonly headingCount: number;
  /** Words in the text a visitor reads. */
  readonly words: number;
  readonly images: {
    readonly total: number;
    /** Images that need a text alternative and have none. */
    readonly missingAlt: number;
    /** Images marked as decorative (`alt=""` or hidden). */
    readonly decorative: number;
  };
  readonly links: {
    readonly total: number;
    /** Links within the site: relative, or to the page's own host. */
    readonly internal: number;
    /** Links to other hosts. */
    readonly external: number;
    readonly nofollow: number;
    /** Links with no name a screen reader could announce. */
    readonly unnamed: number;
  };
  /** Schema.org types found in valid JSON-LD. */
  readonly structuredData: readonly string[];
  /** The preview social networks show when the page is shared (Open Graph). */
  readonly social: {
    readonly title: string | null;
    readonly description: string | null;
    readonly image: string | null;
    /** The site's name for link previews (`og:site_name`), often its brand. */
    readonly siteName: string | null;
  };
  /** Language versions the page declares with hreflang. */
  readonly languageVersions: number;
  /** The start of the text a visitor reads, for summaries. */
  readonly textSample: string;
}

/** Most headings an overview lists. */
export const FACT_HEADINGS = 60;

export interface PageReport {
  readonly url: string | null;
  /** The page's title as written, for telling pages apart; `null` when it has none. */
  readonly title: string | null;
  readonly facts: PageFacts;
  /** How the server answered, when the page was fetched by its address; otherwise `null`. */
  readonly http: HttpFacts | null;
  readonly findings: readonly Finding[];
  /** What this review cannot see, stated before it can mislead. */
  readonly limitations: readonly CoreMessage[];
  readonly counts: Readonly<Record<FindingStatus, number>>;
}

/**
 * Parses and reviews HTML. `parse` turns HTML into a `Document`; in a browser, use
 * `DOMParser`, which never runs the page's scripts or loads its resources.
 */
export function reviewHtml(
  html: string,
  parse: (html: string) => Document,
  options: PageReviewOptions = {},
): Result<PageReport> {
  const limits = resolveLimits(options.limits);
  if (html.trim() === '') return failure([diagnostic('page.empty', 'error')]);
  if (html.length > limits.maxHtmlLength) {
    return failure([diagnostic('page.too-large', 'error', { limit: limits.maxHtmlLength })]);
  }
  if (!/<[a-z!]/i.test(html)) return failure([diagnostic('page.not-html', 'error')]);

  const diagnostics: Diagnostic[] = [];
  let url: string | null = null;
  if (options.url !== undefined && options.url.trim() !== '') {
    url = normalizeUrl(options.url.trim());
    if (url === null)
      diagnostics.push(diagnostic('page.invalid-url', 'warning', { value: options.url }));
  }
  return success(reviewSnapshot(extractSnapshot(parse(html), url), options.http), diagnostics);
}

export function reviewSnapshot(snapshot: PageSnapshot, http?: HttpFacts): PageReport {
  const findings = sortFindings([
    ...(http === undefined ? [] : reviewHttp(http)),
    ...headRules(snapshot),
    ...robotsRules(snapshot, http !== undefined),
    ...titleRules(snapshot),
    ...descriptionRules(snapshot),
    ...languageRules(snapshot),
    ...viewportRules(snapshot),
    ...canonicalRules(snapshot),
    ...headingRules(snapshot),
    ...imageRules(snapshot),
    ...linkRules(snapshot),
    ...structuredDataRules(snapshot),
    ...hreflangRules(snapshot),
    ...charsetRules(snapshot),
    ...socialRules(snapshot),
  ]);
  const counts = Object.fromEntries(
    STATUS_ORDER.map((status) => [status, findings.filter((f) => f.status === status).length]),
  ) as Record<FindingStatus, number>;
  const facts = pageFacts(snapshot);
  return {
    url: snapshot.url,
    title: facts.title,
    facts,
    http: http ?? null,
    findings,
    limitations:
      http === undefined
        ? [message('page.limit.source'), message('page.limit.scope')]
        : [message('page.limit.fetched'), message('page.limit.scope.fetched')],
    counts,
  };
}

/** The facts an overview shows, read from the same snapshot the rules use. */
export function pageFacts(snapshot: PageSnapshot): PageFacts {
  const first = (values: PageSnapshot['titles']) => {
    const value = (values.find((v) => v.inHead) ?? values[0])?.value.trim() ?? '';
    return value === '' ? null : value;
  };
  const pageHost = hostOf(snapshot.url);
  let internal = 0;
  let external = 0;
  for (const link of snapshot.links) {
    if (/^(mailto|tel|javascript|data):/i.test(link.href)) continue;
    const host =
      /^[a-z][a-z0-9+.-]*:/i.test(link.href) || link.href.startsWith('//')
        ? hostOf(link.href.startsWith('//') ? `https:${link.href}` : link.href)
        : pageHost;
    if (host === null || host === pageHost) internal++;
    else external++;
  }
  const og = (name: string) => {
    const value = snapshot.openGraph[name]?.trim() ?? '';
    return value === '' ? null : value;
  };
  const robots = snapshot.robots
    .map((r) => (r.name === 'robots' ? r.content : `${r.name}: ${r.content}`))
    .filter((value) => value.trim() !== '')
    .join('; ');
  const lang = snapshot.lang?.trim() ?? '';
  return {
    title: first(snapshot.titles),
    description: first(snapshot.descriptions),
    lang: lang === '' ? null : lang,
    canonical: first(snapshot.canonicals),
    robots: robots === '' ? null : robots,
    headings: snapshot.headings.slice(0, FACT_HEADINGS),
    headingCount: snapshot.headings.length,
    words: snapshot.words,
    images: {
      total: snapshot.images.length,
      missingAlt: snapshot.images.filter((i) => i.alt === null && !i.hidden).length,
      decorative: snapshot.images.filter((i) => i.alt === '' || i.hidden).length,
    },
    links: {
      total: snapshot.links.length,
      internal,
      external,
      nofollow: snapshot.links.filter((l) => l.nofollow).length,
      unnamed: snapshot.links.filter((l) => l.name === '').length,
    },
    structuredData: [...new Set(snapshot.structuredData.flatMap((block) => block.types))],
    social: {
      title: og('og:title'),
      description: og('og:description'),
      image: og('og:image'),
      siteName: og('og:site_name'),
    },
    languageVersions: snapshot.alternates.length,
    textSample: snapshot.textSample,
  };
}

function hostOf(url: string | null): string | null {
  if (url === null) return null;
  try {
    return new URL(url).host.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Reads a web address the way people type it, such as `example.com` or `www.example.com/shop`,
 * adding `https://` when no scheme is given. Returns the normalized address, or `null` when the
 * text cannot be a website's address (single words such as `localhost` are not).
 */
export function siteAddress(input: string): string | null {
  const text = input.trim();
  if (text === '' || /\s/.test(text)) return null;
  const absolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(text)
    ? text
    : `https://${text.replace(/^\/+/, '')}`;
  const url = normalizeUrl(absolute);
  if (url === null) return null;
  const host = new URL(url).hostname;
  return host.includes('.') || host.startsWith('[') ? url : null;
}

/** An absolute http(s) URL without credentials, normalized; otherwise `null`. */
export function normalizeUrl(value: string, base?: string): string | null {
  try {
    const url = new URL(value, base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username !== '' || url.password !== '') return null;
    return url.href;
  } catch {
    return null;
  }
}

const WIDE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303F\uFF01-\uFF60\uFFE0-\uFFE6]/u;

/**
 * Approximate display width: East Asian wide characters take about twice the space of
 * Latin letters, so counting characters alone would misjudge Chinese titles.
 */
export function displayWidth(text: string): number {
  let width = 0;
  for (const character of text) width += WIDE.test(character) ? 2 : 1;
  return width;
}

function textEvidence(label: CoreMessage, value: string): Evidence {
  return { label, value: code(value) };
}

// ---------------------------------------------------------------------------------------------

function headRules(page: PageSnapshot): Finding[] {
  if (page.misplaced.length === 0) {
    return [finding({ rule: 'page.head', status: 'good', title: message('page.head.ok') })];
  }
  const evidence: Evidence[] =
    page.headBreaker === null
      ? []
      : [textEvidence(message('evidence.head-breaker'), page.headBreaker)];
  const table = {
    columns: [{ label: message('table.tag'), numeric: false }],
    rows: page.misplaced.slice(0, PAGE_THRESHOLDS.listSize).map((tag) => [code(tag)]),
  };
  if (page.headEndsWithNoscript) {
    return [
      finding({
        rule: 'page.head',
        status: 'review',
        title: message('page.head.noscript', { count: page.misplaced.length }),
        summary: message('page.head.noscript.summary'),
        evidence,
        table,
        nextChecks: [message('page.check.noscript')],
        references: [REFERENCES.validMetadata],
      }),
    ];
  }
  return [
    finding({
      rule: 'page.head',
      status: 'attention',
      title: message('page.head.broken', { count: page.misplaced.length }),
      summary: message('page.head.broken.summary', { count: page.misplaced.length }),
      evidence,
      table,
      nextChecks: [message('page.check.head')],
      references: [REFERENCES.validMetadata],
    }),
  ];
}

function robotsRules(page: PageSnapshot, fetched: boolean): Finding[] {
  const findings: Finding[] = [];
  const directives = page.robots.filter((r) => r.inHead);
  const evidence = directives.map((r) =>
    textEvidence(message('table.text', { text: r.name }), r.content),
  );
  const all = new Set(
    directives.flatMap((r) =>
      r.content
        .toLowerCase()
        .split(',')
        .map((d) => d.trim()),
    ),
  );
  const has = (directive: string) => all.has(directive) || all.has('none');

  if (has('noindex')) {
    findings.push(
      finding({
        rule: 'page.robots.noindex',
        status: 'attention',
        title: message('page.robots.noindex'),
        summary: message('page.robots.noindex.summary'),
        evidence,
        nextChecks: [message('page.check.robots')],
        references: [REFERENCES.robotsMeta],
      }),
    );
  }
  if (has('nofollow')) {
    findings.push(
      finding({
        rule: 'page.robots.nofollow',
        status: 'review',
        title: message('page.robots.nofollow'),
        summary: message('page.robots.nofollow.summary'),
        evidence,
        references: [REFERENCES.robotsMeta],
      }),
    );
  }
  const limiting = [...all].filter((d) =>
    /^(nosnippet|noimageindex|notranslate|max-snippet:\s*0|unavailable_after:.*)$/.test(d),
  );
  if (limiting.length > 0) {
    findings.push(
      finding({
        rule: 'page.robots.limited',
        status: 'info',
        title: message('page.robots.limited'),
        summary: message('page.robots.limited.summary'),
        evidence,
        references: [REFERENCES.robotsMeta],
      }),
    );
  }
  if (!has('noindex')) {
    findings.push(
      finding({
        rule: 'page.robots.indexable',
        status: 'good',
        title: message('page.robots.indexable'),
        // The summary points to headers and robots.txt, which a fetched page's own findings cover.
        ...(fetched ? {} : { summary: message('page.robots.indexable.summary') }),
      }),
    );
  }
  return findings;
}

function titleRules(page: PageSnapshot): Finding[] {
  const titles = page.titles.filter((t) => t.inHead);
  const why = message('page.title.why');
  const base = { rule: 'page.title', references: [REFERENCES.titleLinks] };
  const first = titles[0];
  if (first === undefined) {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.title.missing'),
        summary: why,
        nextChecks: [message('page.check.title')],
      }),
    ];
  }
  if (titles.length > 1) {
    return [
      finding({
        ...base,
        status: 'review',
        title: message('page.title.multiple', { count: titles.length }),
        summary: message('page.title.multiple.summary'),
        evidence: titles.map((t) => textEvidence(message('evidence.title'), t.value)),
      }),
    ];
  }
  if (first.value === '') {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.title.empty'),
        summary: why,
        nextChecks: [message('page.check.title')],
      }),
    ];
  }
  const width = displayWidth(first.value);
  const evidence = [textEvidence(message('evidence.title'), first.value)];
  if (width < PAGE_THRESHOLDS.titleShort) {
    return [
      finding({
        ...base,
        status: 'review',
        title: message('page.title.short'),
        summary: message('page.title.short.summary'),
        evidence,
        nextChecks: [message('page.check.title')],
      }),
    ];
  }
  if (width > PAGE_THRESHOLDS.titleLong) {
    return [
      finding({
        ...base,
        status: 'review',
        title: message('page.title.long'),
        summary: message('page.title.long.summary', {
          length: width,
          fit: PAGE_THRESHOLDS.titleLong,
        }),
        evidence,
        limitations: [message('page.limit.width')],
      }),
    ];
  }
  return [finding({ ...base, status: 'good', title: message('page.title.ok'), evidence })];
}

function descriptionRules(page: PageSnapshot): Finding[] {
  const descriptions = page.descriptions.filter((d) => d.inHead);
  const base = { rule: 'page.description', references: [REFERENCES.snippets] };
  const first = descriptions[0];
  if (first === undefined || first.value === '') {
    return [
      finding({
        ...base,
        status: 'review',
        title: message(first === undefined ? 'page.description.missing' : 'page.description.empty'),
        summary: message('page.description.why'),
        nextChecks: [message('page.check.description')],
      }),
    ];
  }
  const evidence = [textEvidence(message('evidence.description'), first.value)];
  if (descriptions.length > 1) {
    return [
      finding({
        ...base,
        status: 'review',
        title: message('page.description.multiple', { count: descriptions.length }),
        summary: message('page.description.multiple.summary'),
        evidence: descriptions.map((d) => textEvidence(message('evidence.description'), d.value)),
      }),
    ];
  }
  const width = displayWidth(first.value);
  if (width > PAGE_THRESHOLDS.descriptionLong) {
    return [
      finding({
        ...base,
        status: 'info',
        title: message('page.description.long'),
        summary: message('page.description.long.summary', {
          length: width,
          fit: PAGE_THRESHOLDS.descriptionLong,
        }),
        evidence,
        limitations: [message('page.limit.width')],
      }),
    ];
  }
  return [finding({ ...base, status: 'good', title: message('page.description.ok'), evidence })];
}

function languageRules(page: PageSnapshot): Finding[] {
  const base = { rule: 'page.lang', references: [REFERENCES.wcagLanguage] };
  const value = page.lang?.trim() ?? '';
  if (value === '') {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.lang.missing'),
        summary: message('page.lang.why'),
        nextChecks: [message('page.check.lang')],
      }),
    ];
  }
  if (!isValidLanguageTag(value)) {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.lang.invalid', { value: code(value) }),
        summary: message('page.lang.why'),
        nextChecks: [message('page.check.lang')],
      }),
    ];
  }
  return [
    finding({ ...base, status: 'good', title: message('page.lang.ok', { value: code(value) }) }),
  ];
}

/**
 * A well-formed BCP 47 language tag. "UK" is rejected as a region, a common mistake: the
 * United Kingdom's code is "GB". (ICU quietly maps UK to GB, so the raw tag is checked;
 * "uk" as the first subtag is Ukrainian, which is valid.)
 */
export function isValidLanguageTag(value: string): boolean {
  if (
    value
      .split('-')
      .slice(1)
      .some((subtag) => subtag.toUpperCase() === 'UK')
  )
    return false;
  try {
    const [canonical] = Intl.getCanonicalLocales(value);
    // Primary language subtags of 5 to 8 letters are well-formed but none are registered.
    return canonical !== undefined && /^[a-z]{2,3}$/.test(new Intl.Locale(canonical).language);
  } catch {
    return false;
  }
}

function viewportRules(page: PageSnapshot): Finding[] {
  if (page.viewport === null) {
    return [
      finding({
        rule: 'page.viewport',
        status: 'attention',
        title: message('page.viewport.missing'),
        summary: message('page.viewport.why'),
        nextChecks: [message('page.check.viewport')],
        references: [REFERENCES.viewport],
      }),
    ];
  }
  const settings = new Map(
    page.viewport
      .toLowerCase()
      .split(/[,;]/)
      .map((part) => part.split('=').map((s) => s.trim()))
      .map(([key = '', value = '']) => [key, value] as const),
  );
  const scalable = settings.get('user-scalable');
  const maximum = Number(settings.get('maximum-scale') ?? Number.NaN);
  if (scalable === 'no' || scalable === '0' || (!Number.isNaN(maximum) && maximum < 2)) {
    return [
      finding({
        rule: 'page.viewport',
        status: 'attention',
        title: message('page.viewport.zoom-blocked'),
        summary: message('page.viewport.zoom-blocked.summary'),
        evidence: [textEvidence(message('evidence.viewport'), page.viewport)],
        references: [REFERENCES.wcagResize],
      }),
    ];
  }
  return [finding({ rule: 'page.viewport', status: 'good', title: message('page.viewport.ok') })];
}

function canonicalRules(page: PageSnapshot): Finding[] {
  const canonicals = page.canonicals.filter((c) => c.inHead && c.value !== '');
  const base = { rule: 'page.canonical', references: [REFERENCES.canonical] };
  if (canonicals.length === 0) {
    return [
      finding({
        ...base,
        status: 'info',
        title: message('page.canonical.missing'),
        summary: message('page.canonical.missing.summary'),
      }),
    ];
  }
  const documentBase =
    page.baseHref === null ? page.url : normalizeUrl(page.baseHref, page.url ?? undefined);
  const resolved = canonicals.map((c) => normalizeUrl(c.value, documentBase ?? undefined));
  const distinct = new Set(resolved.map((r, i) => r ?? canonicals[i]?.value));
  const evidence = canonicals.map((c) => textEvidence(message('evidence.canonical'), c.value));

  if (distinct.size > 1) {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.canonical.multiple', { count: distinct.size }),
        summary: message('page.canonical.multiple.summary'),
        evidence,
      }),
    ];
  }
  const raw = canonicals[0]?.value ?? '';
  const target = resolved[0] ?? null;
  const isAbsolute = /^https?:\/\//i.test(raw);
  if (target === null && (isAbsolute || page.url !== null)) {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.canonical.invalid', { href: code(raw) }),
        evidence,
      }),
    ];
  }
  const findings: Finding[] = [];
  if (!isAbsolute) {
    findings.push(
      finding({
        ...base,
        status: 'review',
        title: message('page.canonical.relative'),
        summary: message('page.canonical.relative.summary'),
        evidence,
      }),
    );
  }
  if (page.url !== null && target !== null) {
    const pageUrl = new URL(page.url);
    const targetUrl = new URL(target);
    pageUrl.hash = '';
    targetUrl.hash = '';
    if (targetUrl.host !== pageUrl.host) {
      findings.push(
        finding({
          ...base,
          status: 'review',
          title: message('page.canonical.other-site', { host: code(targetUrl.host) }),
          summary: message('page.canonical.other-site.summary'),
          evidence,
        }),
      );
    } else if (targetUrl.href !== pageUrl.href) {
      findings.push(
        finding({
          ...base,
          status: 'info',
          title: message('page.canonical.other-page'),
          summary: message('page.canonical.other-page.summary'),
          evidence,
        }),
      );
    } else if (isAbsolute) {
      findings.push(
        finding({ ...base, status: 'good', title: message('page.canonical.self'), evidence }),
      );
    }
  } else if (isAbsolute) {
    findings.push(
      finding({ ...base, status: 'good', title: message('page.canonical.present'), evidence }),
    );
  }
  return findings;
}

function headingRules(page: PageSnapshot): Finding[] {
  const findings: Finding[] = [];
  const base = { references: [REFERENCES.wcagStructure] };
  const h1 = page.headings.filter((h) => h.level === 1);
  if (h1.length === 0) {
    findings.push(
      finding({
        ...base,
        rule: 'page.headings.h1',
        status: 'review',
        title: message('page.h1.missing'),
        summary: message('page.h1.why'),
      }),
    );
  } else if (h1.length > 1) {
    findings.push(
      finding({
        ...base,
        rule: 'page.headings.h1',
        status: 'info',
        title: message('page.h1.multiple', { count: h1.length }),
        summary: message('page.h1.multiple.summary'),
        evidence: h1.map((h) => textEvidence(message('evidence.heading'), h.text)),
      }),
    );
  }

  let previous = 0;
  const skip = page.headings.find((h) => {
    const skipped = previous !== 0 && h.level > previous + 1;
    previous = h.level;
    return skipped;
  });
  if (skip !== undefined) {
    const index = page.headings.indexOf(skip);
    const before = page.headings[index - 1];
    findings.push(
      finding({
        ...base,
        rule: 'page.headings.order',
        status: 'review',
        title: message('page.headings.skipped', { from: before?.level ?? 1, to: skip.level }),
        summary: message('page.headings.skipped.summary'),
        evidence: [before, skip]
          .filter((h) => h !== undefined)
          .map((h) => textEvidence(message('evidence.heading-level', { level: h.level }), h.text)),
      }),
    );
  }

  const empty = page.headings.filter((h) => h.text === '').length;
  if (empty > 0) {
    findings.push(
      finding({
        ...base,
        rule: 'page.headings.empty',
        status: 'review',
        title: message('page.headings.empty', { count: empty }),
        summary: message('page.headings.empty.summary'),
      }),
    );
  }
  if (findings.length === 0 && page.headings.length > 0) {
    findings.push(
      finding({
        ...base,
        rule: 'page.headings.order',
        status: 'good',
        title: message('page.headings.ok', { count: page.headings.length }),
      }),
    );
  }
  return findings;
}

function imageRules(page: PageSnapshot): Finding[] {
  const relevant = page.images.filter((image) => !image.hidden);
  if (relevant.length === 0) return [];
  const missing = relevant.filter((image) => image.alt === null);
  const references = [REFERENCES.wcagNonText, REFERENCES.images];
  if (missing.length === 0) {
    return [
      finding({
        rule: 'page.images.alt',
        status: 'good',
        title: message('page.images.ok', { count: relevant.length }),
        references,
      }),
    ];
  }
  return [
    finding({
      rule: 'page.images.alt',
      status: 'attention',
      title: message('page.images.missing-alt', { count: missing.length }),
      summary: message('page.images.missing-alt.summary'),
      table: {
        columns: [{ label: message('table.image'), numeric: false }],
        rows: missing.slice(0, PAGE_THRESHOLDS.listSize).map((image) => [code(image.src)]),
      },
      references,
    }),
  ];
}

function linkRules(page: PageSnapshot): Finding[] {
  const findings: Finding[] = [];
  const unnamed = page.links.filter((link) => link.name === '');
  if (unnamed.length > 0) {
    findings.push(
      finding({
        rule: 'page.links.name',
        status: 'attention',
        title: message('page.links.unnamed', { count: unnamed.length }),
        summary: message('page.links.unnamed.summary'),
        table: {
          columns: [{ label: message('table.link'), numeric: false }],
          rows: unnamed.slice(0, PAGE_THRESHOLDS.listSize).map((link) => [code(link.href)]),
        },
        references: [REFERENCES.wcagLinkPurpose],
      }),
    );
  }
  const scripted = page.links.filter((link) => /^javascript:/i.test(link.href));
  if (scripted.length > 0) {
    findings.push(
      finding({
        rule: 'page.links.crawlable',
        status: 'review',
        title: message('page.links.javascript', { count: scripted.length }),
        summary: message('page.links.javascript.summary'),
        table: {
          columns: [{ label: message('table.link'), numeric: false }],
          rows: scripted.slice(0, PAGE_THRESHOLDS.listSize).map((link) => [code(link.href)]),
        },
        references: [REFERENCES.crawlableLinks],
      }),
    );
  }
  if (page.url !== null) {
    const documentBase =
      page.baseHref === null ? page.url : (normalizeUrl(page.baseHref, page.url) ?? page.url);
    const host = new URL(page.url).host;
    let internal = 0;
    let external = 0;
    for (const link of page.links) {
      const target = normalizeUrl(link.href, documentBase);
      if (target === null) continue;
      if (new URL(target).host === host) internal++;
      else external++;
    }
    const nofollow = page.links.filter((link) => link.nofollow).length;
    findings.push(
      finding({
        rule: 'page.links.summary',
        status: 'info',
        title: message('page.links.summary', { total: internal + external, internal, external }),
        ...(nofollow > 0 ? { summary: message('page.links.nofollow', { count: nofollow }) } : {}),
      }),
    );
  }
  return findings;
}

function structuredDataRules(page: PageSnapshot): Finding[] {
  const findings: Finding[] = [];
  const invalid = page.structuredData.filter((block) => !block.valid).length;
  if (invalid > 0) {
    findings.push(
      finding({
        rule: 'page.structured-data.valid',
        status: 'attention',
        title: message('page.structured-data.invalid', { count: invalid }),
        summary: message('page.structured-data.invalid.summary'),
        references: [REFERENCES.structuredData],
      }),
    );
  }
  const types = [...new Set(page.structuredData.flatMap((block) => block.types))];
  if (page.structuredData.some((block) => block.valid)) {
    findings.push(
      finding({
        rule: 'page.structured-data.types',
        status: 'info',
        title:
          types.length > 0
            ? message('page.structured-data.found', { types: list(types) })
            : message('page.structured-data.untyped'),
        summary: message('page.structured-data.found.summary'),
        references: [REFERENCES.richResultsTest, REFERENCES.structuredData],
      }),
    );
  }
  return findings;
}

function hreflangRules(page: PageSnapshot): Finding[] {
  if (page.alternates.length === 0) return [];
  const base = { rule: 'page.hreflang', references: [REFERENCES.hreflang] };
  const invalid = page.alternates
    .map((a) => a.hreflang)
    .filter((value) => value.toLowerCase() !== 'x-default' && !isValidLanguageTag(value));
  if (invalid.length > 0) {
    return [
      finding({
        ...base,
        status: 'attention',
        title: message('page.hreflang.invalid', { values: list([...new Set(invalid)]) }),
        summary: message('page.hreflang.invalid.summary'),
      }),
    ];
  }
  const findings: Finding[] = [];
  if (page.url !== null) {
    const self = page.url;
    const listsItself = page.alternates.some((a) => normalizeUrl(a.href, self) === self);
    if (!listsItself) {
      findings.push(
        finding({
          ...base,
          status: 'review',
          title: message('page.hreflang.no-self'),
          summary: message('page.hreflang.no-self.summary'),
        }),
      );
    }
  }
  findings.push(
    finding({
      ...base,
      status: 'info',
      title: message('page.hreflang.ok', { count: page.alternates.length }),
      limitations: [message('page.hreflang.limit')],
    }),
  );
  return findings;
}

function charsetRules(page: PageSnapshot): Finding[] {
  if (page.charset === null) {
    return [
      finding({
        rule: 'page.charset',
        status: 'review',
        title: message('page.charset.missing'),
        summary: message('page.charset.missing.summary'),
      }),
    ];
  }
  if (!/^utf-?8$/i.test(page.charset.trim())) {
    return [
      finding({
        rule: 'page.charset',
        status: 'info',
        title: message('page.charset.legacy', { value: code(page.charset) }),
        summary: message('page.charset.legacy.summary'),
      }),
    ];
  }
  return [finding({ rule: 'page.charset', status: 'good', title: message('page.charset.ok') })];
}

const SOCIAL_TAGS = ['og:title', 'og:description', 'og:image'] as const;

function socialRules(page: PageSnapshot): Finding[] {
  const missing = SOCIAL_TAGS.filter((tag) => (page.openGraph[tag] ?? '') === '');
  if (missing.length === 0) {
    return [finding({ rule: 'page.social', status: 'good', title: message('page.social.ok') })];
  }
  return [
    finding({
      rule: 'page.social',
      status: 'info',
      title: message('page.social.missing', { tags: list(missing) }),
      summary: message('page.social.missing.summary'),
      references: [REFERENCES.openGraph],
    }),
  ];
}
