import type { FindingStatus } from '@searchunveil/core';
import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

/** A status shown with an icon and words, never by color alone. */
export function StatusBadge(props: { readonly status: FindingStatus }) {
  const { t } = useI18n();
  return (
    <span class={`badge badge--${props.status}`}>
      <Icon name={props.status} />
      {t.t(`status.${props.status}`)}
    </span>
  );
}
