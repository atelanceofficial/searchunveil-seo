import {
  ANALYSIS_MODEL,
  displayWidth,
  isValidLanguageTag,
  type AnalysisPriority,
  type PageAnalysis,
  type PageReport,
} from '@searchunveil/core';
import { useEffect, useId, useRef, useState } from 'preact/hooks';
import { useAnnounce } from '../lib/announce.tsx';
import { modelName, useAnalyst, type AnalystError } from '../lib/analyst.ts';
import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

type State =
  | { readonly kind: 'idle' }
  | { readonly kind: 'running'; readonly writing: boolean }
  | {
      readonly kind: 'done';
      readonly analysis: PageAnalysis;
      readonly model: string | null;
      readonly fallback: boolean;
    }
  | { readonly kind: 'failed'; readonly error: AnalystError };

/**
 * The optional AI analysis of one page review, written by Claude Fable 5.2. Nothing is sent
 * until the person presses the button; the panel says beforehand what will be sent, and where.
 */
export function AnalysisPanel(props: { readonly report: PageReport }) {
  const { t, locale } = useI18n();
  const announce = useAnnounce();
  const analyst = useAnalyst();
  const id = useId();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const controller = useRef<AbortController | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);

  // Stop a running analysis when the panel goes away (another review, another page).
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (state.kind === 'done') resultHeading.current?.focus();
  }, [state.kind]);

  if (analyst === undefined) return null;

  const start = async () => {
    if (analyst === null) return;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ kind: 'running', writing: false });
    const outcome = await analyst.run(props.report, locale, {
      signal: current.signal,
      onWriting: () => {
        if (!current.signal.aborted) setState({ kind: 'running', writing: true });
      },
    });
    if (controller.current !== current) return;
    controller.current = null;
    if (outcome.ok) {
      setState({ kind: 'done', ...outcome });
      announce(t.t('ui.analysis.done'));
    } else {
      setState({ kind: 'failed', error: outcome.error });
      announce(t.t(`ui.analysis.error.${outcome.error}`));
    }
  };

  const running = state.kind === 'running';
  const pageLang =
    props.report.facts.lang !== null && isValidLanguageTag(props.report.facts.lang)
      ? props.report.facts.lang
      : undefined;

  return (
    <section class="analysis-panel" aria-labelledby={`${id}-title`}>
      <div class="analysis-panel__intro">
        <h3 id={`${id}-title`}>
          <Icon name="spark" />
          {t.t('ui.analysis.title')}
        </h3>
        <p class="lead">{t.t('ui.analysis.lead')}</p>
        {analyst === null ? (
          <p class="callout">{t.t('ui.analysis.unavailable')}</p>
        ) : (
          <>
            <p class="hint">
              <Icon name="lock" />
              {t.t(
                analyst.kind === 'server' ? 'ui.analysis.sends.server' : 'ui.analysis.sends.claude',
              )}
            </p>
            <div class="actions">
              <button
                type="button"
                class="button button--primary"
                disabled={running}
                onClick={() => {
                  void start();
                }}
              >
                {t.t(state.kind === 'done' ? 'ui.analysis.again' : 'ui.analysis.start')}
              </button>
              {running ? (
                <button
                  type="button"
                  class="button"
                  onClick={() => {
                    controller.current?.abort();
                  }}
                >
                  {t.t('ui.site.stop')}
                </button>
              ) : null}
            </div>
          </>
        )}
        <div role="status" class="analysis-panel__status">
          {running ? (
            <p class="progress analysis-progress">
              <span class="analysis-progress__pulse" aria-hidden="true" />
              {t.t(state.writing ? 'ui.analysis.writing' : 'ui.analysis.thinking')}
            </p>
          ) : null}
          {state.kind === 'failed' ? (
            <p class={state.error === 'cancelled' ? 'muted' : 'alert'}>
              {t.t(`ui.analysis.error.${state.error}`)}
            </p>
          ) : null}
        </div>
      </div>

      {state.kind === 'done' ? (
        <AnalysisResult
          analysis={state.analysis}
          model={state.model}
          fallback={state.fallback}
          pageLang={pageLang}
          headingRef={resultHeading}
        />
      ) : null}
    </section>
  );
}

