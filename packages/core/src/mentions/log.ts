import { formatCsv } from '../csv/format.ts';
import { DiagnosticCollector, diagnostic, failure, success, type Result } from '../diagnostics.ts';
import { isoDate } from '../gsc/values.ts';
import { resolveLimits, type InputLimits } from '../limits.ts';
import { fold } from '../text/fold.ts';

/**
 * A log of AI-generated answers that mentioned or cited a site, as a person recorded them.
 *
 * These are observations, not measurements: SearchUnveil cannot see every AI answer, so a
 * log never becomes a "visibility score". Raw observations are kept exactly as recorded, and
 * summaries are derived from them on demand, never stored in their place.
 */

export const MENTION_LOG_FORMAT = 'searchunveil.ai-mentions';
export const MENTION_LOG_VERSION = 1;

/** A citation links to the site; a mention names it without a link. */
export const MENTION_KINDS = ['citation', 'mention'] as const;
/** How the observation was made. */
export const MENTION_METHODS = ['own-check', 'shared-with-me', 'screenshot', 'other'] as const;
/** Whether the person could confirm what they recorded. */
export const MENTION_CERTAINTY = ['confirmed', 'uncertain'] as const;

export type MentionKind = (typeof MENTION_KINDS)[number];
export type MentionMethod = (typeof MENTION_METHODS)[number];
export type MentionCertainty = (typeof MENTION_CERTAINTY)[number];

/** Common assistants, offered as suggestions; any name may be recorded. */
export const ASSISTANT_SUGGESTIONS = [
  'ChatGPT',
  'Claude',
  'Copilot',
  'DeepSeek',
  'Gemini',
  'Google AI Mode',
  'Google AI Overviews',
  'Grok',
  'Meta AI',
  'Perplexity',
] as const;

export interface AiMention {
  readonly id: string;
  /** The day the answer was seen, `YYYY-MM-DD`. */
  readonly observedOn: string;
  readonly assistant: string;
  readonly kind: MentionKind;
  /** The page of the person's site that was cited. */
  readonly citedUrl: string | null;
  /** What was asked. */
  readonly prompt: string | null;
  /** The relevant part of the answer, as observed. */
  readonly excerpt: string | null;
  /** Where the observation can be checked, such as a shared conversation link. */
  readonly evidenceUrl: string | null;
  readonly method: MentionMethod;
  readonly certainty: MentionCertainty;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type MentionDraft = Omit<AiMention, 'id' | 'createdAt' | 'updatedAt'>;

export const FIELD_LIMITS = Object.freeze({
  assistant: 80,
  prompt: 2000,
  excerpt: 5000,
  notes: 2000,
  url: 2048,
});

export type MentionField = keyof MentionDraft;

export type FieldErrorCode =
  'required' | 'too-long' | 'invalid-url' | 'invalid-date' | 'future-date' | 'invalid-choice';

export interface FieldError {
  readonly field: MentionField;
  readonly code: FieldErrorCode;
  readonly max?: number;
}

/** A URL people can open: absolute http(s), without embedded credentials. */
export function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.username === '' &&
      url.password === ''
    );
  } catch {
    return false;
  }
}

function isChoice<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

/**
 * Validates a mention. `today` is the person's local date (`YYYY-MM-DD`): an observation
 * cannot come from the future, and only the person's own calendar decides what "today" is.
 */
export function validateMention(draft: MentionDraft, today: string): FieldError[] {
  const errors: FieldError[] = [];
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(draft.observedOn);
  if (draft.observedOn === '') errors.push({ field: 'observedOn', code: 'required' });
  else if (
    parts === null ||
    isoDate(Number(parts[1]), Number(parts[2]), Number(parts[3])) === null
  ) {
    errors.push({ field: 'observedOn', code: 'invalid-date' });
  } else if (draft.observedOn > today) {
    errors.push({ field: 'observedOn', code: 'future-date' });
  }

  if (draft.assistant.trim() === '') errors.push({ field: 'assistant', code: 'required' });
  else if (draft.assistant.length > FIELD_LIMITS.assistant) {
    errors.push({ field: 'assistant', code: 'too-long', max: FIELD_LIMITS.assistant });
  }
  if (!isChoice(MENTION_KINDS, draft.kind)) errors.push({ field: 'kind', code: 'invalid-choice' });
  if (!isChoice(MENTION_METHODS, draft.method))
    errors.push({ field: 'method', code: 'invalid-choice' });
  if (!isChoice(MENTION_CERTAINTY, draft.certainty))
    errors.push({ field: 'certainty', code: 'invalid-choice' });

  for (const field of ['citedUrl', 'evidenceUrl'] as const) {
    const value = draft[field];
    if (value === null) continue;
    if (value.length > FIELD_LIMITS.url)
      errors.push({ field, code: 'too-long', max: FIELD_LIMITS.url });
    else if (!isWebAddress(value)) errors.push({ field, code: 'invalid-url' });
  }
  if (draft.kind === 'citation' && draft.citedUrl === null)
    errors.push({ field: 'citedUrl', code: 'required' });

  for (const field of ['prompt', 'excerpt', 'notes'] as const) {
    const value = draft[field];
    if (value !== null && value.length > FIELD_LIMITS[field]) {
      errors.push({ field, code: 'too-long', max: FIELD_LIMITS[field] });
    }
  }
  return errors;
}

