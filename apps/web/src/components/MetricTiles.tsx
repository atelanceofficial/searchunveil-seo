import {
  decimal,
  percent,
  type MetricChange,
  type ParamValue,
  type SearchConsoleReport,
} from '@searchunveil/core';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { seriesFor } from './chart-math.ts';
import { Sparkline } from './Sparkline.tsx';

type Metric = 'clicks' | 'impressions' | 'ctr' | 'position';

const LABEL: Readonly<Record<Metric, MessageKey>> = {
  clicks: 'metric.clicks',
  impressions: 'metric.impressions',
  ctr: 'metric.ctr',
  position: 'metric.position',
};

const HELP: Readonly<Record<Metric, MessageKey>> = {
  clicks: 'metric.clicks.help',
  impressions: 'metric.impressions.help',
  ctr: 'metric.ctr.help',
  position: 'metric.position.help',
};

function display(metric: Metric, value: number | null): ParamValue {
  if (value === null) return '–';
  if (metric === 'ctr') return percent(value);
  if (metric === 'position') return decimal(value, 1);
  return value;
}

/** Whether a change is good news: for position, a lower number is better. */
function trend(change: MetricChange): 'good' | 'bad' | 'neutral' {
  if (change.direction !== 'up' && change.direction !== 'down') return 'neutral';
  const better =
    change.metric === 'position' ? change.direction === 'down' : change.direction === 'up';
  return better ? 'good' : 'bad';
}

/**
 * The four Search Console metrics, each explained next to its number. With two comparable
 * periods, tiles show the recent period and how it changed; otherwise, the export's totals.
 */
export function MetricTiles(props: { readonly report: SearchConsoleReport }) {
  const { t } = useI18n();
  const { comparison, overview, series } = props.report;
  if (overview === null) return null;
  const metrics: readonly Metric[] = ['clicks', 'impressions', 'ctr', 'position'];
  const recentStart =
    comparison === null ? -1 : series.findIndex((p) => p.date === comparison.current.start);

  return (
    <ul class="tiles" role="list">
      {metrics.map((metric) => {
        const change = comparison?.[metric] ?? null;
        const current = change === null ? overview[metric] : change.current;
        const direction = change === null ? 'neutral' : trend(change);
        let changeText: string | null = null;
        if (change !== null && change.direction !== 'insufficient') {
          if (metric === 'position' && change.change !== null) {
            changeText = t.value(decimal(change.change, 1, true));
          } else if (change.relativeChange !== null) {
            changeText = t.value(percent(change.relativeChange, true));
          }
        }
        const value = t.value(display(metric, current));
        return (
          <li key={metric} class="tile">
            <p class="tile__label">{t.t(LABEL[metric])}</p>
            <p class="tile__value">
              {/* The number shrinks to fit its tile, however many digits it has. */}
              <span class="tile__number" style={{ '--chars': value.length }}>
                {value}
              </span>
            </p>
            {changeText === null ? null : (
              <p class="tile__change" data-trend={direction}>
                <span aria-hidden="true">
                  {direction === 'good' ? '▲' : direction === 'bad' ? '▼' : '•'}{' '}
                </span>
                {changeText}
              </p>
            )}
            {change === null ? null : (
              <p class="tile__previous">
                {t.t('ui.gsc.previous-value', { value: display(metric, change.previous) })}
              </p>
            )}
            {series.length > 1 ? (
              <Sparkline
                values={seriesFor(series, metric).average}
                inverted={metric === 'position'}
                highlightFrom={recentStart > 0 ? recentStart : undefined}
              />
            ) : null}
            <p class="tile__help">{t.t(HELP[metric])}</p>
          </li>
        );
      })}
    </ul>
  );
}
