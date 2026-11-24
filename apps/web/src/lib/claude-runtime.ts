/**
 * Claude inside claude.ai. When SearchUnveil is shown as an artifact there, the viewer's
 * runtime offers `sample`, which asks Claude on the viewer's own account after they agree.
 * Anywhere else `window.claude` is absent, and so is this feature.
 */

export interface SampleResult {
  readonly text: string;
  /** The answer hit a length or time limit and stops mid-thought. */
  readonly truncated: boolean;
  /** The model asked for, when it is the one that answered. */
  readonly modelApplied?: string;
}

export interface SampleOptions {
  readonly model?: string;
  readonly modelTier?: 'quick' | 'default' | 'complex';
  readonly effort?: 'low' | 'medium' | 'high';
  readonly signal?: AbortSignal;
  readonly onText?: (update: { readonly text: string; readonly delta: string }) => void;
}

export type Sample = (input: string, options?: SampleOptions) => Promise<SampleResult>;

interface ClaudeRuntime {
  readonly use: (name: 'sample') => Promise<Sample | null>;
}

let sample: Promise<Sample | null> | undefined;

/** The `sample` capability, or `null` outside a Claude viewer (decided within ten seconds). */
export function claudeSample(): Promise<Sample | null> {
  sample ??= (async () => {
    const runtime = (window as unknown as { claude?: Partial<ClaudeRuntime> }).claude;
    if (typeof runtime?.use !== 'function') return null;
    try {
      return await runtime.use('sample');
    } catch {
      return null;
    }
  })();
  return sample;
}

export function sampleErrorCode(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  return typeof code === 'string' ? code : 'upstream_error';
}
