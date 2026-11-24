import {
  decodeText,
  legacyEncodingFor,
  reviewHtml,
  siteAddress,
  STATUS_ORDER,
  type Diagnostic,
  type HttpFacts,
  type PageReport,
} from '@searchunveil/core';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { AnalysisPanel } from '../components/AnalysisPanel.tsx';
import { DiagnosticList } from '../components/Diagnostics.tsx';
import { FindingList } from '../components/FindingCard.tsx';
import { PageHeading } from '../components/PageHeading.tsx';
import { PageOverview } from '../components/PageOverview.tsx';
import { SiteReview } from '../components/SiteReview.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { useAnnounce } from '../lib/announce.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { parseInertHtml } from '../lib/inert-html.ts';
import { fetchPageByAddress, SERVER_BUILD, serverHealth } from '../lib/server-api.ts';
import { SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL } from '../samples/page.ts';

type Mode = 'address' | 'html';

type State =
  | { readonly kind: 'editing'; readonly diagnostics: readonly Diagnostic[] }
  | { readonly kind: 'fetching'; readonly address: string }
  | { readonly kind: 'fetch-failed'; readonly error: string; readonly detail: string | null }
  | { readonly kind: 'no-server'; readonly address: string }
  | {
      readonly kind: 'ready';
      readonly report: PageReport;
      readonly diagnostics: readonly Diagnostic[];
    };

const FETCH_ERRORS = new Set([
  'invalid-address',
  'blocked-address',
  'unknown-host',
  'unreachable',
  'timeout',
  'tls',
  'too-many-redirects',
  'too-large',
  'not-html',
  'http-status',
  'rate-limited',
  'offline',
]);

