import { diagnostic, failure, success, type Diagnostic, type Result } from '../diagnostics.ts';
import { STATUS_ORDER, type Finding, type FindingStatus } from '../findings.ts';
import { resolveLimits, type InputLimits } from '../limits.ts';
import { isWebPage, sourceOf, type ByteSource, type InputFile } from '../source.ts';
import { decodeText, type LegacyEncoding } from '../text/decode.ts';
import { extractEntry, isMetadataEntry, isZip, openZip } from '../zip/read.ts';
import { normalizeUrl, reviewHtml, type PageReport } from './review.ts';

/**
 * Reviews every page of a site at once: the web pages inside ZIP archives, such as a site's
 * backup or static export, and HTML files chosen directly. Archives of any size work, because
 * only their pages are decompressed, one at a time; images, scripts and everything else are
 * counted but never read. Each page gets exactly the single-page review, and the site report
 * then shows which issues recur, and on how many pages.
 */

export interface SiteReviewOptions {
  /** The site's address, such as `https://example.com/`. Each page's address follows from it. */
  readonly siteUrl?: string;
  /** Encoding assumed for pages that are not UTF-8. */
  readonly legacyEncoding?: LegacyEncoding;
  readonly limits?: Partial<InputLimits>;
  /** Called after each page with the number of pages done and the total. */
  readonly onProgress?: (done: number, total: number) => void;
  /** Stops the review between two pages; the returned promise then rejects with its reason. */
  readonly signal?: AbortSignal;
}

export interface SitePage {
  /** Where the page sits in the site, such as `blog/index.html`. */
  readonly path: string;
  readonly report: PageReport;
}

export interface SiteIssue {
  readonly rule: string;
  readonly status: FindingStatus;
  /** The finding as it appears on the first page that has it. */
  readonly example: Finding;
  /** The pages that have it, in path order. */
  readonly pages: readonly string[];
}

export interface SkippedPage {
  readonly path: string;
  readonly diagnostics: readonly Diagnostic[];
}

export interface SiteReport {
  /** Every reviewed page, the ones with the most to fix first. */
  readonly pages: readonly SitePage[];
  /** Issues that need attention or a closer look, the most widespread first. */
  readonly issues: readonly SiteIssue[];
  /** Findings by status across all pages. */
  readonly counts: Readonly<Record<FindingStatus, number>>;
  /** Pages that could not be reviewed, and why. */
  readonly skipped: readonly SkippedPage[];
  /** Files that are not web pages, such as images, styles and scripts. They are not read. */
  readonly otherFiles: number;
}

interface PageSource {
  readonly path: string;
  readonly load: () => Promise<Result<Uint8Array>>;
}

/** How long the review may keep a browser busy before handing control back, in milliseconds. */
const PAUSE_EVERY_MS = 30;

export async function reviewSite(
  files: readonly InputFile[],
  parse: (html: string) => Document,
  options: SiteReviewOptions = {},
): Promise<Result<SiteReport>> {
  const limits = resolveLimits(options.limits);
  const notes: Diagnostic[] = [];
  const sources: PageSource[] = [];
  let otherFiles = 0;

  for (const file of files) {
    const source = sourceOf(file);
    const head = await source.read(0, 4);
    if (isZip(head)) {
      const archive = await openZip(source, { file: file.name, limits });
      notes.push(...archive.diagnostics);
      if (!archive.ok) continue;
      const entries = archive.value.entries.filter((entry) => !isMetadataEntry(entry.name));
      // A zipped folder puts everything under its own name; the site starts inside it.
      const root = sharedFolder(entries.map((entry) => entry.name));
      for (const entry of entries) {
        if (!isWebPage(entry.name)) {
          otherFiles++;
          continue;
        }
        sources.push({
          path: entry.name.slice(root.length),
          load: () => extractEntry(source, entry, { file: file.name, limits }),
        });
      }
    } else if (isWebPage(file.name)) {
      sources.push({ path: file.name, load: () => readWhole(source, limits) });
    } else {
      otherFiles++;
    }
  }
  if (sources.length === 0) return failure([...notes, diagnostic('site.no-pages', 'error')]);
  sources.sort((a, b) => comparePaths(a.path, b.path));

  let base: string | null = null;
  if (options.siteUrl !== undefined && options.siteUrl.trim() !== '') {
    base = siteBase(options.siteUrl.trim());
    if (base === null) {
      notes.push(diagnostic('page.invalid-url', 'warning', { value: options.siteUrl }));
    }
  }

  const pages: SitePage[] = [];
  const skipped: SkippedPage[] = [];
  let lastPause = Date.now();
  for (const [index, item] of sources.entries()) {
    options.signal?.throwIfAborted();
    const reviewed = await reviewOne(item, base, parse, options, limits);
    if (reviewed.ok) pages.push({ path: item.path, report: reviewed.value });
    else skipped.push({ path: item.path, diagnostics: reviewed.diagnostics });
    options.onProgress?.(index + 1, sources.length);
    // Hand control back now and then, so that a browser page stays responsive.
    if (Date.now() - lastPause > PAUSE_EVERY_MS) {
      await pause();
      lastPause = Date.now();
    }
  }
  options.signal?.throwIfAborted();
  return success(summarize(pages, skipped, otherFiles), notes);
}