function AnalysisResult(props: {
  readonly analysis: PageAnalysis;
  readonly model: string | null;
  readonly fallback: boolean;
  readonly pageLang: string | undefined;
  readonly headingRef: { current: HTMLHeadingElement | null };
}) {
  const { t } = useI18n();
  const { analysis } = props;

  return (
    <article class="analysis">
      <header class="analysis__head">
        <h4 ref={props.headingRef} tabIndex={-1} class={`verdict verdict--${analysis.verdict}`}>
          {t.t('ui.analysis.verdict', { verdict: analysis.verdict })}
        </h4>
        {analysis.summary === '' ? null : (
          <p class="analysis__summary" dir="auto">
            {analysis.summary}
          </p>
        )}
      </header>

      {analysis.priorities.length === 0 ? null : (
        <section class="analysis__section">
          <h4>{t.t('ui.analysis.priorities')}</h4>
          <ol class="priorities" role="list">
            {analysis.priorities.map((priority, index) => (
              <Priority key={index} priority={priority} number={index + 1} />
            ))}
          </ol>
        </section>
      )}

      {analysis.titleSuggestions.length + analysis.descriptionSuggestions.length === 0 ? null : (
        <div class="analysis__ideas">
          <Suggestions
            title={t.t('ui.analysis.titles')}
            items={analysis.titleSuggestions}
            lang={props.pageLang}
          />
          <Suggestions
            title={t.t('ui.analysis.descriptions')}
            items={analysis.descriptionSuggestions}
            lang={props.pageLang}
          />
        </div>
      )}

      <Notes title={t.t('ui.analysis.content')} items={analysis.contentNotes} />
      <Notes title={t.t('ui.analysis.technical')} items={analysis.technicalNotes} />
      <Notes title={t.t('ui.analysis.caveats')} items={analysis.caveats} />

      <footer class="analysis__footer">
        <p>
          {props.model === null
            ? t.t('ui.analysis.by-tier')
            : t.t('ui.analysis.by', { model: modelName(props.model) })}
          {props.fallback && props.model !== null
            ? ` ${t.t('ui.analysis.fallback', { model: modelName(props.model) })}`
            : null}
        </p>
        <p>{t.t('ui.analysis.caution')}</p>
      </footer>
    </article>
  );
}

function Priority(props: { readonly priority: AnalysisPriority; readonly number: number }) {
  const { t } = useI18n();
  const { priority } = props;
  return (
    <li class="priority">
      <div class="priority__head">
        <span class="priority__number" aria-hidden="true">
          {t.value(props.number)}
        </span>
        <h5 class="priority__title" dir="auto">
          {priority.title}
        </h5>
        <p class="priority__levels">
          <span class={`level level--${priority.impact}`}>
            {t.t('ui.analysis.impact', { level: priority.impact })}
          </span>
          <span class="level level--effort">
            {t.t('ui.analysis.effort', { level: priority.effort })}
          </span>
        </p>
      </div>
      <dl class="priority__body">
        {priority.why === '' ? null : (
          <div>
            <dt>{t.t('ui.analysis.why')}</dt>
            <dd dir="auto">
              <RichText text={priority.why} />
            </dd>
          </div>
        )}
        <div>
          <dt>{t.t('ui.analysis.how')}</dt>
          <dd class="priority__how" dir="auto">
            <RichText text={priority.how} />
          </dd>
        </div>
        {priority.evidence === '' ? null : (
          <div>
            <dt>{t.t('ui.analysis.evidence')}</dt>
            <dd class="priority__evidence" dir="auto">
              <RichText text={priority.evidence} />
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function Suggestions(props: {
  readonly title: string;
  readonly items: readonly string[];
  readonly lang: string | undefined;
}) {
  const { t } = useI18n();
  if (props.items.length === 0) return null;
  return (
    <section class="ideas">
      <h4>{props.title}</h4>
      <ul class="ideas__list" role="list">
        {props.items.map((item, index) => (
          <li key={index} class="ideas__item">
            <span class="ideas__text" lang={props.lang} dir="auto">
              {item}
            </span>
            <span class="ideas__count">
              {t.t('ui.analysis.characters', { count: Math.round(displayWidth(item)) })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Notes(props: { readonly title: string; readonly items: readonly string[] }) {
  if (props.items.length === 0) return null;
  return (
    <section class="analysis__section">
      <h4>{props.title}</h4>
      <ul class="notes">
        {props.items.map((item, index) => (
          <li key={index} dir="auto">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The model's text, always rendered as text: `code` between backticks becomes a code span,
 * line breaks are kept by the stylesheet, and nothing in it is ever treated as markup.
 */
function RichText(props: { readonly text: string }) {
  const parts = props.text.split('`');
  // An unmatched backtick leaves an odd piece at the end: show it as typed.
  if (parts.length % 2 === 0) return <>{props.text}</>;
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} dir="ltr">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** For tests and the preview: the model the panel asks for. */
export const REQUESTED_MODEL = ANALYSIS_MODEL;
