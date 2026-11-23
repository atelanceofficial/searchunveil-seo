import {
  comparePeriods,
  totals,
  type MetricChange,
  type PeriodComparison,
} from '../analysis/compare.ts';
import { buildDailySeries, type DailyPoint } from '../analysis/series.ts';
import { median, sum, weightedMean } from '../analysis/stats.ts';
import {
  finding,
  sortFindings,
  type CoreMessage,
  type Evidence,
  type Finding,
  type FindingStatus,
  type FindingTable,
} from '../findings.ts';
import type { CoreMessageKey } from '../i18n/catalogs/en.ts';
import { date, dateRange, decimal, message, percent, type ParamValue } from '../i18n/message.ts';
import { REFERENCES } from '../references.ts';
import {
  EXPORT_ROW_LIMIT,
  findTable,
  type ExportFilter,
  type MetricRow,
  type MetricTable,
  type SearchConsoleExport,
} from './model.ts';

/**
 * Every threshold the Search Console analysis uses, in one place. docs/FINDINGS.md explains
 * each one; changing a value here changes behaviour everywhere, and tests pin them down.
 */
export const SEARCH_CONSOLE_THRESHOLDS = Object.freeze({
  /** Relative change below which a metric is "about the same". */
  materialChange: 0.05,
  /** Clicks needed across both periods to compare clicks and CTR. */
  minClicks: 30,
  /** Impressions needed across both periods to compare impressions and position. */
  minImpressions: 300,
  /** Smallest change in average position described as a change. */
  minPositionChange: 0.3,
  /** Sign-test level for calling a day-by-day pattern consistent. */
  consistencyLevel: 0.05,
  /** A final day below this share of the preceding two weeks' median looks incomplete. */
  incompleteShare: 0.5,
  /** Median daily impressions needed before a low final day is called incomplete. */
  incompleteMinMedian: 20,
  lowCtr: {
    /** Only results in the top ten are compared. */
    maxPosition: 10,
    minImpressions: 100,
    /** A row is flagged below this share of its position group's click-through rate. */
    share: 0.5,
    minGroupRows: 5,
    minGroupImpressions: 1000,
  },
  nearTop: { minPosition: 10, maxPosition: 20, minImpressions: 50 },
  zeroClick: { minImpressions: 100 },
  movers: { minChange: 5, size: 5 },
  /** Most rows listed in one finding. */
  listSize: 10,
});

const T = SEARCH_CONSOLE_THRESHOLDS;

/** Position groups used to compare like with like: top 3, 4–6 and 7–10. */
const POSITION_GROUPS: readonly (readonly [number, number])[] = [
  [1, 3.5],
  [3.5, 6.5],
  [6.5, T.lowCtr.maxPosition + 0.5],
];

export interface Overview {
  readonly dateRange: { readonly start: string; readonly end: string } | null;
  readonly clicks: number;
  readonly impressions: number;
  readonly ctr: number | null;
  readonly position: number | null;
  /** The table the totals come from. Only the daily table holds the site's full totals. */
  readonly source: MetricTable['kind'];
}

export interface SearchConsoleReport {
  readonly overview: Overview | null;
  readonly comparison: PeriodComparison | null;
  readonly series: readonly DailyPoint[];
  /** The one-sentence answer to "what happened?". */
  readonly headline: Finding | null;
  /** Changes and opportunities, most important first. */
  readonly findings: readonly Finding[];
  /** Context needed to read the findings correctly: data gaps, limits, export settings. */
  readonly notes: readonly Finding[];
  readonly topQueries: readonly MetricRow[];
  readonly topPages: readonly MetricRow[];
  readonly filters: readonly ExportFilter[];
  readonly files: readonly string[];
}

