import { siteAddress } from '../audit/review.ts';
import { fold } from '../text/fold.ts';
import type { Brand } from './plan.ts';

/**
 * How an AI answer is checked for a brand, whichever way the answer writes it.
 *
 * A site counts when a source is on its host or on a subdomain: `www.example.com`,
 * `example.com/blog` and `shop.example.com` are all example.com. A name counts when it appears
 * as whole words, ignoring case, accents and Turkish dotted and dotless i, so "ÖRNEK SPOR",
 * "Ornek Spor", "örnek spor" and "OrnekSpor" are one name.
 */

/** The site an address belongs to: its host without `www.`; `null` when it is not an address. */
export function siteKey(input: string): string | null {
  const address = siteAddress(input);
  if (address === null) return null;
  return new URL(address).hostname.replace(/\.$/, '').replace(/^www\./, '');
}

/** Whether `host` is the site `key` itself or one of its subdomains. */
export function onSite(host: string, key: string): boolean {
  return host === key || host.endsWith(`.${key}`);
}

/**
 * Where the site first appears among an answer's sources, counting from 1; `null` when it is
 * not among them. Entries that are not web addresses keep their place, so positions match the
 * list the answer showed.
 */
export function sourcePosition(sources: readonly string[], site: string): number | null {
  const key = siteKey(site);
  return key === null ? null : positionOf(sources, key);
}

function positionOf(sources: readonly string[], key: string): number | null {
  for (const [index, source] of sources.entries()) {
    const host = siteKey(source);
    if (host !== null && onSite(host, key)) return index + 1;
  }
  return null;
}

/** Scripts written without spaces between words, where a name is found inside longer text. */
const UNSPACED =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

/** Words only: folded, with symbols such as ® and ™ read as spaces. */
function words(text: string): string {
  return fold(text.replace(/\p{S}/gu, ' '))
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** The forms a name is looked for in: as written, written together, and split at capitals. */
function nameForms(name: string): string[] {
  const forms = new Set<string>();
  for (const form of [name, name.replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')]) {
    const folded = words(form);
    if (folded === '') continue;
    forms.add(folded);
    forms.add(folded.replaceAll(' ', ''));
  }
  return [...forms];
}

function hasForm(folded: string, forms: readonly string[]): boolean {
  const haystack = ` ${folded} `;
  return forms.some((form) =>
    UNSPACED.test(form) ? haystack.includes(form) : haystack.includes(` ${form} `),
  );
}

/**
 * Whether `text` names the brand: the name's words in a row, written together ("ornekspor"
 * for "Ornek Spor") or split at capitals ("Ornek Spor" for "OrnekSpor"). Words must stand
 * alone, so "Ornek" is not found in "ornekler"; in scripts written without spaces, such as
 * Chinese, the name is found anywhere.
 */
export function mentionsName(text: string, name: string): boolean {
  return hasForm(words(text), nameForms(name));
}

/** Whether `text` writes the site's address, such as "example.com" or "www.example.com/shop". */
export function mentionsSite(text: string, site: string): boolean {
  const key = siteKey(site);
  return key !== null && writesSite(text, key);
}

function writesSite(text: string, key: string): boolean {
  for (const token of text.normalize('NFC').split(/[^\p{L}\p{M}\p{N}.-]+/u)) {
    const candidate = token.replace(/^[.-]+|[.-]+$/g, '');
    if (!candidate.includes('.')) continue;
    const host = siteKey(candidate);
    if (host !== null && onSite(host, key)) return true;
  }
  return false;
}

/**
 * How a brand appears in one answer:
 * - `cited`: the site is among the answer's sources;
 * - `named`: the answer names the brand or writes its address, without citing the site;
 * - `absent`: neither.
 */
export type Presence = 'cited' | 'named' | 'absent';

export interface BrandMatch {
  readonly presence: Presence;
  /** The site's place among the answer's sources, from 1, when it is cited. */
  readonly position: number | null;
}

/** Text and sources: the parts of an answer that are checked. */
export interface AnswerContent {
  readonly text: string;
  readonly sources: readonly string[];
}

/**
 * Prepares the checks for one brand, so that many answers can be checked against it. A brand
 * whose address is not valid can still be named.
 */
export function brandMatcher(brand: Brand): (answer: AnswerContent) => BrandMatch {
  const key = siteKey(brand.site);
  const forms = [brand.name, ...(brand.aliases ?? [])].flatMap(nameForms);
  return (answer) => {
    const position = key === null ? null : positionOf(answer.sources, key);
    if (position !== null) return { presence: 'cited', position };
    const named =
      (forms.length > 0 && hasForm(words(answer.text), forms)) ||
      (key !== null && writesSite(answer.text, key));
    return { presence: named ? 'named' : 'absent', position: null };
  };
}

/** How a brand appears in one answer. */
export function matchBrand(brand: Brand, answer: AnswerContent): BrandMatch {
  return brandMatcher(brand)(answer);
}
