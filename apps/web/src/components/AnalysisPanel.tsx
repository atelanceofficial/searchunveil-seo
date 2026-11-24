import {
  analyzePage,
  ANALYST_VERSION,
  displayWidth,
  isValidLanguageTag,
  renderAnalystReport,
  type AnalysisPriority,
  type PageAnalysis,
  type PageReport,
} from '@searchunveil/core';
import type { JSX } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';
import { useAnnounce } from '../lib/announce.tsx';
import { modelName, useAnalyst, type AnalystError } from '../lib/analyst.ts';
import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

type Level = 4 | 5;
type HeadingTag = 'h4' | 'h5' | 'h6';
const heading = (level: number): HeadingTag => (level <= 4 ? 'h4' : level === 5 ? 'h5' : 'h6');

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

function pageLanguage(report: PageReport): string | undefined {
  return report.facts.lang !== null && isValidLanguageTag(report.facts.lang)
    ? report.facts.lang
    : undefined;
}

/**
 * The analysis of one page review. SearchUnveil Analyst, the app's own engine, writes it at once
 * on the person's device, with no API key or account. Inside Claude, Claude Fable 5.2 can add a
 * second opinion on the viewer's own account; nothing is sent until the person asks, and the
 * panel says beforehand what will be sent.
 */
export function AnalysisPanel(props: { readonly report: PageReport }) {
  const { t } = useI18n();
  const id = useId();
  const builtIn = useMemo(
    () => renderAnalystReport(analyzePage(props.report), t),
    [props.report, t],
  );

  return (
    <section class="analysis-panel" aria-labelledby={`${id}-title`}>
      <div class="analysis-panel__intro">
        <h3 id={`${id}-title`}>
          <Icon name="spark" />
          {t.t('ui.analyst.title')}
        </h3>
        <p class="lead">{t.t('ui.analyst.lead')}</p>
      </div>
      <AnalysisResult
        analysis={builtIn}
        level={4}
        pageLang={pageLanguage(props.report)}
        byline={t.t('ui.analyst.by', { version: ANALYST_VERSION })}
      />
      <SecondOpinion report={props.report} />
    </section>
  );
}

/** Claude Fable 5.2's reading of the same review, on request. */
function SecondOpinion(props: { readonly report: PageReport }) {
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

  // Without Claude, the analyst's plan stands alone: nothing to offer, nothing to explain.
  if (analyst === undefined || analyst === null) return null;

  const start = async () => {
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
  const byline = (model: string | null, fallback: boolean) =>
    [
      model === null
        ? t.t('ui.analysis.by-tier')
        : t.t('ui.analysis.by', { model: modelName(model) }),
      fallback && model !== null ? t.t('ui.analysis.fallback', { model: modelName(model) }) : '',
    ]
      .filter((part) => part !== '')
      .join(' ');

  return (
    <section class="second-opinion" aria-labelledby={`${id}-title`}>
      <h4 id={`${id}-title`}>{t.t('ui.analysis.title')}</h4>
      <p>{t.t('ui.analysis.lead')}</p>
      <p class="hint">
        <Icon name="lock" />
        {t.t('ui.analysis.sends.claude')}
      </p>
      <div class="actions">
        <button
          type="button"
          class="button"
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
      {state.kind === 'done' ? (
        <AnalysisResult
          analysis={state.analysis}
          level={5}
          pageLang={pageLanguage(props.report)}
          byline={byline(state.model, state.fallback)}
          caution
          headingRef={resultHeading}
        />
      ) : null}
    </section>
  );
}

function AnalysisResult(props: {
  readonly analysis: PageAnalysis;
  /** The heading level of the result's own sections. */
  readonly level: Level;
  readonly pageLang: string | undefined;
  readonly byline: string;
  /** Whether to warn that the text was written by a language model. */
  readonly caution?: boolean;
  readonly headingRef?: { current: HTMLHeadingElement | null };
}) {
  const { t } = useI18n();
  const { analysis, level } = props;
  const Verdict = heading(level);

  return (
    <article class="analysis">
      <header class="analysis__head">
        <Verdict
          {...(props.headingRef === undefined ? {} : { ref: props.headingRef })}
          tabIndex={-1}
          class={`verdict verdict--${analysis.verdict}`}
        >
          {t.t('ui.analysis.verdict', { verdict: analysis.verdict })}
        </Verdict>
        {analysis.summary === '' ? null : (
          <p class="analysis__summary" dir="auto">
            <RichText text={analysis.summary} />
          </p>
        )}
      </header>

      {analysis.priorities.length === 0 ? null : (
        <Section title={t.t('ui.analysis.priorities')} level={level}>
          <ol class="priorities" role="list">
            {analysis.priorities.map((priority, index) => (
              <Priority key={index} priority={priority} number={index + 1} level={level + 1} />
            ))}
          </ol>
        </Section>
      )}

      {analysis.titleSuggestions.length + analysis.descriptionSuggestions.length === 0 ? null : (
        <div class="analysis__ideas">
          <Suggestions
            title={t.t('ui.analysis.titles')}
            items={analysis.titleSuggestions}
            lang={props.pageLang}
            level={level}
          />
          <Suggestions
            title={t.t('ui.analysis.descriptions')}
            items={analysis.descriptionSuggestions}
            lang={props.pageLang}
            level={level}
          />
        </div>
      )}

      <Notes title={t.t('ui.analysis.content')} items={analysis.contentNotes} level={level} />
      <Notes title={t.t('ui.analysis.technical')} items={analysis.technicalNotes} level={level} />
      <Notes title={t.t('ui.analysis.caveats')} items={analysis.caveats} level={level} />

      <footer class="analysis__footer">
        <p>{props.byline}</p>
        {props.caution === true ? <p>{t.t('ui.analysis.caution')}</p> : null}
      </footer>
    </article>
  );
}

function Section(props: {
  readonly title: string;
  readonly level: number;
  readonly children: JSX.Element;
}) {
  const Title = heading(props.level);
  return (
    <section class="analysis__section">
      <Title>{props.title}</Title>
      {props.children}
    </section>
  );
}

function Priority(props: {
  readonly priority: AnalysisPriority;
  readonly number: number;
  readonly level: number;
}) {
  const { t } = useI18n();
  const { priority } = props;
  const Title = heading(props.level);
  return (
    <li class="priority">
      <div class="priority__head">
        <span class="priority__number" aria-hidden="true">
          {t.value(props.number)}
        </span>
        <Title class="priority__title" dir="auto">
          {priority.title}
        </Title>
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
  readonly level: number;
}) {
  const { t } = useI18n();
  if (props.items.length === 0) return null;
  const Title = heading(props.level);
  return (
    <section class="ideas">
      <Title>{props.title}</Title>
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

function Notes(props: {
  readonly title: string;
  readonly items: readonly string[];
  readonly level: number;
}) {
  if (props.items.length === 0) return null;
  return (
    <Section title={props.title} level={props.level}>
      <ul class="notes">
        {props.items.map((item, index) => (
          <li key={index} dir="auto">
            <RichText text={item} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Text written by the analyst or a model, always rendered as text: `code` between backticks
 * becomes a code span, line breaks are kept by the stylesheet, and nothing in it is ever
 * treated as markup.
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
