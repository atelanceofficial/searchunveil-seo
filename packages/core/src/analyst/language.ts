/**
 * Language tools for the analyst: which language a text is written in, its words and its
 * sentences. Everything runs on the platform's own Unicode data (`Intl.Segmenter`, Unicode
 * property escapes), with small word lists, so it works offline in browsers and Node.js.
 */

/**
 * The most frequent function words of each language, lower-cased: what a text is not about.
 * Each list ends with interface words (home, menu, contact…) that say nothing about a page.
 */
// prettier-ignore
const STOPWORDS: Readonly<Record<string, readonly string[]>> = {
  en: [
    'a', 'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as',
    'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'get', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'his',
    'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'it’s', 'just', 'let’s', 'like', 'many',
    'may', 'me', 'more', 'most', 'much', 'my', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
    'once', 'one', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'per', 'same',
    'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
    'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
    'up', 'us', 'very', 'via', 'was', 'we', 'we’re', 'well', 'were', 'what', 'when', 'where',
    'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'you’re', 'your',
    'yours', 'home', 'welcome', 'menu', 'contact', 'login', 'log', 'sign', 'cookie', 'cookies',
    'privacy', 'policy', 'rights', 'reserved', 'copyright', 'skip', 'search', 'read', 'click',
    'here', 'next', 'previous', 'back', 'top', 'page', 'more',
  ],
  tr: [
    'acaba', 'ama', 'ancak', 'artık', 'aslında', 'ayrıca', 'az', 'bana', 'bazı', 'belki', 'ben',
    'beni', 'benim', 'beş', 'bile', 'bir', 'biraz', 'birçok', 'biri', 'birkaç', 'biz', 'bize',
    'bizi', 'bizim', 'bu', 'buna', 'bunda', 'bundan', 'bunlar', 'bunları', 'bunların', 'bunu',
    'bunun', 'burada', 'böyle', 'bütün', 'çok', 'çünkü', 'da', 'daha', 'dahil', 'de', 'değil',
    'diye', 'diğer', 'dört', 'en', 'gibi', 'göre', 'hakkında', 'hem', 'hep', 'hepsi', 'her',
    'hiç', 'için', 'iki', 'ile', 'ise', 'işte', 'kadar', 'kendi', 'kez', 'ki', 'kim', 'mı', 'mi',
    'mu', 'mü', 'nasıl', 'ne', 'neden', 'nerede', 'o', 'olan', 'olarak', 'oldu', 'olduğu',
    'olmak', 'olur', 'ona', 'ondan', 'onlar', 'onu', 'onun', 'önce', 'sadece', 'sen', 'siz',
    'size', 'sizi', 'sizin', 'sonra', 'şey', 'şu', 'tüm', 'üç', 'üzere', 'var', 've', 'veya',
    'ya', 'yani', 'yok', 'zaten', 'anasayfa', 'ana', 'sayfa', 'hoş', 'geldiniz', 'menü',
    'iletişim', 'giriş', 'çerez', 'çerezler', 'gizlilik', 'politikası', 'hakları', 'saklıdır',
    'devamı', 'oku', 'ara', 'geri',
  ],
  de: [
    'aber', 'alle', 'allem', 'allen', 'aller', 'alles', 'als', 'also', 'am', 'an', 'andere',
    'anderen', 'auch', 'auf', 'aus', 'bei', 'bin', 'bis', 'bist', 'da', 'damit', 'dann', 'das',
    'dass', 'dein', 'deine', 'dem', 'den', 'der', 'des', 'dich', 'die', 'dies', 'diese', 'diesem',
    'diesen', 'dieser', 'dieses', 'dir', 'doch', 'dort', 'du', 'durch', 'ein', 'eine', 'einem',
    'einen', 'einer', 'eines', 'er', 'es', 'euch', 'euer', 'für', 'gegen', 'hat', 'hatte', 'hier',
    'ich', 'ihr', 'ihre', 'im', 'in', 'ist', 'ja', 'jede', 'jedem', 'jeden', 'jeder', 'kann',
    'kein', 'keine', 'man', 'mehr', 'mein', 'meine', 'mich', 'mir', 'mit', 'muss', 'nach',
    'nicht', 'nichts', 'noch', 'nur', 'ob', 'oder', 'ohne', 'sehr', 'sein', 'seine', 'sich',
    'sie', 'sind', 'so', 'soll', 'um', 'und', 'uns', 'unser', 'unsere', 'unter', 'viel', 'vom',
    'von', 'vor', 'war', 'waren', 'was', 'weil', 'wenn', 'wer', 'wie', 'wir', 'wird', 'wo', 'zu',
    'zum', 'zur', 'über', 'startseite', 'willkommen', 'menü', 'kontakt', 'impressum',
    'datenschutz', 'anmelden', 'weiter', 'zurück', 'suche',
  ],
  es: [
    'a', 'al', 'algo', 'algunos', 'ante', 'antes', 'como', 'con', 'contra', 'cual', 'cuando',
    'de', 'del', 'desde', 'donde', 'durante', 'e', 'el', 'ella', 'ellas', 'ellos', 'en', 'entre',
    'era', 'es', 'esa', 'esas', 'ese', 'eso', 'esos', 'esta', 'estas', 'este', 'esto', 'estos',
    'fue', 'ha', 'han', 'hasta', 'hay', 'la', 'las', 'le', 'les', 'lo', 'los', 'más', 'me', 'mi',
    'mis', 'muy', 'nada', 'ni', 'no', 'nos', 'nosotros', 'nuestra', 'nuestras', 'nuestro',
    'nuestros', 'o', 'os', 'otra', 'otro', 'para', 'pero', 'poco', 'por', 'porque', 'que', 'qué',
    'quien', 'se', 'sea', 'ser', 'si', 'sí', 'sin', 'sobre', 'su', 'sus', 'también', 'tanto',
    'te', 'tiene', 'todo', 'todos', 'tu', 'tus', 'un', 'una', 'uno', 'unos', 'y', 'ya', 'yo',
    'inicio', 'bienvenido', 'bienvenidos', 'menú', 'contacto', 'iniciar', 'sesión', 'leer',
    'buscar', 'política', 'privacidad', 'derechos', 'reservados',
  ],
  fr: [
    'à', 'au', 'aux', 'avec', 'ce', 'ces', 'cet', 'cette', 'comme', 'dans', 'de', 'des', 'du',
    'elle', 'elles', 'en', 'entre', 'est', 'et', 'été', 'être', 'il', 'ils', 'je', 'la', 'le',
    'les', 'leur', 'leurs', 'lui', 'ma', 'mais', 'me', 'même', 'mes', 'moi', 'mon', 'ne', 'nos',
    'notre', 'nous', 'on', 'ont', 'ou', 'où', 'par', 'pas', 'plus', 'pour', 'qu', 'que', 'qui',
    'sa', 'sans', 'se', 'ses', 'si', 'son', 'sont', 'sur', 'ta', 'te', 'tes', 'toi', 'ton',
    'tous', 'tout', 'toute', 'toutes', 'très', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'y',
    'aussi', 'accueil', 'bienvenue', 'menu', 'contact', 'connexion', 'lire', 'suite',
    'rechercher', 'politique', 'confidentialité', 'droits', 'réservés',
  ],
  ar: [
    'في', 'من', 'على', 'إلى', 'الى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي',
    'الذين', 'ما', 'لا', 'لم', 'لن', 'كان', 'كانت', 'يكون', 'هو', 'هي', 'هم', 'نحن', 'أنت', 'انت',
    'أن', 'إن', 'ان', 'أو', 'او', 'ثم', 'قد', 'كل', 'بعض', 'غير', 'بين', 'عند', 'حتى', 'إذا',
    'اذا', 'كما', 'لكن', 'أي', 'اي', 'وهو', 'وهي', 'و', 'يا', 'هل', 'أيضا', 'ايضا', 'فقط', 'منذ',
    'خلال', 'حول', 'نحو', 'لدى', 'عبر', 'الرئيسية', 'اتصل', 'تسجيل', 'الدخول', 'المزيد', 'بحث',
    'الخصوصية', 'سياسة', 'حقوق', 'محفوظة',
  ],
  zh: [
    '的', '了', '和', '是', '在', '我', '我们', '你', '您', '他', '她', '它', '他们', '这', '这个', '那', '那个', '有',
    '也', '都', '就', '而', '及', '与', '或', '但', '但是', '因为', '所以', '如果', '一个', '一些', '没有', '不', '很',
    '更', '最', '还', '被', '把', '让', '给', '对', '从', '向', '到', '为', '为了', '以', '等', '中', '上', '下',
    '里', '吗', '呢', '吧', '啊', '首页', '欢迎', '登录', '注册', '联系', '更多', '搜索', '隐私', '政策', '版权', '所有',
  ],
  // Only for telling languages apart.
  it: [
    'il', 'lo', 'la', 'gli', 'le', 'di', 'del', 'della', 'che', 'e', 'è', 'per', 'con', 'non',
    'una', 'un', 'sono', 'nel', 'alla', 'anche', 'come', 'più', 'ma', 'si', 'questo',
  ],
  pt: [
    'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'que', 'e', 'é', 'em', 'um', 'uma',
    'para', 'com', 'não', 'no', 'na', 'por', 'mais', 'se', 'como', 'mas', 'ao', 'seu', 'sua',
    'você', 'são',
  ],
  nl: [
    'de', 'het', 'een', 'en', 'van', 'ik', 'je', 'dat', 'die', 'in', 'is', 'niet', 'op', 'te',
    'met', 'voor', 'zijn', 'er', 'maar', 'om', 'ook', 'als', 'dan', 'aan', 'bij', 'wij', 'u',
    'uw',
  ],
};

