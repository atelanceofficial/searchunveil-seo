import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

/**
 * The page's single h1. It can receive focus, so that after navigating, keyboard and screen
 * reader users start at the top of the new page instead of somewhere in the old one.
 * The privacy promise sits above it on every page; a ruler is drawn beneath it.
 */
export function PageHeading(props: { readonly children: string; readonly lead?: string }) {
  const { t } = useI18n();
  return (
    <div class="page-heading">
      <p class="local-note">
        <Icon name="lock" />
        {t.t('ui.app.local')}
      </p>
      <h1 tabIndex={-1} data-page-heading>
        {props.children}
      </h1>
      {props.lead === undefined ? null : <p class="lead">{props.lead}</p>}
    </div>
  );
}
