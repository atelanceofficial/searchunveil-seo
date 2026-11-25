import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { siteAddress } from '@searchunveil/core';
import { ReviewError, reviewMarkdown, reviewPage } from './review.ts';
import { analyzeExport, searchConsoleMarkdown } from './search-console.ts';
import { wordsFor } from './text.ts';
import {
  buildRecord,
  callLines,
  estimateMarkdown,
  InputError,
  loadInputs,
  loadRecords,
  readAnswerLines,
  reportMarkdown,
  saveRecord,
  trendMarkdown,
  trialMarkdown,
} from './visibility.ts';

export const USAGE = `SearchUnveil: how a website gets found by search engines and AI answers.

Usage: node searchunveil.mjs <command> [options]

  review <page.html | address>      Review one page: a saved HTML file, or a web address.
      --url <address>               The address of a saved page, for checks that compare links.
  search-console <file>...          Read a Search Console export: its CSV files or its ZIP.
  visibility estimate               Price an AI visibility check and print the cost notice.
      --plan plan.json --provider provider.json
  visibility calls --agreed         List the calls to make, once the person agreed to the cost.
      --plan plan.json --provider provider.json
  visibility report                 Check the answers and report who is cited or named.
      --plan plan.json --provider provider.json --answers answers.jsonl [--save <folder>]
  visibility trend <check.json>...  Compare saved checks over time.
  notice trial --provider <name>    The warning to show when a free trial starts.

Every command takes --lang <code> (en, tr, de, es, fr, zh-CN, ar) and prints Markdown.`;

export interface CliIO {
  readonly out: (text: string) => void;
  readonly now: () => Date;
}

const OPTIONS = {
  lang: { type: 'string' },
  url: { type: 'string' },
  plan: { type: 'string' },
  provider: { type: 'string' },
  answers: { type: 'string' },
  save: { type: 'string' },
  agreed: { type: 'boolean', default: false },
  help: { type: 'boolean', short: 'h', default: false },
} as const;

function required(value: string | undefined, name: string): string {
  if (value === undefined || value === '') throw new InputError(`--${name} is required.`);
  return value;
}

/** Runs one command. Problems the person can fix throw `InputError` or `ReviewError`. */
export async function run(argv: readonly string[], io: CliIO): Promise<void> {
  const { values, positionals } = parseArgs({
    args: [...argv],
    options: OPTIONS,
    allowPositionals: true,
    strict: true,
  });
  const [command, sub, ...rest] = positionals;
  const t = wordsFor(values.lang);
  if (values.help || command === undefined || command === 'help') {
    io.out(USAGE);
    return;
  }

  switch (command) {
    case 'review': {
      const target = required(sub, 'page');
      let bytes: Uint8Array | null = null;
      try {
        bytes = await readFile(target);
      } catch {
        if (siteAddress(target) === null)
          throw new InputError(`No such file or address: ${target}`);
      }
      const report = await reviewPage(
        bytes === null
          ? { address: target }
          : { html: values.url === undefined ? { bytes } : { bytes, url: values.url } },
      );
      io.out(reviewMarkdown(report, t));
      return;
    }
    case 'search-console': {
      const files = sub === undefined ? [] : [sub, ...rest];
      if (files.length === 0) throw new InputError('Give the export’s CSV files or its ZIP.');
      io.out(searchConsoleMarkdown(await analyzeExport(files), t));
      return;
    }
    case 'visibility':
      await visibility(sub, rest, values, io, t);
      return;
    case 'notice':
      if (sub !== 'trial')
        throw new InputError('Unknown notice. Try: notice trial --provider <name>');
      io.out(trialMarkdown(required(values.provider, 'provider'), t));
      return;
    default:
      throw new InputError(`Unknown command: ${command}\n\n${USAGE}`);
  }
}

async function visibility(
  sub: string | undefined,
  rest: readonly string[],
  values: {
    plan?: string | undefined;
    provider?: string | undefined;
    answers?: string | undefined;
    save?: string | undefined;
    agreed: boolean;
  },
  io: CliIO,
  t: ReturnType<typeof wordsFor>,
): Promise<void> {
  if (sub === 'trend') {
    if (rest.length === 0) throw new InputError('Give the saved checks to compare.');
    const { records, problems } = await loadRecords(rest);
    io.out([trendMarkdown(records, t), ...problems.map((p) => `- ${p}`)].join('\n\n'));
    return;
  }
  const { plan, provider } = await loadInputs(
    required(values.plan, 'plan'),
    required(values.provider, 'provider'),
  );
  switch (sub ?? '') {
    case 'estimate':
      io.out(estimateMarkdown(plan, provider, t));
      return;
    case 'calls':
      io.out(callLines(plan, provider, values.agreed));
      return;
    case 'report': {
      const path = required(values.answers, 'answers');
      let text: string;
      try {
        text = await readFile(path, 'utf8');
      } catch {
        throw new InputError(`Cannot read the answers file: ${path}`);
      }
      const read = readAnswerLines(text);
      const { record, problems } = buildRecord(plan, provider, read.entries, io.now());
      const parts = [reportMarkdown(record, provider, t)];
      const lineOf = (note: string) => Number(/^Line (\d+)/.exec(note)?.[1] ?? 0);
      const notes = [...read.problems, ...problems].sort((a, b) => lineOf(a) - lineOf(b));
      if (notes.length > 0) parts.push(notes.map((note) => `- ${note}`).join('\n'));
      if (values.save !== undefined) parts.push(`Saved: ${await saveRecord(record, values.save)}`);
      io.out(parts.join('\n\n'));
      return;
    }
    default:
      throw new InputError('Unknown visibility command. Try: estimate, calls, report or trend.');
  }
}

/** Runs the command line and turns problems into a message and an exit code. */
export async function main(argv: readonly string[]): Promise<number> {
  const io: CliIO = { out: (text) => process.stdout.write(`${text}\n`), now: () => new Date() };
  try {
    await run(argv, io);
    return 0;
  } catch (error) {
    const code = (error as { code?: unknown }).code;
    const known =
      error instanceof InputError ||
      error instanceof ReviewError ||
      (typeof code === 'string' && code.startsWith('ERR_PARSE_ARGS'));
    const text = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${known ? '' : 'Unexpected error: '}${text}\n`);
    return known ? 1 : 2;
  }
}