const STOPWORD_SETS = new Map(
  Object.entries(STOPWORDS).map(([language, words]) => [language, new Set(words)]),
);

/** Letters that mostly occur in one language, with how strongly they point to it. */
const TELLTALE_LETTERS: Readonly<Record<string, RegExp>> = {
  tr: /[ğışİ]/gu,
  de: /[ßä]/gu,
  es: /[ñ¿¡]/gu,
  fr: /[œçèêàùë]/gu,
  pt: /[ãõ]/gu,
};

export interface DetectedLanguage {
  /** A BCP 47 language code, such as `tr` or `zh`. */
  readonly code: string;
  /** From 0 to 1: how clearly the text points to this language. */
  readonly confidence: number;
}

const SCRIPTS: readonly (readonly [string, RegExp])[] = [
  ['Latin', /\p{Script=Latin}/u],
  ['Han', /\p{Script=Han}/u],
  ['Kana', /[\p{Script=Hiragana}\p{Script=Katakana}]/u],
  ['Hangul', /\p{Script=Hangul}/u],
  ['Arabic', /\p{Script=Arabic}/u],
  ['Cyrillic', /\p{Script=Cyrillic}/u],
  ['Greek', /\p{Script=Greek}/u],
  ['Hebrew', /\p{Script=Hebrew}/u],
  ['Thai', /\p{Script=Thai}/u],
  ['Devanagari', /\p{Script=Devanagari}/u],
];