export function PageReviewView() {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const id = useId();
  const [mode, setMode] = useState<Mode>('address');
  const [address, setAddress] = useState('');
  const [addressInvalid, setAddressInvalid] = useState(false);
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>({ kind: 'editing', diagnostics: [] });
  const [reviewCount, setReviewCount] = useState(0);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const htmlField = useRef<HTMLTextAreaElement>(null);
  const fetching = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.kind === 'ready') resultsHeading.current?.focus();
  }, [state]);

  useEffect(
    () => () => {
      fetching.current?.abort();
    },
    [],
  );

  const review = (source: string, pageAddress: string, http?: HttpFacts) => {
    const result = reviewHtml(source, parseInertHtml, {
      ...(pageAddress.trim() === '' ? {} : { url: pageAddress }),
      ...(http === undefined ? {} : { http }),
    });
    if (!result.ok) {
      setState({ kind: 'editing', diagnostics: result.diagnostics });
      return;
    }
    setState({ kind: 'ready', report: result.value, diagnostics: result.diagnostics });
    setReviewCount((count) => count + 1);
    announce(t.t('ui.page.done'));
  };

  const reviewAddress = async () => {
    const normalized = siteAddress(address);
    setAddressInvalid(normalized === null);
    if (normalized === null) return;
    const health = await serverHealth();
    if (health?.fetch !== true) {
      setState({ kind: 'no-server', address: normalized });
      return;
    }
    fetching.current?.abort();
    const controller = new AbortController();
    fetching.current = controller;
    setState({ kind: 'fetching', address: normalized });
    announce(t.t('ui.page.fetching', { address: normalized }));
    const reply = await fetchPageByAddress(normalized, controller.signal);
    if (fetching.current !== controller) return;
    fetching.current = null;
    if (reply.ok) {
      review(reply.html, reply.http.finalUrl, reply.http);
    } else if (reply.error === 'cancelled') {
      setState({ kind: 'editing', diagnostics: [] });
    } else {
      setState({ kind: 'fetch-failed', error: reply.error, detail: reply.detail });
      announce(fetchErrorText(reply.error, reply.detail));
    }
  };

  const fetchErrorText = (error: string, detail: string | null) => {
    if (error === 'http-status') return t.t('ui.page.fetch.http-status', { detail: detail ?? '?' });
    const known = FETCH_ERRORS.has(error) ? error : 'failed';
    return t.t(`ui.page.fetch.${known}` as MessageKey);
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

  const switchToHtml = (pageAddress: string) => {
    setMode('html');
    if (url.trim() === '') setUrl(pageAddress);
    setState({ kind: 'editing', diagnostics: [] });
    // Let the field render before it takes focus.
    requestAnimationFrame(() => htmlField.current?.focus());
  };

  const errorId = `${id}-errors`;
  const hasErrors =
    state.kind === 'editing' && state.diagnostics.some((d) => d.severity === 'error');
  const busy = state.kind === 'fetching';

  return (
    <>
      <PageHeading lead={t.t('ui.page.lead')}>{t.t('ui.page.title')}</PageHeading>

      <form
        class="panel form page-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (mode === 'address') void reviewAddress();
          else review(html, url);
        }}
      >
        <fieldset class="segmented page-form__mode">
          <legend class="visually-hidden">{t.t('ui.page.mode')}</legend>
          {(['address', 'html'] as const).map((option) => (
            <label key={option} class="segmented__option">
              <input
                type="radio"
                name={`${id}-mode`}
                value={option}
                checked={mode === option}
                onChange={() => {
                  setMode(option);
                  if (state.kind !== 'ready') setState({ kind: 'editing', diagnostics: [] });
                }}
              />
              <span>
                {t.t(option === 'address' ? 'ui.page.mode.address' : 'ui.page.mode.html')}
              </span>
            </label>
          ))}
        </fieldset>

        {mode === 'address' ? (
          <div class="field">
            <label for={`${id}-address`}>{t.t('ui.page.address')}</label>
            <p id={`${id}-address-hint`} class="hint">
              {t.t(SERVER_BUILD ? 'ui.page.address.hint' : 'ui.page.address.no-server')}
            </p>
            <div class="address-input">
              <input
                id={`${id}-address`}
                type="text"
                inputMode="url"
                dir="ltr"
                autoComplete="url"
                autoCapitalize="none"
                spellcheck={false}
                placeholder="example.com"
                value={address}
                aria-invalid={addressInvalid}
                aria-describedby={`${id}-address-hint${addressInvalid ? ` ${id}-address-error` : ''}`}
                onInput={(event) => {
                  setAddress(event.currentTarget.value);
                  setAddressInvalid(false);
                }}
              />
              <button type="submit" class="button button--primary" disabled={busy}>
                {t.t('ui.page.submit')}
              </button>
            </div>
            {addressInvalid ? (
              <p id={`${id}-address-error`} class="field-error">
                {t.t('ui.page.address.invalid')}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div class="field">
              <label for={`${id}-html`}>{t.t('ui.page.html')}</label>
              <p id={`${id}-html-hint`} class="hint">
                {t.t('ui.page.html.hint')}
              </p>
              <textarea
                ref={htmlField}
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
          </>
        )}

        {state.kind === 'editing' && state.diagnostics.length > 0 ? (
          <div id={errorId}>
            <DiagnosticList diagnostics={state.diagnostics} />
          </div>
        ) : null}

        <div role="status" class="page-form__status">
          {state.kind === 'fetching' ? (
            <p class="progress">
              {t.t('ui.page.fetching', { address: state.address })}{' '}
              <button
                type="button"
                class="button button--small"
                onClick={() => {
                  fetching.current?.abort();
                }}
              >
                {t.t('ui.site.stop')}
              </button>
            </p>
          ) : null}
          {state.kind === 'fetch-failed' ? (
            <p class="alert">{fetchErrorText(state.error, state.detail)}</p>
          ) : null}
        </div>

        {state.kind === 'no-server' ? (
          <div class="callout no-server">
            <p>
              <strong>{t.t('ui.page.no-server.title')}</strong>
            </p>
            <p>{t.t('ui.page.no-server.steps', { address: state.address })}</p>
            <p>
              <button
                type="button"
                class="button"
                onClick={() => {
                  switchToHtml(state.address);
                }}
              >
                {t.t('ui.page.no-server.switch')}
              </button>
            </p>
          </div>
        ) : null}

        <div class="actions">
          {mode === 'html' ? (
            <button type="submit" class="button button--primary">
              {t.t('ui.page.submit')}
            </button>
          ) : null}
          <button
            type="button"
            class="button"
            onClick={() => {
              setMode('html');
              setHtml(SAMPLE_PAGE_HTML);
              setUrl(SAMPLE_PAGE_URL);
              review(SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL);
            }}
          >
            {t.t('ui.page.sample')}
          </button>
        </div>
      </form>

      {state.kind === 'ready' ? (
        <section class="section page-results" aria-labelledby="page-results">
          <h2 id="page-results" ref={resultsHeading} tabIndex={-1}>
            {t.t('ui.page.results')}
          </h2>
          <p class="muted">
            {state.report.url === null
              ? t.t('ui.page.reviewed-pasted')
              : t.t('ui.page.reviewed', { url: state.report.url })}
          </p>
          <PageOverview report={state.report} />
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
          <AnalysisPanel key={reviewCount} report={state.report} />
        </section>
      ) : null}

      <SiteReview />
    </>
  );
}
