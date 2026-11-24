import { robotsAddress, type HttpFacts } from '../audit/http.ts';
import { isValidLanguageTag, type PageFacts, type PageReport } from '../audit/review.ts';
import type { CoreMessage, Evidence, Finding, FindingStatus } from '../findings.ts';
import type { CoreMessageKey } from '../i18n/catalogs/en.ts';
import type { Translator } from '../i18n/format.ts';
import { code, decimal, list, message, text, type MessageParams } from '../i18n/message.ts';
import { keyPhrases, mentions, type Phrase } from './keywords.ts';
import {
  baseLanguage,
  detectLanguage,
  sentences,
  tokenize,
  type DetectedLanguage,
} from './language.ts';
import { brandOf, descriptionIdeas, fold, isGeneric, subjectOf, titleIdeas } from './suggest.ts';

/**
 * SearchUnveil Analyst: our own analysis engine. It reads a finished page review, the page's text
 * and the server's answer, and turns them into a plan: what to change first, why, exactly how,
 * and on what evidence, with title and description ideas made from the page's own words.
 *
 * It is not a language model. It is a set of documented rules and text statistics, so it runs on
 * the person's device in an instant, costs nothing, gives the same answer every time, and never
 * states anything the review doesn't show. Its output is messages, translated like findings.
 */

export type AnalysisVerdict = 'strong' | 'fair' | 'weak';
export type AnalysisLevel = 'high' | 'medium' | 'low';

/** One change in the plan, in the reader's language. */
export interface AnalysisPriority {
  readonly title: string;
  /** Why it matters for this page, in plain words. */
  readonly why: string;
  /** Exactly what to do; code to use is marked with backticks. */
  readonly how: string;
  /** The facts from the review that show it. */
  readonly evidence: string;
  readonly impact: AnalysisLevel;
  readonly effort: AnalysisLevel;
}

/** The analysis as the interface shows it: every message rendered in the reader's language. */
export interface PageAnalysis {
  readonly summary: string;
  readonly verdict: AnalysisVerdict;
  /** The most important changes first. */
  readonly priorities: readonly AnalysisPriority[];
  /** Better titles, in the page's own language. */
  readonly titleSuggestions: readonly string[];
  /** Better meta descriptions, in the page's own language. */
  readonly descriptionSuggestions: readonly string[];
  readonly contentNotes: readonly string[];
  readonly technicalNotes: readonly string[];
  /** What this analysis cannot know. */
  readonly caveats: readonly string[];
}

export const ANALYST_NAME = 'SearchUnveil Analyst';
export const ANALYST_VERSION = '1.0';

export interface AnalystAction {
  /** The kind of change, such as `title` or `https`. */
  readonly id: string;
  /** The finding rule it answers, when it answers one. */
  readonly rule: string | null;
  readonly title: CoreMessage;
  readonly why: CoreMessage | null;
  readonly how: CoreMessage;
  readonly evidence: readonly Evidence[];
  readonly impact: AnalysisLevel;
  readonly effort: AnalysisLevel;
}

export interface AnalystReport {
  readonly verdict: AnalysisVerdict;
  /** Whether search engines are told not to show the page, or can't reach it. */
  readonly blocked: boolean;
  readonly counts: Readonly<Record<FindingStatus, number>>;
  /** The language the page declares, and the one its text is written in. */
  readonly language: { readonly declared: string | null; readonly detected: string | null };
  /** What the page is mainly about, in its own words. */
  readonly topic: string | null;
  /** The most important changes first; at most {@link MAX_ACTIONS}. */
  readonly actions: readonly AnalystAction[];
  readonly titleIdeas: readonly string[];
  readonly descriptionIdeas: readonly string[];
  readonly contentNotes: readonly CoreMessage[];
  readonly technicalNotes: readonly CoreMessage[];
  readonly caveats: readonly CoreMessage[];
}

export const MAX_ACTIONS = 7;

