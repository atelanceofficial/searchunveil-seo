import {
  legacyEncodingFor,
  reviewSite,
  STATUS_ORDER,
  type Diagnostic,
  type SitePage,
  type SiteReport,
} from '@searchunveil/core';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { useAnnounce } from '../lib/announce.tsx';
import { takeHandOff } from '../lib/handoff.ts';
import { useI18n } from '../lib/i18n.tsx';
import { parseInertHtml } from '../lib/inert-html.ts';
import { DiagnosticList } from './Diagnostics.tsx';
import { FileDrop } from './FileDrop.tsx';
import { FindingList } from './FindingCard.tsx';
import { Icon } from './Icon.tsx';
import { StatusBadge } from './StatusBadge.tsx';
import { Value } from './Value.tsx';

type State =
  | { readonly kind: 'idle'; readonly diagnostics: readonly Diagnostic[] }
  | { readonly kind: 'reviewing'; readonly done: number; readonly total: number }
  | {
      readonly kind: 'ready';
      readonly report: SiteReport;
      readonly diagnostics: readonly Diagnostic[];
    };

/** Pages listed at once; more are a click away, so a large site renders quickly. */
const PAGE_STEP = 30;
/** Pages named under one issue before the rest are counted instead. */
const ISSUE_PAGES = 12;
/** How often progress may redraw, in milliseconds. */
const PROGRESS_EVERY_MS = 120;

/**
 * Reviews every page of a site from a ZIP of its files, or from several HTML files. The ZIP can
 * be of any size: only its pages are read, one at a time, on this device.
 */
export function SiteReview() {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const id = useId();
  const [address, setAddress] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle', diagnostics: [] });
  const running = useRef<AbortController | null>(null);
  const section = useRef<HTMLElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  const review = async (files: readonly File[], siteUrl: string) => {
    running.current?.abort();
    const controller = new AbortController();
    running.current = controller;
    setState({ kind: 'reviewing', done: 0, total: 0 });
    announce(t.t('ui.site.preparing'));
    let drawn = 0;
    try {
      const result = await reviewSite(
        files.map((file) => ({ name: file.name, blob: file })),
        parseInertHtml,
        {
          siteUrl,
          legacyEncoding: legacyEncodingFor(locale),
          signal: controller.signal,
          onProgress: (done, total) => {
            const now = performance.now();
            if (done < total && now - drawn < PROGRESS_EVERY_MS) return;
            drawn = now;
            setState({ kind: 'reviewing', done, total });
          },
        },
      );
      if (!result.ok) {
        setState({ kind: 'idle', diagnostics: result.diagnostics });
        return;
      }
      setState({ kind: 'ready', report: result.value, diagnostics: result.diagnostics });
      announce(t.t('ui.site.done'));
    } catch (error) {
      if (!controller.signal.aborted) throw error;
      setState({ kind: 'idle', diagnostics: [] });
      announce(t.t('ui.site.stopped'));
    } finally {
      if (running.current === controller) running.current = null;
    }
  };

  // A site's files sent over from the Search Console tool are reviewed straight away.
  useEffect(() => {
    const files = takeHandOff();
    if (files !== null && files.length > 0) {
      section.current?.scrollIntoView({ block: 'start' });
      void review(files, '');
    }
    return () => {
      running.current?.abort();
    };
    // Runs once, when the page review opens.
  }, []);

  useEffect(() => {
    if (state.kind === 'ready') resultsHeading.current?.focus();
  }, [state.kind]);

  return (
    <section
      ref={section}
      id="site-review"
      class="panel site-review"
      aria-labelledby={`${id}-title`}
      aria-busy={state.kind === 'reviewing'}
    >
      <h2 id={`${id}-title`}>{t.t('ui.site.title')}</h2>
      <p class="site-review__lead">{t.t('ui.site.lead')}</p>

      {state.kind === 'idle' ? (
        <>
          <div class="field">
            <label for={`${id}-url`}>
              {t.t('ui.site.url')} <span class="optional">({t.t('ui.mentions.optional')})</span>
            </label>
            <p id={`${id}-url-hint`} class="hint">
              {t.t('ui.site.url.hint')}
            </p>
            <input
              id={`${id}-url`}
              type="url"
              inputMode="url"
              dir="ltr"
              autoComplete="url"
              placeholder="https://"
              value={address}
              aria-describedby={`${id}-url-hint`}
              onInput={(event) => {
                setAddress(event.currentTarget.value);
              }}
            />
          </div>
          <FileDrop
            label={t.t('ui.site.choose')}
            dropText={t.t('ui.file.drop')}
            hint={t.t('ui.site.files.hint')}
            accept=".zip,.html,.htm,application/zip,text/html"
            multiple
            onFiles={(files) => void review(files, address)}
          />
          {state.diagnostics.length === 0 ? null : (
            <DiagnosticList diagnostics={state.diagnostics} />
          )}
        </>
      ) : null}

      {state.kind === 'reviewing' ? (
        <div class="site-progress">
          <progress
            max={Math.max(1, state.total)}
            value={state.total === 0 ? undefined : state.done}
            aria-labelledby={`${id}-progress`}
          />
          <p id={`${id}-progress`} role="status">
            {state.total === 0
              ? t.t('ui.site.preparing')
              : t.t('ui.site.progress', { done: state.done, total: state.total })}
          </p>
          <button
            type="button"
            class="button"
            onClick={() => {
              running.current?.abort();
            }}
          >
            {t.t('ui.site.stop')}
          </button>
        </div>
      ) : null}

      {state.kind === 'ready' ? (
        <SiteResults
          report={state.report}
          diagnostics={state.diagnostics}
          headingRef={resultsHeading}
          onReset={() => {
            setState({ kind: 'idle', diagnostics: [] });
          }}
        />
      ) : null}
    </section>
  );
}

