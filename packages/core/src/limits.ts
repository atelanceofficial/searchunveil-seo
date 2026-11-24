/**
 * Explicit input limits.
 *
 * Every file SearchUnveil reads is untrusted, but size alone never turns one away: archives
 * are read from their directory, only the entries an analysis needs are decompressed, and
 * text streams through the parsers instead of being held whole. These limits bound only what
 * must be held in memory at once, and stop pathological inputs (zip bombs, endless rows,
 * gigantic fields) before they exhaust it. Exceeding a limit is always reported, never
 * silently truncated.
 *
 * The defaults are generous for real data: Search Console's own CSV export holds at most
 * 1,000 rows per table and about 16 months of dates.
 */
export interface InputLimits {
  /** Most data rows accepted in one CSV table. */
  readonly maxRows: number;
  /** Most columns accepted in one CSV row. */
  readonly maxColumns: number;
  /** Longest single CSV field accepted, in characters. */
  readonly maxFieldLength: number;
  /** Most entries (files and folders) accepted in one ZIP archive. */
  readonly maxZipEntries: number;
  /** Largest ZIP central directory read, in bytes. It lists every entry, about 100 bytes each. */
  readonly maxZipDirectoryBytes: number;
  /**
   * Largest uncompressed size of one ZIP entry held whole in memory, such as a web page.
   * Entries that are streamed, such as CSV tables, are not bound by it.
   */
  readonly maxZipEntryBytes: number;
  /**
   * Highest compression ratio accepted for entries larger than one mebibyte.
   * Text compresses well, but ratios beyond this are typical of decompression bombs.
   */
  readonly maxZipRatio: number;
  /** Largest HTML document accepted for a page review, in characters. */
  readonly maxHtmlLength: number;
  /** Most AI mentions accepted in one log. */
  readonly maxMentions: number;
}

const MiB = 1024 * 1024;

export const DEFAULT_LIMITS: InputLimits = Object.freeze({
  maxRows: 1_000_000,
  maxColumns: 256,
  maxFieldLength: 32_768,
  maxZipEntries: 1_000_000,
  maxZipDirectoryBytes: 256 * MiB,
  maxZipEntryBytes: 64 * MiB,
  maxZipRatio: 200,
  maxHtmlLength: 64 * MiB,
  maxMentions: 10_000,
});

/** Converts a byte limit to mebibytes for messages people read. */
export function toMegabytes(bytes: number): number {
  return Math.round((bytes / MiB) * 100) / 100;
}

export function resolveLimits(overrides: Partial<InputLimits> = {}): InputLimits {
  return { ...DEFAULT_LIMITS, ...overrides };
}