/** Thresholds for the analyst's own checks; documented in docs/FINDINGS.md. */
export const ANALYST_THRESHOLDS = Object.freeze({
  /** Fewer words than this: the page should say more (an action). */
  thinAction: 150,
  /** Fewer words than this: a note that the text is short. */
  thinNote: 300,
  /** Average words per sentence above this: a note on long sentences. */
  longSentences: 25,
  /** Language detection must be at least this sure before a mismatch is reported. */
  languageConfidence: 0.6,
  /** Seconds for the HTML to arrive before it counts as slow. */
  slowSeconds: 1.5,
  /** Uncompressed HTML above this many kilobytes should be compressed. */
  compressKilobytes: 30,
  /** HTML above this many kilobytes is heavy. */
  heavyKilobytes: 1024,
  /** Descriptions narrower than this have room for more. */
  shortDescription: 70,
});

const LEVEL = { high: 3, medium: 2, low: 1 } as const;

/** Findings that keep a page out of search results or out of reach of crawlers. */
const BLOCKING = new Set([
  'page.robots.noindex',
  'http.x-robots-tag',
  'http.robots-txt',
  'http.status',
]);

interface Context {
  readonly report: PageReport;
  readonly facts: PageFacts;
  readonly http: HttpFacts | null;
  /** The address of the page: where the server ended up, or the one given. */
  readonly address: string | null;
  readonly titleIdeas: readonly string[];
  readonly descriptionIdeas: readonly string[];
  readonly subject: string | null;
  readonly detected: DetectedLanguage | null;
}

export function analyzePage(report: PageReport): AnalystReport {
  const { facts, http } = report;
  const declared = facts.lang !== null && isValidLanguageTag(facts.lang) ? facts.lang : null;
  const detected = detectLanguage(facts.textSample);
  const sureDetection =
    detected !== null && detected.confidence >= ANALYST_THRESHOLDS.languageConfidence
      ? detected
      : null;
  // Words are read in the language the text is written in, whatever the page declares.
  const language = sureDetection?.code ?? baseLanguage(declared) ?? detected?.code ?? null;
  const h1 = facts.headings.find((heading) => heading.level === 1)?.text ?? null;
  const phrases = keyPhrases(
    [
      { text: facts.title ?? '', weight: 3 },
      { text: h1 ?? '', weight: 3 },
      // The link-preview title often names the page better than a generic title does.
      { text: facts.social.title ?? '', weight: 2 },
      {
        text: facts.headings
          .filter((heading) => heading.level === 2)
          .map((heading) => heading.text)
          .join('\n'),
        weight: 2,
      },
      { text: facts.description ?? '', weight: 2 },
      { text: facts.textSample, weight: 1 },
    ],
    language,
  );
  const input = {
    language,
    title: facts.title,
    h1,
    siteName: facts.social.siteName,
    url: http?.finalUrl ?? report.url,
    text: facts.textSample,
    phrases,
  };
  const brand = brandOf(input);
  const topic = phrases.find(
    (phrase) => brand === null || !fold(brand).includes(fold(phrase.text)),
  );
  const context: Context = {
    report,
    facts,
    http,
    address: http?.finalUrl ?? report.url,
    titleIdeas: titleIdeas(input),
    descriptionIdeas: descriptionIdeas(input),
    subject: subjectOf(input, brand),
    detected,
  };

  const actions = new Map<string, AnalystAction>();
  for (const found of report.findings) {
    if (found.status === 'good') continue;
    const action = FROM_FINDINGS[found.rule]?.(found, context) ?? null;
    if (action !== null && !actions.has(action.id)) actions.set(action.id, action);
  }
  for (const action of analystActions(context, declared, sureDetection, h1)) {
    if (!actions.has(action.id)) actions.set(action.id, action);
  }
  const ranked = [...actions.values()].sort(
    (a, b) =>
      LEVEL[b.impact] - LEVEL[a.impact] ||
      LEVEL[a.effort] - LEVEL[b.effort] ||
      Number(b.rule !== null) - Number(a.rule !== null),
  );

  const counts = report.counts;
  const blocked = report.findings.some((f) => f.status === 'attention' && BLOCKING.has(f.rule));
  const verdict: AnalysisVerdict =
    blocked || counts.attention >= 3
      ? 'weak'
      : counts.attention >= 1 || counts.review >= 3
        ? 'fair'
        : 'strong';

  return {
    verdict,
    blocked,
    counts,
    language: { declared, detected: detected?.code ?? null },
    topic: topic?.text ?? null,
    actions: ranked.slice(0, MAX_ACTIONS),
    titleIdeas: context.titleIdeas,
    descriptionIdeas: context.descriptionIdeas,
    contentNotes: contentNotes(context, topic ?? null, brand, language),
    technicalNotes: technicalNotes(context),
    caveats: caveats(context, language),
  };
}