function SiteResults(props: {
  readonly report: SiteReport;
  readonly diagnostics: readonly Diagnostic[];
  readonly headingRef: { current: HTMLHeadingElement | null };
  readonly onReset: () => void;
}) {
  const { t } = useI18n();
  const [shown, setShown] = useState(PAGE_STEP);
  const { report } = props;
  const remaining = report.pages.length - shown;

  return (
    <div class="site-results">
      <h3 ref={props.headingRef} tabIndex={-1}>
        {t.t('ui.site.results')}
      </h3>
      <p class="muted">
        {t.t('ui.site.summary', { pages: report.pages.length })}
        {report.otherFiles === 0 ? null : ` ${t.t('ui.site.other', { count: report.otherFiles })}`}
      </p>
      <ul class="counts" role="list">
        {STATUS_ORDER.map((status) => (
          <li key={status}>
            <StatusBadge status={status} />
            <strong>{t.value(report.counts[status])}</strong>
          </li>
        ))}
      </ul>
      {props.diagnostics.length === 0 ? null : <DiagnosticList diagnostics={props.diagnostics} />}

      <h4>{t.t('ui.site.issues')}</h4>
      {report.issues.length === 0 ? (
        <p class="muted">{t.t('ui.site.issues.none')}</p>
      ) : (
        <ul class="site-issues" role="list">
          {report.issues.map((issue) => (
            <li key={`${issue.status} ${issue.rule} ${issue.example.title.key}`} class="site-issue">
              <StatusBadge status={issue.status} />
              <div class="site-issue__body">
                <p class="site-issue__title">{t.message(issue.example.title)}</p>
                <p class="site-issue__count">
                  {t.t('ui.site.issue.pages', {
                    count: issue.pages.length,
                    path: issue.pages[0] ?? '',
                  })}
                </p>
                <details class="site-issue__pages">
                  <summary>{t.t('ui.site.issue.list')}</summary>
                  <ul role="list">
                    {issue.pages.slice(0, ISSUE_PAGES).map((path) => (
                      <li key={path}>
                        <Value value={{ kind: 'code', value: path }} />
                      </li>
                    ))}
                    {issue.pages.length > ISSUE_PAGES ? (
                      <li class="muted">
                        {t.t('ui.site.and-more', { count: issue.pages.length - ISSUE_PAGES })}
                      </li>
                    ) : null}
                  </ul>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h4>{t.t('ui.site.pages')}</h4>
      <ul class="site-pages" role="list">
        {report.pages.slice(0, shown).map((page) => (
          <li key={page.path}>
            <PageDetails page={page} />
          </li>
        ))}
      </ul>
      {remaining > 0 ? (
        <p>
          <button
            type="button"
            class="button"
            onClick={() => {
              setShown((count) => count + PAGE_STEP);
            }}
          >
            {t.t('ui.site.more', { count: Math.min(PAGE_STEP, remaining) })}
          </button>
        </p>
      ) : null}

      {report.skipped.length === 0 ? null : (
        <>
          <h4>{t.t('ui.site.skipped')}</h4>
          <ul class="site-skipped" role="list">
            {report.skipped.map((skipped) => (
              <li key={skipped.path}>
                <Value value={{ kind: 'code', value: skipped.path }} />
                <DiagnosticList diagnostics={skipped.diagnostics} />
              </li>
            ))}
          </ul>
        </>
      )}

      <p>
        <button type="button" class="button" onClick={props.onReset}>
          {t.t('ui.site.again')}
        </button>
      </p>
    </div>
  );
}

/** One page, closed by default; its findings are drawn only once it is opened. */
function PageDetails(props: { readonly page: SitePage }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { page } = props;
  return (
    <details
      class="site-page"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>
        <span class="site-page__name">
          <Value value={{ kind: 'code', value: page.path }} />
          <span class="site-page__title">{page.report.title ?? t.t('ui.site.untitled')}</span>
        </span>
        <span class="site-page__counts">
          {(['attention', 'review'] as const).map((status) =>
            page.report.counts[status] === 0 ? null : (
              <span key={status} class="site-page__count" data-status={status}>
                <Icon name={status} />
                {t.value(page.report.counts[status])}
                <span class="visually-hidden"> {t.t(`status.${status}`)}</span>
              </span>
            ),
          )}
        </span>
      </summary>
      {open ? <FindingList findings={page.report.findings} /> : null}
    </details>
  );
}
