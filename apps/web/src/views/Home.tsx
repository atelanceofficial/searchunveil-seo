import { Icon, type IconName } from '../components/Icon.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { href, type ROUTES } from '../lib/router.ts';

interface Entry {
  readonly route: (typeof ROUTES)[number];
  readonly icon: IconName;
  readonly title: MessageKey;
  readonly text: MessageKey;
  readonly action: MessageKey;
}

const ENTRIES: readonly Entry[] = [
  {
    route: 'search-console',
    icon: 'chart',
    title: 'ui.home.gsc.title',
    text: 'ui.home.gsc.text',
    action: 'ui.home.gsc.action',
  },
  {
    route: 'page-review',
    icon: 'page',
    title: 'ui.home.page.title',
    text: 'ui.home.page.text',
    action: 'ui.home.page.action',
  },
  {
    route: 'mentions',
    icon: 'spark',
    title: 'ui.home.mentions.title',
    text: 'ui.home.mentions.text',
    action: 'ui.home.mentions.action',
  },
];

export function Home() {
  const { t } = useI18n();
  return (
    <>
      <PageHeading lead={t.t('ui.home.lead')}>{t.t('ui.home.title')}</PageHeading>
      <ul class="entry-grid" role="list">
        {ENTRIES.map((entry) => (
          <li key={entry.route} class="entry">
            <Icon name={entry.icon} class="entry__icon" />
            <h2 class="entry__title">{t.t(entry.title)}</h2>
            <p>{t.t(entry.text)}</p>
            <a class="entry__action" href={href(entry.route)}>
              {t.t(entry.action)}
              <Icon name="arrow" class="icon--inline icon--directional" />
            </a>
          </li>
        ))}
      </ul>
      <section class="principles" aria-labelledby="principles-title">
        <h2 id="principles-title">{t.t('ui.home.principles')}</h2>
        <ul role="list">
          <li>
            <Icon name="lock" />
            {t.t('ui.home.principle.local')}
          </li>
          <li>
            <Icon name="review" />
            {t.t('ui.home.principle.evidence')}
          </li>
          <li>
            <Icon name="info" />
            {t.t('ui.home.principle.limits')}
          </li>
        </ul>
      </section>
    </>
  );
}