/** Trims text fields and turns empty optional fields into `null`. */
export function normalizeDraft(draft: MentionDraft): MentionDraft {
  const optional = (value: string | null) => {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
  };
  return {
    ...draft,
    assistant: draft.assistant.trim(),
    citedUrl: optional(draft.citedUrl),
    prompt: optional(draft.prompt),
    excerpt: optional(draft.excerpt),
    evidenceUrl: optional(draft.evidenceUrl),
    notes: optional(draft.notes),
  };
}

export function createMention(draft: MentionDraft, id: string, now: string): AiMention {
  return { ...normalizeDraft(draft), id, createdAt: now, updatedAt: now };
}

export interface MentionLogFile {
  readonly format: typeof MENTION_LOG_FORMAT;
  readonly version: typeof MENTION_LOG_VERSION;
  readonly exportedAt: string;
  readonly mentions: readonly AiMention[];
}

export function serializeMentionLog(mentions: readonly AiMention[], exportedAt: string): string {
  const file: MentionLogFile = {
    format: MENTION_LOG_FORMAT,
    version: MENTION_LOG_VERSION,
    exportedAt,
    mentions,
  };
  return `${JSON.stringify(file, null, 2)}\n`;
}

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

/**
 * Reads a mention log exported by SearchUnveil. Invalid entries are reported and skipped,
 * so one damaged entry never costs a person the rest of their log.
 */
export function parseMentionLog(
  text: string,
  options: { readonly today: string; readonly limits?: Partial<InputLimits> },
): Result<readonly AiMention[]> {
  const limits = resolveLimits(options.limits);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return failure([diagnostic('mentions.invalid-json', 'error')]);
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('format' in data) ||
    data.format !== MENTION_LOG_FORMAT
  ) {
    return failure([diagnostic('mentions.invalid-format', 'error')]);
  }
  const version = 'version' in data ? data.version : undefined;
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    return failure([diagnostic('mentions.invalid-format', 'error')]);
  }
  if (version > MENTION_LOG_VERSION) {
    return failure([diagnostic('mentions.unsupported-version', 'error', { version })]);
  }
  const entries = 'mentions' in data ? data.mentions : undefined;
  if (!Array.isArray(entries)) return failure([diagnostic('mentions.invalid-format', 'error')]);
  if (entries.length > limits.maxMentions) {
    return failure([diagnostic('mentions.too-many', 'error', { limit: limits.maxMentions })]);
  }

  const collector = new DiagnosticCollector();
  const mentions: AiMention[] = [];
  const ids = new Set<string>();
  entries.forEach((entry: unknown, i) => {
    const index = i + 1;
    const mention = readMention(entry);
    if (typeof mention === 'string') {
      collector.add(diagnostic('mentions.invalid-field', 'warning', { index, field: mention }));
      return;
    }
    const [firstError] = validateMention(mention, options.today);
    if (firstError !== undefined) {
      collector.add(
        diagnostic('mentions.invalid-field', 'warning', { index, field: firstError.field }),
      );
      return;
    }
    if (ids.has(mention.id)) {
      collector.add(diagnostic('mentions.duplicate-id', 'warning', { index }));
      return;
    }
    ids.add(mention.id);
    mentions.push(mention);
  });
  return success(mentions, collector.toArray());
}

