import {
  capitalize,
  isStopword,
  joinsWithoutSpaces,
  sentences,
  tokenize,
  type Token,
} from './language.ts';

/**
 * What a page is about, read from its words: the phrases its title, headings, description and
 * text repeat most, and the names it mentions. Plain counting with weights: a word in the title
 * counts more than a word in a paragraph, and a phrase of two or three words counts more than
 * its words alone, because it says more.
 */

export interface TextField {
  readonly text: string;
  /** How much a word here says about the page: 3 for the title, 1 for body text. */
  readonly weight: number;
}

export interface Phrase {
  /** The phrase as the page most often writes it. */
  readonly text: string;
  /** Lower-cased words, for comparisons. */
  readonly norm: string;
  readonly words: number;
  readonly score: number;
}

/** Phrases of more than one word must appear this often, unless a title or heading uses them. */
const MIN_PHRASE_COUNT = 2;
const PHRASE_BONUS = [0, 1, 1.6, 2] as const;

export function keyPhrases(
  fields: readonly TextField[],
  language: string | null,
  limit = 8,
): Phrase[] {
  const scores = new Map<string, { score: number; count: number; strong: boolean }>();
  const surfaces = new Map<string, Map<string, number>>();

  const glue = joinsWithoutSpaces(language) ? '' : ' ';
  const add = (words: readonly Token[], weight: number) => {
    const norm = words.map((w) => w.norm).join(' ');
    const surface = words.map((w) => w.surface).join(glue);
    const entry = scores.get(norm) ?? { score: 0, count: 0, strong: false };
    entry.score += weight;
    entry.count += 1;
    entry.strong ||= weight >= 2;
    scores.set(norm, entry);
    const forms = surfaces.get(norm) ?? new Map<string, number>();
    // How a title or heading writes a phrase wins over how body text writes it, however often.
    forms.set(surface, (forms.get(surface) ?? 0) + (weight >= 2 ? 1000 * weight : 1));
    surfaces.set(norm, forms);
  };

  for (const field of fields) {
    let run: Token[] = [];
    for (const token of tokenize(field.text, language)) {
      const useful = isContentWord(token, language);
      if (token.breakBefore || !useful) run = [];
      if (!useful) continue;
      run.push(token);
      if (run.length > 3) run = run.slice(-3);
      for (let size = 1; size <= run.length; size++) add(run.slice(-size), field.weight);
    }
  }

  const phrases: Phrase[] = [];
  for (const [norm, entry] of scores) {
    const words = norm.split(' ').length;
    if (words > 1 && entry.count < MIN_PHRASE_COUNT && !entry.strong) continue;
    const forms = [...(surfaces.get(norm) ?? new Map<string, number>())].sort(
      (a, b) => b[1] - a[1],
    );
    phrases.push({
      text: forms[0]?.[0] ?? norm,
      norm,
      words,
      score: entry.score * (PHRASE_BONUS[words] ?? 2),
    });
  }
  phrases.sort((a, b) => b.score - a.score || b.words - a.words);

  // A word already covered by a stronger phrase adds nothing: keep the phrase.
  const kept: Phrase[] = [];
  for (const phrase of phrases) {
    if (kept.some((other) => containsWords(other.norm, phrase.norm))) continue;
    kept.push(phrase);
    if (kept.length >= limit) break;
  }
  return kept;
}

/** Currency codes and units: frequent next to prices, never the subject of a page. */
const UNITS = new Set(['tl', 'try', 'usd', 'eur', 'gbp', 'chf', 'kg', 'cm', 'mm', 'km', 'ml']);

function isContentWord(token: Token, language: string | null): boolean {
  if (/^\p{N}/u.test(token.norm) || UNITS.has(token.norm)) return false;
  if (isStopword(token.norm, language)) return false;
  // One-letter Latin words carry no subject; a single Chinese character often does not either.
  return Array.from(token.norm).length >= 2;
}

