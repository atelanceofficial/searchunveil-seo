/**
 * The data model for a Google Search Console performance export.
 *
 * Search Console's four metrics measure different things and are kept apart:
 * - clicks: times someone clicked through to the site from a search result;
 * - impressions: times a link to the site appeared in a search result someone saw;
 * - CTR: clicks divided by impressions;
 * - position: the average topmost position of the site's results (1 is the top).
 */

export type DimensionKind =
  'date' | 'query' | 'page' | 'country' | 'device' | 'searchAppearance' | 'other';

export type MetricName = 'clicks' | 'impressions' | 'ctr' | 'position';

export interface Metrics {
  readonly clicks: number;
  readonly impressions: number;
  /** Clicks divided by impressions, from 0 to 1. `null` without impressions. */
  readonly ctr: number | null;
  /** Average position, where 1 is the top. `null` without impressions or when not exported. */
  readonly position: number | null;
}

export interface MetricRow {
  /** The dimension value: a query, a page URL, a country, or an ISO date (`YYYY-MM-DD`). */
  readonly key: string;
  /** Metrics for the export's main date range. */
  readonly primary: Metrics;
  /** Metrics for the date range it was compared with, in comparison exports. */
  readonly comparison: Metrics | null;
  /** Line in the source file, so findings can point back to their evidence. */
  readonly line: number;
}

/** Date-range labels exactly as the export wrote them, e.g. "Last 28 days". */
export interface PeriodLabels {
  readonly primary: string;
  readonly comparison: string;
}

/**
 * How columns were identified: by their names, or (when names were not recognized) by
 * Search Console's fixed column order, confirmed by the values they contain.
 */
export type ColumnIdentification = 'header' | 'order';

export interface MetricTable {
  readonly kind: DimensionKind;
  /** File the table came from, e.g. `Queries.csv`. */
  readonly file: string;
  /** The dimension column's heading as written in the file. */
  readonly dimensionHeader: string;
  readonly rows: readonly MetricRow[];
  /** Present when the export compares two date ranges. */
  readonly periods: PeriodLabels | null;
  readonly identifiedBy: ColumnIdentification;
  /** Whether the export included an average position column. */
  readonly hasPosition: boolean;
}

/** One row of the export's `Filters.csv`, such as "Search type: Web". */
export interface ExportFilter {
  readonly name: string;
  readonly value: string;
}

export interface SearchConsoleExport {
  readonly tables: readonly MetricTable[];
  readonly filters: readonly ExportFilter[];
  /** Every CSV file that was read, in order. */
  readonly files: readonly string[];
}

export function findTable(data: SearchConsoleExport, kind: DimensionKind): MetricTable | undefined {
  return data.tables.find((table) => table.kind === kind);
}

/** Search Console's performance export lists at most this many rows per table. */
export const EXPORT_ROW_LIMIT = 1000;