type Build = (finding: Finding, context: Context) => AnalystAction | null;

function act(
  id: string,
  finding: Finding | null,
  title: CoreMessage,
  how: CoreMessage,
  impact: AnalysisLevel,
  effort: AnalysisLevel,
  why: CoreMessage | null = finding?.summary ?? null,
  evidence: readonly Evidence[] = finding?.evidence.slice(0, 2) ?? [],
): AnalystAction {
  return { id, rule: finding?.rule ?? null, title, why, how, evidence, impact, effort };
}

const snippet = (value: string) => code(value);

/** The first examples a finding's table lists, such as image addresses. */
function examples(finding: Finding, count = 3): string[] {
  return (finding.table?.rows ?? [])
    .slice(0, count)
    .map((row) => row[0])
    .map((cell) =>
      typeof cell === 'object' && (cell.kind === 'code' || cell.kind === 'text') ? cell.value : '',
    )
    .filter((value) => value !== '');
}

function tableCount(finding: Finding): number {
  const count = finding.title.params?.['count'];
  return typeof count === 'number' ? count : (finding.table?.rows.length ?? 0);
}

function titleSnippet(context: Context): string {
  return `<title>${context.titleIdeas[0] ?? '…'}</title>`;
}

function descriptionSnippet(context: Context): string {
  return `<meta name="description" content="${context.descriptionIdeas[0] ?? '…'}">`;
}