/**
 * Which language `text` is written in, or `null` when it holds too little text to tell. The
 * writing system decides most languages; among those written in Latin letters, the share of
 * each language's most common words decides, helped by letters only one of them uses.
 */
export function detectLanguage(text: string): DetectedLanguage | null {
  const sample = text.slice(0, 8000);
  const counts = new Map<string, number>();
  let letters = 0;
  for (const char of sample) {
    if (!/\p{L}/u.test(char)) continue;
    letters++;
    const script = SCRIPTS.find(([, pattern]) => pattern.test(char))?.[0] ?? 'Other';
    counts.set(script, (counts.get(script) ?? 0) + 1);
  }
  if (letters < 20) return null;
  const share = (script: string) => (counts.get(script) ?? 0) / letters;

  if (share('Kana') > 0.05 && share('Han') + share('Kana') > 0.5) {
    return { code: 'ja', confidence: 0.9 };
  }
  if (share('Han') > 0.4) return { code: 'zh', confidence: Math.min(1, share('Han') + 0.3) };
  if (share('Hangul') > 0.4) return { code: 'ko', confidence: 0.9 };
  if (share('Arabic') > 0.4) {
    return /[پچژگ]/u.test(sample)
      ? { code: 'fa', confidence: 0.7 }
      : { code: 'ar', confidence: 0.9 };
  }
  if (share('Cyrillic') > 0.4) {
    return /[іїєґ]/u.test(sample)
      ? { code: 'uk', confidence: 0.8 }
      : { code: 'ru', confidence: 0.7 };
  }
  for (const [script, code] of [
    ['Greek', 'el'],
    ['Hebrew', 'he'],
    ['Thai', 'th'],
    ['Devanagari', 'hi'],
  ] as const) {
    if (share(script) > 0.4) return { code, confidence: 0.9 };
  }
  if (share('Latin') < 0.5) return null;

  const tokens = sample
    .toLowerCase()
    .split(/[^\p{L}’']+/u)
    .filter((token) => token !== '');
  if (tokens.length < 8) return null;
  const scores = ['en', 'tr', 'de', 'es', 'fr', 'it', 'pt', 'nl'].map((code) => {
    const words = STOPWORD_SETS.get(code) ?? new Set<string>();
    const hits = tokens.filter((token) => words.has(token)).length;
    const telltale = TELLTALE_LETTERS[code];
    const letterHits = telltale === undefined ? 0 : (sample.match(telltale) ?? []).length;
    return { code, score: hits / tokens.length + Math.min(0.15, letterHits / tokens.length) };
  });
  scores.sort((a, b) => b.score - a.score);
  const [best, second] = scores;
  if (best === undefined || best.score < 0.04) return null;
  const margin = second === undefined ? 1 : (best.score - second.score) / best.score;
  return { code: best.code, confidence: Math.min(1, 0.4 + margin) };
}

/** The base language of a tag: `tr` for `tr-TR`, `zh` for `zh-Hans`. */
export function baseLanguage(tag: string | null): string | null {
  if (tag === null) return null;
  const base = tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return /^[a-z]{2,3}$/.test(base) ? base : null;
}

export function isStopword(word: string, language: string | null): boolean {
  return STOPWORD_SETS.get(language ?? '')?.has(word) ?? false;
}

export interface Token {
  /** The word as written, without what an apostrophe attaches to it. */
  readonly surface: string;
  /** What the apostrophe attached, such as Turkish `’taki` in `Alsancak’taki`; often empty. */
  readonly clitic: string;
  /** Lower-cased, with clitics removed: what tokens are compared by. */
  readonly norm: string;
  /** Whether punctuation (not just spaces) separates this word from the one before it. */
  readonly breakBefore: boolean;
}

const segmenters = new Map<string, Intl.Segmenter>();

function segmenter(language: string | null, granularity: 'word' | 'sentence'): Intl.Segmenter {
  const key = `${language ?? ''}:${granularity}`;
  let found = segmenters.get(key);
  if (found === undefined) {
    found = new Intl.Segmenter(language ?? undefined, { granularity });
    segmenters.set(key, found);
  }
  return found;
}

/** The words of `text`, in order, as the language's own rules divide them. */
export function tokenize(text: string, language: string | null): Token[] {
  const tokens: Token[] = [];
  let breakBefore = true;
  let afterWord = false;
  for (const part of segmenter(language, 'word').segment(text)) {
    if (part.isWordLike !== true) {
      // A hyphen inside a word joins it ("hafta-sonu"); anything else that isn't a space, or a
      // line break, separates phrases: punctuation, " - " between title parts, a new block.
      const joiner = afterWord && /^[-‐]$/u.test(part.segment);
      if (!joiner && (/[^\s]/u.test(part.segment) || part.segment.includes('\n'))) {
        breakBefore = true;
      }
      afterWord = false;
      continue;
    }
    afterWord = true;
    const surface = stripClitics(part.segment, language);
    if (surface === '') continue;
    tokens.push({
      surface,
      clitic: part.segment.startsWith(surface)
        ? part.segment.slice(surface.length)
        : part.segment.slice(0, part.segment.length - surface.length),
      norm: surface.toLocaleLowerCase(language ?? undefined),
      breakBefore,
    });
    breakBefore = false;
  }
  return tokens;
}

/** Languages written without spaces between words. */
export function joinsWithoutSpaces(language: string | null): boolean {
  return language === 'zh' || language === 'ja' || language === 'th';
}

/**
 * Removes what attaches to a word with an apostrophe: Turkish case endings on names
 * (`İzmir’de` is İzmir) and French elisions (`l’atelier` is atelier).
 */
function stripClitics(word: string, language: string | null): string {
  const apostrophe = /['’]/u.exec(word);
  if (apostrophe === null) return word;
  if (language === 'tr') return word.slice(0, apostrophe.index);
  if (language === 'fr' || language === 'it') {
    const rest = word.slice(apostrophe.index + 1);
    return apostrophe.index <= 2 && rest !== '' ? rest : word;
  }
  return word;
}

/** The sentences of `text`: each line is split on its own, so a heading never joins a paragraph. */
export function sentences(text: string, language: string | null): string[] {
  const found: string[] = [];
  for (const line of text.split('\n')) {
    for (const part of segmenter(language, 'sentence').segment(line)) {
      const sentence = part.segment.replace(/\s+/g, ' ').trim();
      if (sentence !== '') found.push(sentence);
    }
  }
  return found;
}

/** Upper-cases the first letter the way the language does (`istanbul` becomes `İstanbul` in Turkish). */
export function capitalize(text: string, language: string | null): string {
  const [first = ''] = text;
  return first.toLocaleUpperCase(language ?? undefined) + text.slice(first.length);
}
