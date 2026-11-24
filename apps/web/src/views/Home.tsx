import {
  analyzeSearchConsole,
  importSearchConsole,
  LOCALES,
  MENTION_CERTAINTY,
  MENTION_KINDS,
  percent,
  reviewHtml,
  STATUS_ORDER,
  type FindingStatus,
  type SearchConsoleReport,
} from '@searchunveil/core';
import { Fragment, type ComponentChildren } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { seriesFor } from '../components/chart-math.ts';
import { FindingCard } from '../components/FindingCard.tsx';
import { Icon, type IconName } from '../components/Icon.tsx';
import { MetricTiles } from '../components/MetricTiles.tsx';
import { Sparkline } from '../components/Sparkline.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { TrendChart } from '../components/TrendChart.tsx';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { parseInertHtml } from '../lib/inert-html.ts';
import { href, type ROUTES } from '../lib/router.ts';
import { SAMPLE_PAGE_HTML, SAMPLE_PAGE_URL } from '../samples/page.ts';
import { sampleSearchConsoleFiles } from '../samples/search-console.ts';

const TOOL_NAMES: readonly MessageKey[] = [
  'ui.nav.search-console',
  'ui.nav.page-review',
  'ui.nav.mentions',
];

const PRINCIPLES: readonly { readonly icon: IconName; readonly text: MessageKey }[] = [
  { icon: 'lock', text: 'ui.home.principle.local' },
  { icon: 'review', text: 'ui.home.principle.evidence' },
  { icon: 'info', text: 'ui.home.principle.limits' },
];

/** The fictional sample export, analyzed in the browser like any file a person chooses. */
function useSampleReport(): SearchConsoleReport | null {
  const [report, setReport] = useState<SearchConsoleReport | null>(null);
  useEffect(() => {
    let current = true;
    void importSearchConsole(sampleSearchConsoleFiles()).then((imported) => {
      if (current && imported.ok) setReport(analyzeSearchConsole(imported.value));
    });
    return () => {
      current = false;
    };
  }, []);
  return report;
}

/** How the sample page's findings divide between the four statuses. */
function useSampleCounts(): Readonly<Record<FindingStatus, number>> | null {
  return useMemo(() => {
    const result = reviewHtml(SAMPLE_PAGE_HTML, parseInertHtml, { url: SAMPLE_PAGE_URL });
    return result.ok ? result.value.counts : null;
  }, []);
}

function ToolCard(props: {
  readonly route: (typeof ROUTES)[number];
  readonly icon: IconName;
  readonly name: MessageKey;
  readonly title: MessageKey;
  readonly text: MessageKey;
  readonly action: MessageKey;
  readonly children: ComponentChildren;
}) {
  const { t } = useI18n();
  return (
    <li class="tool">
      <p class="tool__name">
        <span class="tool__icon">
          <Icon name={props.icon} />
        </span>
        {t.t(props.name)}
      </p>
      {/* A glimpse of the tool's real output on sample data; the words beside it explain it. */}
      <div class="tool__preview" aria-hidden="true">
        {props.children}
      </div>
      <h2 class="tool__title">{t.t(props.title)}</h2>
      <p class="tool__text">{t.t(props.text)}</p>
      <a class="tool__action" href={href(props.route)}>
        {t.t(props.action)}
        <Icon name="arrow" class="icon--inline icon--directional" />
      </a>
    </li>
  );
}