const FROM_FINDINGS: Readonly<Record<string, Build>> = {
  'http.status': (f, c) =>
    act(
      'status',
      f,
      message('analyst.do.status'),
      message('analyst.do.status.how', { status: code(String(c.http?.status ?? '')) }),
      'high',
      'medium',
    ),
  'http.https': (f, c) =>
    act(
      'https',
      f,
      message('analyst.do.https'),
      message('analyst.do.https.how', {
        url: code((c.address ?? 'http://').replace(/^http:/, 'https:')),
      }),
      'high',
      'medium',
    ),
  'http.x-robots-tag': (f, c) =>
    act(
      'header-noindex',
      f,
      message('analyst.do.header-noindex'),
      message('analyst.do.header-noindex.how', {
        header: code(`X-Robots-Tag: ${c.http?.xRobotsTag ?? ''}`),
      }),
      'high',
      'low',
    ),
  'http.robots-txt': (f, c) =>
    act(
      'robots-txt',
      f,
      message('analyst.do.robots-txt'),
      message('analyst.do.robots-txt.how', {
        rule: code(c.http?.robotsTxt?.rule ?? ''),
        path: code(pathOf(c.address)),
      }),
      'high',
      'low',
    ),
  'http.robots-txt.unreadable': (f, c) =>
    act(
      'robots-txt-error',
      f,
      message('analyst.do.robots-txt-error'),
      message('analyst.do.robots-txt-error.how', {
        url: code(c.address === null ? '/robots.txt' : robotsAddress(c.address)),
      }),
      'high',
      'low',
    ),
  'http.redirects': (f, c) =>
    act(
      'redirects',
      f,
      message('analyst.do.redirects'),
      message('analyst.do.redirects.how', { url: code(c.address ?? '') }),
      'medium',
      'low',
    ),
  'page.robots.noindex': (f) =>
    act(
      'noindex',
      f,
      message('analyst.do.noindex'),
      message('analyst.do.noindex.how', {
        snippet: snippet('<meta name="robots" content="index, follow">'),
      }),
      'high',
      'low',
    ),
  'page.robots.nofollow': (f) =>
    act(
      'nofollow',
      f,
      message('analyst.do.nofollow'),
      message('analyst.do.nofollow.how'),
      'low',
      'low',
    ),
  'page.head': (f) =>
    act(
      'head',
      f,
      message('analyst.do.head'),
      message('analyst.do.head.how'),
      f.status === 'attention' ? 'high' : 'low',
      'medium',
    ),
  'page.title': (f, c) => {
    const missing = f.status === 'attention';
    return act(
      missing ? 'title-missing' : 'title',
      f,
      message(missing ? 'analyst.do.title-missing' : 'analyst.do.title'),
      message(missing ? 'analyst.do.title-missing.how' : 'analyst.do.title.how', {
        snippet: snippet(titleSnippet(c)),
      }),
      missing ? 'high' : 'medium',
      'low',
      f.summary ?? message('page.title.why'),
    );
  },
  'page.description': (f, c) =>
    f.status === 'info'
      ? null
      : act(
          'description',
          f,
          message('analyst.do.description'),
          message('analyst.do.description.how', { snippet: snippet(descriptionSnippet(c)) }),
          'medium',
          'low',
        ),
  'page.lang': (f, c) =>
    act(
      'lang',
      f,
      message('analyst.do.lang'),
      message('analyst.do.lang.how', {
        snippet: snippet(`<html lang="${c.detected?.code ?? '…'}">`),
      }),
      'medium',
      'low',
    ),
  'page.viewport': (f) =>
    act(
      'viewport',
      f,
      message('analyst.do.viewport'),
      message('analyst.do.viewport.how', {
        snippet: snippet('<meta name="viewport" content="width=device-width, initial-scale=1">'),
      }),
      'high',
      'low',
    ),
  'page.canonical': (f, c) =>
    f.status === 'info'
      ? null
      : act(
          'canonical',
          f,
          message('analyst.do.canonical'),
          message('analyst.do.canonical.how', {
            snippet: snippet(`<link rel="canonical" href="${c.address ?? 'https://…'}">`),
          }),
          f.status === 'attention' ? 'high' : 'medium',
          'low',
        ),
  'page.headings.h1': (f, c) =>
    f.status === 'info'
      ? null
      : act(
          'h1',
          f,
          message('analyst.do.h1'),
          message('analyst.do.h1.how', { snippet: snippet(`<h1>${c.subject ?? '…'}</h1>`) }),
          'medium',
          'low',
        ),
  'page.headings.order': (f) =>
    act(
      'heading-order',
      f,
      message('analyst.do.heading-order'),
      message('analyst.do.heading-order.how'),
      'low',
      'low',
    ),
  'page.headings.empty': (f) =>
    act(
      'heading-empty',
      f,
      message('analyst.do.heading-empty'),
      message('analyst.do.heading-empty.how'),
      'low',
      'low',
    ),
  'page.images.alt': (f) => {
    const count = tableCount(f);
    return act(
      'alt',
      f,
      message('analyst.do.alt'),
      message('analyst.do.alt.how', { count, examples: list(examples(f)) }),
      'medium',
      count > 10 ? 'medium' : 'low',
    );
  },
  'page.links.name': (f) =>
    act(
      'link-names',
      f,
      message('analyst.do.link-names'),
      message('analyst.do.link-names.how', { count: tableCount(f), examples: list(examples(f)) }),
      'medium',
      'low',
    ),
  'page.links.crawlable': (f) =>
    act(
      'crawlable',
      f,
      message('analyst.do.crawlable'),
      message('analyst.do.crawlable.how'),
      'medium',
      'medium',
    ),
  'page.structured-data.valid': (f) =>
    act(
      'structured-data',
      f,
      message('analyst.do.structured-data'),
      message('analyst.do.structured-data.how'),
      'medium',
      'low',
    ),
  'page.hreflang': (f) =>
    act(
      'hreflang',
      f,
      message('analyst.do.hreflang'),
      message('analyst.do.hreflang.how'),
      'medium',
      'low',
    ),
  'page.charset': (f) =>
    f.status === 'info'
      ? null
      : act(
          'charset',
          f,
          message('analyst.do.charset'),
          message('analyst.do.charset.how', { snippet: snippet('<meta charset="utf-8">') }),
          'low',
          'low',
        ),
  'page.social': (f, c) =>
    act(
      'social',
      f,
      message('analyst.do.social'),
      message('analyst.do.social.how', {
        snippet: snippet(
          [
            `<meta property="og:title" content="${c.facts.title ?? c.titleIdeas[0] ?? '…'}">`,
            `<meta property="og:description" content="${c.facts.description ?? c.descriptionIdeas[0] ?? '…'}">`,
            '<meta property="og:image" content="https://…/preview.jpg">',
          ].join('\n'),
        ),
      }),
      'low',
      'low',
    ),
};

