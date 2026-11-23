import { PageHeading } from '../components/PageHeading.tsx';
import { useI18n } from '../lib/i18n.tsx';
import { href } from '../lib/router.ts';

export function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <PageHeading>{t.t('ui.not-found.title')}</PageHeading>
      <p>
        <a class="button" href={href('home')}>
          {t.t('ui.not-found.back')}
        </a>
      </p>
    </>
  );
}
