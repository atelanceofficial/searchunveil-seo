/**
 * Writes RFC 4180 CSV that spreadsheet applications open safely.
 *
 * Text cells that begin with a formula trigger are prefixed with an apostrophe, following
 * the OWASP guidance on CSV injection: a log of observations someone pasted from the web
 * must never execute as a formula when it is opened in a spreadsheet.
 */

export type CsvCell = string | number | null;

export interface CsvFormatOptions {
  readonly delimiter?: ',' | ';' | '\t';
  /** Prefix a UTF-8 byte order mark so that Excel detects the encoding. Defaults to true. */
  readonly byteOrderMark?: boolean;
}

const FORMULA_TRIGGERS = new Set(['=', '+', '-', '@', '\t', '\r', '＝', '＋', '－', '＠']);

export function formatCsv(
  rows: readonly (readonly CsvCell[])[],
  options: CsvFormatOptions = {},
): string {
  const delimiter = options.delimiter ?? ',';
  const body = rows
    .map((row) => row.map((cell) => formatCell(cell, delimiter)).join(delimiter))
    .join('\r\n');
  return (options.byteOrderMark ?? true) ? `\uFEFF${body}\r\n` : `${body}\r\n`;
}

function formatCell(cell: CsvCell, delimiter: string): string {
  if (cell === null) return '';
  if (typeof cell === 'number') return Number.isFinite(cell) ? String(cell) : '';
  const guarded = FORMULA_TRIGGERS.has(cell.charAt(0)) ? `'${cell}` : cell;
  const needsQuotes =
    guarded.includes(delimiter) ||
    guarded.includes('"') ||
    guarded.includes('\n') ||
    guarded.includes('\r') ||
    guarded !== guarded.trim();
  return needsQuotes ? `"${guarded.replaceAll('"', '""')}"` : guarded;
}
