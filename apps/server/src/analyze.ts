import Anthropic from '@anthropic-ai/sdk';
import {
  ANALYSIS_MODEL,
  extractJson,
  PAGE_ANALYSIS_SCHEMA,
  parsePageAnalysis,
  type AnalysisRequest,
  type PageAnalysis,
} from '@searchunveil/core';

/**
 * The AI analysis: one request to Claude Fable 5.2 with SearchUnveil's standing instructions
 * and a page review's evidence, answered as JSON in a fixed shape.
 */

export interface AnalysisOutcome {
  readonly analysis: PageAnalysis;
  /** The model that wrote the answer. */
  readonly model: string;
  /** Whether a fallback model finished the answer after the requested one declined. */
  readonly fallback: boolean;
}

export type Analyze = (request: AnalysisRequest, signal: AbortSignal) => Promise<AnalysisOutcome>;

export type AnalysisErrorCode =
  | 'cancelled'
  | 'rate-limited'
  | 'overloaded'
  | 'refused'
  | 'too-long'
  | 'invalid-answer'
  | 'not-configured'
  | 'upstream-error';

export class AnalysisError extends Error {
  readonly code: AnalysisErrorCode;

  constructor(code: AnalysisErrorCode) {
    super(code);
    this.code = code;
  }
}

/** Room for the model's thinking and a long answer; the answer itself needs a few thousand. */
const MAX_TOKENS = 32_000;

export function claudeAnalyzer(client: Anthropic): Analyze {
  return async ({ instructions, evidence }, signal) => {
    let message: Anthropic.Beta.BetaMessage;
    try {
      const stream = client.beta.messages.stream(
        {
          model: ANALYSIS_MODEL,
          max_tokens: MAX_TOKENS,
          // If the model declines, Anthropic's recommended fallback model finishes the request.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: {
            effort: 'high',
            format: { type: 'json_schema', schema: PAGE_ANALYSIS_SCHEMA },
          },
          system: instructions,
          messages: [{ role: 'user', content: `The evidence:\n${evidence}` }],
        },
        { signal },
      );
      message = await stream.finalMessage();
    } catch (error) {
      throw toAnalysisError(error, signal);
    }

    if (message.stop_reason === 'refusal') throw new AnalysisError('refused');
    if (message.stop_reason === 'max_tokens') throw new AnalysisError('too-long');
    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');
    const analysis = parsePageAnalysis(extractJson(text));
    if (analysis === null) throw new AnalysisError('invalid-answer');
    const fallback = (message.usage.iterations ?? []).some(
      (entry) => entry.type === 'fallback_message',
    );
    return { analysis, model: message.model, fallback };
  };
}

function toAnalysisError(error: unknown, signal: AbortSignal): AnalysisError {
  if (signal.aborted || error instanceof Anthropic.APIUserAbortError) {
    return new AnalysisError('cancelled');
  }
  if (error instanceof Anthropic.RateLimitError) return new AnalysisError('rate-limited');
  if (error instanceof Anthropic.AuthenticationError) return new AnalysisError('not-configured');
  if (error instanceof Anthropic.PermissionDeniedError) return new AnalysisError('not-configured');
  if (error instanceof Anthropic.OverloadedError) return new AnalysisError('overloaded');
  return new AnalysisError('upstream-error');
}
