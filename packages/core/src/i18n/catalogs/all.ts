import type { Locale } from '../locales.ts';
import { ar } from './ar.ts';
import { de } from './de.ts';
import { en, type CoreCatalog } from './en.ts';
import { es } from './es.ts';
import { fr } from './fr.ts';
import { tr } from './tr.ts';
import { zhCN } from './zh-CN.ts';

/** Every catalog, loaded eagerly. For tools and tests; apps should prefer `loadCoreCatalog`. */
export const CORE_CATALOGS: Readonly<Record<Locale, CoreCatalog>> = Object.freeze({
  en,
  es,
  de,
  fr,
  tr,
  'zh-CN': zhCN,
  ar,
});
