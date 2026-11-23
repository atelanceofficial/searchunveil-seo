import {
  analyzeSearchConsole,
  dateRange,
  decimal,
  DEFAULT_LIMITS,
  importSearchConsole,
  legacyEncodingFor,
  percent,
  toMegabytes,
  type Diagnostic,
  type InputFile,
  type MetricRow,
  type SearchConsoleReport,
} from '@searchunveil/core';
import { useEffect, useRef, useState } from 'preact/hooks';
import { DataTable } from '../components/DataTable.tsx';
import { DiagnosticList } from '../components/Diagnostics.tsx';
import { FileDrop } from '../components/FileDrop.tsx';
import { FindingCard, FindingList } from '../components/FindingCard.tsx';
import { MetricTiles } from '../components/MetricTiles.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { TrendChart } from '../components/TrendChart.tsx';
import { Value } from '../components/Value.tsx';
import { useAnnounce } from '../lib/announce.tsx';
import { useI18n } from '../lib/i18n.tsx';
import { sampleSearchConsoleFiles } from '../samples/search-console.ts';

type State =
  | { readonly kind: 'idle' }
  | { readonly kind: 'reading' }
  | { readonly kind: 'failed'; readonly diagnostics: readonly Diagnostic[] }
  | {
      readonly kind: 'ready';
      readonly report: SearchConsoleReport;
      readonly diagnostics: readonly Diagnostic[];
      readonly sample: boolean;
    };

export function SearchConsoleView() {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.kind === 'ready' || state.kind === 'failed') resultsHeading.current?.focus();
  }, [state.kind]);

  const analyze = async (files: readonly InputFile[], sample: boolean) => {
    setState({ kind: 'reading' });
    announce(t.t('ui.gsc.reading'));
    try {
      const imported = await importSearchConsole(files, {
        legacyEncoding: legacyEncodingFor(locale),
      });
      if (!imported.ok) {
        setState({ kind: 'failed', diagnostics: imported.diagnostics });
        announce(t.t('ui.gsc.failed'));
        return;
      }
      setState({
        kind: 'ready',
        report: analyzeSearchConsole(imported.value),
        diagnostics: imported.diagnostics,
        sample,
      });
      announce(t.t('ui.gsc.ready'));
    } catch {
      setState({ kind: 'failed', diagnostics: [] });
      announce(t.t('ui.gsc.failed'));
    }
  };

  const readFiles = async (files: readonly File[]) => {
    const inputs = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        bytes: new Uint8Array(await file.arrayBuffer()),
      })),
    );
    await analyze(inputs, false);
  };

  return (
    <>
      <PageHeading lead={t.t('ui.gsc.lead')}>{t.t('ui.gsc.title')}</PageHeading>

      {state.kind === 'ready' || state.kind === 'failed' ? null : (
        <section class="panel" aria-busy={state.kind === 'reading'}>
          <FileDrop
            label={t.t('ui.file.choose')}
            dropText={t.t('ui.file.drop')}
            hint={t.t('ui.file.limit', { megabytes: toMegabytes(DEFAULT_LIMITS.maxFileBytes) })}
            accept=".zip,.csv,application/zip,text/csv"
            multiple
            disabled={state.kind === 'reading'}
            onFiles={(files) => void readFiles(files)}
          />
          <div class="panel__aside">
            <button
              type="button"
              class="button"
              disabled={state.kind === 'reading'}
              onClick={() => void analyze(sampleSearchConsoleFiles(), true)}
            >
              {t.t('ui.gsc.sample')}
            </button>
            <p class="hint">{t.t('ui.gsc.sample.note')}</p>
          </div>
          {state.kind === 'reading' ? <p class="progress">{t.t('ui.gsc.reading')}</p> : null}
          <details class="how-to">
            <summary>{t.t('ui.gsc.how')}</summary>
            <ol>
              <li>{t.t('ui.gsc.how.1')}</li>
              <li>{t.t('ui.gsc.how.2')}</li>
              <li>{t.t('ui.gsc.how.3')}</li>
            </ol>
          </details>
        </section>
      )}

      {state.kind === 'failed' ? (
        <section class="section" aria-labelledby="gsc-failed">
          <h2 id="gsc-failed" ref={resultsHeading} tabIndex={-1}>
            {t.t('ui.gsc.failed')}
          </h2>
          {state.diagnostics.length === 0 ? (
            <p>{t.t('ui.gsc.unexpected')}</p>
          ) : (
            <DiagnosticList diagnostics={state.diagnostics} />
          )}
          <ResetButton
            onReset={() => {
              setState({ kind: 'idle' });
            }}
          />
        </section>
      ) : null}

      {state.kind === 'ready' ? (
        <Results
          report={state.report}
          diagnostics={state.diagnostics}
          sample={state.sample}
          headingRef={resultsHeading}
          onReset={() => {
            setState({ kind: 'idle' });
          }}
        />
      ) : null}
    </>
  );
}

