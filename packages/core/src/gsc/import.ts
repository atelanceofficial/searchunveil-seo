import type { CsvRecord, CsvTable } from '../csv/parse.ts';
import { readCsv } from '../csv/stream.ts';
import {
  DiagnosticCollector,
  diagnostic,
  failure,
  locate,
  success,
  type Result,
} from '../diagnostics.ts';
import { resolveLimits, type InputLimits } from '../limits.ts';
import { chunksOf, isWebPage, sourceOf, type ByteSource, type InputFile } from '../source.ts';
import type { LegacyEncoding } from '../text/decode.ts';
import {
  baseName,
  entryChunks,
  isMetadataEntry,
  isZip,
  openZip,
  ZipEntryError,
} from '../zip/read.ts';
import {
  isFilterHeader,
  matchDimension,
  matchMetricHeader,
  planColumns,
  tableKindFromFileName,
  type ColumnPlan,
  type MetricColumn,
} from './columns.ts';
import type {
  DimensionKind,
  ExportFilter,
  MetricName,
  MetricRow,
  MetricTable,
  Metrics,
  SearchConsoleExport,
} from './model.ts';
import {
  decimalPlaces,
  detectDecimalSeparator,
  parseCount,
  parseDateColumn,
  parseDecimal,
  stripPercent,
  type Cell,
  type DecimalSeparator,
} from './values.ts';

export type { InputFile } from '../source.ts';

export interface SearchConsoleImportOptions {
  readonly limits?: Partial<InputLimits>;
  /** Encoding assumed for files that are not UTF-8; choose it from the reader's language. */
  readonly legacyEncoding?: LegacyEncoding;
  /** Order of day and month when dates cannot tell on their own. */
  readonly dateOrder?: 'dmy' | 'mdy';
}

const SPREADSHEET_EXTENSIONS = /\.(xlsx|xlsm|xls|ods|numbers)$/i;
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
/** Share of rows with more clicks than impressions above which columns look swapped. */
const SWAPPED_SHARE = 0.5;
/** Share of rows whose CTR disagrees with clicks ÷ impressions above which we warn. */
const CTR_MISMATCH_SHARE = 0.1;

/** A CSV table to read: from a file chosen directly, or from an entry in an archive. */
interface TableSource {
  readonly name: string;
  readonly open: () => AsyncIterable<Uint8Array>;
}

/** An archive that holds web pages, remembered in case it turns out to hold no export. */
interface WebsiteArchive {
  readonly name: string;
  readonly pages: number;
  readonly files: number;
}

/**
 * Reads the files of a Search Console performance export: the ZIP archive Search Console
 * downloads, or any of the CSV files inside it. Files of any size are accepted: an archive is
 * read from its directory and only its CSV files are decompressed, and every table is decoded
 * and parsed as it streams in. Each file is validated independently; a broken file is
 * reported without discarding the others. The import fails only when no table could be read.
 */
export async function importSearchConsole(
  files: readonly InputFile[],
  options: SearchConsoleImportOptions = {},
): Promise<Result<SearchConsoleExport>> {
  const limits = resolveLimits(options.limits);
  const collector = new DiagnosticCollector();
  const sources: TableSource[] = [];
  const websites: WebsiteArchive[] = [];

  for (const file of files) {
    const where = locate(file.name);
    const source = sourceOf(file);
    const head = await source.read(0, OLE_SIGNATURE.length);
    if (isZip(head)) {
      sources.push(...(await unpackArchive(file.name, source, limits, collector, websites)));
    } else if (SPREADSHEET_EXTENSIONS.test(file.name) || hasOleSignature(head)) {
      collector.add(diagnostic('input.spreadsheet', 'error', {}, where));
    } else {
      sources.push({ name: file.name, open: () => chunksOf(source.stream(0, source.size)) });
    }
  }

  const tables: MetricTable[] = [];
  const filters: ExportFilter[] = [];
  const read: string[] = [];
  for (const file of sources) {
    let csv: Result<CsvTable>;
    try {
      csv = await readCsv(file.open, {
        file: file.name,
        maxRows: limits.maxRows,
        maxColumns: limits.maxColumns,
        maxFieldLength: limits.maxFieldLength,
        ...(options.legacyEncoding === undefined ? {} : { legacyEncoding: options.legacyEncoding }),
      });
    } catch (error) {
      if (!(error instanceof ZipEntryError)) throw error;
      collector.add(error.diagnostic);
      continue;
    }
    collector.addAll(csv.diagnostics);
    if (!csv.ok) continue;
    read.push(file.name);

    const headerFields = csv.value.header.fields.map((h) => h.trim());
    if (isFilterHeader(headerFields) || tableKindFromFileName(file.name) === 'filters') {
      if (headerFields.length === 2) {
        filters.push(...readFilters(csv.value));
        continue;
      }
    }
    const table = readMetricTable(file.name, csv.value, headerFields, options, collector);
    if (table === null) continue;
    if (table.kind !== 'other' && tables.some((t) => t.kind === table.kind)) {
      collector.add(
        diagnostic('gsc.duplicate-table', 'warning', { kind: table.kind }, locate(file.name)),
      );
      continue;
    }
    tables.push(table);
  }

  if (tables.length === 0) {
    // An archive of web pages was probably meant for the page review.
    for (const site of websites) {
      collector.add(
        diagnostic(
          'zip.website',
          'error',
          { pages: site.pages, files: site.files },
          locate(site.name),
        ),
      );
    }
    collector.add(diagnostic('gsc.no-tables', 'error'));
    return failure(collector.toArray());
  }
  return success({ tables, filters, files: read }, collector.toArray());
}

