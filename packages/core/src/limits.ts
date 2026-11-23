/**
 * Explicit input limits.
 *
 * Every file SearchUnveil reads is untrusted. These limits keep processing predictable on
 * modest devices and stop pathological inputs (zip bombs, endless rows, gigantic fields)
 * before they exhaust memory. Exceeding a limit is always reported, never silently truncated.
 *
 * The defaults are generous for real exports: Search Console's own CSV export holds at most
 * 1,000 rows per table and about 16 months of dates.
 */
export interface InputLimits {
  /** Largest single file accepted, in bytes. */
  readonly maxFileBytes: number;
  /** Most data rows accepted in one CSV table. */
  readonly maxRows: number;
  /** Most columns accepted in one CSV row. */
  readonly maxColumns: number;
  /** Longest single CSV field accepted, in characters. */
  readonly maxFieldLength: number;
  /** Most entries (files and folders) accepted in one ZIP archive. */
  readonly maxZipEntries: number;
  /** Largest uncompressed size accepted for one ZIP entry, in bytes. */
  readonly maxZipEntryBytes: number;
  /** Largest combined uncompressed size accepted for one ZIP archive, in bytes. */
  readonly maxZipTotalBytes: number;
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
  maxFileBytes: 25 * MiB,
  maxRows: 200_000,
  maxColumns: 256,
  maxFieldLength: 32_768,
  maxZipEntries: 64,
  maxZipEntryBytes: 50 * MiB,
  maxZipTotalBytes: 100 * MiB,
  maxZipRatio: 200,
  maxHtmlLength: 5_000_000,
  maxMentions: 10_000,
});

/** Converts a byte limit to mebibytes for messages people read. */
export function toMegabytes(bytes: number): number {
  return Math.round((bytes / MiB) * 100) / 100;
}

export function resolveLimits(overrides: Partial<InputLimits> = {}): InputLimits {
  return { ...DEFAULT_LIMITS, ...overrides };
}
