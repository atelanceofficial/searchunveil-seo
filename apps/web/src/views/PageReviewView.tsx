import {
  decodeText,
  legacyEncodingFor,
  reviewHtml,
  STATUS_ORDER,
  type Diagnostic,
  type PageReport,
} from '@searchunveil/core';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { DiagnosticList } from '../components/Diagnostics.tsx';
import { FindingList } from '../components/FindingCard.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { SiteReview } from '../components/SiteReview.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { useAnnounce } from '../lib/announce.tsx';
import { useI18n } from '../lib/i18n.tsx';
import { parseInertHtml } from '../lib/inert-html.ts';
import { SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL } from '../samples/page.ts';

type State =
  | { readonly kind: 'editing'; readonly diagnostics: readonly Diagnostic[] }
  | {
      readonly kind: 'ready';
      readonly report: PageReport;
      readonly diagnostics: readonly Diagnostic[];
    };

export function PageReviewView() {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const id = useId();
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>({ kind: 'editing', diagnostics: [] });
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.kind === 'ready') resultsHeading.current?.focus();
  }, [state]);

  const review = (source: string, address: string) => {
    const result = reviewHtml(
      source,
      parseInertHtml,
      address.trim() === '' ? {} : { url: address },
    );
    if (!result.ok) {
      setState({ kind: 'editing', diagnostics: result.diagnostics });
      return;
    }
    setState({ kind: 'ready', report: result.value, diagnostics: result.diagnostics });
    announce(t.t('ui.page.done'));
  };

  const readFile = async (file: File | undefined) => {
    if (file === undefined) return;
    const decoded = decodeText(new Uint8Array(await file.arrayBuffer()), {
      file: file.name,
      legacyEncoding: legacyEncodingFor(locale),
    });
    if (decoded.ok) setHtml(decoded.value.text);
    else setState({ kind: 'editing', diagnostics: decoded.diagnostics });
  };

  const errorId = `${id}-errors`;
  const hasErrors = state.diagnostics.some((d) => d.severity === 'error');

  return (
    <>
      <PageHeading lead={t.t('ui.page.lead')}>{t.t('ui.page.title')}</PageHeading>

      <form
        class="panel form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          review(html, url);
        }}
      >
        <div class="field">
          <label for={`${id}-html`}>{t.t('ui.page.html')}</label>
          <p id={`${id}-html-hint`} class="hint">
            {t.t('ui.page.html.hint')}
          </p>
          <textarea
            id={`${id}-html`}
            class="code-input"
            rows={10}
            spellcheck={false}
            dir="ltr"
            value={html}
            aria-describedby={`${id}-html-hint${hasErrors ? ` ${errorId}` : ''}`}
            aria-invalid={hasErrors}
            onInput={(event) => {
              setHtml(event.currentTarget.value);
            }}
          />
        </div>
        <div class="field">
          <label for={`${id}-file`}>{t.t('ui.page.file')}</label>
          <input
            id={`${id}-file`}
            type="file"
            accept=".html,.htm,text/html"
            onChange={(event) => {
              void readFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
        </div>
        <div class="field">
          <label for={`${id}-url`}>
            {t.t('ui.page.url')} <span class="optional">({t.t('ui.mentions.optional')})</span>
          </label>
          <p id={`${id}-url-hint`} class="hint">
            {t.t('ui.page.url.hint')}
          </p>
          <input
            id={`${id}-url`}
            type="url"
            inputMode="url"
            dir="ltr"
            autoComplete="url"
            placeholder="https://"
            value={url}
            aria-describedby={`${id}-url-hint`}
            onInput={(event) => {
              setUrl(event.currentTarget.value);
            }}
          />
        </div>
        {state.diagnostics.length === 0 ? null : (
          <div id={errorId}>
            <DiagnosticList diagnostics={state.diagnostics} />
          </div>
        )}
        <div class="actions">
          <button type="submit" class="button button--primary">
            {t.t('ui.page.submit')}
          </button>
          <button
            type="button"
            class="button"
            onClick={() => {
              setHtml(SAMPLE_PAGE_HTML);
              setUrl(SAMPLE_PAGE_URL);
              review(SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL);
            }}
          >
            {t.t('ui.page.sample')}
          </button>
        </div>
        <p class="hint">{t.t('ui.page.why-paste')}</p>
      </form>

      {state.kind === 'ready' ? (
        <section class="section" aria-labelledby="page-results">
          <h2 id="page-results" ref={resultsHeading} tabIndex={-1}>
            {t.t('ui.page.results')}
          </h2>
          <p class="muted">
            {state.report.url === null ? (
              t.t('ui.page.reviewed-pasted')
            ) : (
              <>{t.t('ui.page.reviewed', { url: state.report.url })}</>
            )}
          </p>
          <ul class="counts" role="list">
            {STATUS_ORDER.map((status) => (
              <li key={status}>
                <StatusBadge status={status} />
                <strong>{t.value(state.report.counts[status])}</strong>
              </li>
            ))}
          </ul>
          <div class="callout">
            <ul>
              {state.report.limitations.map((limitation) => (
                <li key={limitation.key}>{t.message(limitation)}</li>
              ))}
            </ul>
          </div>
          <FindingList findings={state.report.findings} />
        </section>
      ) : null}

      <SiteReview />
    </>
  );
}
