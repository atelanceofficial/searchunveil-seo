import type { Locale } from '../locales.ts';
import type { CoreCatalog } from './en.ts';

/**
 * Loads one language's engine messages on demand, so an app downloads only the catalog its
 * reader needs. Bundlers split each `import()` into its own chunk.
 */
export async function loadCoreCatalog(locale: Locale): Promise<CoreCatalog> {
  switch (locale) {
    case 'en':
      return (await import('./en.ts')).en;
    case 'es':
      return (await import('./es.ts')).es;
    case 'de':
      return (await import('./de.ts')).de;
    case 'fr':
      return (await import('./fr.ts')).fr;
    case 'tr':
      return (await import('./tr.ts')).tr;
    case 'zh-CN':
      return (await import('./zh-CN.ts')).zhCN;
    case 'ar':
      return (await import('./ar.ts')).ar;
  }
}
