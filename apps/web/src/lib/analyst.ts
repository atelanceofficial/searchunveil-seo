import {
  ANALYSIS_MODEL,
  extractJson,
  pageAnalysisPrompt,
  pageAnalysisRequest,
  parsePageAnalysis,
  type Locale,
  type PageAnalysis,
  type PageReport,
} from '@searchunveil/core';
import { useEffect, useState } from 'preact/hooks';
import { claudeSample, sampleErrorCode, type Sample } from './claude-runtime.ts';

/**
 * Who writes the second opinion: Claude, in the claude.ai viewer showing this page, on the
 * viewer's own account. It needs no API key; anywhere else there is no second opinion, and the
 * app's own analyst (SearchUnveil Analyst) stands alone.
 */

export type AnalystKind = 'claude';

export type AnalystError =
  | 'cancelled'
  | 'not-granted'
  | 'rate-limited'
  | 'refused'
  | 'too-long'
  | 'invalid-answer'
  | 'unavailable'
  | 'failed';

export type AnalystOutcome =
  | {
      readonly ok: true;
      readonly analysis: PageAnalysis;
      /** The model that wrote it, when known. */
      readonly model: string | null;
      /** Whether a fallback model finished after the requested one declined. */
      readonly fallback: boolean;
    }
  | { readonly ok: false; readonly error: AnalystError };

export interface Analyst {
  readonly kind: AnalystKind;
  readonly run: (
    report: PageReport,
    locale: Locale,
    options: { readonly signal: AbortSignal; readonly onWriting?: () => void },
  ) => Promise<AnalystOutcome>;
}

function claudeAnalyst(sample: Sample): Analyst {
  return {
    kind: 'claude',
    run: async (report, locale, { signal, onWriting }) => {
      const prompt = pageAnalysisPrompt(pageAnalysisRequest(report, { locale }));
      let writing = false;
      try {
        const result = await sample(prompt, {
          model: ANALYSIS_MODEL,
          modelTier: 'complex',
          effort: 'high',
          signal,
          onText: () => {
            if (writing) return;
            writing = true;
            onWriting?.();
          },
        });
        const analysis = parsePageAnalysis(extractJson(result.text));
        if (analysis === null) {
          return { ok: false, error: result.truncated ? 'too-long' : 'invalid-answer' };
        }
        return { ok: true, analysis, model: result.modelApplied ?? null, fallback: false };
      } catch (error) {
        return { ok: false, error: sampleError(sampleErrorCode(error)) };
      }
    },
  };
}

let analyst: Promise<Analyst | null> | undefined;

/** Claude, when this page is shown inside a Claude viewer; otherwise `null`. */
export function findAnalyst(): Promise<Analyst | null> {
  analyst ??= claudeSample().then((sample) => (sample === null ? null : claudeAnalyst(sample)));
  return analyst;
}

/** `undefined` while looking, then the analyst or `null`. */
export function useAnalyst(): Analyst | null | undefined {
  const [found, setFound] = useState<Analyst | null | undefined>(undefined);
  useEffect(() => {
    let current = true;
    void findAnalyst().then((value) => {
      if (current) setFound(value);
    });
    return () => {
      current = false;
    };
  }, []);
  return found;
}

/** A readable name for a Claude model id: `claude-fable-5-2` is "Claude Fable 5.2". */
export function modelName(id: string): string {
  const match = /^claude-([a-z]+)-(\d+)(?:-(\d{1,2}))?(?:-|$)/.exec(id);
  if (match === null) return id;
  const [, family = '', major = '', minor] = match;
  const version = minor === undefined ? major : `${major}.${minor}`;
  return `Claude ${family.charAt(0).toUpperCase()}${family.slice(1)} ${version}`;
}

function sampleError(code: string): AnalystError {
  switch (code) {
    case 'cancelled':
      return 'cancelled';
    case 'not_granted':
    case 'sampling_disabled':
    case 'session_expired':
      return 'not-granted';
    case 'rate_limited':
    case 'queue_overflow':
      return 'rate-limited';
    case 'refused':
      return 'refused';
    case 'prompt_too_large':
      return 'too-long';
    case 'empty_completion':
    case 'invalid_json':
      return 'invalid-answer';
    case 'capability_disabled':
    case 'capability_removed':
    case 'not_declared':
      return 'unavailable';
    default:
      return 'failed';
  }
}
