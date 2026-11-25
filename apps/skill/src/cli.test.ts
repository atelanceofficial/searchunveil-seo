import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dailySeries,
  datesFile,
  queriesFile,
} from '../../../packages/core/src/test-support/gsc-fixtures.ts';
import { main, run, USAGE } from './cli.ts';
import { InputError } from './errors.ts';

let folder: string;
let printed: string[];
const io = {
  out: (text: string) => printed.push(text),
  now: () => new Date('2026-11-25T10:00:00Z'),
};
const output = () => printed.join('\n');
const path = (name: string) => join(folder, name);
const write = (name: string, value: unknown) =>
  writeFile(path(name), typeof value === 'string' ? value : JSON.stringify(value));

const PROVIDER = {
  id: 'test-tools',
  label: 'Example Tools',
  currency: 'USD',
  chargesFailedCalls: false,
  billing: 'balance',
  engines: [
    { id: 'pplx', label: 'Perplexity', family: 'perplexity', model: 'sonar', pricePerCall: 0.005 },
    {
      id: 'pplx-pro',
      label: 'Perplexity',
      family: 'perplexity',
      model: 'pro',
      pricePerCall: 0.013,
    },
    {
      id: 'aio',
      label: 'Google AI Overviews',
      family: 'google-ai-overviews',
      pricePerCall: 0.0052,
    },
    { id: 'chat', label: 'ChatGPT', family: 'chatgpt', pricePerCall: null },
  ],
};
const PLAN = {
  brand: { site: 'ornekspor.com', name: 'Örnek Spor' },
  competitors: [{ site: 'rakip.com.tr', name: 'Rakip' }],
  questions: ['en iyi koşu ayakkabısı', 'yeni başlayanlar için koşu ayakkabısı'],
  country: 'tr',
  language: 'tr',
};
const visibility = (command: string, ...more: string[]) =>
  run(
    [
      'visibility',
      command,
      '--plan',
      path('plan.json'),
      '--provider',
      path('provider.json'),
      ...more,
    ],
    io,
  );

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), 'searchunveil-skill-'));
  printed = [];
  await write('plan.json', PLAN);
  await write('provider.json', PROVIDER);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('the command line', () => {
  it('explains itself', async () => {
    await run([], io);
    await run(['--help'], io);
    expect(printed).toEqual([USAGE, USAGE]);
  });

  it('reviews a saved page in the person’s language', async () => {
    await write(
      'page.html',
      '<html lang="tr"><head><title>Koşu</title><div>x</div><link rel="canonical" href="/k"></head><body><h1>Koşu</h1><img src="a.jpg"></body></html>',
    );
    await run(
      ['review', path('page.html'), '--url', 'https://ornekspor.com/kosu', '--lang', 'tr'],
      io,
    );
    expect(output()).toContain('## Sayfa incelemesi: Koşu');
    expect(output()).toContain('### Uzman analizi');
    expect(output()).toContain('<https://ornekspor.com/kosu>');
    expect(output()).toMatch(/Head bölümünü sonlandıran: <div>/);
    expect(output()).not.toMatch(/[\u2068\u2069]/);
  });

  it('refuses what it cannot review', async () => {
    await expect(run(['review', path('missing.html')], io)).rejects.toThrow(InputError);
    await expect(run(['review', 'localhost'], io)).rejects.toThrow('No such file or address');
    await write('empty.html', '   ');
    await expect(run(['review', path('empty.html')], io)).rejects.toThrow('page.empty');
  });

  it('reads a Search Console export', async () => {
    const dates = datesFile(
      dailySeries({ start: '2026-08-24', days: 90, clicks: 40, impressions: 1000 }),
    );
    const queries = queriesFile([['running shoes', 120, 2400, 3.1]]);
    await writeFile(path(dates.name), dates.bytes);
    await writeFile(path(queries.name), queries.bytes);
    await run(['search-console', path(dates.name), path(queries.name)], io);
    expect(output()).toContain('## Search Console export');
    expect(output()).toContain('### Overview');
    expect(output()).toMatch(/^- Clicks: [\d,]+$/m);
    expect(output()).toContain('### Findings');
    await expect(run(['search-console'], io)).rejects.toThrow('CSV files or its ZIP');
  });

  it('says what it could not read in an export', async () => {
    await write('notes.txt', 'not a table');
    await run(['search-console', path('notes.txt')], io);
    expect(output()).toContain('## Search Console export');
    expect(output()).toMatch(/^- /m);
  });
});

