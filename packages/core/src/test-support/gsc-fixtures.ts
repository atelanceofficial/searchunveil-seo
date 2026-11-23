/** Builders for realistic Search Console export files used across tests. */

import type { InputFile } from '../gsc/import.ts';
import { createZip } from './zip-writer.ts';

const encoder = new TextEncoder();

export type CsvCellValue = string | number;

export function csvText(
  header: readonly string[],
  rows: readonly (readonly CsvCellValue[])[],
  delimiter = ',',
): string {
  const quote = (value: CsvCellValue) => {
    const text = String(value);
    return text.includes(delimiter) || text.includes('"') || text.includes('\n')
      ? `"${text.replaceAll('"', '""')}"`
      : text;
  };
  return [header, ...rows].map((row) => row.map(quote).join(delimiter)).join('\n') + '\n';
}

/** A CSV file as Search Console writes it: UTF-8 with a byte order mark. */
export function csvFile(
  name: string,
  header: readonly string[],
  rows: readonly (readonly CsvCellValue[])[],
  delimiter = ',',
): InputFile {
  const body = encoder.encode(csvText(header, rows, delimiter));
  const bytes = new Uint8Array(body.length + 3);
  bytes.set([0xef, 0xbb, 0xbf]);
  bytes.set(body, 3);
  return { name, bytes };
}

export const METRIC_HEADERS = ['Clicks', 'Impressions', 'CTR', 'Position'] as const;

export interface DailyValues {
  readonly date: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly position: number;
}

export function percent(clicks: number, impressions: number): string {
  return impressions === 0 ? '0%' : `${((clicks / impressions) * 100).toFixed(2)}%`;
}

/** A `Dates.csv` table. Search Console lists the newest day first. */
export function datesFile(days: readonly DailyValues[]): InputFile {
  return csvFile(
    'Dates.csv',
    ['Date', ...METRIC_HEADERS],
    [...days]
      .reverse()
      .map((d) => [d.date, d.clicks, d.impressions, percent(d.clicks, d.impressions), d.position]),
  );
}

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Daily values with a weekly rhythm: weekdays busier than weekends, as most sites see.
 * `impressionGrowth` and `clickGrowth` scale the most recent `recentDays`.
 */
export function dailySeries(options: {
  readonly start: string;
  readonly days: number;
  readonly clicks: number;
  readonly impressions: number;
  readonly recentDays?: number;
  readonly impressionGrowth?: number;
  readonly clickGrowth?: number;
  readonly position?: number;
}): DailyValues[] {
  const recent = options.recentDays ?? 0;
  return Array.from({ length: options.days }, (_, i) => {
    const date = addDays(options.start, i);
    const weekday = new Date(Date.parse(date)).getUTCDay();
    const rhythm = weekday === 0 || weekday === 6 ? 0.7 : 1.1;
    const isRecent = i >= options.days - recent;
    const wobble = 1 + 0.04 * Math.sin(i * 1.7);
    const impressions = Math.round(
      options.impressions * rhythm * wobble * (isRecent ? (options.impressionGrowth ?? 1) : 1),
    );
    const clicks = Math.min(
      impressions,
      Math.round(
        options.clicks * rhythm * (2 - wobble) * (isRecent ? (options.clickGrowth ?? 1) : 1),
      ),
    );
    return { date, clicks, impressions, position: options.position ?? 8.4 };
  });
}

export function queriesFile(
  rows: readonly (readonly [
    query: string,
    clicks: number,
    impressions: number,
    position: number,
  ])[],
  name = 'Queries.csv',
): InputFile {
  return csvFile(
    name,
    ['Top queries', ...METRIC_HEADERS],
    rows.map(([q, c, i, p]) => [q, c, i, percent(c, i), p]),
  );
}

export function filtersFile(entries: readonly (readonly [string, string])[]): InputFile {
  return csvFile('Filters.csv', ['Filter', 'Value'], entries);
}

export async function zipFile(name: string, files: readonly InputFile[]): Promise<InputFile> {
  return {
    name,
    bytes: await createZip(files.map((f) => ({ name: f.name, data: f.bytes }))),
  };
}
