import { displayWidth } from '../audit/review.ts';
import { mentions, properNames, titleCase, type Phrase, type ProperName } from './keywords.ts';
import { joinsWithoutSpaces, sentences, tokenize } from './language.ts';

/**
 * Title and description ideas, assembled from the page's own words: never invented. A title idea
 * names the page's subject, a place when the page clearly says where it is, and the brand; a
 * description idea is the page's most telling sentence, sometimes with the one after it.
 */

/** Widths, in the display units of `displayWidth`, that search results usually show. */
export const IDEA_LIMITS = Object.freeze({ title: 60, description: 155, descriptionMin: 70 });

/** Headings and titles that could stand on any site: they say nothing about the page. */
// prettier-ignore
const GENERIC = new Set([
  'home', 'homepage', 'home page', 'welcome', 'untitled', 'index', 'main page', 'hello',
  'hello world', 'anasayfa', 'ana sayfa', 'hoş geldiniz', 'hoşgeldiniz', 'merhaba', 'başlıksız',
  'startseite', 'willkommen', 'herzlich willkommen', 'inicio', 'bienvenido', 'bienvenidos',
  'bienvenida', 'página principal', 'accueil', 'bienvenue', 'page d’accueil', "page d'accueil",
  'الرئيسية', 'الصفحة الرئيسية', 'مرحبا', 'أهلا وسهلا', 'اهلا وسهلا', '首页', '主页', '欢迎', '欢迎光临',
  'benvenuti', 'benvenuto', 'início', 'bem-vindo', 'bem-vindos', 'página inicial', 'welkom',
]);

export function isGeneric(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+$/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized === '' || GENERIC.has(normalized);
}

export interface SuggestionInput {
  /** The language the page is written in (a base code such as `tr`), when known. */
  readonly language: string | null;
  readonly title: string | null;
  readonly h1: string | null;
  readonly siteName: string | null;
  readonly url: string | null;
  readonly text: string;
  readonly phrases: readonly Phrase[];
}

/**
 * The brand, when the page names it: its link-preview site name, or the part of a title such as
 * "Trail shoes | Stride" that matches the site's address or is short enough to be a name.
 */
export function brandOf(input: SuggestionInput): string | null {
  const siteName = input.siteName?.trim() ?? '';
  if (siteName !== '' && siteName.length <= 40) return siteName;
  const parts = (input.title ?? '')
    .split(/\s[|–—·•:]\s|\s-\s/u)
    .map((part) => part.trim())
    .filter((part) => part !== '');
  if (parts.length < 2) return null;
  const label = domainLabel(input.url);
  const matching = parts.find((part) => label !== null && fold(part).includes(label));
  if (matching !== undefined) return matching;
  const last = parts[parts.length - 1] ?? '';
  return last.split(/\s+/).length <= 3 ? last : null;
}

/** The subject a title should name: the main heading when it says something, else the top phrase. */
export function subjectOf(input: SuggestionInput, brand: string | null): string | null {
  const h1 = input.h1?.replace(/\s+/g, ' ').trim() ?? '';
  // Languages without spaces count characters; others count words.
  const size = joinsWithoutSpaces(input.language)
    ? Array.from(h1).length / 2
    : h1.split(' ').length;
  if (h1 !== '' && !isGeneric(h1) && size >= 2 && size <= 8 && displayWidth(h1) <= 50) {
    return titleCase(h1, input.language);
  }
  const phrase = input.phrases.find(
    (candidate) => brand === null || !fold(brand).includes(fold(candidate.text)),
  );
  return phrase === undefined ? null : titleCase(phrase.text, input.language);
}

/** A place the page says it is in: named early, or more than once, and written as a place. */
export function placeOf(input: SuggestionInput, subject: string | null): ProperName | null {
  const names = properNames(input.text, input.language);
  return (
    names.find(
      (name) =>
        name.located &&
        (name.firstSentence <= 1 || name.count >= 2) &&
        (subject === null || !fold(subject).includes(fold(name.name))),
    ) ?? null
  );
}

const PLACE_TEMPLATES: Readonly<Record<string, (subject: string, place: string) => string>> = {
  en: (subject, place) => `${subject} in ${place}`,
  de: (subject, place) => `${subject} in ${place}`,
  nl: (subject, place) => `${subject} in ${place}`,
  es: (subject, place) => `${subject} en ${place}`,
  fr: (subject, place) => `${subject} à ${place}`,
  it: (subject, place) => `${subject} a ${place}`,
  pt: (subject, place) => `${subject} em ${place}`,
  tr: (subject, place) => `${place} ${subject}`,
  ar: (subject, place) => `${subject} في ${place}`,
  zh: (subject, place) => `${place}${subject}`,
  ja: (subject, place) => `${place}の${subject}`,
};