export function analyzeSearchConsole(data: SearchConsoleExport): SearchConsoleReport {
  const dates = findTable(data, 'date');
  const queries = findTable(data, 'query');
  const pages = findTable(data, 'page');
  const series = dates === undefined ? [] : buildDailySeries(dates, T);
  const comparison = series.length > 0 ? comparePeriods(series, T) : null;
  const overview = buildOverview(series, data);

  const findings: Finding[] = [];
  if (comparison !== null) findings.push(...changeFindings(comparison));
  for (const table of [queries, pages]) {
    if (table === undefined) continue;
    findings.push(...lowCtrFindings(table), ...nearTopFindings(table), ...moverFindings(table));
  }
  if (pages !== undefined) findings.push(...zeroClickFindings(pages));

  return {
    overview,
    comparison,
    series,
    headline: comparison === null ? null : headlineFinding(comparison),
    findings: sortFindings(findings),
    notes: noteFindings(data, series, comparison, overview),
    topQueries: topRows(queries),
    topPages: topRows(pages),
    filters: data.filters,
    files: data.files,
  };
}

function topRows(table: MetricTable | undefined): MetricRow[] {
  if (table === undefined) return [];
  return [...table.rows]
    .sort(
      (a, b) =>
        b.primary.clicks - a.primary.clicks || b.primary.impressions - a.primary.impressions,
    )
    .slice(0, T.listSize);
}

function buildOverview(series: readonly DailyPoint[], data: SearchConsoleExport): Overview | null {
  if (series.length > 0) {
    const all = totals(series);
    return {
      dateRange: { start: all.start, end: all.end },
      clicks: all.clicks,
      impressions: all.impressions,
      ctr: all.ctr,
      position: all.position,
      source: 'date',
    };
  }
  const table = findTable(data, 'query') ?? data.tables[0];
  if (table === undefined) return null;
  const clicks = sum(table.rows.map((r) => r.primary.clicks));
  const impressions = sum(table.rows.map((r) => r.primary.impressions));
  return {
    dateRange: null,
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    position: weightedMean(
      table.rows.map((r) => r.primary.position),
      table.rows.map((r) => r.primary.impressions),
    ),
    source: table.kind,
  };
}

// ---------------------------------------------------------------------------------------------
// Headline and changes

type Trend = 'up' | 'flat' | 'down';

const HEADLINE_STATUS: Readonly<Record<`${Trend}-${Trend}`, FindingStatus>> = {
  'up-up': 'good',
  'up-flat': 'good',
  'up-down': 'good',
  'flat-up': 'review',
  'flat-flat': 'info',
  'flat-down': 'info',
  'down-up': 'attention',
  'down-flat': 'attention',
  'down-down': 'attention',
};

const HEADLINE_CHECKS: Readonly<Record<`${Trend}-${Trend}`, readonly CoreMessageKey[]>> = {
  'up-up': ['gsc.check.growth-drivers'],
  'up-flat': ['gsc.check.growth-drivers'],
  'up-down': ['gsc.check.growth-drivers', 'gsc.check.lost-visibility'],
  'flat-up': ['gsc.check.queries-gained', 'gsc.check.titles', 'gsc.check.position-shift'],
  'flat-flat': ['gsc.check.opportunities', 'gsc.check.seasonality'],
  'flat-down': ['gsc.check.lost-visibility'],
  'down-up': ['gsc.check.titles', 'gsc.check.position-shift', 'gsc.check.serp-features'],
  'down-flat': ['gsc.check.titles', 'gsc.check.serp-features'],
  'down-down': ['gsc.check.lost-visibility', 'gsc.check.site-changes', 'gsc.check.seasonality'],
};

function periodEvidence(comparison: PeriodComparison): Evidence[] {
  const { current, previous } = comparison;
  return [
    { label: message('evidence.recent-period'), value: dateRange(current.start, current.end) },
    { label: message('evidence.previous-period'), value: dateRange(previous.start, previous.end) },
  ];
}

function headlineFinding(comparison: PeriodComparison): Finding {
  const clicks = comparison.clicks.direction;
  const impressions = comparison.impressions.direction;
  const summary = message('gsc.headline.method', {
    current: dateRange(comparison.current.start, comparison.current.end),
    previous: dateRange(comparison.previous.start, comparison.previous.end),
  });
  const base = { rule: 'gsc.headline', summary, evidence: periodEvidence(comparison) };

  if (impressions === 'insufficient') {
    return finding({
      ...base,
      status: 'info',
      title: message('gsc.headline.insufficient'),
      nextChecks: [message('gsc.check.export-longer')],
    });
  }
  if (clicks === 'insufficient') {
    const status: FindingStatus =
      impressions === 'up' ? 'good' : impressions === 'down' ? 'attention' : 'info';
    return finding({
      ...base,
      status,
      title: message(`gsc.headline.impressions-${impressions}`),
      nextChecks: [
        message(impressions === 'down' ? 'gsc.check.lost-visibility' : 'gsc.check.queries-gained'),
      ],
    });
  }
  const state = `${clicks}-${impressions}` as const;
  return finding({
    ...base,
    status: HEADLINE_STATUS[state],
    title: message(`gsc.headline.${state}`),
    nextChecks: HEADLINE_CHECKS[state].map((key) => message(key)),
  });
}

