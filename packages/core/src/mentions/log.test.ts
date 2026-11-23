import { describe, expect, it } from 'vitest';
import {
  createMention,
  mentionsToCsv,
  MENTION_LOG_FORMAT,
  parseMentionLog,
  serializeMentionLog,
  summarizeMentions,
  validateMention,
  type AiMention,
  type MentionDraft,
} from './log.ts';

const TODAY = '2026-11-23';
const NOW = '2026-11-23T10:00:00.000Z';

function draft(overrides: Partial<MentionDraft> = {}): MentionDraft {
  return {
    observedOn: '2026-11-20',
    assistant: 'Perplexity',
    kind: 'citation',
    citedUrl: 'https://example.com/shoes',
    prompt: 'best trail running shoes',
    excerpt: 'Example’s guide compares…',
    evidenceUrl: null,
    method: 'own-check',
    certainty: 'confirmed',
    notes: null,
    ...overrides,
  };
}

function mention(id: string, overrides: Partial<MentionDraft> = {}): AiMention {
  return createMention(draft(overrides), id, NOW);
}

describe('validateMention', () => {
  it('accepts a complete observation', () => {
    expect(validateMention(draft(), TODAY)).toEqual([]);
  });

  it('requires a date, an assistant and, for citations, the cited page', () => {
    expect(
      validateMention(draft({ observedOn: '', assistant: ' ', citedUrl: null }), TODAY),
    ).toEqual([
      { field: 'observedOn', code: 'required' },
      { field: 'assistant', code: 'required' },
      { field: 'citedUrl', code: 'required' },
    ]);
    expect(validateMention(draft({ kind: 'mention', citedUrl: null }), TODAY)).toEqual([]);
  });

  it('rejects impossible and future dates', () => {
    expect(validateMention(draft({ observedOn: '2026-02-30' }), TODAY)).toEqual([
      { field: 'observedOn', code: 'invalid-date' },
    ]);
    expect(validateMention(draft({ observedOn: '2026-11-24' }), TODAY)).toEqual([
      { field: 'observedOn', code: 'future-date' },
    ]);
  });

  it('accepts only web addresses people can open', () => {
    for (const url of [
      'javascript:alert(1)',
      'ftp://example.com/',
      'https://user:pw@example.com/',
      'example.com',
    ]) {
      expect(validateMention(draft({ evidenceUrl: url }), TODAY)).toEqual([
        { field: 'evidenceUrl', code: 'invalid-url' },
      ]);
    }
  });

  it('enforces length limits and known choices', () => {
    expect(validateMention(draft({ notes: 'x'.repeat(2001) }), TODAY)).toEqual([
      { field: 'notes', code: 'too-long', max: 2000 },
    ]);
    expect(validateMention({ ...draft(), method: 'guess' as never }, TODAY)).toEqual([
      { field: 'method', code: 'invalid-choice' },
    ]);
  });
});

describe('createMention', () => {
  it('trims text and stores empty optional fields as null', () => {
    const created = createMention(
      draft({ assistant: '  Gemini ', notes: '   ', prompt: ' shoes ' }),
      'id-1',
      NOW,
    );
    expect(created).toMatchObject({
      id: 'id-1',
      assistant: 'Gemini',
      notes: null,
      prompt: 'shoes',
      createdAt: NOW,
      updatedAt: NOW,
    });
  });
});

