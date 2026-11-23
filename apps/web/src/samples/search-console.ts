import { formatCsv, type CsvCell, type InputFile } from '@searchunveil/core';
import { addDays, localToday } from '../lib/dates.ts';

/**
 * Fictional sample data for example.com, a domain reserved for examples (RFC 2606).
 *
 * The sample tells the story SearchUnveil was designed around: over the last four weeks the
 * site appeared in search about a quarter more often, while clicks stayed level. It also holds
 * a few opportunities. Values are generated from a fixed seed, so the story never changes;
 * only the dates follow the calendar. The files go through the same import as real exports.
 */

const encoder = new TextEncoder();

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function csvFile(name: string, rows: readonly (readonly CsvCell[])[]): InputFile {
  return { name, bytes: encoder.encode(formatCsv(rows)) };
}

const percentText = (clicks: number, impressions: number) =>
  `${impressions === 0 ? '0' : ((clicks / impressions) * 100).toFixed(2)}%`;

const QUERIES: readonly (readonly [string, number, number, number])[] = [
  ['example outdoor', 1450, 4100, 1.1],
  ['trail running shoes guide', 640, 2900, 2.3],
  ['waterproof hiking boots', 520, 2600, 2.8],
  ['how to choose a sleeping bag', 410, 1700, 1.9],
  ['tent footprint size', 300, 1350, 2.6],
  ['best hiking socks', 60, 2400, 2.4],
  ['ultralight backpack', 210, 2600, 4.4],
  ['rain jacket layering', 180, 2300, 5.1],
  ['trekking poles height', 150, 1900, 4.8],
  ['camping stove fuel', 140, 1700, 5.6],
  ['hiking boots break in', 120, 1500, 5.9],
  ['merino base layer', 12, 1900, 4.9],
  ['headlamp lumens', 70, 1600, 7.8],
  ['water filter hiking', 64, 1400, 8.4],
  ['hiking first aid kit', 52, 1300, 9.2],
  ['bivy vs tent', 40, 1100, 9.7],
  ['trail shoes vs boots', 36, 900, 8.9],
  ['lightweight camping chair', 22, 1800, 11.6],
  ['how to waterproof a tent', 18, 1500, 12.8],
  ['winter hiking checklist', 14, 1300, 14.2],
  ['gaiters for hiking', 9, 800, 16.5],
  ['packable down jacket', 7, 950, 18.9],
  ['mountain weather forecast', 2, 700, 34],
  ['hiking near me', 1, 600, 41.2],
];

const PAGES: readonly (readonly [string, number, number, number])[] = [
  ['https://example.com/', 1500, 4200, 1.2],
  ['https://example.com/guides/trail-running-shoes', 700, 3500, 2.6],
  ['https://example.com/guides/hiking-boots', 640, 4300, 3.5],
  ['https://example.com/guides/sleeping-bags', 430, 2000, 2.1],
  ['https://example.com/guides/tents', 330, 3000, 4.2],
  ['https://example.com/guides/layering', 260, 4400, 5.2],
  ['https://example.com/guides/backpacks', 230, 2900, 4.6],
  ['https://example.com/guides/stoves', 150, 1800, 5.7],
  ['https://example.com/guides/first-aid', 60, 1500, 9],
  ['https://example.com/guides/camp-chairs', 0, 1900, 11.8],
  ['https://example.com/blog/winter-checklist', 0, 1300, 14],
];

export function sampleSearchConsoleFiles(today = localToday()): InputFile[] {
  const random = mulberry32(20_261_123);
  const days = 90;
  const recentDays = 28;
  // Search Console data arrives a few days late.
  const end = addDays(today, -3);
  const start = addDays(end, -(days - 1));

  const dates: CsvCell[][] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const weekday = new Date(Date.parse(date)).getUTCDay();
    const rhythm = weekday === 0 || weekday === 6 ? 0.72 : 1.11;
    const recent = i >= days - recentDays;
    const impressions = Math.round(1800 * rhythm * (0.92 + random() * 0.16) * (recent ? 1.24 : 1));
    const clicks = Math.round(62 * rhythm * (0.92 + random() * 0.16));
    const position = Math.round((recent ? 10 : 9.3) * (0.97 + random() * 0.06) * 10) / 10;
    dates.push([date, clicks, impressions, percentText(clicks, impressions), position]);
  }

  return [
    // Search Console lists the newest day first.
    csvFile('Dates.csv', [
      ['Date', 'Clicks', 'Impressions', 'CTR', 'Position'],
      ...dates.reverse(),
    ]),
    csvFile('Queries.csv', [
      ['Top queries', 'Clicks', 'Impressions', 'CTR', 'Position'],
      ...QUERIES.map(([query, clicks, impressions, position]) => [
        query,
        clicks,
        impressions,
        percentText(clicks, impressions),
        position,
      ]),
    ]),
    csvFile('Pages.csv', [
      ['Top pages', 'Clicks', 'Impressions', 'CTR', 'Position'],
      ...PAGES.map(([page, clicks, impressions, position]) => [
        page,
        clicks,
        impressions,
        percentText(clicks, impressions),
        position,
      ]),
    ]),
    csvFile('Filters.csv', [
      ['Filter', 'Value'],
      ['Search type', 'Web'],
      ['Date', 'Last 3 months'],
    ]),
  ];
}
