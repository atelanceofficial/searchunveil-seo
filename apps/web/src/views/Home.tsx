import lensDark from '../assets/hero/lens-dark.webp';
import lensLight from '../assets/hero/lens-light.webp';
import { Icon, type IconName } from '../components/Icon.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { href, type ROUTES } from '../lib/router.ts';

interface Tool {
  readonly route: (typeof ROUTES)[number];
  readonly name: MessageKey;
  readonly title: MessageKey;
  readonly text: MessageKey;
  readonly action: MessageKey;
}

const TOOLS: readonly Tool[] = [
  {
    route: 'search-console',
    name: 'ui.nav.search-console',
    title: 'ui.home.gsc.title',
    text: 'ui.home.gsc.text',
    action: 'ui.home.gsc.action',
  },
  {
    route: 'page-review',
    name: 'ui.nav.page-review',
    title: 'ui.home.page.title',
    text: 'ui.home.page.text',
    action: 'ui.home.page.action',
  },
  {
    route: 'mentions',
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
      <section class="hero" aria-labelledby="home-title">
        <div class="hero__copy">
          <h1 id="home-title" class="hero__title" tabIndex={-1} data-page-heading>
            {t.t('ui.home.title')}
          </h1>
          <p class="hero__lead">{t.t('ui.home.lead')}</p>
        </div>
        {/* The lens, photographed in both lights; each blends into its own page colour. */}
        <div class="hero__art">
          <img
            class="hero__image hero__image--light"
            src={lensLight}
            alt=""
            width={1280}
            height={960}
            loading="lazy"
            decoding="async"
          />
          <img
            class="hero__image hero__image--dark"
            src={lensDark}
            alt=""
            width={1280}
            height={960}
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      <ol class="tools" role="list">
        {TOOLS.map((tool) => (
          <li key={tool.route} class="tool">
            <div class="tool__body">
              <p class="tool__name">{t.t(tool.name)}</p>
              <h2 class="tool__title">{t.t(tool.title)}</h2>
              <p class="tool__text">{t.t(tool.text)}</p>
            </div>
            <a class="tool__action" href={href(tool.route)}>
              {t.t(tool.action)}
              <Icon name="arrow" class="icon--inline icon--directional" />
            </a>
          </li>
        ))}
      </ol>

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
