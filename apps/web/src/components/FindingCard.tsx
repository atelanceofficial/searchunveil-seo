import type { Finding } from '@searchunveil/core';
import { useId } from 'preact/hooks';
import { useI18n } from '../lib/i18n.tsx';
import { DataTable } from './DataTable.tsx';
import { Icon } from './Icon.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { Value } from './Value.tsx';

/**
 * One finding: the answer first, then its evidence, then what to do. Limitations and sources
 * are one click away (progressive disclosure) but never hidden from assistive technology.
 */
export function FindingCard(props: { readonly finding: Finding }) {
  const { t } = useI18n();
  const id = useId();
  const { finding } = props;
  const title = t.message(finding.title);
  const hasMore = finding.limitations.length > 0 || finding.references.length > 0;

  return (
    <article class="finding" data-status={finding.status} aria-labelledby={id}>
      <div class="finding__head">
        <StatusBadge status={finding.status} />
        <h3 id={id} class="finding__title">
          {title}
        </h3>
      </div>
      {finding.summary === undefined ? null : (
        <p class="finding__summary">{t.message(finding.summary)}</p>
      )}
      {finding.evidence.length === 0 ? null : (
        <dl class="evidence" aria-label={t.t('ui.finding.evidence')}>
          {finding.evidence.map((item, i) => (
            <div key={i} class="evidence__item">
              <dt>{t.message(item.label)}</dt>
              <dd>
                <Value value={item.value} />
              </dd>
            </div>
          ))}
        </dl>
      )}
      {finding.table === undefined ? null : (
        <DataTable
          caption={title}
          captionHidden
          columns={finding.table.columns.map((column) => ({
            label: t.message(column.label),
            numeric: column.numeric,
          }))}
          rows={finding.table.rows.map((row) =>
            row.map((cell, i) => <Value key={i} value={cell} />),
          )}
        />
      )}
      {finding.nextChecks.length === 0 ? null : (
        <div class="finding__next">
          <h4>{t.t('ui.finding.next')}</h4>
          <ul>
            {finding.nextChecks.map((check, i) => (
              <li key={i}>{t.message(check)}</li>
            ))}
          </ul>
        </div>
      )}
      {hasMore ? (
        <details class="finding__more">
          <summary>{t.t('ui.finding.more')}</summary>
          {finding.limitations.length === 0 ? null : (
            <>
              <h4>{t.t('ui.finding.limits')}</h4>
              <ul>
                {finding.limitations.map((limit, i) => (
                  <li key={i}>{t.message(limit)}</li>
                ))}
              </ul>
            </>
          )}
          {finding.references.length === 0 ? null : (
            <>
              <h4>{t.t('ui.finding.sources')}</h4>
              <ul class="sources">
                {finding.references.map((reference) => (
                  <li key={reference.url}>
                    <a href={reference.url} target="_blank" rel="noopener noreferrer">
                      {t.message(reference.title)}
                      <Icon name="external" class="icon--inline" />
                      <span class="visually-hidden"> {t.t('ui.finding.new-tab')}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </details>
      ) : null}
    </article>
  );
}

export function FindingList(props: { readonly findings: readonly Finding[] }) {
  return (
    <ul class="finding-list" role="list">
      {props.findings.map((finding, i) => (
        <li key={`${finding.rule}-${i}`}>
          <FindingCard finding={finding} />
        </li>
      ))}
    </ul>
  );
}
