import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import './styles/app.css';
import { render } from 'preact';
import { App } from './app.tsx';
import { AnnouncerProvider } from './lib/announce.tsx';
import { I18nProvider, initialLocale, loadCatalogs } from './lib/i18n.tsx';
import { applyTheme, readTheme } from './lib/theme.ts';

// Apply the saved theme before the first paint to avoid a flash of the wrong colors.
applyTheme(readTheme());

const root = document.getElementById('app');
if (root === null) throw new Error('The #app element is missing from index.html.');

const locale = initialLocale();
const catalogs = await loadCatalogs(locale);

render(
  <I18nProvider locale={locale} catalogs={catalogs}>
    <AnnouncerProvider>
      <App />
    </AnnouncerProvider>
  </I18nProvider>,
  root,
);