describe('the AI visibility check', () => {
  it('prices the plan, lists the models and ends with the question', async () => {
    await visibility('estimate', '--lang', 'tr');
    const text = output();
    expect(text).toContain(
      '**Perplexity · sonar**: Çağrı başına $0,005, bu kontrol için yaklaşık $0,03 · En ucuz · Seçili',
    );
    expect(text).toContain('**ChatGPT**: Fiyatı belirtilmemiş');
    expect(text).toContain(
      'Claude, Microsoft Copilot, Gemini ve Google AI Mode Example Tools üzerinde kontrol edilemiyor',
    );
    expect(text).toContain('2 soru × 2 yapay zekâ × 3 tekrar = 12 çağrı');
    expect(text).toContain(
      '> Bu kontrol, Example Tools üzerindeki ücretli araçları kullanır. Tahmini maliyet: 12 çağrı, yaklaşık $0,0612. Bu ücret SearchUnveil aboneliğinize ve 14 günlük ücretsiz deneme sürenize dahil değildir ve Example Tools bakiyenizden kesilir. Başarısız çağrılar ücretlendirilmez. Devam etmek istiyor musunuz?',
    );
  });

  it('lists the calls only after the person agreed', async () => {
    await expect(visibility('calls')).rejects.toThrow('wait until the person answers yes');
    expect(printed).toEqual([]);
    await visibility('calls', '--agreed');
    const calls = output()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(calls).toHaveLength(12);
    expect(calls[0]).toEqual({
      question: 0,
      ask: 'en iyi koşu ayakkabısı',
      engine: 'pplx',
      tool: 'Perplexity · sonar',
      attempt: 1,
      country: 'TR',
      language: 'tr',
    });
    expect(calls.at(-1)).toMatchObject({ question: 1, engine: 'aio', attempt: 3 });
  });

  it('reports the answers, keeps the record and follows it over time', async () => {
    await visibility('calls', '--agreed');
    const calls = output()
      .split('\n')
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    const answers = calls.map((call, index) => {
      if (index === 5) return { ...call, ok: false, failure: 'timeout' };
      const cited = call['engine'] === 'pplx' && call['question'] === 0;
      return {
        ...call,
        ok: true,
        text: call['engine'] === 'aio' ? 'ÖRNEK SPOR’un modelleri' : 'Rakip öne çıkıyor.',
        sources: cited
          ? ['https://tr.wikipedia.org/wiki/Koşu', 'https://www.ornekspor.com/kosu']
          : ['https://rakip.com.tr/a'],
      };
    });
    const lines = [
      ...answers.map((answer) => JSON.stringify(answer)),
      JSON.stringify(answers[0]),
      JSON.stringify({ question: 7, engine: 'pplx', attempt: 1, ok: true, text: '', sources: [] }),
      JSON.stringify({ question: 1, engine: 'aio', attempt: 1 }),
      '[]',
      'not json',
    ];
    await write('answers.jsonl', lines.join('\n'));
    printed = [];
    await visibility('report', '--answers', path('answers.jsonl'), '--save', path('checks'));
    const text = output();
    expect(text).toContain('## Approximate visibility');
    expect(text).toContain('You appear in 8 of 11 answers.');
    expect(text).toContain('Rakip appears in 11 of 11 answers.');
    expect(text).toContain(
      '| en iyi koşu ayakkabısı | Cited (3 of 3), source 2 | Named, no link (2 of 2) |',
    );
    expect(text).toContain('- tr.wikipedia.org: cited in 3 answers');
    expect(text).toContain('This check made 12 calls and cost about $0.056.');
    expect(text).toContain('1 call failed and was not charged.');
    expect(text).toContain('1 call brought no answer: No answer in time (1).');
    const notes = text.slice(text.indexOf('- Line'));
    expect(notes.split('\n').slice(0, 5)).toEqual([
      '- Line 13 repeats an earlier call; the first was kept.',
      '- Line 14 is not one of the planned calls: keep question, engine and attempt as listed.',
      '- Line 15 repeats an earlier call; the first was kept.',
      '- Line 16 is not a JSON object.',
      '- Line 17 is not valid JSON.',
    ]);
    expect(text).toContain('Saved: ');
    const saved = await readdir(path('checks'));
    expect(saved).toEqual(['2026-11-25-ornekspor.com.json']);

    await visibility('report', '--answers', path('answers.jsonl'), '--save', path('checks'));
    expect((await readdir(path('checks'))).sort()).toEqual([
      '2026-11-25-ornekspor.com-2.json',
      '2026-11-25-ornekspor.com.json',
    ]);
    await write('broken.json', '{');
    printed = [];
    const checks = (await readdir(path('checks'))).map((name) => join(path('checks'), name));
    await run(['visibility', 'trend', ...checks, path('broken.json')], io);
    expect(output()).toContain('## Change over time');
    expect(output()).toContain('| Örnek Spor | 8 of 11 | 8 of 11 |');
    expect(output()).toContain('Compared on 2 questions and Perplexity and Google AI Overviews');
    expect(output()).toContain('broken.json: visibility.invalid-json');
  });

  it('notes a check that is missing answers', async () => {
    await write('answers.jsonl', '');
    await visibility('report', '--answers', path('answers.jsonl'));
    expect(output()).toContain('You stopped the check');
    expect(output()).toContain('No answer came back');
  });

  it('uses the plan as written, when it names engines and repeats', async () => {
    await write('plan.json', { ...PLAN, engines: ['pplx-pro'], repeats: 1 });
    await visibility('estimate');
    expect(output()).toContain('2 questions × 1 AI × 1 time = 2 calls');
    expect(output()).toContain(
      '**Perplexity · pro**: $0.013 per call, about $0.026 for this check · Chosen',
    );
  });

  it('says exactly what is wrong with its files', async () => {
    const fails = async (file: string, value: unknown, message: string) => {
      await write(file, value);
      await expect(visibility('estimate')).rejects.toThrow(message);
      await write('plan.json', PLAN);
      await write('provider.json', PROVIDER);
    };
    await fails('provider.json', '[]', 'must hold a JSON object');
    await fails('provider.json', '{', 'not valid JSON');
    await fails('provider.json', { ...PROVIDER, id: '' }, 'provider.id');
    await fails('provider.json', { ...PROVIDER, label: 3 }, 'provider.label');
    await fails('provider.json', { ...PROVIDER, currency: 'dollars' }, 'ISO 4217');
    await fails('provider.json', { ...PROVIDER, chargesFailedCalls: 'no' }, 'true or false');
    await fails('provider.json', { ...PROVIDER, billing: 'card' }, '"balance" or "account"');
    await fails('provider.json', { ...PROVIDER, engines: [] }, 'must list the engines');
    await fails('provider.json', { ...PROVIDER, engines: [{ id: 'x' }] }, 'provider.engines[0]');
    const twice = [PROVIDER.engines[0], PROVIDER.engines[0]];
    await fails('provider.json', { ...PROVIDER, engines: twice }, 'repeats an id');
    await fails('plan.json', 'null', 'must hold a JSON object');
    await fails('plan.json', { ...PLAN, questions: 'one' }, 'questions (a list of text)');
    await fails(
      'plan.json',
      { ...PLAN, repeats: 9, engines: ['gemini'] },
      'repeats: out-of-range (limit 5)',
    );
    await expect(
      run(
        [
          'visibility',
          'estimate',
          '--plan',
          path('none.json'),
          '--provider',
          path('provider.json'),
        ],
        io,
      ),
    ).rejects.toThrow('Cannot read the plan file');
    await expect(run(['visibility', 'estimate'], io)).rejects.toThrow('--plan is required');
    await expect(visibility('report', '--answers', path('none.jsonl'))).rejects.toThrow(
      'Cannot read the answers file',
    );
    await expect(visibility('guess')).rejects.toThrow('Unknown visibility command');
    await expect(run(['visibility', 'trend'], io)).rejects.toThrow('saved checks to compare');
  });

  it('warns at the start of a free trial', async () => {
    await run(['notice', 'trial', '--provider', 'Example Tools', '--lang', 'en'], io);
    expect(output()).toBe(
      'Your 14-day free trial covers the SearchUnveil subscription only. The AI visibility check uses paid tools on Example Tools, and their fees are charged to your Example Tools balance during the trial too.',
    );
    await expect(run(['notice', 'other'], io)).rejects.toThrow('Unknown notice');
    await expect(run(['notice', 'trial'], io)).rejects.toThrow('--provider is required');
    await expect(run(['dance'], io)).rejects.toThrow('Unknown command: dance');
  });
});

describe('main', () => {
  it('exits with a code and a message people can act on', async () => {
    const out = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const err = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    expect(await main([])).toBe(0);
    expect(out).toHaveBeenCalledWith(`${USAGE}\n`);
    expect(await main(['dance'])).toBe(1);
    expect(await main(['--nope'])).toBe(1);
    expect(err.mock.calls.map(([text]) => String(text)).join('')).not.toContain('Unexpected');
    expect(await main(['search-console', path('missing.csv')])).toBe(1);
    expect(String(err.mock.calls.at(-1)?.[0])).toContain('Cannot read');
    out.mockImplementationOnce(() => {
      throw new RangeError('boom');
    });
    expect(await main([])).toBe(2);
    expect(String(err.mock.calls.at(-1)?.[0])).toContain('Unexpected error: boom');
  });
});