async function unpackArchive(
  name: string,
  source: ByteSource,
  limits: InputLimits,
  collector: DiagnosticCollector,
  websites: WebsiteArchive[],
): Promise<TableSource[]> {
  const where = locate(name);
  const archive = await openZip(source, { file: name, limits });
  collector.addAll(archive.diagnostics);
  if (!archive.ok) return [];
  const entries = archive.value.entries.filter((entry) => !isMetadataEntry(entry.name));
  if (entries.some((entry) => entry.name === '[Content_Types].xml')) {
    // Office documents are ZIP archives too.
    collector.add(diagnostic('input.spreadsheet', 'error', {}, where));
    return [];
  }
  const csvEntries = entries.filter((entry) => entry.name.toLowerCase().endsWith('.csv'));
  const pages = entries.filter((entry) => isWebPage(entry.name)).length;
  if (csvEntries.length === 0) {
    collector.add(
      pages > 0
        ? diagnostic('zip.website', 'error', { pages, files: entries.length }, where)
        : diagnostic('zip.no-csv', 'error', {}, where),
    );
    return [];
  }
  if (pages > 0) websites.push({ name, pages, files: entries.length });
  return csvEntries.map((entry) => ({
    name: baseName(entry.name),
    open: () => entryChunks(source, entry, { file: name, limits }),
  }));
}

function hasOleSignature(bytes: Uint8Array): boolean {
  return OLE_SIGNATURE.every((byte, i) => bytes[i] === byte);
}

function readFilters(csv: CsvTable): ExportFilter[] {
  return csv.records
    .map((record) => ({
      name: (record.fields[0] ?? '').trim(),
      value: (record.fields[1] ?? '').trim(),
    }))
    .filter((filter) => filter.name !== '');
}

