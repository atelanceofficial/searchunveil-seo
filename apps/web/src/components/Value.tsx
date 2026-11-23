import type { ParamValue } from '@searchunveil/core';
import { useI18n } from '../lib/i18n.tsx';

/**
 * Shows one value in the reader's language. Text quoted from a person's own data is isolated
 * with <bdi>, and markup with <code dir="auto">, so an English query or a URL reads correctly
 * inside an Arabic sentence and vice versa.
 */
export function Value(props: { readonly value: ParamValue }) {
  const { t } = useI18n();
  const { value } = props;
  if (typeof value === 'string') return <bdi>{value}</bdi>;
  if (typeof value === 'object' && value.kind === 'code')
    return <code dir="auto">{value.value}</code>;
  return <>{t.value(value)}</>;
}