/** Changes the analyst finds on its own, from the page's words and language. */
function analystActions(
  context: Context,
  declared: string | null,
  detected: DetectedLanguage | null,
  h1: string | null,
): AnalystAction[] {
  const found: AnalystAction[] = [];
  const { facts } = context;

  const declaredBase = baseLanguage(declared);
  if (declaredBase !== null && detected !== null && declaredBase !== detected.code) {
    found.push(
      act(
        'language-mismatch',
        null,
        message('analyst.do.language-mismatch'),
        message('analyst.do.language-mismatch.how', {
          declaredLanguage: declaredBase,
          detectedLanguage: detected.code,
          snippet: snippet(`<html lang="${detected.code}">`),
        }),
        'medium',
        'low',
        message('analyst.why.language-mismatch'),
        [
          { label: message('analyst.evidence.declared'), value: code(declared ?? '') },
          { label: message('analyst.evidence.detected'), value: code(detected.code) },
        ],
      ),
    );
  }

  if (h1 !== null && isGeneric(h1) && h1.trim() !== '') {
    found.push(
      act(
        'generic-heading',
        null,
        message('analyst.do.generic-heading'),
        message('analyst.do.generic-heading.how', {
          heading: text(h1.trim()),
          snippet: snippet(`<h1>${context.subject ?? '…'}</h1>`),
        }),
        'medium',
        'low',
        message('analyst.why.generic-heading'),
        [{ label: message('evidence.heading'), value: text(h1.trim()) }],
      ),
    );
  }

  const title = facts.title?.trim() ?? '';
  if (title !== '' && isGeneric(title)) {
    found.push(
      act(
        'title',
        null,
        message('analyst.do.title'),
        message('analyst.do.title.how', { snippet: snippet(titleSnippet(context)) }),
        'high',
        'low',
        message('analyst.why.generic-title', { title: text(title) }),
        [{ label: message('evidence.title'), value: text(title) }],
      ),
    );
  }

  if (facts.words < ANALYST_THRESHOLDS.thinAction) {
    found.push(
      act(
        'thin',
        null,
        message('analyst.do.thin'),
        message('analyst.do.thin.how', { words: facts.words }),
        'medium',
        'medium',
        message('analyst.why.thin'),
        [{ label: message('analyst.evidence.words'), value: facts.words }],
      ),
    );
  }
  return found;
}

