import {
  createTranslator,
  matchLocale,
  type CoreMessageKey,
  type Finding,
  type Locale,
  type Translator,
} from '@searchunveil/core';
import { CORE_CATALOGS } from '@searchunveil/core/catalogs';
import { uiAr } from '../../web/src/messages/ar.ts';
import { uiDe } from '../../web/src/messages/de.ts';
import { uiEn, type UiMessageKey } from '../../web/src/messages/en.ts';
import { uiEs } from '../../web/src/messages/es.ts';
import { uiFr } from '../../web/src/messages/fr.ts';
import { uiTr } from '../../web/src/messages/tr.ts';
import { uiZhCN } from '../../web/src/messages/zh-CN.ts';

/**
 * Words and Markdown for the command line. The skill speaks the person's language with the web
 * app's own catalogs, so the same finding reads the same in both.
 */

export type MessageKey = CoreMessageKey | UiMessageKey;
export type Words = Translator<MessageKey>;

const UI = { en: uiEn, es: uiEs, de: uiDe, fr: uiFr, tr: uiTr, 'zh-CN': uiZhCN, ar: uiAr };

/** The translator for a language tag such as `tr` or `pt-BR`; unknown languages get English. */
export function wordsFor(tag: string | undefined): Words {
  const locale: Locale = matchLocale(tag === undefined ? [] : [tag]);
  return createTranslator<MessageKey>(locale, { ...CORE_CATALOGS[locale], ...UI[locale] });
}

/**
 * Text without the invisible marks that keep inserted names' direction in a browser. In a
 * terminal, or in an assistant's answer, they are only noise.
 */
export function plain(text: string): string {
  return text.replace(/[\u2068\u2069]/g, '');
}

/** One table cell: on one line, with pipes escaped. */
function cell(text: string): string {
  return plain(text)
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\|/g, '\\|');
}

export function table(head: readonly string[], rows: readonly (readonly string[])[]): string {
  const line = (cells: readonly string[]) => `| ${cells.map(cell).join(' | ')} |`;
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

/** Markdown for findings, each under a heading of `level`. */
export function findingsMarkdown(findings: readonly Finding[], t: Words, level: number): string {
  const hashes = '#'.repeat(level);
  return findings
    .map((finding) => {
      const parts = [`${hashes} ${t.t(`status.${finding.status}`)}: ${t.message(finding.title)}`];
      if (finding.summary !== undefined) parts.push(t.message(finding.summary));
      if (finding.evidence.length > 0) {
        parts.push(
          [
            `**${t.t('ui.finding.evidence')}**`,
            ...finding.evidence.map((e) => `- ${t.message(e.label)}: ${t.value(e.value)}`),
          ].join('\n'),
        );
      }
      if (finding.table !== undefined) {
        parts.push(
          table(
            finding.table.columns.map((column) => t.message(column.label)),
            finding.table.rows.map((row) => row.map((value) => t.value(value))),
          ),
        );
      }
      const list = (key: MessageKey, items: readonly string[]) => {
        if (items.length > 0)
          parts.push([`**${t.t(key)}**`, ...items.map((i) => `- ${i}`)].join('\n'));
      };
      list(
        'ui.finding.next',
        finding.nextChecks.map((m) => t.message(m)),
      );
      list(
        'ui.finding.limits',
        finding.limitations.map((m) => t.message(m)),
      );
      list(
        'ui.finding.sources',
        finding.references.map((r) => `[${t.message(r.title)}](${r.url})`),
      );
      return plain(parts.join('\n\n'));
    })
    .join('\n\n');
}
