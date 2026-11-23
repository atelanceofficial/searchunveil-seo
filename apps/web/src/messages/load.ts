import type { Locale } from '@searchunveil/core';
import type { UiCatalog } from './en.ts';

/** Loads one language's interface text on demand; each language becomes its own chunk. */
export async function loadUiCatalog(locale: Locale): Promise<UiCatalog> {
  switch (locale) {
    case 'en':
      return (await import('./en.ts')).uiEn;
    case 'es':
      return (await import('./es.ts')).uiEs;
    case 'de':
      return (await import('./de.ts')).uiDe;
    case 'fr':
      return (await import('./fr.ts')).uiFr;
    case 'tr':
      return (await import('./tr.ts')).uiTr;
    case 'zh-CN':
      return (await import('./zh-CN.ts')).uiZhCN;
    case 'ar':
      return (await import('./ar.ts')).uiAr;
  }
}