function readMetricTable(
  file: string,
  csv: CsvTable,
  header: readonly string[],
  options: SearchConsoleImportOptions,
  collector: DiagnosticCollector,
): MetricTable | null {
  const where = locate(file);
  const planned = planColumns(header);
  if (!planned.ok) {
    if (header.slice(1).some((name) => matchMetricHeader(name) !== null)) {
      for (const metric of planned.missing) {
        collector.add(diagnostic('gsc.missing-columns', 'error', { metric }, where));
      }
    } else {
      collector.add(diagnostic('gsc.unrecognized-table', 'error', {}, where));
    }
    return null;
  }
  const { plan } = planned;
  if (plan.identifiedBy === 'order')
    collector.add(diagnostic('gsc.columns-inferred', 'info', {}, where));

  const records = csv.records;
  const keys = records.map((record) => (record.fields[0] ?? '').trim());
  const kind = resolveKind(file, header[0] ?? '', keys, collector);

  let dateKeys: readonly (string | null)[] | null = null;
  if (kind === 'date') {
    const parsed = parseDateColumn(keys, options.dateOrder);
    if (parsed.ambiguous) {
      collector.add(diagnostic('gsc.ambiguous-dates', 'error', {}, where));
      return null;
    }
    dateKeys = parsed.dates;
  }

  const readers = createMetricReaders(plan, records, header, file, collector);
  if (readers === null) return null;

  const rows: MetricRow[] = [];
  const seen = new Set<string>();
  let swapped = 0;
  let ctrChecked = 0;
  let ctrMismatched = 0;

  records.forEach((record, index) => {
    const at = locate(file, record.line);
    const rawKey = keys[index] ?? '';
    if (rawKey === '') {
      collector.add(diagnostic('gsc.empty-key', 'warning', {}, at));
      return;
    }
    const key = dateKeys === null ? rawKey : dateKeys[index];
    if (key === null || key === undefined) {
      collector.add(diagnostic('gsc.invalid-date', 'error', { value: rawKey }, at));
      return;
    }
    if (seen.has(key)) {
      collector.add(diagnostic('gsc.duplicate-key', 'warning', { key }, at));
      return;
    }
    seen.add(key);
    const primary = readers.read(record, 'primary');
    const comparison = plan.periods === null ? null : readers.read(record, 'comparison');
    if (primary === null || (plan.periods !== null && comparison === null)) return;

    for (const metrics of comparison === null ? [primary] : [primary, comparison]) {
      if (metrics.metrics.clicks > metrics.metrics.impressions) {
        swapped++;
        collector.add(
          diagnostic(
            'gsc.clicks-exceed-impressions',
            'warning',
            { clicks: metrics.metrics.clicks, impressions: metrics.metrics.impressions },
            at,
          ),
        );
      }
      if (metrics.reportedCtr !== null && metrics.metrics.ctr !== null) {
        ctrChecked++;
        if (
          Math.abs(metrics.reportedCtr.value - metrics.metrics.ctr) > metrics.reportedCtr.tolerance
        ) {
          ctrMismatched++;
        }
      }
    }
    rows.push({
      key,
      primary: primary.metrics,
      comparison: comparison?.metrics ?? null,
      line: record.line,
    });
  });

  if (rows.length >= 3 && swapped / rows.length > SWAPPED_SHARE) {
    collector.add(diagnostic('gsc.columns-swapped', 'error', {}, where));
    return null;
  }
  if (ctrChecked >= 3 && ctrMismatched / ctrChecked > CTR_MISMATCH_SHARE) {
    collector.add(diagnostic('gsc.ctr-mismatch', 'warning', { rows: ctrMismatched }, where));
  }
  if (rows.length === 0) {
    collector.add(diagnostic('gsc.empty-table', 'warning', {}, where));
    return null;
  }
  if (kind === 'date') rows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  return {
    kind,
    file,
    dimensionHeader: header[0] ?? '',
    rows,
    periods: plan.periods,
    identifiedBy: plan.identifiedBy,
    hasPosition: plan.metrics.some((column) => column.metric === 'position'),
  };
}

function resolveKind(
  file: string,
  dimensionHeader: string,
  keys: readonly string[],
  collector: DiagnosticCollector,
): DimensionKind {
  const byHeader = matchDimension(dimensionHeader);
  if (byHeader !== null) return byHeader;
  const byFileName = tableKindFromFileName(file);
  if (byFileName !== null && byFileName !== 'filters') return byFileName;

  const sample = keys.filter((key) => key !== '').slice(0, 50);
  let kind: DimensionKind = 'other';
  if (sample.length > 0) {
    const dates = parseDateColumn(sample).dates.filter((d) => d !== null).length;
    const urls = sample.filter((key) => /^https?:\/\/\S+$/i.test(key)).length;
    if (dates / sample.length >= 0.9) kind = 'date';
    else if (urls / sample.length >= 0.9) kind = 'page';
  }
  collector.add(diagnostic('gsc.dimension-inferred', 'info', { kind }, locate(file)));
  return kind;
}

interface ReadMetrics {
  readonly metrics: Metrics;
  /** The CTR the file reported, with the tolerance implied by its rounding. */
  readonly reportedCtr: { readonly value: number; readonly tolerance: number } | null;
}

interface MetricReaders {
  read(record: CsvRecord, period: 'primary' | 'comparison'): ReadMetrics | null;
}

/**
 * Prepares one reader per metric column. Column-wide decisions are made first: the decimal
 * separator of CTR and position columns, and whether CTR is written as a percentage or a
 * fraction.
 */
