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
import { useId, useMemo } from 'preact/hooks';
import { useI18n } from '../lib/i18n.tsx';
import { Icon } from './Icon.tsx';

type Level = 4 | 5;
type HeadingTag = 'h4' | 'h5' | 'h6';
const heading = (level: number): HeadingTag => (level <= 4 ? 'h4' : level === 5 ? 'h5' : 'h6');

function pageLanguage(report: PageReport): string | undefined {
  return report.facts.lang !== null && isValidLanguageTag(report.facts.lang)
    ? report.facts.lang
    : undefined;
}

/**
 * The analysis of one page review, written by SearchUnveil Analyst, the app's own engine: at once,
 * on the person's device, with nothing sent anywhere and no key or account.
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
    </section>
  );
}

function AnalysisResult(props: {
  readonly analysis: PageAnalysis;
  /** The heading level of the result's own sections. */
  readonly level: Level;
  readonly pageLang: string | undefined;
  readonly byline: string;
}) {
  const { t } = useI18n();
  const { analysis, level } = props;
  const Verdict = heading(level);

  return (
    <article class="analysis">
      <header class="analysis__head">
        <Verdict class={`verdict verdict--${analysis.verdict}`}>
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
