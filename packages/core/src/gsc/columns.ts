import { fold, foldWithOrigin, isCjk } from '../text/fold.ts';
import type { DimensionKind, MetricName, PeriodLabels } from './model.ts';

/**
 * Recognizes the columns of Search Console exports.
 *
 * Search Console writes column names in the account's interface language. The English names
 * are exact. Names for the other supported languages are best-effort aliases: whenever names
 * are not recognized, columns are identified by Search Console's fixed order instead, and the
 * values themselves are validated (counts must be whole numbers, clicks cannot exceed
 * impressions, CTR must match clicks divided by impressions).
 */

type KnownDimension = Exclude<DimensionKind, 'other'>;

const DIMENSION_ALIASES: Readonly<Record<KnownDimension, readonly string[]>> = {
  date: [
    'Date',
    'Dates',
    'Day',
    'Fecha',
    'Fechas',
    'Datum',
    'Tarih',
    'Tarihler',
    '日期',
    'التاريخ',
  ],
  query: [
    'Top queries',
    'Queries',
    'Query',
    'Search query',
    'Keyword',
    'Keywords',
    'Consultas principales',
    'Consultas',
    'Consulta',
    'Häufigste Suchanfragen',
    'Suchanfragen',
    'Suchanfrage',
    'Requêtes les plus fréquentes',
    'Principales requêtes',
    'Requêtes',
    'Requête',
    'En çok yapılan sorgular',
    'Popüler sorgular',
    'Sorgular',
    'Sorgu',
    '热门查询',
    '查询',
    '搜索查询',
    'أهم طلبات البحث',
    'طلبات البحث',
    'طلب البحث',
    'الاستعلامات',
  ],
  page: [
    'Top pages',
    'Pages',
    'Page',
    'URL',
    'URLs',
    'Landing page',
    'Address',
    'Páginas principales',
    'Páginas',
    'Página',
    'Häufigste Seiten',
    'Seiten',
    'Seite',
    'Pages les plus populaires',
    'Principales pages',
    'En popüler sayfalar',
    'Sayfalar',
    'Sayfa',
    '热门网页',
    '网页',
    '页面',
    'أهم الصفحات',
    'الصفحات',
    'الصفحة',
  ],
  country: [
    'Country',
    'Countries',
    'País',
    'Países',
    'Land',
    'Länder',
    'Pays',
    'Ülke',
    'Ülkeler',
    '国家/地区',
    '国家',
    'البلد',
    'البلدان',
  ],
  device: [
    'Device',
    'Devices',
    'Dispositivo',
    'Dispositivos',
    'Gerät',
    'Geräte',
    'Appareil',
    'Appareils',
    'Cihaz',
    'Cihazlar',
    '设备',
    'الجهاز',
    'الأجهزة',
  ],
  searchAppearance: [
    'Search appearance',
    'Aspecto en la búsqueda',
    'Darstellung in der Suche',
    'Apparence dans les résultats de recherche',
    'Arama görünümü',
    '搜索结果呈现',
    '搜索外观',
    'مظهر البحث',
  ],
};

const METRIC_ALIASES: Readonly<Record<MetricName, readonly string[]>> = {
  clicks: [
    'Clicks',
    'Url clicks',
    'Clics',
    'Klicks',
    'Tıklamalar',
    'Tıklama',
    '点击次数',
    'النقرات',
  ],
  impressions: [
    'Impressions',
    'Impresiones',
    'Impressionen',
    'Gösterimler',
    'Gösterim',
    '展示次数',
    'مرات الظهور',
  ],
  ctr: [
    'CTR',
    'Click-through rate',
    'Average CTR',
    'Klickrate',
    'Taux de clics',
    'TO',
    'Tıklama oranı',
    'Ortalama TO',
    '点击率',
    'نسبة النقر إلى الظهور',
    'نسبة النقر',
  ],
  position: [
    'Position',
    'Average position',
    'Avg. position',
    'Posición',
    'Posición media',
    'Durchschnittliche Position',
    'Position moyenne',
    'Konum',
    'Ortalama konum',
    'Pozisyon',
    '排名',
    '平均排名',
    'الموضع',
    'متوسط الموضع',
  ],
};

/** English file names inside Search Console's export archive. */
const FILE_NAMES: Readonly<Record<string, KnownDimension | 'filters'>> = {
  dates: 'date',
  queries: 'query',
  pages: 'page',
  countries: 'country',
  devices: 'device',
  'search appearance': 'searchAppearance',
  filters: 'filters',
};

const FILTER_ALIASES = ['Filter', 'Filtro', 'Filtre', '过滤条件', '过滤器', 'عامل التصفية'];
const VALUE_ALIASES = ['Value', 'Valor', 'Wert', 'Valeur', 'Değer', '值', 'القيمة'];

const foldedDimensions = new Map<string, KnownDimension>(
  Object.entries(DIMENSION_ALIASES).flatMap(([kind, aliases]) =>
    aliases.map((alias) => [fold(alias), kind as KnownDimension] as const),
  ),
);