export function Home() {
  const { t } = useI18n();
  const report = useSampleReport();
  const counts = useSampleCounts();
  const impressions = report?.comparison?.impressions ?? null;
  const recentStart =
    report?.comparison === null || report?.comparison === undefined
      ? -1
      : report.series.findIndex((p) => p.date === report.comparison?.current.start);
  const totalFindings =
    counts === null ? 0 : STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);

  return (
    <>
      {/* The cover: the title beside threads of light, on the deep blue-black of the night sky. */}
      <section class="hero tone-dark" aria-labelledby="home-title">
        <div class="hero__inner">
          <div class="hero__copy">
            <p class="hero__label">
              {TOOL_NAMES.map((name, index) => (
                <Fragment key={name}>
                  {index === 0 ? null : ' '}
                  {/* A no-break space keeps each dot on the line of the name before it. */}
                  <span class="hero__label-item">
                    {t.t(name)}
                    {index < TOOL_NAMES.length - 1 ? '\u00A0·' : null}
                  </span>
                </Fragment>
              ))}
            </p>
            <h1 id="home-title" class="hero__title" tabIndex={-1} data-page-heading>
              {t.t('ui.home.title')}
            </h1>
            <p class="hero__lead">{t.t('ui.home.lead')}</p>
            <p class="local-note">
              <Icon name="lock" />
              {t.t('ui.app.local')}
            </p>
          </div>
          {/* Threads of light from a photograph, without its ground; drawn by the stylesheet. */}
          <div class="hero__art" aria-hidden="true" />
          {/* Facts about how it works, read like the dials of an instrument. */}
          <dl class="facts">
            <div class="fact">
              <dt>{t.t('ui.home.fact.languages')}</dt>
              <dd>{t.value(LOCALES.length)}</dd>
            </div>
            <div class="fact">
              <dt>{t.t('ui.home.fact.uploads')}</dt>
              <dd>{t.value(0)}</dd>
            </div>
            <div class="fact">
              <dt>{t.t('ui.home.fact.trackers')}</dt>
              <dd>{t.value(0)}</dd>
            </div>
            <div class="fact">
              <dt>{t.t('ui.home.fact.device')}</dt>
              <dd>{t.value(percent(1))}</dd>
            </div>
          </dl>
        </div>
      </section>

      <ul class="tools" role="list">
        <ToolCard
          route="search-console"
          icon="chart"
          name="ui.nav.search-console"
          title="ui.home.gsc.title"
          text="ui.home.gsc.text"
          action="ui.home.gsc.action"
        >
          {report === null ? null : (
            <div class="preview-trend">
              <Sparkline
                values={seriesFor(report.series, 'impressions').average}
                highlightFrom={recentStart > 0 ? recentStart : undefined}
              />
              {impressions?.relativeChange === null || impressions === null ? null : (
                <p class="preview-trend__readout">
                  <span class="preview-trend__value">
                    {t.value(percent(impressions.relativeChange, true))}
                  </span>
                  <span class="readout">{t.t('metric.impressions')}</span>
                </p>
              )}
            </div>
          )}
        </ToolCard>
        <ToolCard
          route="page-review"
          icon="page"
          name="ui.nav.page-review"
          title="ui.home.page.title"
          text="ui.home.page.text"
          action="ui.home.page.action"
        >
          {counts === null || totalFindings === 0 ? null : (
            <div class="preview-findings">
              <div class="preview-findings__bar">
                {STATUS_ORDER.map((status) =>
                  counts[status] === 0 ? null : (
                    <span
                      key={status}
                      class={`preview-findings__part preview-findings__part--${status}`}
                      style={{ flexGrow: counts[status] }}
                    />
                  ),
                )}
              </div>
              <ul class="preview-findings__legend" role="list">
                {STATUS_ORDER.map((status) => (
                  <li key={status}>
                    <StatusBadge status={status} />
                    <strong>{t.value(counts[status])}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ToolCard>
        <ToolCard
          route="mentions"
          icon="quote"
          name="ui.nav.mentions"
          title="ui.home.mentions.title"
          text="ui.home.mentions.text"
          action="ui.home.mentions.action"
        >
          <div class="preview-log">
            {MENTION_KINDS.map((kind) => (
              <span key={kind} class="tag">
                {t.t(`mentions.kind.${kind}`)}
              </span>
            ))}
            {MENTION_CERTAINTY.map((certainty) => (
              <span
                key={certainty}
                class={certainty === 'uncertain' ? 'tag tag--uncertain' : 'tag'}
              >
                {t.t(`mentions.certainty.${certainty}`)}
              </span>
            ))}
          </div>
        </ToolCard>
      </ul>

      {report?.headline === null || report?.headline === undefined ? null : (
        <section class="showcase tone-dark" aria-labelledby="showcase-title">
          <div class="showcase__inner">
            <div class="showcase__head">
              <p class="hero__label">{t.t('ui.gsc.sample.badge')}</p>
              <h2 id="showcase-title">{t.t('ui.home.showcase.title')}</h2>
              <p class="showcase__text">{t.t('ui.home.showcase.text')}</p>
            </div>
            <div class="showcase__grid">
              <div class="headline">
                <FindingCard finding={report.headline} />
              </div>
              <MetricTiles report={report} />
            </div>
            {report.series.length > 1 ? (
              <TrendChart points={report.series} comparison={report.comparison} />
            ) : null}
          </div>
        </section>
      )}

      <section class="principles" aria-labelledby="principles-title">
        <h2 id="principles-title">{t.t('ui.home.principles')}</h2>
        <ul class="principles__list" role="list">
          {PRINCIPLES.map((principle) => (
            <li key={principle.text}>
              <span class="principles__icon">
                <Icon name={principle.icon} />
              </span>
              <span>{t.t(principle.text)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