function changeFindings(comparison: PeriodComparison): Finding[] {
  const results: Finding[] = [];
  for (const change of [comparison.clicks, comparison.impressions]) {
    if (change.direction === 'insufficient') continue;
    results.push(countChangeFinding(change, comparison));
  }
  if (comparison.ctr.direction !== 'insufficient')
    results.push(ctrChangeFinding(comparison.ctr, comparison));
  if (comparison.position.direction !== 'insufficient') {
    results.push(positionChangeFinding(comparison.position, comparison));
  }
  return results;
}

function changeEvidence(
  comparison: PeriodComparison,
  previous: ParamValue,
  current: ParamValue,
  relativeChange: number | null,
): Evidence[] {
  const { current: now, previous: before } = comparison;
  const evidence: Evidence[] = [
    { label: message('evidence.period', { range: dateRange(now.start, now.end) }), value: current },
    {
      label: message('evidence.period', { range: dateRange(before.start, before.end) }),
      value: previous,
    },
  ];
  if (relativeChange !== null) {
    evidence.push({ label: message('evidence.change'), value: percent(relativeChange, true) });
  }
  return evidence;
}

function countChangeFinding(change: MetricChange, comparison: PeriodComparison): Finding {
  const metric = change.metric === 'clicks' ? 'clicks' : 'impressions';
  const previous = change.previous ?? 0;
  const current = change.current ?? 0;
  const direction =
    change.direction === 'up' || change.direction === 'down' ? change.direction : 'flat';
  const started = direction === 'up' && change.relativeChange === null;
  const title = message(
    started ? `gsc.change.${metric}.started` : `gsc.change.${metric}.${direction}`,
    {
      current,
      previous,
      change: percent(Math.abs(change.relativeChange ?? 0)),
    },
  );

  let summary: CoreMessage | undefined;
  const days = change.dayByDay;
  if (days !== null && direction !== 'flat') {
    const total = days.higher + days.lower + days.tied;
    summary = days.consistent
      ? message(direction === 'up' ? 'gsc.daybyday.higher' : 'gsc.daybyday.lower', {
          count: direction === 'up' ? days.higher : days.lower,
          days: total,
        })
      : message('gsc.daybyday.uneven', { higher: days.higher, lower: days.lower });
  }

  const status: FindingStatus =
    direction === 'up' ? 'good' : direction === 'down' ? 'attention' : 'info';
  return finding({
    rule: `gsc.change.${metric}`,
    status: metric === 'impressions' && direction === 'down' ? 'review' : status,
    title,
    ...(summary === undefined ? {} : { summary }),
    evidence: changeEvidence(comparison, previous, current, change.relativeChange),
    limitations: [message('gsc.limit.weekday-matching')],
    references: [REFERENCES.gscMetrics],
  });
}

function ctrChangeFinding(change: MetricChange, comparison: PeriodComparison): Finding {
  const direction =
    change.direction === 'up' || change.direction === 'down' ? change.direction : 'flat';
  const previous = percent(change.previous ?? 0);
  const current = percent(change.current ?? 0);
  return finding({
    rule: 'gsc.change.ctr',
    status: direction === 'up' ? 'good' : direction === 'down' ? 'review' : 'info',
    title: message(`gsc.change.ctr.${direction}`, { previous, current }),
    summary: message('metric.ctr.help'),
    evidence: changeEvidence(comparison, previous, current, change.relativeChange),
    limitations: [message('gsc.limit.ctr-features')],
    nextChecks:
      direction === 'down' ? [message('gsc.check.titles'), message('gsc.check.serp-features')] : [],
    references:
      direction === 'down' ? [REFERENCES.titleLinks, REFERENCES.snippets] : [REFERENCES.gscMetrics],
  });
}

