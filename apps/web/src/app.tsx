import { LOCALE_INFO, LOCALES, isLocale, text } from '@searchunveil/core';
import { useEffect, useRef, useState } from 'preact/hooks';
import { BrandMark } from './components/BrandMark.tsx';
import { Icon } from './components/Icon.tsx';
import { useDataMode } from './lib/data-mode.ts';
import { useI18n, type MessageKey } from './lib/i18n.tsx';
import { href, ROUTES, useRoute, type Route } from './lib/router.ts';
import { readTheme, saveTheme, THEMES, type ThemePreference } from './lib/theme.ts';
import { Home } from './views/Home.tsx';
import { MentionsView } from './views/MentionsView.tsx';
import { NotFound } from './views/NotFound.tsx';
import { PageReviewView } from './views/PageReviewView.tsx';
import { PrivacyView } from './views/PrivacyView.tsx';
import { SearchConsoleView } from './views/SearchConsoleView.tsx';

const NAV_LABELS: Readonly<Record<(typeof ROUTES)[number], MessageKey>> = {
  home: 'ui.nav.home',
  'search-console': 'ui.nav.search-console',
  'page-review': 'ui.nav.page-review',
  mentions: 'ui.nav.mentions',
  privacy: 'ui.nav.privacy',
};

const THEME_LABELS: Readonly<Record<ThemePreference, MessageKey>> = {
  system: 'ui.theme.system',
  light: 'ui.theme.light',
  dark: 'ui.theme.dark',
};

function View(props: { readonly route: Route }) {
  switch (props.route) {
    case 'home':
      return <Home />;
    case 'search-console':
      return <SearchConsoleView />;
    case 'page-review':
      return <PageReviewView />;
    case 'mentions':
      return <MentionsView />;
    case 'privacy':
      return <PrivacyView />;
    case 'not-found':
      return <NotFound />;
  }
}

export function App() {
  const { t, locale, setLocale } = useI18n();
  const dataMode = useDataMode();
  const route = useRoute();
  const [theme, setTheme] = useState<ThemePreference>(readTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const firstRender = useRef(true);
  const menuButton = useRef<HTMLButtonElement>(null);

  const pageName = t.t(route === 'not-found' ? 'ui.not-found.title' : NAV_LABELS[route]);

  useEffect(() => {
    document.title =
      route === 'home'
        ? `SearchUnveil · ${t.t('ui.app.tagline')}`
        : t.t('ui.page-title', { page: text(pageName) });
  }, [route, pageName, t]);

  // After navigating, start keyboard and screen reader users at the new page's heading.
  useEffect(() => {
    setMenuOpen(false);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>('[data-page-heading]')?.focus();
    window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <>
      <a
        class="skip-link"
        href="#main"
        onClick={(event) => {
          // A plain fragment link would be read as a route; move focus directly instead.
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {t.t('ui.skip')}
      </a>
      {/* On the home page the header joins the dark cover below it, in both themes. */}
      <header class={route === 'home' ? 'site-header tone-dark' : 'site-header'}>
        <div class="site-header__bar">
          <a class="brand" href={href('home')}>
            <BrandMark />
            <span class="brand__name">
              Search<span class="brand__accent">Unveil</span>
            </span>
            <span class="brand__badge">{t.t('ui.app.preview')}</span>
          </a>
          <button
            ref={menuButton}
            type="button"
            class="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => {
              setMenuOpen((open) => !open);
            }}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
            <span>{t.t('ui.menu')}</span>
          </button>
          {/* One menu for every width: a row on wide screens, a panel behind the button on narrow ones. */}
          <div
            id="site-menu"
            class="site-menu"
            data-open={menuOpen}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && menuOpen) {
                setMenuOpen(false);
                menuButton.current?.focus();
              }
            }}
          >
            <nav class="site-nav" aria-label={t.t('ui.nav.label')}>
              <ul role="list">
                {ROUTES.map((name) => (
                  <li key={name}>
                    <a href={href(name)} aria-current={route === name ? 'page' : undefined}>
                      {t.t(NAV_LABELS[name])}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div class="preferences">
              <label class="preference">
                <Icon name="globe" class="preference__icon" />
                <span class="preference__label">{t.t('ui.language')}</span>
                <select
                  value={locale}
                  onChange={(event) => {
                    const next = event.currentTarget.value;
                    if (isLocale(next)) setLocale(next);
                  }}
                >
                  {LOCALES.map((code) => (
                    <option key={code} value={code} lang={code}>
                      {LOCALE_INFO[code].name}
                    </option>
                  ))}
                </select>
              </label>
              <label class="preference">
                <Icon name="moon" class="preference__icon" />
                <span class="preference__label">{t.t('ui.theme')}</span>
                <select
                  value={theme}
                  onChange={(event) => {
                    const next =
                      THEMES.find((value) => value === event.currentTarget.value) ?? 'system';
                    setTheme(next);
                    saveTheme(next);
                  }}
                >
                  {THEMES.map((value) => (
                    <option key={value} value={value}>
                      {t.t(THEME_LABELS[value])}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </header>
      <main id="main" class="site-main" tabIndex={-1}>
        <View route={route} />
      </main>
      <footer class="site-footer tone-dark">
        <div class="site-footer__inner">
          <p class="site-footer__brand">
            <BrandMark />
            <strong>{t.t('ui.footer.built-by')}</strong>
          </p>
          <div class="site-footer__notes">
            <p>{t.t('ui.footer.status')}</p>
            <p>
              {t.t(
                dataMode === 'server'
                  ? 'ui.footer.privacy.server'
                  : dataMode === 'claude'
                    ? 'ui.footer.privacy.claude'
                    : 'ui.footer.privacy',
              )}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