/** Up to three title ideas, each within the width results usually show, none equal to the title. */
export function titleIdeas(input: SuggestionInput): string[] {
  const brand = brandOf(input);
  const subject = subjectOf(input, brand);
  if (subject === null) return [];
  const place = placeOf(input, subject);
  const second = input.phrases.find(
    (phrase) =>
      !fold(subject).includes(fold(phrase.text)) &&
      !fold(phrase.text).includes(fold(subject)) &&
      (brand === null || !fold(brand).includes(fold(phrase.text))) &&
      (place === null || !fold(place.name).includes(fold(phrase.text))),
  );

  const cores: string[] = [];
  if (place !== null) {
    const template = PLACE_TEMPLATES[input.language ?? ''] ?? ((s, p) => `${s} – ${p}`);
    cores.push(template(subject, place.name));
  }
  if (second !== undefined) {
    cores.push(`${subject} – ${titleCase(second.text, input.language)}`);
  }
  cores.push(subject);

  const ideas: string[] = [];
  const current = fold(input.title ?? '');
  for (const core of cores) {
    const branded =
      brand === null || fold(core).includes(fold(brand)) ? core : `${core} | ${brand}`;
    const idea = displayWidth(branded) <= IDEA_LIMITS.title ? branded : core;
    if (displayWidth(idea) > IDEA_LIMITS.title || fold(idea) === current) continue;
    if (!ideas.some((other) => fold(other) === fold(idea))) ideas.push(idea);
  }
  return ideas.slice(0, 3);
}

/** Words that mark text no description should repeat. */
const BOILERPLATE =
  /©|cookie|çerez|rights reserved|hakları saklıdır|alle rechte|derechos reservados|droits réservés|javascript|newsletter|版权所有|جميع الحقوق/iu;

/**
 * Up to two description ideas: the sentences that say most about the page's main phrases, early
 * on, joined with the sentence after them when there is room.
 */
export function descriptionIdeas(input: SuggestionInput): string[] {
  const all = sentences(input.text, input.language);
  const top = input.phrases.slice(0, 6);
  const best = top[0]?.score ?? 1;
  let complete = 0;
  const scored = all
    .map((sentence, index) => {
      const width = displayWidth(sentence);
      const ends = /[.!?。！？]$/u.test(sentence);
      const words = tokenize(sentence, input.language).length;
      if (!ends || width < 25 || width > IDEA_LIMITS.description || BOILERPLATE.test(sentence)) {
        return { sentence, index, score: -1 };
      }
      const coverage = top
        .filter((phrase) => mentions(sentence, phrase, input.language))
        .reduce((sum, phrase) => sum + phrase.score / best, 0);
      // The page's first sentences usually introduce it best.
      const lead = [0.9, 0.5, 0.3][complete] ?? 0;
      complete++;
      const enough = words >= 6 || joinsWithoutSpaces(input.language) ? 0.2 : -0.3;
      // Phone numbers belong on the page, not in a search snippet.
      const contact = /\d[\d\s().-]{8,}\d/u.test(sentence) ? -0.6 : 0;
      return { sentence, index, score: coverage + lead + enough + contact };
    })
    .filter((entry) => entry.score > 0.2);
  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const ideas: string[] = [];
  const used = new Set<number>();
  for (const entry of scored) {
    if (used.has(entry.index)) continue;
    let idea = entry.sentence;
    used.add(entry.index);
    // Add the following sentence while the idea is short and the result still fits.
    for (let next = entry.index + 1; next < all.length; next++) {
      const following = all[next] ?? '';
      const joined = joinsWithoutSpaces(input.language) ? idea + following : `${idea} ${following}`;
      if (
        displayWidth(idea) >= 110 ||
        displayWidth(joined) > IDEA_LIMITS.description ||
        !/[.!?。！？]$/u.test(following) ||
        BOILERPLATE.test(following) ||
        /\d[\d\s().-]{8,}\d/u.test(following)
      ) {
        break;
      }
      idea = joined;
      used.add(next);
    }
    if (displayWidth(idea) >= IDEA_LIMITS.descriptionMin) ideas.push(idea);
    if (ideas.length === 2) break;
  }
  return ideas;
}

/** Lower-cased letters and digits only, for loose comparisons ("Stride Co." matches "stride co"). */
export function fold(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function domainLabel(url: string | null): string | null {
  if (url === null) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const label = host.split('.')[0] ?? '';
    return label.length >= 3 ? fold(label) : null;
  } catch {
    return null;
  }
}