const PHONE = /(?:\+|00)\d[\d\s().-]{8,}\d|\b0\d{2,3}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/u;
const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/u;
const PRICE =
  /[$€£₺¥]\s?\d|\d[\d.,]*\s?(?:TL|₺|€|EUR|USD|\$|£|GBP|TRY|CHF|元|ريال|درهم|جنيه)(?![\p{L}])/u;
const BUSINESS_TYPES = /LocalBusiness|Organization|Store|Restaurant|Hotel|Corporation|Person/u;
const OFFER_TYPES = /Product|Offer|Service|Course|Event|Menu/u;

function contentNotes(
  context: Context,
  topic: Phrase | null,
  brand: string | null,
  language: string | null,
): CoreMessage[] {
  const notes: CoreMessage[] = [];
  const { facts } = context;
  const title = facts.title ?? '';
  const h1 = facts.headings.find((heading) => heading.level === 1)?.text ?? '';

  if (topic !== null) {
    const quoted = { topic: text(topic.text) };
    if (title !== '' && !mentions(title, topic, language)) {
      notes.push(message('analyst.note.topic-title', quoted));
    }
    if (h1 !== '' && !isGeneric(h1) && !mentions(h1, topic, language)) {
      notes.push(message('analyst.note.topic-h1', quoted));
    }
    if (facts.description !== null && !mentions(facts.description, topic, language)) {
      notes.push(message('analyst.note.topic-description', quoted));
    }
  }
  if (brand !== null && facts.social.siteName !== null && !fold(title).includes(fold(brand))) {
    notes.push(message('analyst.note.brand', { brand: text(brand) }));
  }
  if (facts.words >= ANALYST_THRESHOLDS.thinAction && facts.words < ANALYST_THRESHOLDS.thinNote) {
    notes.push(message('analyst.note.thin', { words: facts.words }));
  }
  const average = averageSentenceLength(facts.textSample, language);
  if (average !== null && average > ANALYST_THRESHOLDS.longSentences) {
    notes.push(message('analyst.note.long-sentences', { average: Math.round(average) }));
  }
  if (title !== '' && facts.description !== null && fold(title) === fold(facts.description)) {
    notes.push(message('analyst.note.same-title-description'));
  } else if (
    facts.description !== null &&
    facts.description.length < ANALYST_THRESHOLDS.shortDescription
  ) {
    notes.push(message('analyst.note.description-short', { count: facts.description.length }));
  }
  if (facts.headingCount <= 1 && facts.words >= ANALYST_THRESHOLDS.thinNote) {
    notes.push(message('analyst.note.headings-few'));
  }
  if (facts.links.internal === 0 && context.address !== null) {
    notes.push(message('analyst.note.internal-links'));
  }
  return notes;
}

function technicalNotes(context: Context): CoreMessage[] {
  const notes: CoreMessage[] = [];
  const { facts, http } = context;
  const types = facts.structuredData.join(' ');
  if (
    (PHONE.test(facts.textSample) || EMAIL.test(facts.textSample)) &&
    !BUSINESS_TYPES.test(types)
  ) {
    notes.push(message('analyst.note.contact'));
  }
  if (PRICE.test(facts.textSample) && !OFFER_TYPES.test(types)) {
    notes.push(message('analyst.note.prices'));
  }
  if (http !== null) {
    const kilobytes = http.bytes / 1024;
    if (http.elapsedMs / 1000 > ANALYST_THRESHOLDS.slowSeconds) {
      notes.push(message('analyst.note.slow', { seconds: decimal(http.elapsedMs / 1000, 1) }));
    }
    if (http.contentEncoding === null && kilobytes > ANALYST_THRESHOLDS.compressKilobytes) {
      notes.push(message('analyst.note.compression', { kilobytes: Math.round(kilobytes) }));
    }
    if (kilobytes > ANALYST_THRESHOLDS.heavyKilobytes) {
      notes.push(message('analyst.note.heavy', { kilobytes: Math.round(kilobytes) }));
    }
    if (http.finalUrl.startsWith('https:') && !http.hsts) notes.push(message('analyst.note.hsts'));
    if (http.robotsTxt?.found === true && http.robotsTxt.sitemaps.length === 0) {
      notes.push(message('analyst.note.sitemap'));
    }
  }
  return notes;
}

