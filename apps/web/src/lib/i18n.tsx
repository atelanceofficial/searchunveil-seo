import {
  createTranslator,
  isLocale,
  LOCALE_INFO,
  loadCoreCatalog,
  matchLocale,
  type CoreCatalog,
  type CoreMessageKey,
  type Locale,
  type Translator,
} from '@searchunveil/core';
import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { UiCatalog, UiMessageKey } from '../messages/en.ts';
import { loadUiCatalog } from '../messages/load.ts';
import { readStored, writeStored } from './storage.ts';

export type MessageKey = CoreMessageKey | UiMessageKey;
export type AppTranslator = Translator<MessageKey>;

export interface Catalogs {
  readonly core: CoreCatalog;
  readonly ui: UiCatalog;
}

export async function loadCatalogs(locale: Locale): Promise<Catalogs> {
  const [core, ui] = await Promise.all([loadCoreCatalog(locale), loadUiCatalog(locale)]);
  return { core, ui };
}

/**
 * The language to start in: an explicit `?lang=` link wins, then the person's saved choice,
 * then their browser's preferences.
 */
export function initialLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (isLocale(requested)) return requested;
  const saved = readStored('locale');
  if (isLocale(saved)) return saved;
  return matchLocale(navigator.languages);
}

interface I18nValue {
  readonly locale: Locale;
  readonly t: AppTranslator;
  readonly setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider(props: {
  readonly locale: Locale;
  readonly catalogs: Catalogs;
  readonly children: ComponentChildren;
}) {
  const [state, setState] = useState({ locale: props.locale, catalogs: props.catalogs });
  const latestRequest = useRef(0);

  const t = useMemo(
    () =>
      createTranslator<MessageKey>(state.locale, { ...state.catalogs.core, ...state.catalogs.ui }),
    [state],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = state.locale;
    root.dir = LOCALE_INFO[state.locale].dir;
  }, [state.locale]);

  const setLocale = useCallback((locale: Locale) => {
    // Only the most recent choice wins if the person switches quickly.
    const request = ++latestRequest.current;
    void loadCatalogs(locale).then((catalogs) => {
      if (request !== latestRequest.current) return;
      setState({ locale, catalogs });
      writeStored('locale', locale);
    });
  }, []);

  const value = useMemo(
    () => ({ locale: state.locale, t, setLocale }),
    [state.locale, t, setLocale],
  );
  return <I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (value === null) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
