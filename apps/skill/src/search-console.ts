import { openAsBlob } from 'node:fs';
import { basename } from 'node:path';
import {
  analyzeSearchConsole,
  dateRange,
  decimal,
  importSearchConsole,
  percent,
  type Diagnostic,
  type SearchConsoleReport,
} from '@searchunveil/core';
import { InputError } from './errors.ts';
import { findingsMarkdown, plain, type MessageKey, type Words } from './text.ts';

/**
 * A Search Console export read on the person's computer: the CSV files or the ZIP that Search
 * Console downloads. Files are read in parts, so their size does not matter.
 */

export interface SearchConsoleResult {
  readonly report: SearchConsoleReport | null;
  readonly diagnostics: readonly Diagnostic[];
}

export async function analyzeExport(paths: readonly string[]): Promise<SearchConsoleResult> {
  const files = await Promise.all(
    paths.map(async (path) => {
      try {
        return { name: basename(path), blob: await openAsBlob(path) };
      } catch {
        throw new InputError(`Cannot read ${path}`);
      }
    }),
  );
  const result = await importSearchConsole(files);
  if (!result.ok) return { report: null, diagnostics: result.diagnostics };
  return { report: analyzeSearchConsole(result.value), diagnostics: result.diagnostics };
}

export function diagnosticsMarkdown(diagnostics: readonly Diagnostic[], t: Words): string {
  return diagnostics
    .map((d) => `- ${t.t(`diagnostic.${d.code}` as MessageKey, d.params)}`)
    .join('\n');
}

export function searchConsoleMarkdown(result: SearchConsoleResult, t: Words): string {
  const parts = [`## ${t.t('ui.gsc.title')}`];
  if (result.diagnostics.length > 0) parts.push(diagnosticsMarkdown(result.diagnostics, t));
  const { report } = result;
  if (report === null) return plain(parts.join('\n\n'));

  const { overview } = report;
  if (overview !== null) {
    const lines = [`### ${t.t('ui.gsc.overview')}`];
    if (overview.dateRange !== null) {
      lines.push(t.value(dateRange(overview.dateRange.start, overview.dateRange.end)));
    }
    lines.push(`- ${t.t('metric.clicks')}: ${t.value(overview.clicks)}`);
    lines.push(`- ${t.t('metric.impressions')}: ${t.value(overview.impressions)}`);
    if (overview.ctr !== null)
      lines.push(`- ${t.t('metric.ctr')}: ${t.value(percent(overview.ctr))}`);
    if (overview.position !== null) {
      lines.push(`- ${t.t('metric.position')}: ${t.value(decimal(overview.position, 1))}`);
    }
    parts.push(lines.join('\n'));
  }
  if (report.headline !== null) parts.push(findingsMarkdown([report.headline], t, 3));
  parts.push(`### ${t.t('ui.gsc.findings')}`);
  parts.push(
    report.findings.length === 0
      ? t.t('ui.gsc.findings.none')
      : findingsMarkdown(report.findings, t, 4),
  );
  if (report.notes.length > 0) {
    parts.push(`### ${t.t('ui.gsc.notes')}`);
    parts.push(findingsMarkdown(report.notes, t, 4));
  }
  return plain(parts.join('\n\n'));
}
