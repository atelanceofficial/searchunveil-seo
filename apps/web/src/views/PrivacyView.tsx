import { useState } from 'preact/hooks';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { Icon } from '../components/Icon.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { useAnnounce } from '../lib/announce.tsx';
import { useI18n } from '../lib/i18n.tsx';
import { clearStored } from '../lib/storage.ts';
import { applyTheme } from '../lib/theme.ts';

export function PrivacyView() {
  const { t } = useI18n();
  const announce = useAnnounce();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  return (
    <>
      <PageHeading lead={t.t('ui.privacy.lead')}>{t.t('ui.privacy.title')}</PageHeading>
      <ul class="privacy-list" role="list">
        <li>
          <Icon name="lock" />
          {t.t('ui.privacy.files')}
        </li>
        <li>
          <Icon name="info" />
          {t.t('ui.privacy.stored')}
        </li>
        <li>
          <Icon name="good" />
          {t.t('ui.privacy.network')}
        </li>
        <li>
          <Icon name="good" />
          {t.t('ui.privacy.tracking')}
        </li>
      </ul>
      <p>
        <button
          type="button"
          class="button button--danger"
          onClick={() => {
            setConfirming(true);
          }}
        >
          <Icon name="trash" />
          {t.t('ui.privacy.clear')}
        </button>
      </p>
      {cleared ? (
        <p class="callout" role="status">
          {t.t('ui.privacy.cleared')}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirming}
        message={t.t('ui.privacy.clear.confirm')}
        confirmLabel={t.t('ui.privacy.clear')}
        onCancel={() => {
          setConfirming(false);
        }}
        onConfirm={() => {
          clearStored();
          applyTheme('system');
          setConfirming(false);
          setCleared(true);
          announce(t.t('ui.privacy.cleared'));
        }}
      />
    </>
  );
}