/** Reads one entry's shape; returns the name of the first malformed field instead on failure. */
function readMention(entry: unknown): AiMention | string {
  if (typeof entry !== 'object' || entry === null) return 'entry';
  const record = entry as Record<string, unknown>;
  const text = (field: string): string | undefined => {
    const value = record[field];
    return typeof value === 'string' ? value : undefined;
  };
  const optional = (field: string): string | null | undefined => {
    const value = record[field];
    if (value === null || value === undefined) return null;
    return typeof value === 'string' ? value : undefined;
  };

  const id = text('id');
  if (id === undefined || id === '' || id.length > 100) return 'id';
  const observedOn = text('observedOn');
  if (observedOn === undefined) return 'observedOn';
  const assistant = text('assistant');
  if (assistant === undefined) return 'assistant';
  const kind = record['kind'];
  if (!isChoice(MENTION_KINDS, kind)) return 'kind';
  const method = record['method'];
  if (!isChoice(MENTION_METHODS, method)) return 'method';
  const certainty = record['certainty'];
  if (!isChoice(MENTION_CERTAINTY, certainty)) return 'certainty';
  const createdAt = text('createdAt');
  if (createdAt === undefined || !TIMESTAMP.test(createdAt)) return 'createdAt';
  const updatedAt = text('updatedAt');
  if (updatedAt === undefined || !TIMESTAMP.test(updatedAt)) return 'updatedAt';

  const fields = ['citedUrl', 'prompt', 'excerpt', 'evidenceUrl', 'notes'] as const;
  const values: Partial<Record<(typeof fields)[number], string | null>> = {};
  for (const field of fields) {
    const value = optional(field);
    if (value === undefined) return field;
    values[field] = value;
  }
  const draft = normalizeDraft({
    observedOn,
    assistant,
    kind,
    method,
    certainty,
    citedUrl: values.citedUrl ?? null,
    prompt: values.prompt ?? null,
    excerpt: values.excerpt ?? null,
    evidenceUrl: values.evidenceUrl ?? null,
    notes: values.notes ?? null,
  });
  return { ...draft, id, createdAt, updatedAt };
}

export const CSV_COLUMNS = [
  'observedOn',
  'assistant',
  'kind',
  'citedUrl',
  'prompt',
  'excerpt',
  'evidenceUrl',
  'method',
  'certainty',
  'notes',
] as const;

/** A spreadsheet-safe CSV copy of the log, with formula-like text neutralized. */
export function mentionsToCsv(mentions: readonly AiMention[]): string {
  return formatCsv([
    [...CSV_COLUMNS],
    ...mentions.map((m) => CSV_COLUMNS.map((column) => m[column])),
  ]);
}

export interface CountedValue {
  readonly value: string;
  readonly count: number;
}

/**
 * Counts derived from the recorded mentions. There is deliberately no share, rate or score:
 * a log shows where a person has seen their site mentioned, not how often AI assistants
 * mention it overall.
 */
export interface MentionSummary {
  readonly total: number;
  readonly citations: number;
  readonly mentions: number;
  readonly confirmed: number;
  readonly uncertain: number;
  readonly firstObserved: string | null;
  readonly lastObserved: string | null;
  /** Assistants by number of recorded mentions; names differing only in case or accents are grouped. */
  readonly byAssistant: readonly CountedValue[];
  /** Mentions per calendar month (`YYYY-MM`), oldest first. */
  readonly byMonth: readonly CountedValue[];
  /** Pages of the site cited most often. */
  readonly citedPages: readonly CountedValue[];
}

export function summarizeMentions(mentions: readonly AiMention[]): MentionSummary {
  const dates = mentions.map((m) => m.observedOn).sort();
  return {
    total: mentions.length,
    citations: mentions.filter((m) => m.kind === 'citation').length,
    mentions: mentions.filter((m) => m.kind === 'mention').length,
    confirmed: mentions.filter((m) => m.certainty === 'confirmed').length,
    uncertain: mentions.filter((m) => m.certainty === 'uncertain').length,
    firstObserved: dates[0] ?? null,
    lastObserved: dates.at(-1) ?? null,
    byAssistant: countBy(
      mentions.map((m) => m.assistant),
      fold,
    ),
    byMonth: countBy(
      mentions.map((m) => m.observedOn.slice(0, 7)),
      (v) => v,
    ).sort((a, b) => a.value.localeCompare(b.value)),
    citedPages: countBy(
      mentions.flatMap((m) => (m.citedUrl === null ? [] : [m.citedUrl])),
      (v) => v,
    ),
  };
}

/** Counts values grouped by `key`, labelling each group with its most frequent spelling. */
function countBy(values: readonly string[], key: (value: string) => string): CountedValue[] {
  const groups = new Map<string, Map<string, number>>();
  for (const value of values) {
    const group = groups.get(key(value)) ?? new Map<string, number>();
    group.set(value, (group.get(value) ?? 0) + 1);
    groups.set(key(value), group);
  }
  return [...groups.values()]
    .map((spellings) => {
      const [label = ''] = [...spellings.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
      return { value: label, count: [...spellings.values()].reduce((a, b) => a + b, 0) };
    })
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