async function reviewOne(
  item: PageSource,
  base: string | null,
  parse: (html: string) => Document,
  options: SiteReviewOptions,
  limits: InputLimits,
): Promise<Result<PageReport>> {
  const loaded = await item.load();
  if (!loaded.ok) return failure(loaded.diagnostics);
  const decoded = decodeText(loaded.value, {
    file: item.path,
    ...(options.legacyEncoding === undefined ? {} : { legacyEncoding: options.legacyEncoding }),
  });
  if (!decoded.ok) return failure(decoded.diagnostics);
  const url = base === null ? null : pageAddress(base, item.path);
  return reviewHtml(decoded.value.text, parse, url === null ? { limits } : { url, limits });
}

function summarize(pages: SitePage[], skipped: SkippedPage[], otherFiles: number): SiteReport {
  const counts: Record<FindingStatus, number> = { attention: 0, review: 0, good: 0, info: 0 };
  const issues = new Map<
    string,
    { rule: string; status: FindingStatus; example: Finding; pages: string[] }
  >();
  for (const page of pages) {
    for (const status of STATUS_ORDER) counts[status] += page.report.counts[status];
    for (const found of page.report.findings) {
      if (found.status !== 'attention' && found.status !== 'review') continue;
      // The same rule can say different things (a title that is missing, or too long).
      const key = `${found.status} ${found.rule} ${found.title.key}`;
      let issue = issues.get(key);
      if (issue === undefined) {
        issue = { rule: found.rule, status: found.status, example: found, pages: [] };
        issues.set(key, issue);
      }
      if (issue.pages.at(-1) !== page.path) issue.pages.push(page.path);
    }
  }
  const rank = (status: FindingStatus) => STATUS_ORDER.indexOf(status);
  return {
    pages: [...pages].sort(
      (a, b) =>
        b.report.counts.attention - a.report.counts.attention ||
        b.report.counts.review - a.report.counts.review ||
        comparePaths(a.path, b.path),
    ),
    issues: [...issues.values()].sort(
      (a, b) =>
        rank(a.status) - rank(b.status) ||
        b.pages.length - a.pages.length ||
        a.rule.localeCompare(b.rule),
    ),
    counts,
    skipped,
    otherFiles,
  };
}

async function readWhole(source: ByteSource, limits: InputLimits): Promise<Result<Uint8Array>> {
  // A web page is held whole while it is parsed; beyond this it could not be reviewed anyway.
  if (source.size > limits.maxZipEntryBytes) {
    return failure([diagnostic('page.too-large', 'error', { limit: limits.maxHtmlLength })]);
  }
  return success(await source.read(0, source.size));
}

/** The folder every path starts with, such as `site/`, or an empty string. */
export function sharedFolder(paths: readonly string[]): string {
  const first = paths[0];
  if (first === undefined) return '';
  let shared = '';
  for (;;) {
    const slash = first.indexOf('/', shared.length);
    if (slash === -1) return shared;
    const candidate = first.slice(0, slash + 1);
    // Keep at least the file name of every path.
    if (!paths.every((path) => path.startsWith(candidate) && path.length > candidate.length)) {
      return shared;
    }
    shared = candidate;
  }
}

/** The site's address as a folder, so that page paths resolve inside it. */
function siteBase(value: string): string | null {
  const normalized = normalizeUrl(value);
  if (normalized === null) return null;
  const url = new URL(normalized);
  if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
  url.search = '';
  url.hash = '';
  return url.href;
}

/** A page's address: `blog/index.html` is served as `blog/`, as web servers do. */
export function pageAddress(base: string, path: string): string | null {
  return normalizeUrl(path.replace(/(^|\/)index\.html?$/i, '$1'), base);
}

/** Orders paths so that a folder's own page comes before the pages inside it. */
function comparePaths(a: string, b: string): number {
  const depth = (path: string) => path.split('/').length;
  return depth(a) - depth(b) || a.localeCompare(b, 'en', { numeric: true });
}

function pause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
