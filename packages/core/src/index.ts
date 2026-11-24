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
export {
  blobSource,
  bytesSource,
  chunksOf,
  isWebPage,
  sourceOf,
  type ByteSource,
  type InputFile,
} from './source.ts';
export { formatCsv, type CsvCell, type CsvFormatOptions } from './csv/format.ts';
export {
  CsvReader,
  parseCsv,
  sniffDelimiter,
  type CsvDelimiter,
  type CsvOptions,
  type CsvRecord,
  type CsvTable,
} from './csv/parse.ts';
export { readCsv, type CsvStreamOptions } from './csv/stream.ts';
export {
  chooseTextDecoder,
  decodeText,
  ENCODING_SAMPLE_BYTES,
  legacyEncodingFor,
  type DecodedText,
  type LegacyEncoding,
  type TextDecoderChoice,
  type TextEncoding,
} from './text/decode.ts';
export {
  entryChunks,
  extractEntry,
  isMetadataEntry,
  isZip,
  openZip,
  readZip,
  ZipEntryError,
  type ZipArchive,
  type ZipDirectoryEntry,
  type ZipEntry,
  type ZipEntryOptions,
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
export { importSearchConsole, type SearchConsoleImportOptions } from './gsc/import.ts';
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
  FACT_HEADINGS,
  isValidLanguageTag,
  normalizeUrl,
  PAGE_THRESHOLDS,
  pageFacts,
  reviewHtml,
  reviewSnapshot,
  siteAddress,
  type PageFacts,
  type PageReport,
  type PageReviewOptions,
} from './audit/review.ts';
export { extractSnapshot, TEXT_SAMPLE_LENGTH, type PageSnapshot } from './audit/snapshot.ts';
export { reviewHttp, robotsAddress, type HttpFacts } from './audit/http.ts';
export {
  parseRobots,
  ROBOTS_MAX_CHARS,
  robotsAllows,
  robotsRule,
  type RobotsFile,
  type RobotsGroup,
  type RobotsRule,
} from './audit/robots.ts';
export {
  pageAddress,
  reviewSite,
  sharedFolder,
  type SiteIssue,
  type SitePage,
  type SiteReport,
  type SiteReviewOptions,
  type SkippedPage,
} from './audit/site.ts';

// SearchUnveil Analyst: the built-in analysis engine
export {
  ANALYST_NAME,
  ANALYST_THRESHOLDS,
  ANALYST_VERSION,
  analyzePage,
  MAX_ACTIONS,
  renderAnalystReport,
  type AnalystAction,
  type AnalystReport,
} from './analyst/analyst.ts';
export { detectLanguage, type DetectedLanguage } from './analyst/language.ts';

// Analysis by a language model
export {
  ANALYSIS_EVIDENCE_MAX_CHARS,
  ANALYSIS_MODEL,
  extractJson,
  PAGE_ANALYSIS_SCHEMA,
  PAGE_ANALYSIS_SHAPE,
  pageAnalysisEvidence,
  pageAnalysisInstructions,
  pageAnalysisPrompt,
  pageAnalysisRequest,
  parsePageAnalysis,
  serializePageAnalysis,
  type AnalysisLevel,
  type AnalysisPriority,
  type AnalysisRequest,
  type AnalysisVerdict,
  type PageAnalysis,
} from './ai/page-analysis.ts';

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
  text,
  type Message,
  type MessageParams,
  type ParamValue,
} from './i18n/message.ts';
