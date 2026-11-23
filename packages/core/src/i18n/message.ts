/**
 * Messages are data, not prose: a catalog key plus typed parameters. The engine never
 * formats text itself, so every interface can render its findings in the reader's language,
 * with numbers and dates written the way that language writes them.
 */

export type ParamValue =
  | string
  | number
  | { readonly kind: 'percent'; readonly value: number; readonly signed?: boolean }
  | {
      readonly kind: 'decimal';
      readonly value: number;
      readonly digits: number;
      readonly signed?: boolean;
    }
  | { readonly kind: 'date'; readonly value: string }
  | { readonly kind: 'dateRange'; readonly start: string; readonly end: string }
  | { readonly kind: 'list'; readonly values: readonly string[] }
  | { readonly kind: 'code'; readonly value: string }
  | { readonly kind: 'text'; readonly value: string };

export type MessageParams = Readonly<Record<string, ParamValue>>;

export interface Message<K extends string = string> {
  readonly key: K;
  readonly params?: MessageParams;
}

export function message<K extends string>(key: K, params?: MessageParams): Message<K> {
  return params === undefined ? { key } : { key, params };
}

/** A share such as a CTR or a relative change, given as a fraction (0.05 is 5%). */
export function percent(value: number, signed = false): ParamValue {
  return signed ? { kind: 'percent', value, signed } : { kind: 'percent', value };
}

export function decimal(value: number, digits: number, signed = false): ParamValue {
  return signed ? { kind: 'decimal', value, digits, signed } : { kind: 'decimal', value, digits };
}

/** A calendar date given as `YYYY-MM-DD`. */
export function date(value: string): ParamValue {
  return { kind: 'date', value };
}

export function dateRange(start: string, end: string): ParamValue {
  return { kind: 'dateRange', start, end };
}

export function list(values: readonly string[]): ParamValue {
  return { kind: 'list', values };
}

/**
 * Text the interface itself produced (already translated), inserted without bidirectional
 * isolation. Plain strings are treated as a person's own data and isolated; use this only
 * for the application's own words.
 */
export function text(value: string): ParamValue {
  return { kind: 'text', value };
}

/** Markup or source text quoted from a person's input, shown exactly as written. */
export function code(value: string): ParamValue {
  return { kind: 'code', value };
}