function positionChangeFinding(change: MetricChange, comparison: PeriodComparison): Finding {
  // A lower average position is better: 1 is the top of the page.
  const direction =
    change.direction === 'down' ? 'better' : change.direction === 'up' ? 'worse' : 'flat';
  const previous = decimal(change.previous ?? 0, 1);
  const current = decimal(change.current ?? 0, 1);
  return finding({
    rule: 'gsc.change.position',
    status: direction === 'better' ? 'good' : direction === 'worse' ? 'review' : 'info',
    title: message(`gsc.change.position.${direction}`, { previous, current }),
    summary: message('metric.position.help'),
    evidence: changeEvidence(comparison, previous, current, null),
    limitations: [message('gsc.limit.position-mix')],
    references: [REFERENCES.gscMetrics],
  });
}

// ---------------------------------------------------------------------------------------------
// Opportunities

function rowLabelColumn(table: MetricTable): FindingTable['columns'][number] {
  return { label: message(table.kind === 'page' ? 'table.page' : 'table.query'), numeric: false };
}

function lowCtrFindings(table: MetricTable): Finding[] {
  if (!table.hasPosition) return [];
  const flagged: { row: MetricRow; typical: number; missed: number }[] = [];
  for (const [low, high] of POSITION_GROUPS) {
    const group = table.rows.filter(
      (r) => r.primary.position !== null && r.primary.position >= low && r.primary.position < high,
    );
    const impressions = sum(group.map((r) => r.primary.impressions));
    if (group.length < T.lowCtr.minGroupRows || impressions < T.lowCtr.minGroupImpressions)
      continue;
    const typical = sum(group.map((r) => r.primary.clicks)) / impressions;
    for (const row of group) {
      const ctr = row.primary.ctr ?? 0;
      if (row.primary.impressions >= T.lowCtr.minImpressions && ctr < typical * T.lowCtr.share) {
        flagged.push({
          row,
          typical,
          missed: row.primary.impressions * typical - row.primary.clicks,
        });
      }
    }
  }
  if (flagged.length === 0) return [];
  const listed = flagged.sort((a, b) => b.missed - a.missed).slice(0, T.listSize);
  const kind = table.kind === 'page' ? 'page' : 'query';
  return [
    finding({
      rule: `gsc.opportunity.low-ctr.${kind}`,
      status: 'review',
      title: message(`gsc.opportunity.low-ctr.${kind}`, { count: flagged.length }),
      summary: message('gsc.opportunity.low-ctr.summary', { share: percent(T.lowCtr.share) }),
      table: {
        columns: [
          rowLabelColumn(table),
          { label: message('metric.impressions'), numeric: true },
          { label: message('metric.clicks'), numeric: true },
          { label: message('metric.ctr'), numeric: true },
          { label: message('table.typical-ctr'), numeric: true },
          { label: message('metric.position'), numeric: true },
        ],
        rows: listed.map(({ row, typical }) => [
          row.key,
          row.primary.impressions,
          row.primary.clicks,
          percent(row.primary.ctr ?? 0),
          percent(typical),
          decimal(row.primary.position ?? 0, 1),
        ]),
      },
      limitations: [message('gsc.limit.ctr-features')],
      nextChecks: [message('gsc.check.titles'), message('gsc.check.serp-features')],
      references: [REFERENCES.titleLinks, REFERENCES.snippets],
    }),
  ];
}

