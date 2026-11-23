/** The languages SearchUnveil plans to support, as BCP 47 language tags. */
export const LOCALES = ['en', 'es', 'de', 'fr', 'tr', 'zh-CN', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export type TextDirection = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleInfo {
  readonly code: Locale;
  /** The language's name in that language, as people look for it in a language menu. */
  readonly name: string;
  readonly englishName: string;
  readonly dir: TextDirection;
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = Object.freeze({
  en: { code: 'en', name: 'English', englishName: 'English', dir: 'ltr' },
  es: { code: 'es', name: 'Español', englishName: 'Spanish', dir: 'ltr' },
  de: { code: 'de', name: 'Deutsch', englishName: 'German', dir: 'ltr' },
  fr: { code: 'fr', name: 'Français', englishName: 'French', dir: 'ltr' },
  tr: { code: 'tr', name: 'Türkçe', englishName: 'Turkish', dir: 'ltr' },
  'zh-CN': { code: 'zh-CN', name: '简体中文', englishName: 'Simplified Chinese', dir: 'ltr' },
  ar: { code: 'ar', name: 'العربية', englishName: 'Arabic', dir: 'rtl' },
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale for a list of preferred language tags, such as
 * `navigator.languages`. Tags are tried in order of preference.
 *
 * Chinese is matched by script: Simplified Chinese serves `zh`, `zh-CN`, `zh-SG` and
 * `zh-Hans`, while Traditional Chinese preferences (`zh-TW`, `zh-HK`, `zh-Hant`) are skipped
 * rather than answered in a script the person did not ask for.
 */
export function matchLocale(
  preferences: readonly string[],
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  for (const preference of preferences) {
    let locale: Intl.Locale;
    try {
      locale = new Intl.Locale(preference).maximize();
    } catch {
      continue; // Not a well-formed language tag.
    }
    if (locale.language === 'zh') {
      if (locale.script === 'Hans') return 'zh-CN';
      continue;
    }
    const match = LOCALES.find((candidate) => candidate === locale.language);
    if (match !== undefined) return match;
  }
  return fallback;
}