function caveats(context: Context, language: string | null): CoreMessage[] {
  const found: CoreMessage[] = [message('analyst.caveat.scope')];
  if (context.http === null) found.push(message('analyst.caveat.pasted'));
  if (context.facts.words < 50) found.push(message('analyst.caveat.little-text'));
  if (language === null) found.push(message('analyst.caveat.no-language'));
  if (context.titleIdeas.length + context.descriptionIdeas.length > 0) {
    found.push(message('analyst.caveat.ideas'));
  }
  return found;
}

function averageSentenceLength(textSample: string, language: string | null): number | null {
  // Languages without spaces have no words to count this way.
  if (language === null || language === 'zh' || language === 'ja' || language === 'th') return null;
  const real = sentences(textSample, language).filter((s) => /[.!?]$/u.test(s));
  if (real.length < 3) return null;
  const words = real.reduce((sum, s) => sum + tokenize(s, language).length, 0);
  return words / real.length;
}

function pathOf(address: string | null): string {
  if (address === null) return '/';
  try {
    const url = new URL(address);
    return `${url.pathname}${url.search}`;
  } catch {
    return '/';
  }
}

/**
 * The report in the reader's language. Code in steps is marked with backticks; language codes
 * become language names.
 */
export function renderAnalystReport(
  report: AnalystReport,
  translator: Translator<CoreMessageKey>,
): PageAnalysis {
  const languages = new Intl.DisplayNames(translator.locale, { type: 'language' });
  const render = (value: CoreMessage) => {
    const params: Record<string, MessageParams[string]> = {};
    for (const [name, param] of Object.entries(value.params ?? {})) {
      if (typeof param === 'string' && name.endsWith('Language')) {
        params[name] = text(languages.of(param) ?? param);
      } else if (typeof param === 'object' && param.kind === 'code') {
        params[name] = text(`\`${param.value}\``);
      } else if (typeof param === 'object' && param.kind === 'list') {
        // Lists in steps name files and addresses: show each as code.
        params[name] = list(param.values.map((value) => `\`${value}\``));
      } else {
        params[name] = param;
      }
    }
    return translator.message(message(value.key, params));
  };

  const summary: CoreMessage[] = [];
  if (report.blocked) summary.push(message('analyst.summary.blocked'));
  else if (report.verdict === 'weak') {
    summary.push(message('analyst.summary.weak', { count: report.counts.attention }));
  } else if (report.verdict === 'fair') {
    summary.push(
      message('analyst.summary.fair', { count: report.counts.attention + report.counts.review }),
    );
  } else summary.push(message('analyst.summary.strong'));
  if (report.topic !== null)
    summary.push(message('analyst.summary.topic', { topic: text(report.topic) }));
  const first = report.actions[0];
  const summaryText = [
    ...summary.map(render),
    first === undefined
      ? render(message('analyst.summary.done'))
      : render(message('analyst.summary.start', { action: text(render(first.title)) })),
  ].join(' ');

  return {
    summary: summaryText,
    verdict: report.verdict,
    priorities: report.actions.map((action) => ({
      title: render(action.title),
      why: action.why === null ? '' : render(action.why),
      how: render(action.how),
      evidence: action.evidence
        .map((item) => `${render(item.label)}: ${translator.value(item.value)}`)
        .join(' · '),
      impact: action.impact,
      effort: action.effort,
    })),
    titleSuggestions: report.titleIdeas,
    descriptionSuggestions: report.descriptionIdeas,
    contentNotes: report.contentNotes.map(render),
    technicalNotes: report.technicalNotes.map(render),
    caveats: report.caveats.map(render),
  };
}