function ResetButton(props: { readonly onReset: () => void }) {
  const { t } = useI18n();
  return (
    <p>
      <button type="button" class="button" onClick={props.onReset}>
        {t.t('ui.gsc.again')}
      </button>
    </p>
  );
}

function Results(props: {
  readonly report: SearchConsoleReport;
  readonly diagnostics: readonly Diagnostic[];
  readonly sample: boolean;
  readonly headingRef: { current: HTMLHeadingElement | null };
  readonly onReset: () => void;
}) {
  const { t } = useI18n();
  const { report } = props;
  const range = report.overview?.dateRange ?? null;
  // Without a period comparison, the most important note answers "what happened" instead.
  const leadNote = report.headline === null ? report.notes[0] : undefined;
  const notes = leadNote === undefined ? report.notes : report.notes.slice(1);

  return (
    <div class="results">
      <section class="section" aria-labelledby="gsc-what">
        <div class="section__title-row">
          <h2 id="gsc-what" ref={props.headingRef} tabIndex={-1}>
            {t.t('ui.gsc.what-happened')}
          </h2>
          {props.sample ? <span class="tag tag--sample">{t.t('ui.gsc.sample.badge')}</span> : null}
        </div>
        {report.headline === null ? null : (
          <div class="headline">
            <FindingCard finding={report.headline} />
          </div>
        )}
        {leadNote === undefined ? null : <FindingCard finding={leadNote} />}
      </section>

      {report.overview === null ? null : (
        <section class="section" aria-labelledby="gsc-overview">
          <h2 id="gsc-overview">{t.t('ui.gsc.overview')}</h2>
          {range === null ? null : (
            <p class="muted">
              {t.t('ui.gsc.covers', { range: dateRange(range.start, range.end) })}
            </p>
          )}
          <MetricTiles report={report} />
          {report.series.length > 1 ? (
            <TrendChart points={report.series} comparison={report.comparison} />
          ) : null}
        </section>
      )}

      <section class="section" aria-labelledby="gsc-findings">
        <h2 id="gsc-findings">{t.t('ui.gsc.findings')}</h2>
        {report.findings.length === 0 ? (
          <p class="muted">{t.t('ui.gsc.findings.none')}</p>
        ) : (
          <FindingList findings={report.findings} />
        )}
      </section>

      <TopTable
        id="gsc-top-queries"
        title={t.t('ui.gsc.top-queries')}
        label={t.t('table.query')}
        rows={report.topQueries}
      />
      <TopTable
        id="gsc-top-pages"
        title={t.t('ui.gsc.top-pages')}
        label={t.t('table.page')}
        rows={report.topPages}
      />

      <section class="section" aria-labelledby="gsc-notes">
        <h2 id="gsc-notes">{t.t('ui.gsc.notes')}</h2>
        <FindingList findings={notes} />
        {props.diagnostics.length === 0 ? null : (
          <>
            <h3>{t.t('ui.gsc.diagnostics')}</h3>
            <DiagnosticList diagnostics={props.diagnostics} />
          </>
        )}
        <h3>{t.t('ui.gsc.files')}</h3>
        <ul class="file-list">
          {report.files.map((file) => (
            <li key={file}>
              <Value value={{ kind: 'code', value: file }} />
            </li>
          ))}
        </ul>
      </section>

      <ResetButton onReset={props.onReset} />
    </div>
  );
}

function TopTable(props: {
  readonly id: string;
  readonly title: string;
  readonly label: string;
  readonly rows: readonly MetricRow[];
}) {
  const { t } = useI18n();
  if (props.rows.length === 0) return null;
  return (
    <section class="section" aria-labelledby={props.id}>
      <h2 id={props.id}>{props.title}</h2>
      <DataTable
        caption={props.title}
        captionHidden
        columns={[
          { label: props.label },
          { label: t.t('metric.clicks'), numeric: true },
          { label: t.t('metric.impressions'), numeric: true },
          { label: t.t('metric.ctr'), numeric: true },
          { label: t.t('metric.position'), numeric: true },
        ]}
        rows={props.rows.map((row) => [
          <bdi key="key">{row.key}</bdi>,
          t.value(row.primary.clicks),
          t.value(row.primary.impressions),
          row.primary.ctr === null ? '–' : t.value(percent(row.primary.ctr)),
          row.primary.position === null ? '–' : t.value(decimal(row.primary.position, 1)),
        ])}
      />
    </section>
  );
}
