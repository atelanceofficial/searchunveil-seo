import { describe, expect, it, vi } from 'vitest';
import {
  answered,
  TEST_PLAN,
  testProvider,
  type TestProvider,
} from '../test-support/visibility-fixtures.ts';
import type { Answer } from './plan.ts';
import { runVisibilityCheck, type CheckOptions } from './run.ts';

const clock = () => {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 25, 12, 0, tick++));
};
const agree: CheckOptions['confirm'] = () => true;

describe('runVisibilityCheck', () => {
  it('asks nothing before the person agrees to the estimated cost', async () => {
    const provider = testProvider(() => answered('text'));
    const confirm = vi.fn((estimate: { calls: number; total: number }) => {
      expect(provider.requests).toHaveLength(0);
      expect([estimate.calls, estimate.total]).toEqual([12, 0.0612]);
      return Promise.resolve(false);
    });
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, { confirm });
    expect(outcome.status).toBe('declined');
    expect(confirm).toHaveBeenCalledOnce();
    expect(provider.requests).toHaveLength(0);
  });

  it('starts only on an explicit yes', async () => {
    const provider = testProvider(() => answered('text'));
    const unclear = (() => 'yes') as unknown as CheckOptions['confirm'];
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, { confirm: unclear });
    expect(outcome.status).toBe('declined');
    expect(provider.requests).toHaveLength(0);
  });

  it('refuses a plan that cannot run, without asking for agreement', async () => {
    const provider = testProvider(() => answered('text'));
    const confirm = vi.fn(agree);
    const outcome = await runVisibilityCheck({ ...TEST_PLAN, engines: ['gemini'] }, provider, {
      confirm,
    });
    expect(outcome).toEqual({
      status: 'invalid',
      errors: [{ field: 'engines', code: 'unknown-engine', index: 1 }],
    });
    expect(confirm).not.toHaveBeenCalled();
  });

  it('makes every planned call and records the answers in planned order', async () => {
    const provider = testProvider((request) =>
      answered(`${request.engine} ${request.attempt}`, ['https://ornekspor.com/']),
    );
    const progress: number[] = [];
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: agree,
      now: clock(),
      concurrency: 3,
      onProgress: ({ done, total }) => {
        expect(total).toBe(12);
        progress.push(done);
      },
    });
    if (outcome.status !== 'done') throw new Error(outcome.status);
    const { record } = outcome;
    expect(provider.requests).toHaveLength(12);
    expect(progress).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(record.complete).toBe(true);
    expect(record.startedAt).toBe('2026-11-25T12:00:00.000Z');
    expect(record.finishedAt).toBe('2026-11-25T12:00:01.000Z');
    expect(record.plan.country).toBe('TR');
    expect(record.provider).toEqual({
      id: 'test-tools',
      label: 'Test Tools',
      currency: 'USD',
      chargesFailedCalls: false,
    });
    expect(record.engines.map((engine) => engine.id)).toEqual(['pplx', 'aio']);
    expect(record.answers.map((a) => [a.question, a.engine, a.attempt])).toEqual([
      [0, 'pplx', 1],
      [0, 'aio', 1],
      [1, 'pplx', 1],
      [1, 'aio', 1],
      [0, 'pplx', 2],
      [0, 'aio', 2],
      [1, 'pplx', 2],
      [1, 'aio', 2],
      [0, 'pplx', 3],
      [0, 'aio', 3],
      [1, 'pplx', 3],
      [1, 'aio', 3],
    ]);
  });

  it('runs no more calls at once than allowed', async () => {
    let running = 0;
    let most = 0;
    const provider = testProvider(async () => {
      running++;
      most = Math.max(most, running);
      await new Promise((resolve) => setTimeout(resolve, 1));
      running--;
      return answered('text');
    });
    await runVisibilityCheck(TEST_PLAN, provider, { confirm: agree, concurrency: 2 });
    expect(most).toBe(2);
    await runVisibilityCheck(TEST_PLAN, provider, { confirm: agree, concurrency: 99 });
    expect(most).toBe(8);
  });

  it('records what goes wrong as failed calls and carries on', async () => {
    let call = 0;
    const provider = testProvider(() => {
      call++;
      if (call === 1) throw new Error('network down');
      if (call === 2) return { ok: false, failure: 'rate-limited' };
      if (call === 3) return { ok: true, text: 42 } as unknown as Answer;
      return answered('text');
    });
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: agree,
      concurrency: 1,
      onProgress: () => {
        throw new Error('display broke');
      },
    });
    if (outcome.status !== 'done') throw new Error(outcome.status);
    expect(outcome.record.answers.slice(0, 4).map(({ answer }) => answer)).toEqual([
      { ok: false, failure: 'error' },
      { ok: false, failure: 'rate-limited' },
      { ok: false, failure: 'error' },
      { ok: true, text: 'text', sources: [] },
    ]);
    expect(outcome.record.complete).toBe(true);
  });

  it('stops starting calls when the person stops, and keeps what came back', async () => {
    const controller = new AbortController();
    const provider: TestProvider = testProvider(() => {
      if (provider.requests.length === 3) controller.abort();
      return answered('text');
    });
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: agree,
      concurrency: 1,
      signal: controller.signal,
    });
    if (outcome.status !== 'stopped') throw new Error(outcome.status);
    expect(provider.requests).toHaveLength(3);
    expect(outcome.record.complete).toBe(false);
    expect(outcome.record.answers.map(({ answer }) => answer.ok)).toEqual([true, true, true]);
  });

  it('marks a call that stopping cut off', async () => {
    const controller = new AbortController();
    const provider: TestProvider = testProvider(() => {
      if (provider.requests.length < 2) return answered('text');
      controller.abort();
      return Promise.reject(new DOMException('Stopped', 'AbortError'));
    });
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: agree,
      concurrency: 1,
      signal: controller.signal,
    });
    if (outcome.status !== 'stopped') throw new Error(outcome.status);
    expect(outcome.record.answers.map(({ answer }) => answer)).toEqual([
      { ok: true, text: 'text', sources: [] },
      { ok: false, failure: 'stopped' },
    ]);
  });

  it('keeps the cost the provider reports for a call cut off by stopping', async () => {
    const controller = new AbortController();
    const provider = testProvider((request) => {
      if (request.question.startsWith('yeni')) {
        controller.abort();
        return { ok: false, failure: 'error', cost: 0.001 };
      }
      return answered('text');
    });
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: agree,
      concurrency: 1,
      signal: controller.signal,
    });
    if (outcome.status !== 'stopped') throw new Error(outcome.status);
    expect(outcome.record.answers.map(({ answer }) => answer)).toEqual([
      { ok: true, text: 'text', sources: [] },
      { ok: true, text: 'text', sources: [] },
      { ok: false, failure: 'stopped', cost: 0.001 },
    ]);
  });

  it('makes no call when stopped before it starts', async () => {
    const controller = new AbortController();
    const provider = testProvider(() => answered('text'));
    const outcome = await runVisibilityCheck(TEST_PLAN, provider, {
      confirm: () => {
        controller.abort();
        return true;
      },
      signal: controller.signal,
    });
    expect(outcome.status).toBe('stopped');
    expect(provider.requests).toHaveLength(0);
  });
});