/** Whether `phrase` contains all the words of `part`, in order. */
export function containsWords(phrase: string, part: string): boolean {
  return ` ${phrase} `.includes(` ${part} `);
}

/** Whether `text` mentions `phrase`, comparing words regardless of case. */
export function mentions(text: string, phrase: Phrase, language: string | null): boolean {
  const norm = tokenize(text, language)
    .map((t) => t.norm)
    .join(' ');
  return containsWords(norm, phrase.norm);
}

export interface ProperName {
  readonly name: string;
  readonly count: number;
  /** Written as a place: after "in", "à", "en"…, or with a Turkish locative ending (`İzmir’de`). */
  readonly located: boolean;
  /** The first sentence it appears in, counting from 0. */
  readonly firstSentence: number;
}

/** Words that put a place after them, per language. */
const LOCATION_WORDS: Readonly<Record<string, ReadonlySet<string>>> = {
  en: new Set(['in', 'at', 'near', 'from']),
  de: new Set(['in', 'bei', 'aus', 'nahe']),
  es: new Set(['en', 'cerca']),
  fr: new Set(['à', 'en', 'près']),
  it: new Set(['a', 'in', 'presso']),
  pt: new Set(['em', 'no', 'na']),
  nl: new Set(['in', 'bij']),
};

/** Turkish locative endings, as written after a name: ’de, ’ta, ’nda, ’daki… */
const TURKISH_LOCATIVE = /^['’]n?[dt][ae](ki)?$/u;

/**
 * Names the text mentions, such as places and brands: words written with a capital letter where
 * a sentence does not require one. Only real sentences count, since menus and headings
 * capitalize every word; and only scripts with capital letters.
 */
export function properNames(text: string, language: string | null, limit = 5): ProperName[] {
  const found = new Map<string, { count: number; located: boolean; firstSentence: number }>();
  const lowered = new Set<string>();
  const locationWords = LOCATION_WORDS[language ?? ''] ?? new Set<string>();

  sentences(text, language)
    .filter((sentence) => /[.!?。！？]$/u.test(sentence))
    .forEach((sentence, sentenceIndex) => {
      const tokens = tokenize(sentence, language);
      let run: Token[] = [];
      let runStart = 0;
      const close = () => {
        // A capitalized first word is just the start of a sentence, unless a name continues it.
        if (run.length === 0 || (runStart === 0 && run.length === 1)) return;
        const name = run.map((token) => token.surface).join(' ');
        const previous = tokens[runStart - 1];
        const located =
          (previous !== undefined && locationWords.has(previous.norm)) ||
          (language === 'tr' && TURKISH_LOCATIVE.test(run[run.length - 1]?.clitic ?? ''));
        const entry = found.get(name) ?? { count: 0, located: false, firstSentence: sentenceIndex };
        entry.count += 1;
        entry.located ||= located;
        found.set(name, entry);
      };
      tokens.forEach((token, index) => {
        const capital = /^\p{Lu}/u.test(token.surface) && !/^\p{Lu}+$/u.test(token.surface);
        if (!capital) lowered.add(token.norm);
        const name = capital && !isStopword(token.norm, language);
        if (name && !token.breakBefore && run.length > 0) {
          run.push(token);
          return;
        }
        close();
        run = name ? [token] : [];
        runStart = index;
      });
      close();
    });

  return [...found]
    .filter(([name]) => !lowered.has(name.toLocaleLowerCase(language ?? undefined)))
    .sort((a, b) => b[1].count - a[1].count || a[1].firstSentence - b[1].firstSentence)
    .slice(0, limit)
    .map(([name, entry]) => ({ name, ...entry }));
}

/** A phrase written the way titles write it in the language. */
export function titleCase(phrase: string, language: string | null): string {
  // English and Turkish titles capitalize each main word; most other languages only the first.
  if (language === 'en' || language === 'tr') {
    return phrase
      .split(' ')
      .map((word, index) =>
        index > 0 && isStopword(word, language) ? word : capitalize(word, language),
      )
      .join(' ');
  }
  return capitalize(phrase, language);
}
