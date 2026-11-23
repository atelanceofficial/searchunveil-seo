import { createTranslator, describeMessage, LOCALES, type Locale } from '@searchunveil/core';
import { describe, expect, it } from 'vitest';
import { uiEn, type UiCatalog, type UiMessageKey } from './en.ts';
import { loadUiCatalog } from './load.ts';

const KEYS = Object.keys(uiEn) as UiMessageKey[];
const catalogs = new Map<Locale, UiCatalog>();
for (const locale of LOCALES) catalogs.set(locale, await loadUiCatalog(locale));

describe('interface catalogs', () => {
  it.each(LOCALES)('%s renders every message', (locale) => {
    const catalog = catalogs.get(locale) ?? uiEn;
    const t = createTranslator(locale, catalog);
    for (const key of KEYS) {
      const params = Object.fromEntries(
        [...describeMessage(uiEn[key]).arguments].map((name) => [name, 3]),
      );
      for (const count of [0, 1, 2, 11, 100]) {
        const text = t.t(key, Object.fromEntries(Object.keys(params).map((name) => [name, count])));
        expect(text, `${locale} ${key}`).not.toMatch(/[{}]/);
      }
    }
  });

  it.each(LOCALES.filter((l) => l !== 'en'))(
    '%s uses the same placeholders as English',
    (locale) => {
      const catalog = catalogs.get(locale) ?? uiEn;
      for (const key of KEYS) {
        expect([...describeMessage(catalog[key]).arguments].sort(), `${locale} ${key}`).toEqual(
          [...describeMessage(uiEn[key]).arguments].sort(),
        );
      }
    },
  );

  it.each(LOCALES.filter((l) => l !== 'en'))('%s is translated rather than copied', (locale) => {
    const catalog = catalogs.get(locale) ?? uiEn;
    const prose = KEYS.filter((key) =>
      /\p{L}{4,}/u.test(uiEn[key].replace(/\{[^}]*\}|SearchUnveil|Search Console/g, '')),
    );
    // A few words are genuinely identical across languages ("Date", "optional"); a large
    // share would mean English was pasted in by mistake.
    const copied = prose.filter((key) => catalog[key] === uiEn[key]);
    expect(copied.length / prose.length, `${locale}: ${copied.join(', ')}`).toBeLessThan(0.05);
  });
});
