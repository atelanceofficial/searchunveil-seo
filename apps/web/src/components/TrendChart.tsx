import { decimal, percent, type DailyPoint, type PeriodComparison } from '@searchunveil/core';
import { niceTicks, seriesFor, type ChartMetric } from './chart-math.ts';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useI18n, type MessageKey } from '../lib/i18n.tsx';
import { DataTable } from './DataTable.tsx';

const METRICS: readonly ChartMetric[] = ['clicks', 'impressions', 'ctr', 'position'];
const LABELS: Readonly<Record<ChartMetric, MessageKey>> = {
  clicks: 'metric.clicks',
  impressions: 'metric.impressions',
  ctr: 'metric.ctr',
  position: 'metric.position',
};

const HEIGHT = 260;
const MARGIN = { top: 28, right: 16, bottom: 32, left: 56 } as const;

function path(
  values: readonly (number | null)[],
  x: (i: number) => number,
  y: (v: number) => number,
): string {
  let d = '';
  let drawing = false;
  values.forEach((value, i) => {
    if (value === null) {
      drawing = false;
      return;
    }
    d += `${drawing ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)}`;
    drawing = true;
  });
  return d;
}

function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, width };
}

export function TrendChart(props: {
  readonly points: readonly DailyPoint[];
  readonly comparison: PeriodComparison | null;
}) {
  const { t, locale } = useI18n();
  const id = useId();
  const [metric, setMetric] = useState<ChartMetric>('clicks');
  const { ref, width } = useWidth(640);
  const { points, comparison } = props;
  const series = useMemo(() => seriesFor(points, metric), [points, metric]);

  /** Exact values for the table; compact ones (1.2K) only where axis labels need the room. */
  const formatValue = (value: number) => {
    if (metric === 'ctr') return t.value(percent(value));
    if (metric === 'position') return t.value(decimal(value, 1));
    return t.value(Number.isInteger(value) ? value : decimal(value, 1));
  };
  const formatAxis = (value: number) =>
    metric === 'clicks' || metric === 'impressions'
      ? new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
          value,
        )
      : formatValue(value);
  const dayFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const known = [...series.daily, ...series.average].filter((v): v is number => v !== null);
  const inverted = metric === 'position';
  const ticks = niceTicks(
    inverted ? Math.min(...known, 1) : 0,
    Math.max(...known, inverted ? 2 : 1),
  );
  const yMin = ticks[0] ?? 0;
  const yMax = ticks.at(-1) ?? 1;
  const x = (i: number) =>
    MARGIN.left + (points.length <= 1 ? 0 : (i * plotWidth) / (points.length - 1));
  const y = (value: number) => {
    const share = (value - yMin) / (yMax - yMin || 1);
    return inverted ? MARGIN.top + share * plotHeight : MARGIN.top + (1 - share) * plotHeight;
  };
  const halfStep = points.length <= 1 ? 0 : plotWidth / (points.length - 1) / 2;
  const indexOf = (date: string) => points.findIndex((p) => p.date === date);
  const bands =
    comparison === null
      ? []
      : [
          {
            key: 'previous',
            label: t.t('evidence.previous-period'),
            from: indexOf(comparison.previous.start),
            to: indexOf(comparison.previous.end),
          },
          {
            key: 'recent',
            label: t.t('evidence.recent-period'),
            from: indexOf(comparison.current.start),
            to: indexOf(comparison.current.end),
          },
        ].filter((band) => band.from >= 0 && band.to >= band.from);
  const xTicks = [
    ...new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * (points.length - 1)))),
  ];
  const first = points[0]?.date ?? '';
  const last = points.at(-1)?.date ?? '';
  const metricName = t.t(LABELS[metric]);
  const title = t.t('ui.chart.title', { metric: metricName });

  return (
    <figure class="chart" aria-labelledby={`${id}-title`}>
      <div class="chart__header">
        <figcaption id={`${id}-title`} class="chart__title">
          {title}
          {inverted ? <span class="chart__note"> · {t.t('ui.chart.lower-better')}</span> : null}
        </figcaption>
        <fieldset class="segmented">
          <legend class="visually-hidden">{t.t('ui.chart.metric')}</legend>
          {METRICS.filter(
            (option) => option !== 'position' || points.some((point) => point.position !== null),
          ).map((option) => (
            <label key={option} class="segmented__option">
              <input
                type="radio"
                name={`${id}-metric`}
                value={option}
                checked={metric === option}
                onChange={() => {
                  setMetric(option);
                }}
              />
              <span>{t.t(LABELS[option])}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <div ref={ref} class="chart__canvas">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
          class="chart__svg"
        >
          <desc id={`${id}-desc`}>
            {t.t('ui.chart.description', {
              metric: metricName,
              start: { kind: 'date', value: first },
              end: { kind: 'date', value: last },
            })}
          </desc>
          {bands.map((band) => {
            // Each day owns the half-step on either side of its point, so adjacent periods meet.
            const start = Math.max(MARGIN.left, x(band.from) - halfStep);
            const end = Math.min(width - MARGIN.right, x(band.to) + halfStep);
            return (
              <g key={band.key} class={`chart__band chart__band--${band.key}`}>
                <rect
                  x={start}
                  y={MARGIN.top}
                  width={Math.max(1, end - start)}
                  height={plotHeight}
                />
                <text x={start + 6} y={MARGIN.top - 10}>
                  {band.label}
                </text>
              </g>
            );
          })}
          {ticks.map((tick) => (
            <g key={tick} class="chart__grid">
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(tick)} y2={y(tick)} />
              <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" text-anchor="end">
                {formatAxis(tick)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text
              key={i}
              class="chart__axis"
              x={x(i)}
              y={HEIGHT - 10}
              text-anchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
            >
              {dayFormat.format(Date.parse(points[i]?.date ?? first))}
            </text>
          ))}
          <path class="chart__daily" d={path(series.daily, x, y)} />
          <path class="chart__average" d={path(series.average, x, y)} />
          {points.map((point, i) => {
            const value = series.daily[i] ?? null;
            return point.incomplete && value !== null ? (
              <circle key={point.date} class="chart__incomplete" cx={x(i)} cy={y(value)} r={4}>
                <title>{t.t('ui.chart.incomplete')}</title>
              </circle>
            ) : null;
          })}
        </svg>
      </div>
      <p class="chart__legend">
        <span class="legend legend--average">{t.t('ui.chart.average')}</span>
        <span class="legend legend--daily">{t.t('ui.chart.daily')}</span>
        {points.some((p) => p.incomplete) ? (
          <span class="legend legend--incomplete">{t.t('ui.chart.incomplete')}</span>
        ) : null}
      </p>
      <details class="chart__table">
        <summary>{t.t('ui.chart.table')}</summary>
        <DataTable
          caption={title}
          columns={[
            { label: t.t('ui.table.date') },
            { label: t.t('ui.chart.daily'), numeric: true },
            { label: t.t('ui.chart.average'), numeric: true },
          ]}
          rows={points.map((point, i) => {
            const daily = series.daily[i] ?? null;
            const average = series.average[i] ?? null;
            return [
              t.value({ kind: 'date', value: point.date }),
              daily === null ? '–' : formatValue(daily),
              average === null ? '–' : formatValue(average),
            ];
          })}
        />
      </details>
    </figure>
  );
}
