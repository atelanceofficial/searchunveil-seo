/**
 * Folding for comparisons that should ignore case, accents, character width, punctuation
 * and spacing: "Häufigste Suchanfragen" matches "haufigste suchanfragen", "ＣＴＲ" matches
 * "ctr", and "TIKLAMALAR" matches "Tıklamalar" (the Turkish dotless ı folds to i).
 */
export interface FoldedText {
  readonly text: string;
  /** `origin[i]` is the index in the original string of the folded character `i`. */
  readonly origin: readonly number[];
}

const SEPARATOR = /[\s\p{P}_]/u;
const COMBINING_MARK = /\p{M}/gu;

export function foldWithOrigin(input: string): FoldedText {
  const characters: string[] = [];
  const origin: number[] = [];
  let pendingSpace = false;
  let index = 0;

  for (const character of input) {
    const start = index;
    index += character.length;
    if (SEPARATOR.test(character)) {
      pendingSpace = characters.length > 0;
      continue;
    }
    const folded = character
      .normalize('NFKD')
      .replace(COMBINING_MARK, '')
      .toLowerCase()
      .replaceAll('ı', 'i')
      .replaceAll('ß', 'ss');
    if (folded === '') continue;
    if (pendingSpace) {
      characters.push(' ');
      origin.push(start);
      pendingSpace = false;
    }
    for (const part of folded) {
      characters.push(part);
      origin.push(start);
    }
  }
  return { text: characters.join(''), origin };
}

export function fold(input: string): string {
  return foldWithOrigin(input).text;
}

/** True for characters of scripts written without spaces between words (Chinese, Japanese). */
export function isCjk(character: string): boolean {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(character);
}
