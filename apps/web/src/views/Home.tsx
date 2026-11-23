import type { ComponentType } from 'preact';
import { Icon, type IconName } from '../components/Icon.tsx';
import { MentionsArt, PageReviewArt, SearchConsoleArt } from '../components/Illustrations.tsx';
import { Lens } from '../components/Lens.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { href, type ROUTES } from '../lib/router.ts';

interface Entry {
  readonly route: (typeof ROUTES)[number];
  readonly name: MessageKey;
  readonly title: MessageKey;
  readonly text: MessageKey;
  readonly action: MessageKey;
  readonly Art: ComponentType;
  readonly feature?: true;
}

const ENTRIES: readonly Entry[] = [
  {
    route: 'search-console',
    name: 'ui.nav.search-console',
    title: 'ui.home.gsc.title',
    text: 'ui.home.gsc.text',
    action: 'ui.home.gsc.action',
    Art: SearchConsoleArt,
    feature: true,
  },
  {
    route: 'page-review',
    name: 'ui.nav.page-review',
    title: 'ui.home.page.title',
    text: 'ui.home.page.text',
    action: 'ui.home.page.action',
    Art: PageReviewArt,
  },
  {
    route: 'mentions',
    name: 'ui.nav.mentions',
    title: 'ui.home.mentions.title',
    text: 'ui.home.mentions.text',
    action: 'ui.home.mentions.action',
    Art: MentionsArt,
  },
];

const PRINCIPLES: readonly { readonly icon: IconName; readonly text: MessageKey }[] = [
  { icon: 'lock', text: 'ui.home.principle.local' },
  { icon: 'review', text: 'ui.home.principle.evidence' },
  { icon: 'info', text: 'ui.home.principle.limits' },
];

export function Home() {
  const { t } = useI18n();
  return (
    <>
      <section class="hero" aria-labelledby="home-title">
        <div class="hero__copy">
          <p class="eyebrow">{ENTRIES.map((entry) => t.t(entry.name)).join(' · ')}</p>
          <h1 id="home-title" class="hero__title" tabIndex={-1} data-page-heading>
            {t.t('ui.home.title')}
          </h1>
          <p class="hero__lead">{t.t('ui.home.lead')}</p>
        </div>
        <div class="hero__art">
          <Lens />
        </div>
      </section>

      <ul class="bento" role="list">
        {ENTRIES.map(({ route, title, text, action, Art, feature }) => (
          <li
            key={route}
            class={
              feature === true ? 'entry bento__item bento__item--feature' : 'entry bento__item'
            }
          >
            <div class="entry__art">
              <Art />
            </div>
            <h2 class="entry__title">{t.t(title)}</h2>
            <p>{t.t(text)}</p>
            <a class="entry__action" href={href(route)}>
              {t.t(action)}
              <Icon name="arrow" class="icon--inline icon--directional" />
            </a>
          </li>
        ))}
      </ul>

      <section class="principles" aria-labelledby="principles-title">
        <h2 id="principles-title">{t.t('ui.home.principles')}</h2>
        <ul class="principles__list" role="list">
          {PRINCIPLES.map((principle) => (
            <li key={principle.text}>
              <span class="icon-badge">
                <Icon name={principle.icon} />
              </span>
              <span>{t.t(principle.text)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
