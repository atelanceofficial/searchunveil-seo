/**
 * @searchunveil/core: SearchUnveil's analysis engine.
 *
 * Everything here runs where it is called, in a browser or in Node.js, without network
 * access and without dependencies. Results are plain data: findings carry message keys and
 * typed parameters, rendered in the reader's language by a `Translator`.
 */

// Results and limits
export {
  DiagnosticCollector,
  diagnostic,
  failure,
  hasErrors,
  locate,
  success,
  type Diagnostic,
  type DiagnosticCode,
  type DiagnosticParams,
  type Result,
  type Severity,
  type SourceLocation,
} from './diagnostics.ts';
export { DEFAULT_LIMITS, resolveLimits, toMegabytes, type InputLimits } from './limits.ts';

// Files
export { formatCsv, type CsvCell, type CsvFormatOptions } from './csv/format.ts';
export {
  parseCsv,
  sniffDelimiter,
  type CsvDelimiter,
  type CsvOptions,
  type CsvRecord,
  type CsvTable,
} from './csv/parse.ts';
export {
  decodeText,
  legacyEncodingFor,
  type DecodedText,
  type LegacyEncoding,
  type TextEncoding,
} from './text/decode.ts';
export {
  extractEntry,
  isZip,
  openZip,
  readZip,
  type ZipArchive,
  type ZipDirectoryEntry,
  type ZipEntry,
} from './zip/read.ts';

// Findings
export {
  finding,
  sortFindings,
  STATUS_ORDER,
  type CoreMessage,
  type Evidence,
  type Finding,
  type FindingStatus,
  type FindingTable,
  type Reference,
} from './findings.ts';
export { REFERENCES } from './references.ts';

// Search Console
export {
  analyzeSearchConsole,
  SEARCH_CONSOLE_THRESHOLDS,
  type Overview,
  type SearchConsoleReport,
} from './gsc/analyze.ts';
export {
  importSearchConsole,
  type InputFile,
  type SearchConsoleImportOptions,
} from './gsc/import.ts';
export {
  EXPORT_ROW_LIMIT,
  findTable,
  type DimensionKind,
  type ExportFilter,
  type MetricName,
  type MetricRow,
  type Metrics,
  type MetricTable,
  type PeriodLabels,
  type SearchConsoleExport,
} from './gsc/model.ts';
export type {
  ComparedMetric,
  Direction,
  MetricChange,
  PeriodComparison,
  PeriodTotals,
} from './analysis/compare.ts';
export type { DailyPoint } from './analysis/series.ts';

// Page review
export {
  displayWidth,
  isValidLanguageTag,
  normalizeUrl,
  PAGE_THRESHOLDS,
  reviewHtml,
  reviewSnapshot,
  type PageReport,
  type PageReviewOptions,
} from './audit/review.ts';
export { extractSnapshot, type PageSnapshot } from './audit/snapshot.ts';

// AI mention log
export {
  ASSISTANT_SUGGESTIONS,
  createMention,
  CSV_COLUMNS as MENTION_CSV_COLUMNS,
  FIELD_LIMITS as MENTION_FIELD_LIMITS,
  isWebAddress,
  MENTION_CERTAINTY,
  MENTION_KINDS,
  MENTION_LOG_FORMAT,
  MENTION_LOG_VERSION,
  MENTION_METHODS,
  mentionsToCsv,
  normalizeDraft,
  parseMentionLog,
  serializeMentionLog,
  summarizeMentions,
  validateMention,
  type AiMention,
  type CountedValue,
  type FieldError,
  type FieldErrorCode,
  type MentionCertainty,
  type MentionDraft,
  type MentionField,
  type MentionKind,
  type MentionMethod,
  type MentionSummary,
} from './mentions/log.ts';

// Languages
export { en as englishCatalog, type CoreCatalog, type CoreMessageKey } from './i18n/catalogs/en.ts';
export { loadCoreCatalog } from './i18n/catalogs/load.ts';
export {
  createTranslator,
  describeMessage,
  isolate,
  MessageSyntaxError,
  parseMessage,
  type MessageShape,
  type Translator,
} from './i18n/format.ts';
export {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_INFO,
  LOCALES,
  matchLocale,
  type Locale,
  type LocaleInfo,
  type TextDirection,
} from './i18n/locales.ts';
export {
  code,
  date,
  dateRange,
  decimal,
  list,
  message,
  percent,
  type Message,
  type MessageParams,
  type ParamValue,
} from './i18n/message.ts';