function createMetricReaders(
  plan: ColumnPlan,
  records: readonly CsvRecord[],
  header: readonly string[],
  file: string,
  collector: DiagnosticCollector,
): MetricReaders | null {
  const where = locate(file);
  const separators = new Map<number, DecimalSeparator>();
  const ctrIsFraction = new Map<number, boolean>();

  for (const column of plan.metrics) {
    if (column.metric !== 'ctr' && column.metric !== 'position') continue;
    const values = records.map((record) => record.fields[column.index] ?? '');
    const separator = detectDecimalSeparator(values);
    const name = header[column.index] ?? String(column.index + 1);
    if (separator === 'mixed') {
      collector.add(diagnostic('gsc.mixed-decimal-separators', 'error', { column: name }, where));
      return null;
    }
    if (separator === ',')
      collector.add(diagnostic('gsc.decimal-comma', 'info', { column: name }, where));
    separators.set(column.index, separator);
    if (column.metric === 'ctr') {
      const stripped = values.map(stripPercent);
      const anyPercent = stripped.some((v) => v.percent);
      const numbers = stripped
        .map((v) => parseDecimal(v.text, separator))
        .filter((v): v is number => typeof v === 'number');
      const fraction = !anyPercent && numbers.length > 0 && numbers.every((v) => v <= 1);
      if (fraction)
        collector.add(diagnostic('gsc.ctr-as-fraction', 'info', { column: name }, where));
      ctrIsFraction.set(column.index, fraction);
    }
  }

  const columnsFor = (period: 'primary' | 'comparison') => {
    const byMetric = new Map<MetricName, MetricColumn>();
    for (const column of plan.metrics)
      if (column.period === period) byMetric.set(column.metric, column);
    return byMetric;
  };
  const periodColumns = { primary: columnsFor('primary'), comparison: columnsFor('comparison') };

  return {
    read(record, period) {
      const columns = periodColumns[period];
      const at = (column: MetricColumn) => locate(file, record.line, header[column.index]);
      const count = (metric: 'clicks' | 'impressions'): number | null => {
        const column = columns.get(metric);
        if (column === undefined) return 0;
        const raw = record.fields[column.index] ?? '';
        const value: Cell = parseCount(raw);
        if (typeof value === 'number') return value;
        // An empty count means "no data" in a comparison period, and is an error otherwise.
        if (value === 'empty' && plan.periods !== null) return 0;
        collector.add(diagnostic('gsc.invalid-number', 'error', { value: raw }, at(column)));
        return null;
      };
      const clicks = count('clicks');
      const impressions = count('impressions');
      if (clicks === null || impressions === null) return null;

      let reportedCtr: ReadMetrics['reportedCtr'] = null;
      const ctrColumn = columns.get('ctr');
      if (ctrColumn !== undefined) {
        const separator = separators.get(ctrColumn.index) ?? '.';
        const raw = record.fields[ctrColumn.index] ?? '';
        const { text } = stripPercent(raw);
        const value = parseDecimal(text, separator);
        if (typeof value === 'number') {
          const scale = ctrIsFraction.get(ctrColumn.index) === true ? 1 : 100;
          const tolerance = (0.5 * 10 ** -decimalPlaces(raw, separator)) / scale + 1e-9;
          reportedCtr = { value: value / scale, tolerance };
        } else if (value === 'invalid') {
          collector.add(diagnostic('gsc.invalid-number', 'warning', { value: raw }, at(ctrColumn)));
        }
      }

      let position: number | null = null;
      const positionColumn = columns.get('position');
      if (positionColumn !== undefined && impressions > 0) {
        const raw = record.fields[positionColumn.index] ?? '';
        const value = parseDecimal(raw, separators.get(positionColumn.index) ?? '.');
        if (typeof value === 'number' && value >= 1) position = value;
        else if (typeof value === 'number') {
          collector.add(
            diagnostic('gsc.position-out-of-range', 'warning', { value: raw }, at(positionColumn)),
          );
        } else if (value === 'invalid') {
          collector.add(
            diagnostic('gsc.invalid-number', 'warning', { value: raw }, at(positionColumn)),
          );
        }
      }

      return {
        metrics: {
          clicks,
          impressions,
          ctr: impressions > 0 ? clicks / impressions : null,
          position,
        },
        reportedCtr,
      };
    },
  };
}
