import type { Diagnostic, FindingStatus } from '@searchunveil/core';
import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

const STATUS: Readonly<Record<Diagnostic['severity'], FindingStatus>> = {
  error: 'attention',
  warning: 'review',
  info: 'info',
};

const ORDER: readonly Diagnostic['severity'][] = ['error', 'warning', 'info'];

/** Problems and notes about the files themselves, with where they were found. */
export function DiagnosticList(props: { readonly diagnostics: readonly Diagnostic[] }) {
  const { t } = useI18n();
  const sorted = [...props.diagnostics].sort(
    (a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity),
  );
  return (
    <ul class="diagnostics" role="list">
      {sorted.map((item, i) => {
        const where: string[] = [];
        if (item.location?.file !== undefined) where.push(item.location.file);
        if (item.location?.line !== undefined)
          where.push(t.t('ui.location.line', { line: item.location.line }));
        if (typeof item.location?.column === 'string') {
          where.push(t.t('ui.location.column', { column: item.location.column }));
        }
        return (
          <li key={i} class="diagnostic" data-status={STATUS[item.severity]}>
            <Icon name={STATUS[item.severity]} />
            <span>
              {t.t(`diagnostic.${item.code}`, item.params)}
              {where.length === 0 ? null : (
                <span class="diagnostic__where"> ({where.join(', ')})</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