describe('mention log files', () => {
  it('round-trips through its JSON format', () => {
    const mentions = [
      mention('a'),
      mention('b', { kind: 'mention', citedUrl: null, certainty: 'uncertain' }),
    ];
    const text = serializeMentionLog(mentions, NOW);
    expect(JSON.parse(text)).toMatchObject({
      format: MENTION_LOG_FORMAT,
      version: 1,
      exportedAt: NOW,
    });
    expect(parseMentionLog(text, { today: TODAY })).toEqual({
      ok: true,
      value: mentions,
      diagnostics: [],
    });
  });

  it('rejects files that are not mention logs', () => {
    const codes = (text: string) =>
      parseMentionLog(text, { today: TODAY }).diagnostics.map((d) => d.code);
    expect(codes('{ nope')).toEqual(['mentions.invalid-json']);
    expect(codes('{"format":"other"}')).toEqual(['mentions.invalid-format']);
    expect(codes(`{"format":"${MENTION_LOG_FORMAT}","version":2,"mentions":[]}`)).toEqual([
      'mentions.unsupported-version',
    ]);
    expect(codes(`{"format":"${MENTION_LOG_FORMAT}","version":1}`)).toEqual([
      'mentions.invalid-format',
    ]);
  });

  it('enforces the size limit', () => {
    const text = serializeMentionLog([mention('a'), mention('b')], NOW);
    expect(
      parseMentionLog(text, { today: TODAY, limits: { maxMentions: 1 } }).diagnostics[0],
    ).toMatchObject({
      code: 'mentions.too-many',
      params: { limit: 1 },
    });
  });

  it('keeps valid entries when others are damaged or repeated', () => {
    const good = mention('a');
    const text = JSON.stringify({
      format: MENTION_LOG_FORMAT,
      version: 1,
      mentions: [
        good,
        { ...good, id: 'b', evidenceUrl: 'javascript:alert(1)' },
        { ...good, id: 'c', kind: 'rumor' },
        good,
        42,
      ],
    });
    const result = parseMentionLog(text, { today: TODAY });
    expect(result.ok && result.value).toEqual([good]);
    expect(result.diagnostics.map((d) => [d.code, d.params])).toEqual([
      ['mentions.invalid-field', { index: 2, field: 'evidenceUrl' }],
      ['mentions.invalid-field', { index: 3, field: 'kind' }],
      ['mentions.duplicate-id', { index: 4 }],
      ['mentions.invalid-field', { index: 5, field: 'entry' }],
    ]);
  });

  it('exports spreadsheet-safe CSV', () => {
    const csv = mentionsToCsv([
      mention('a', { excerpt: '=HYPERLINK("http://evil.example")', notes: 'two\nlines' }),
    ]);
    expect(csv.split('\r\n')[0]).toBe(
      '\uFEFFobservedOn,assistant,kind,citedUrl,prompt,excerpt,evidenceUrl,method,certainty,notes',
    );
    expect(csv).toContain(`"'=HYPERLINK(""http://evil.example"")"`);
    expect(csv).toContain('"two\nlines"');
  });
});

describe('summarizeMentions', () => {
  it('counts what was recorded, and never estimates a share or score', () => {
    const summary = summarizeMentions([
      mention('a', { assistant: 'ChatGPT', observedOn: '2026-10-02' }),
      mention('b', { assistant: 'chatgpt', observedOn: '2026-11-05', certainty: 'uncertain' }),
      mention('c', {
        assistant: 'ChatGPT',
        observedOn: '2026-11-07',
        kind: 'mention',
        citedUrl: null,
      }),
      mention('d', {
        assistant: 'Gemini',
        observedOn: '2026-11-08',
        citedUrl: 'https://example.com/boots',
      }),
    ]);
    expect(summary).toEqual({
      total: 4,
      citations: 3,
      mentions: 1,
      confirmed: 3,
      uncertain: 1,
      firstObserved: '2026-10-02',
      lastObserved: '2026-11-08',
      byAssistant: [
        { value: 'ChatGPT', count: 3 },
        { value: 'Gemini', count: 1 },
      ],
      byMonth: [
        { value: '2026-10', count: 1 },
        { value: '2026-11', count: 3 },
      ],
      citedPages: [
        { value: 'https://example.com/shoes', count: 2 },
        { value: 'https://example.com/boots', count: 1 },
      ],
    });
  });

  it('summarizes an empty log', () => {
    expect(summarizeMentions([])).toMatchObject({ total: 0, firstObserved: null, byAssistant: [] });
  });
});
