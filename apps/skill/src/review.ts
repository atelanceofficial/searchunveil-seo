import {
  analyzePage,
  ANALYST_VERSION,
  decodeText,
  displayWidth,
  renderAnalystReport,
  reviewHtml,
  siteAddress,
  type HttpFacts,
  type PageAnalysis,
  type PageReport,
} from '@searchunveil/core';
import { FetchError, fetchPage } from '../../server/src/fetch-page.ts';
import { parseHtml } from './dom.ts';
import { findingsMarkdown, plain, type Words } from './text.ts';

/**
 * A page review on the person's computer: of a saved HTML file, or of a page fetched by its
 * address. Fetching goes through the server's own fetcher, with the same limits: public
 * addresses only, five redirects at most, 15 seconds and 15 MB, and the site's robots.txt.
 */

export interface ReviewInput {
  /** HTML read from a file, with its address when the person gave one. */
  readonly html?: { readonly bytes: Uint8Array; readonly url?: string };
  /** A page's address, to fetch. */
  readonly address?: string;
}

export class ReviewError extends Error {
  override readonly name = 'ReviewError';
}

export async function reviewPage(input: ReviewInput): Promise<PageReport> {
  let html: string;
  let url: string | undefined;
  let http: HttpFacts | undefined;
  if (input.html !== undefined) {
    const decoded = decodeText(input.html.bytes);
    if (!decoded.ok) throw new ReviewError(decoded.diagnostics.map((d) => d.code).join(', '));
    html = decoded.value.text;
    url = input.html.url;
  } else {
    const address = siteAddress(input.address ?? '');
    if (address === null) throw new ReviewError(`Not a web address: ${input.address ?? ''}`);
    try {
      const page = await fetchPage(address);
      html = page.html;
      http = page.http;
      url = page.http.finalUrl;
    } catch (error) {
      if (error instanceof FetchError)
        throw new ReviewError(`Could not fetch ${address}: ${error.code}`);
      throw error;
    }
  }
  const result = reviewHtml(html, parseHtml, {
    ...(url === undefined ? {} : { url }),
    ...(http === undefined ? {} : { http }),
  });
  if (!result.ok) {
    throw new ReviewError(result.diagnostics.map((d) => d.code).join(', '));
  }
  return result.value;
}

function analysisMarkdown(analysis: PageAnalysis, t: Words): string {
  const parts = [
    `### ${t.t('ui.analyst.title')}`,
    `**${t.t('ui.analysis.verdict', { verdict: analysis.verdict })}**`,
  ];
  if (analysis.summary !== '') parts.push(analysis.summary);
  if (analysis.priorities.length > 0) {
    parts.push(`#### ${t.t('ui.analysis.priorities')}`);
    analysis.priorities.forEach((priority, index) => {
      const lines = [
        `${index + 1}. **${priority.title}** (${t.t('ui.analysis.impact', { level: priority.impact })}; ${t.t('ui.analysis.effort', { level: priority.effort })})`,
      ];
      if (priority.why !== '') lines.push(`   - ${t.t('ui.analysis.why')}: ${priority.why}`);
      lines.push(`   - ${t.t('ui.analysis.how')}: ${priority.how.replace(/\n/g, ' ')}`);
      if (priority.evidence !== '') {
        lines.push(`   - ${t.t('ui.analysis.evidence')}: ${priority.evidence.replace(/\n/g, ' ')}`);
      }
      parts.push(lines.join('\n'));
    });
  }
  const ideas = (
    key: 'ui.analysis.titles' | 'ui.analysis.descriptions',
    items: readonly string[],
  ) => {
    if (items.length === 0) return;
    parts.push(
      [
        `#### ${t.t(key)}`,
        ...items.map(
          (item) =>
            `- ${item} (${t.t('ui.analysis.characters', { count: Math.round(displayWidth(item)) })})`,
        ),
      ].join('\n'),
    );
  };
  ideas('ui.analysis.titles', analysis.titleSuggestions);
  ideas('ui.analysis.descriptions', analysis.descriptionSuggestions);
  const notes = (
    key: 'ui.analysis.content' | 'ui.analysis.technical' | 'ui.analysis.caveats',
    items: readonly string[],
  ) => {
    if (items.length > 0)
      parts.push([`#### ${t.t(key)}`, ...items.map((i) => `- ${i}`)].join('\n'));
  };
  notes('ui.analysis.content', analysis.contentNotes);
  notes('ui.analysis.technical', analysis.technicalNotes);
  notes('ui.analysis.caveats', analysis.caveats);
  parts.push(`_${t.t('ui.analyst.by', { version: ANALYST_VERSION })}_`);
  return parts.join('\n\n');
}

/** The review as Markdown: the analyst's plan first, then every finding. */
export function reviewMarkdown(report: PageReport, t: Words): string {
  const name = report.title ?? report.url ?? '';
  const parts = [`## ${t.t('ui.page.title')}${name === '' ? '' : `: ${name}`}`];
  if (report.url !== null) parts.push(`<${report.url}>`);
  parts.push(analysisMarkdown(renderAnalystReport(analyzePage(report), t), t));
  parts.push(`### ${t.t('ui.gsc.findings')}`);
  parts.push(findingsMarkdown(report.findings, t, 4));
  if (report.limitations.length > 0) {
    parts.push(
      [
        `**${t.t('ui.finding.limits')}**`,
        ...report.limitations.map((m) => `- ${t.message(m)}`),
      ].join('\n'),
    );
  }
  return plain(parts.join('\n\n'));
}
