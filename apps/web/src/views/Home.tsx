import lensPhoto from '../assets/hero/lens-dark.webp';
import { Icon, type IconName } from '../components/Icon.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { href, type ROUTES } from '../lib/router.ts';

interface Tool {
  readonly route: (typeof ROUTES)[number];
  readonly icon: IconName;
  readonly name: MessageKey;
  readonly title: MessageKey;
  readonly text: MessageKey;
  readonly action: MessageKey;
}

const TOOLS: readonly Tool[] = [
  {
    route: 'search-console',
    icon: 'chart',
    name: 'ui.nav.search-console',
    title: 'ui.home.gsc.title',
    text: 'ui.home.gsc.text',
    action: 'ui.home.gsc.action',
  },
  {
    route: 'page-review',
    icon: 'page',
    name: 'ui.nav.page-review',
    title: 'ui.home.page.title',
    text: 'ui.home.page.text',
    action: 'ui.home.page.action',
  },
  {
    route: 'mentions',
    icon: 'quote',
    name: 'ui.nav.mentions',
    title: 'ui.home.mentions.title',
    text: 'ui.home.mentions.text',
    action: 'ui.home.mentions.action',
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
      {/* The cover: the brand's lens, photographed, on the deep blue-black of the cover art. */}
      <section class="hero tone-dark" aria-labelledby="home-title">
        <div class="hero__inner">
          <div class="hero__copy">
            <p class="hero__label">{TOOLS.map((tool) => t.t(tool.name)).join(' · ')}</p>
            <h1 id="home-title" class="hero__title" tabIndex={-1} data-page-heading>
              {t.t('ui.home.title')}
            </h1>
            <p class="hero__lead">{t.t('ui.home.lead')}</p>
            <p class="local-note">
              <Icon name="lock" />
              {t.t('ui.app.local')}
            </p>
          </div>
          <div class="hero__art">
            <img
              class="hero__image"
              src={lensPhoto}
              alt=""
              width={1280}
              height={960}
              decoding="async"
            />
          </div>
        </div>
      </section>

      <ul class="tools" role="list">
        {TOOLS.map((tool) => (
          <li key={tool.route} class="tool">
            <p class="tool__name">
              <span class="tool__icon">
                <Icon name={tool.icon} />
              </span>
              {t.t(tool.name)}
            </p>
            <h2 class="tool__title">{t.t(tool.title)}</h2>
            <p class="tool__text">{t.t(tool.text)}</p>
            <a class="tool__action" href={href(tool.route)}>
              {t.t(tool.action)}
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
              <Icon name={principle.icon} />
              <span>{t.t(principle.text)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