function nearTopFindings(table: MetricTable): Finding[] {
  if (!table.hasPosition) return [];
  const rows = table.rows
    .filter(
      (r) =>
        r.primary.position !== null &&
        r.primary.position > T.nearTop.minPosition &&
        r.primary.position <= T.nearTop.maxPosition &&
        r.primary.impressions >= T.nearTop.minImpressions,
    )
    .sort((a, b) => b.primary.impressions - a.primary.impressions);
  if (rows.length === 0) return [];
  const kind = table.kind === 'page' ? 'page' : 'query';
  return [
    finding({
      rule: `gsc.opportunity.near-top.${kind}`,
      status: 'review',
      title: message(`gsc.opportunity.near-top.${kind}`, { count: rows.length }),
      summary: message('gsc.opportunity.near-top.summary', {
        from: T.nearTop.minPosition,
        to: T.nearTop.maxPosition,
      }),
      table: {
        columns: [
          rowLabelColumn(table),
          { label: message('metric.impressions'), numeric: true },
          { label: message('metric.clicks'), numeric: true },
          { label: message('metric.position'), numeric: true },
        ],
        rows: rows
          .slice(0, T.listSize)
          .map((r) => [
            r.key,
            r.primary.impressions,
            r.primary.clicks,
            decimal(r.primary.position ?? 0, 1),
          ]),
      },
      limitations: [message('gsc.limit.position-average')],
      nextChecks: [message('gsc.check.focused-page')],
    }),
  ];
}

function zeroClickFindings(table: MetricTable): Finding[] {
  const rows = table.rows
    .filter((r) => r.primary.clicks === 0 && r.primary.impressions >= T.zeroClick.minImpressions)
    .sort((a, b) => b.primary.impressions - a.primary.impressions);
  if (rows.length === 0) return [];
  return [
    finding({
      rule: 'gsc.opportunity.zero-click-pages',
      status: 'review',
      title: message('gsc.opportunity.zero-click-pages', { count: rows.length }),
      summary: message('gsc.opportunity.zero-click-pages.summary', {
        min: T.zeroClick.minImpressions,
      }),
      table: {
        columns: [
          rowLabelColumn(table),
          { label: message('metric.impressions'), numeric: true },
          { label: message('metric.position'), numeric: true },
        ],
        rows: rows
          .slice(0, T.listSize)
          .map((r) => [
            r.key,
            r.primary.impressions,
            r.primary.position === null ? '' : decimal(r.primary.position, 1),
          ]),
      },
      nextChecks: [message('gsc.check.search-intent'), message('gsc.check.titles')],
      references: [REFERENCES.titleLinks, REFERENCES.snippets],
    }),
  ];
}

function moverFindings(table: MetricTable): Finding[] {
  const periods = table.periods;
  if (periods === null) return [];
  const changes = table.rows
    .filter((r) => r.comparison !== null)
    .map((r) => ({ row: r, change: r.primary.clicks - (r.comparison?.clicks ?? 0) }));
  const periodLabel = (label: string, fallback: CoreMessageKey): CoreMessage =>
    label === '' ? message(fallback) : message('table.text', { text: label });
  const columns: FindingTable['columns'] = [
    rowLabelColumn(table),
    { label: periodLabel(periods.primary, 'table.primary-period'), numeric: true },
    { label: periodLabel(periods.comparison, 'table.comparison-period'), numeric: true },
    { label: message('evidence.change'), numeric: true },
  ];
  const kind = table.kind === 'page' ? 'page' : 'query';
  const build = (direction: 'gains' | 'losses'): Finding | null => {
    const selected = changes
      .filter(({ change }) =>
        direction === 'gains' ? change >= T.movers.minChange : change <= -T.movers.minChange,
      )
      .sort((a, b) => (direction === 'gains' ? b.change - a.change : a.change - b.change))
      .slice(0, T.movers.size);
    if (selected.length === 0) return null;
    return finding({
      rule: `gsc.movers.${direction}`,
      status: direction === 'gains' ? 'good' : 'review',
      title: message(`gsc.movers.${direction}`, { kind }),
      table: {
        columns,
        rows: selected.map(({ row, change }) => [
          row.key,
          row.primary.clicks,
          row.comparison?.clicks ?? 0,
          decimal(change, 0, true),
        ]),
      },
      ...(direction === 'losses'
        ? { nextChecks: [message('gsc.check.lost-visibility'), message('gsc.check.site-changes')] }
        : {}),
    });
  };
  return [build('gains'), build('losses')].filter((f): f is Finding => f !== null);
}

// ---------------------------------------------------------------------------------------------
// Notes: the context needed to read everything else correctly

