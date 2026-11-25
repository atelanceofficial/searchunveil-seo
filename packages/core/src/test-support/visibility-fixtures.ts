import type {
  Answer,
  AnswerEngine,
  AnswerProvider,
  AnswerRequest,
  VisibilityPlan,
} from '../visibility/plan.ts';

/** Engines priced like a typical tool marketplace: two models of one product, one unpriced. */
export const TEST_ENGINES: readonly AnswerEngine[] = [
  { id: 'pplx', label: 'Perplexity', family: 'perplexity', model: 'sonar', pricePerCall: 0.005 },
  {
    id: 'pplx-pro',
    label: 'Perplexity Pro',
    family: 'perplexity',
    model: 'sonar-pro',
    pricePerCall: 0.013,
  },
  { id: 'aio', label: 'Google AI Overviews', family: 'google-ai-overviews', pricePerCall: 0.0052 },
  { id: 'chat', label: 'ChatGPT', family: 'chatgpt', pricePerCall: null },
];

export const TEST_PLAN: VisibilityPlan = {
  brand: { site: 'ornekspor.com', name: 'Örnek Spor' },
  competitors: [{ site: 'www.rakip.com.tr', name: 'Rakip' }],
  questions: ['en iyi koşu ayakkabısı', 'yeni başlayanlar için koşu ayakkabısı'],
  engines: ['pplx', 'aio'],
  repeats: 3,
  country: 'tr',
  language: 'tr',
};

export interface TestProvider extends AnswerProvider {
  /** Every request the provider received, in order. */
  readonly requests: AnswerRequest[];
}

/** A provider answering from a script, recording what it was asked. */
export function testProvider(
  answer: (request: AnswerRequest, signal: AbortSignal) => Answer | Promise<Answer>,
  terms: Partial<Pick<AnswerProvider, 'chargesFailedCalls' | 'engines' | 'currency'>> = {},
): TestProvider {
  const requests: AnswerRequest[] = [];
  return {
    id: 'test-tools',
    label: 'Test Tools',
    currency: terms.currency ?? 'USD',
    engines: terms.engines ?? TEST_ENGINES,
    chargesFailedCalls: terms.chargesFailedCalls ?? false,
    requests,
    ask(request, signal) {
      requests.push(request);
      try {
        return Promise.resolve(answer(request, signal));
      } catch (error) {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      }
    },
  };
}

export const answered = (text: string, sources: readonly string[] = []): Answer => ({
  ok: true,
  text,
  sources,
});