/** Metric aliases, longest first so that "average position" wins over "position". */
const foldedMetrics: readonly (readonly [string, MetricName])[] = Object.entries(METRIC_ALIASES)
  .flatMap(([metric, aliases]) =>
    aliases.map((alias) => [fold(alias), metric as MetricName] as const),
  )
  .sort((a, b) => b[0].length - a[0].length);

const foldedFilterNames = new Set(FILTER_ALIASES.map(fold));
const foldedValueNames = new Set(VALUE_ALIASES.map(fold));

export function matchDimension(header: string): KnownDimension | null {
  return foldedDimensions.get(fold(header)) ?? null;
}

/** Infers a table's kind from a file name such as `Queries.csv`. */
export function tableKindFromFileName(fileName: string): KnownDimension | 'filters' | null {
  const base = fileName.slice(fileName.lastIndexOf('/') + 1).replace(/\.[^.]*$/, '');
  return FILE_NAMES[fold(base)] ?? matchDimension(base);
}

export function isFilterHeader(header: readonly string[]): boolean {
  return (
    header.length === 2 &&
    foldedFilterNames.has(fold(header[0] ?? '')) &&
    foldedValueNames.has(fold(header[1] ?? ''))
  );
}

export interface MetricHeader {
  readonly metric: MetricName;
  /** The date-range label around the metric name, or '' when there is none. */
  readonly label: string;
}

/**
 * Recognizes a metric column name. Comparison exports prefix metric names with the date
 * range ("Last 28 days Clicks"); the rest of the name is returned as the period label.
 */
export function matchMetricHeader(header: string): MetricHeader | null {
  const { text, origin } = foldWithOrigin(header);
  for (const [alias, metric] of foldedMetrics) {
    if (text === alias) return { metric, label: '' };
  }
  for (const [alias, metric] of foldedMetrics) {
    const start = text.length - alias.length;
    if (start > 0 && text.endsWith(alias) && isBoundary(text, start)) {
      return { metric, label: cleanLabel(header.slice(0, origin[start])) };
    }
  }
  for (const [alias, metric] of foldedMetrics) {
    if (alias.length < text.length && text.startsWith(alias) && isBoundary(text, alias.length)) {
      return { metric, label: cleanLabel(header.slice(origin[alias.length])) };
    }
  }
  return null;
}

function isBoundary(text: string, index: number): boolean {
  const before = text.charAt(index - 1);
  const after = text.charAt(index);
  return before === ' ' || after === ' ' || isCjk(before) || isCjk(after);
}

function cleanLabel(label: string): string {
  return label.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '');
}

export interface MetricColumn {
  readonly index: number;
  readonly metric: MetricName;
  readonly period: 'primary' | 'comparison';
}

export interface ColumnPlan {
  readonly metrics: readonly MetricColumn[];
  readonly periods: PeriodLabels | null;
  readonly identifiedBy: 'header' | 'order';
}

export type ColumnPlanResult =
  | { readonly ok: true; readonly plan: ColumnPlan }
  | { readonly ok: false; readonly missing: readonly MetricName[] };

const STANDARD_ORDER: readonly MetricName[] = ['clicks', 'impressions', 'ctr', 'position'];

/**
 * Maps the metric columns (every column after the first) of a performance table.
 * Requires clicks and impressions; CTR and position are optional because they can be
 * derived or left out, but never invented.
 */
export function planColumns(header: readonly string[]): ColumnPlanResult {
  const metricHeaders = header.slice(1);
  const matches = metricHeaders.map(matchMetricHeader);

  if (matches.every((m) => m !== null)) {
    const labels = [...new Set(matches.map((m) => m.label))];
    const comparison = labels.length === 2;
    if (labels.length <= 2) {
      const seen = new Set<string>();
      const metrics: MetricColumn[] = [];
      matches.forEach((match, i) => {
        const period = comparison && match.label === labels[1] ? 'comparison' : 'primary';
        const key = `${match.metric}:${period}`;
        if (seen.has(key)) return; // A repeated column adds nothing; the first one wins.
        seen.add(key);
        metrics.push({ index: i + 1, metric: match.metric, period });
      });
      const missing = (['clicks', 'impressions'] as const).filter(
        (metric) => !metrics.some((c) => c.metric === metric && c.period === 'primary'),
      );
      if (missing.length > 0) return { ok: false, missing };
      return {
        ok: true,
        plan: {
          metrics,
          periods: comparison ? { primary: labels[0] ?? '', comparison: labels[1] ?? '' } : null,
          identifiedBy: 'header',
        },
      };
    }
  }

  // Names not recognized: fall back to Search Console's fixed column order.
  if (metricHeaders.length === 4) {
    return {
      ok: true,
      plan: {
        metrics: STANDARD_ORDER.map((metric, i) => ({ index: i + 1, metric, period: 'primary' })),
        periods: null,
        identifiedBy: 'order',
      },
    };
  }
  if (metricHeaders.length === 8) {
    return {
      ok: true,
      plan: {
        metrics: STANDARD_ORDER.flatMap((metric, i) => [
          { index: i * 2 + 1, metric, period: 'primary' as const },
          { index: i * 2 + 2, metric, period: 'comparison' as const },
        ]),
        periods: { primary: '', comparison: '' },
        identifiedBy: 'order',
      },
    };
  }
  return { ok: false, missing: ['clicks', 'impressions'] };
}