function noteFindings(
  data: SearchConsoleExport,
  series: readonly DailyPoint[],
  comparison: PeriodComparison | null,
  overview: Overview | null,
): Finding[] {
  const notes: Finding[] = [];
  const dates = findTable(data, 'date');

  if (dates === undefined) {
    notes.push(
      finding({ rule: 'gsc.note.no-dates', status: 'info', title: message('gsc.note.no-dates') }),
    );
  } else if (comparison === null) {
    notes.push(
      finding({
        rule: 'gsc.note.short-range',
        status: 'info',
        title: message('gsc.note.short-range', { days: series.length }),
        nextChecks: [message('gsc.check.export-longer')],
      }),
    );
  }

  const missing = series.filter((p) => p.missing);
  const firstMissing = missing[0];
  const lastMissing = missing.at(-1);
  if (firstMissing !== undefined && lastMissing !== undefined) {
    notes.push(
      finding({
        rule: 'gsc.note.missing-days',
        status: 'info',
        title: message('gsc.note.missing-days', { count: missing.length }),
        summary: message('gsc.note.missing-days.summary'),
        evidence: [
          { label: message('evidence.first-day'), value: date(firstMissing.date) },
          { label: message('evidence.last-day'), value: date(lastMissing.date) },
        ],
      }),
    );
  }

  const incomplete = series.filter((p) => p.incomplete);
  if (incomplete.length > 0) {
    const reference = median(series.slice(-16, -2).map((p) => p.impressions)) ?? 0;
    notes.push(
      finding({
        rule: 'gsc.note.incomplete-days',
        status: 'info',
        title: message('gsc.note.incomplete-days', { count: incomplete.length }),
        summary: message('gsc.note.incomplete-days.summary', { count: incomplete.length }),
        evidence: [
          ...incomplete.map((p) => ({
            label: message('evidence.impressions-on', { day: date(p.date) }),
            value: p.impressions,
          })),
          { label: message('evidence.typical-impressions'), value: Math.round(reference) },
        ],
      }),
    );
  }

  const queries = findTable(data, 'query');
  if (queries !== undefined && dates !== undefined && overview !== null && overview.clicks > 0) {
    // Compare over the same days: the Queries table covers the export's whole date range.
    const share = sum(queries.rows.map((r) => r.primary.clicks)) / overview.clicks;
    if (share < 0.99) {
      notes.push(
        finding({
          rule: 'gsc.note.anonymized-queries',
          status: 'info',
          title: message('gsc.note.anonymized-queries', { share: percent(Math.min(1, share)) }),
          summary: message('gsc.note.anonymized-queries.summary', { limit: EXPORT_ROW_LIMIT }),
          references: [REFERENCES.gscPerformance],
        }),
      );
    }
  }

  for (const table of data.tables) {
    if (table.kind === 'date' || table.rows.length < EXPORT_ROW_LIMIT) continue;
    notes.push(
      finding({
        rule: 'gsc.note.row-limit',
        status: 'info',
        title: message('gsc.note.row-limit', { kind: table.kind, limit: EXPORT_ROW_LIMIT }),
        summary: message('gsc.note.row-limit.summary', { kind: table.kind }),
      }),
    );
  }

  if (overview !== null && overview.source !== 'date') {
    notes.push(
      finding({
        rule: 'gsc.note.partial-totals',
        status: 'info',
        title: message('gsc.note.partial-totals', { kind: overview.source }),
        summary: message('gsc.note.partial-totals.summary', { kind: overview.source }),
      }),
    );
  }

  const periods = data.tables.find((t) => t.periods !== null)?.periods ?? null;
  if (periods !== null) {
    const { primary, comparison: other } = periods;
    notes.push(
      finding({
        rule: 'gsc.note.comparison-export',
        status: 'info',
        title:
          primary === '' || other === ''
            ? message('gsc.note.comparison-export.unlabeled')
            : message('gsc.note.comparison-export', { primary, comparison: other }),
      }),
    );
  }

  if (data.filters.length > 0) {
    notes.push(
      finding({
        rule: 'gsc.note.filters',
        status: 'info',
        title: message('gsc.note.filters'),
        evidence: data.filters.map((f) => ({
          label: message('table.text', { text: f.name }),
          value: f.value,
        })),
      }),
    );
  }

  return notes;
}
