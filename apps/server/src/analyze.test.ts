import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { AnalysisError, claudeAnalyzer } from './analyze.ts';

const ANSWER = {
  summary: 'Clear page with a weak title.',
  verdict: 'fair',
  priorities: [
    {
      title: 'Rewrite the title',
      why: 'It is one word.',
      how: 'Use “Ceramics workshop in Izmir”.',
      evidence: 'Title: Home',
      impact: 'high',
      effort: 'low',
    },
  ],
  title_suggestions: ['Ceramics workshop in Izmir'],
  description_suggestions: [],
  content_notes: [],
  technical_notes: [],
  caveats: [],
};

type Message = Partial<Anthropic.Beta.BetaMessage>;

/** A client whose stream answers with `message`, recording the request it was given. */
function fakeClient(answer: Message | Error) {
  const calls: { params: Record<string, unknown>; options: unknown }[] = [];
  const client = {
    beta: {
      messages: {
        stream(params: Record<string, unknown>, options: unknown) {
          calls.push({ params, options });
          return {
            finalMessage: () =>
              answer instanceof Error
                ? Promise.reject(answer)
                : Promise.resolve({
                    model: 'claude-fable-5-2',
                    stop_reason: 'end_turn',
                    content: [{ type: 'text', text: JSON.stringify(ANSWER) }],
                    usage: { iterations: null },
                    ...answer,
                  }),
          };
        },
      },
    },
  } as unknown as Anthropic;
  return { client, calls };
}

const request = { instructions: 'Review the page.', evidence: '{"page":{},"findings":[]}' };

async function code(answer: Message | Error, signal = new AbortController().signal) {
  try {
    await claudeAnalyzer(fakeClient(answer).client)(request, signal);
  } catch (error) {
    if (error instanceof AnalysisError) return error.code;
    throw error;
  }
  throw new Error('expected the analysis to fail');
}

describe('claudeAnalyzer', () => {
  it('asks Claude Fable 5.2 for JSON in the analysis shape, with a fallback on decline', async () => {
    const { client, calls } = fakeClient({});
    const signal = new AbortController().signal;
    const outcome = await claudeAnalyzer(client)(request, signal);
    expect(outcome).toMatchObject({ model: 'claude-fable-5-2', fallback: false });
    expect(outcome.analysis.priorities[0]?.title).toBe('Rewrite the title');

    const [call] = calls;
    expect(call?.params).toMatchObject({
      model: 'claude-fable-5-2',
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'high', format: { type: 'json_schema' } },
      system: 'Review the page.',
      messages: [{ role: 'user', content: `The evidence:\n${request.evidence}` }],
    });
    expect(call?.params).not.toHaveProperty('thinking');
    expect(call?.options).toEqual({ signal });
  });

  it('says when a fallback model finished the answer', async () => {
    const { client } = fakeClient({
      model: 'claude-opus-4-8',
      usage: { iterations: [{ type: 'fallback_message' }] } as unknown as Anthropic.Beta.BetaUsage,
    });
    const outcome = await claudeAnalyzer(client)(request, new AbortController().signal);
    expect(outcome).toMatchObject({ model: 'claude-opus-4-8', fallback: true });
  });

  it('turns stop reasons and unusable answers into clear errors', async () => {
    expect(await code({ stop_reason: 'refusal', content: [] })).toBe('refused');
    expect(await code({ stop_reason: 'max_tokens' })).toBe('too-long');
    expect(await code({ content: [{ type: 'text', text: 'not json', citations: null }] })).toBe(
      'invalid-answer',
    );
  });

  it('maps API errors without leaking their messages', async () => {
    const headers = new Headers();
    expect(await code(new Anthropic.RateLimitError(429, {}, 'slow down', headers))).toBe(
      'rate-limited',
    );
    expect(await code(new Anthropic.AuthenticationError(401, {}, 'bad key', headers))).toBe(
      'not-configured',
    );
    expect(await code(new Anthropic.InternalServerError(500, {}, 'oops', headers))).toBe(
      'upstream-error',
    );
    const aborted = new AbortController();
    aborted.abort();
    expect(await code(new Error('aborted'), aborted.signal)).toBe('cancelled');
  });
});
