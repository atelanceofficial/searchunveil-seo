/**
 * Diagnostics describe problems and notes found while reading data a person provided.
 *
 * A diagnostic never carries prose. It carries a stable `code` and the parameters needed
 * to explain it, so every interface can describe it in the reader's own language
 * (see `i18n`) and so tests can assert behaviour without depending on wording.
 */

export type Severity = 'error' | 'warning' | 'info';

export type DiagnosticCode =
  // Input files
  | 'input.empty'
  | 'input.binary'
  | 'input.spreadsheet'
  | 'input.unsupported-type'
  // Text encoding
  | 'encoding.legacy-fallback'
  | 'encoding.utf16-without-bom'
  // CSV structure
  | 'csv.no-header'
  | 'csv.unterminated-quote'
  | 'csv.stray-quote'
  | 'csv.text-after-quote'
  | 'csv.field-count'
  | 'csv.too-many-rows'
  | 'csv.too-many-columns'
  | 'csv.field-too-long'
  // ZIP archives
  | 'zip.invalid'
  | 'zip.multi-disk'
  | 'zip.encrypted'
  | 'zip.unsupported-method'
  | 'zip.too-many-entries'
  | 'zip.entry-too-large'
  | 'zip.suspicious-ratio'
  | 'zip.overlapping-entries'
  | 'zip.corrupt-entry'
  | 'zip.checksum-mismatch'
  | 'zip.no-csv'
  | 'zip.website'
  // Search Console exports
  | 'gsc.no-tables'
  | 'gsc.unrecognized-table'
  | 'gsc.duplicate-table'
  | 'gsc.columns-inferred'
  | 'gsc.dimension-inferred'
  | 'gsc.missing-columns'
  | 'gsc.invalid-number'
  | 'gsc.invalid-date'
  | 'gsc.ambiguous-dates'
  | 'gsc.mixed-decimal-separators'
  | 'gsc.decimal-comma'
  | 'gsc.ctr-as-fraction'
  | 'gsc.clicks-exceed-impressions'
  | 'gsc.columns-swapped'
  | 'gsc.ctr-mismatch'
  | 'gsc.position-out-of-range'
  | 'gsc.duplicate-key'
  | 'gsc.empty-key'
  | 'gsc.empty-table'
  // AI mention logs
  | 'mentions.invalid-json'
  | 'mentions.invalid-format'
  | 'mentions.unsupported-version'
  | 'mentions.too-many'
  | 'mentions.invalid-field'
  | 'mentions.duplicate-id'
  // Page review
  | 'page.empty'
  | 'page.too-large'
  | 'page.not-html'
  | 'page.invalid-url'
  // Site review
  | 'site.no-pages'
  // Aggregation
  | 'diagnostic.more';

export type DiagnosticParams = Readonly<Record<string, string | number>>;

export interface SourceLocation {
  /** Name of the file the diagnostic refers to, when known. */
  readonly file?: string;
  /** 1-based physical line number in a text file. */
  readonly line?: number;
  /** Column name as written in the file, or a 1-based column index. */
  readonly column?: string | number;
}

export interface Diagnostic {
  readonly code: DiagnosticCode;
  readonly severity: Severity;
  readonly params: DiagnosticParams;
  readonly location?: SourceLocation;
}

/**
 * Successful results still carry diagnostics: a file can be read and still deserve a
 * warning (for example, a legacy text encoding). Failed results carry at least one error.
 */
export type Result<T> =
  | { readonly ok: true; readonly value: T; readonly diagnostics: readonly Diagnostic[] }
  | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] };

export function diagnostic(
  code: DiagnosticCode,
  severity: Severity,
  params: DiagnosticParams = {},
  location?: SourceLocation,
): Diagnostic {
  return location === undefined ? { code, severity, params } : { code, severity, params, location };
}

/** Builds a location from whichever parts are known; `undefined` when none are. */
export function locate(
  file?: string,
  line?: number,
  column?: string | number,
): SourceLocation | undefined {
  const location: { file?: string; line?: number; column?: string | number } = {};
  if (file !== undefined) location.file = file;
  if (line !== undefined) location.line = line;
  if (column !== undefined) location.column = column;
  return Object.keys(location).length === 0 ? undefined : location;
}

export function success<T>(value: T, diagnostics: readonly Diagnostic[] = []): Result<T> {
  return { ok: true, value, diagnostics };
}

export function failure<T = never>(diagnostics: readonly Diagnostic[]): Result<T> {
  return { ok: false, diagnostics };
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === 'error');
}

/**
 * Collects diagnostics while limiting repeats. A malformed file can produce the same
 * problem on thousands of rows; people need the first few examples and a count, not a flood.
 */
export class DiagnosticCollector {
  readonly #items: Diagnostic[] = [];
  readonly #counts = new Map<string, number>();
  readonly #maxPerCode: number;

  constructor(maxPerCode = 5) {
    this.#maxPerCode = maxPerCode;
  }

  add(item: Diagnostic): void {
    const key = `${item.code}\u0000${item.location?.file ?? ''}`;
    const seen = (this.#counts.get(key) ?? 0) + 1;
    this.#counts.set(key, seen);
    if (seen <= this.#maxPerCode) this.#items.push(item);
  }

  addAll(items: Iterable<Diagnostic>): void {
    for (const item of items) this.add(item);
  }

  get hasErrors(): boolean {
    return hasErrors(this.#items);
  }

  /** Returns the collected diagnostics followed by a summary for each truncated group. */
  toArray(): Diagnostic[] {
    const result = [...this.#items];
    for (const [key, count] of this.#counts) {
      if (count <= this.#maxPerCode) continue;
      const [code = '', file = ''] = key.split('\u0000');
      const example = this.#items.find((d) => d.code === code && (d.location?.file ?? '') === file);
      result.push(
        diagnostic(
          'diagnostic.more',
          example?.severity ?? 'info',
          { count: count - this.#maxPerCode, code },
          file === '' ? undefined : { file },
        ),
      );
    }
    return result;
  }
}
