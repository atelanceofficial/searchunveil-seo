import { useId } from 'preact/hooks';

/*
 * Small pictures for the three tools on the home page. They are decorative: each card's heading
 * and text say what the tool does, so the pictures are hidden from assistive technology. They
 * are drawn with the interface's color tokens and contain no words, so they suit every language.
 */

const DAYS = 28;
const CHART = { left: 18, right: 462, top: 158, bottom: 382 } as const;
const TILE_WIDTH = 105;
const TILE_GAP = 8;

/** A month of made-up daily values between 0 and 1: a calm start, a rise, quieter weekends. */
const DAILY = Array.from({ length: DAYS }, (_, i) => {
  const rise = 0.4 / (1 + Math.exp(-(i - 17) / 2.4));
  const weekend = i % 7 === 5 || i % 7 === 6 ? -0.13 : 0;
  return (
    0.24 +
    (0.15 * i) / (DAYS - 1) +
    rise +
    0.065 * Math.sin(i * 2.1) +
    0.04 * Math.cos(i * 1.3) +
    weekend
  );
});

/** The trailing seven-day average, as the real chart draws it. */
const AVERAGE = DAILY.map((_, i) =>
  i < 6 ? null : DAILY.slice(i - 6, i + 1).reduce((sum, v) => sum + v, 0) / 7,
);

const dayX = (i: number) => CHART.left + (i * (CHART.right - CHART.left)) / (DAYS - 1);
const valueY = (v: number) => CHART.bottom - v * (CHART.bottom - CHART.top);
const point = (i: number, value: number) => `${dayX(i).toFixed(1)} ${valueY(value).toFixed(1)}`;

const DAILY_PATH = `M${DAILY.map((v, i) => point(i, v)).join('L')}`;
const AVERAGE_POINTS = AVERAGE.flatMap((v, i) => (v === null ? [] : [point(i, v)]));
const AVERAGE_PATH = `M${AVERAGE_POINTS.join('L')}`;
const AREA_PATH = `M${dayX(6).toFixed(1)} ${String(CHART.bottom)}L${AVERAGE_POINTS.join('L')}L${dayX(DAYS - 1).toFixed(1)} ${String(CHART.bottom)}Z`;
const LAST_Y = valueY(AVERAGE.at(-1) ?? 0);
const SPLIT = (dayX(13) + dayX(14)) / 2;
const GRID = [0.25, 0.5, 0.75, 1]
  .map((share) => {
    const y = (CHART.bottom - share * (CHART.bottom - CHART.top)).toFixed(1);
    return `M${String(CHART.left)} ${y}H${String(CHART.right)}`;
  })
  .join('');

/** Four metric tiles, each with its own small trend: two rising, one level, one falling. */
const TILES = [0.9, 0.55, 0.05, -0.35].map((slope, k) => {
  const left = CHART.left + k * (TILE_WIDTH + TILE_GAP);
  const values = Array.from(
    { length: 12 },
    (_, j) => 0.5 + (slope * (j - 5.5)) / 11 + 0.12 * Math.sin(j * 1.9 + k),
  );
  const spark = values
    .map(
      (v, j) =>
        `${(left + 12 + (j * (TILE_WIDTH - 24)) / 11).toFixed(1)} ${(112 - v * 28).toFixed(1)}`,
    )
    .join('L');
  return { left, spark: `M${spark}`, up: slope > 0.2 };
});

/** A miniature of the Search Console results: metric tiles above, the daily trend below. */
export function SearchConsoleArt() {
  const id = useId();
  return (
    <svg class="illustration" viewBox="0 0 480 400" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id={`${id}-hatch`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line class="illus__hatch-line" x1="0" y1="0" x2="0" y2="7" />
        </pattern>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop class="illus__area-top" offset="0" />
          <stop class="illus__area-bottom" offset="1" />
        </linearGradient>
      </defs>
      {TILES.map((tile, k) => (
        <g key={k}>
          <rect class="illus__frame" x={tile.left} y="18" width={TILE_WIDTH} height="108" rx="12" />
          <rect class="illus__code" x={tile.left + 12} y="32" width="38" height="6" rx="3" />
          <rect
            class={tile.up ? 'illus__pill illus__pill--up' : 'illus__pill'}
            x={tile.left + TILE_WIDTH - 36}
            y="30"
            width="24"
            height="10"
            rx="5"
          />
          <rect class="illus__value" x={tile.left + 12} y="48" width="58" height="15" rx="4" />
          <path class="illus__spark" d={tile.spark} />
        </g>
      ))}
      <rect
        x={CHART.left}
        y={CHART.top}
        width={SPLIT - CHART.left}
        height={CHART.bottom - CHART.top}
        fill={`url(#${id}-hatch)`}
      />
      <rect
        class="illus__band-recent"
        x={SPLIT}
        y={CHART.top}
        width={CHART.right - SPLIT}
        height={CHART.bottom - CHART.top}
      />
      <path class="illus__grid" d={GRID} />
      <path d={AREA_PATH} fill={`url(#${id}-area)`} />
      <path class="illus__daily" d={DAILY_PATH} />
      <path class="illus__line" d={AVERAGE_PATH} />
      <circle class="illus__halo" cx={dayX(DAYS - 1)} cy={LAST_Y} r="11" />
      <circle class="illus__dot" cx={dayX(DAYS - 1)} cy={LAST_Y} r="5" />
    </svg>
  );
}

export function PageReviewArt() {
  return (
    <svg class="illustration" viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <rect class="illus__frame" x="18" y="16" width="232" height="138" rx="12" />
      <circle class="illus__chrome" cx="34" cy="31" r="3.5" />
      <circle class="illus__chrome" cx="46" cy="31" r="3.5" />
      <circle class="illus__chrome" cx="58" cy="31" r="3.5" />
      <rect class="illus__code illus__code--accent" x="34" y="50" width="54" height="7" rx="3.5" />
      <rect class="illus__code" x="94" y="50" width="96" height="7" rx="3.5" />
      <rect class="illus__code" x="46" y="66" width="38" height="7" rx="3.5" />
      <rect class="illus__code illus__code--mist" x="90" y="66" width="112" height="7" rx="3.5" />
      <rect class="illus__code" x="46" y="82" width="70" height="7" rx="3.5" />
      <rect class="illus__code illus__code--accent" x="122" y="82" width="44" height="7" rx="3.5" />
      <rect class="illus__code" x="46" y="98" width="120" height="7" rx="3.5" />
      <rect class="illus__code illus__code--mist" x="34" y="114" width="64" height="7" rx="3.5" />
      <rect class="illus__code" x="104" y="114" width="58" height="7" rx="3.5" />
      <rect class="illus__code" x="34" y="130" width="90" height="7" rx="3.5" />
      <line class="illus__lens-handle" x1="252" y1="128" x2="284" y2="158" />
      <circle class="illus__lens" cx="224" cy="100" r="40" />
      <circle class="illus__lens-ring" cx="224" cy="100" r="31" />
      <path class="illus__check" d="M207 101l11 11 23-25" />
    </svg>
  );
}

export function MentionsArt() {
  return (
    <svg class="illustration" viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <path class="illus__timeline" d="M30 26V160" />
      <circle class="illus__tick" cx="30" cy="40" r="5" />
      <circle class="illus__tick illus__tick--gold" cx="30" cy="96" r="6" />
      <circle class="illus__tick" cx="30" cy="146" r="5" />
      <rect class="illus__bubble" x="52" y="20" width="148" height="40" rx="14" />
      <rect class="illus__code" x="68" y="31" width="96" height="7" rx="3.5" />
      <rect class="illus__code" x="68" y="44" width="60" height="7" rx="3.5" />
      <rect
        class="illus__bubble illus__bubble--answer"
        x="88"
        y="70"
        width="210"
        height="82"
        rx="16"
      />
      <path
        class="illus__quote"
        d="M106 92c0-6 4-10 10-11v5c-3 1-4 3-4 5h4v9h-10zm16 0c0-6 4-10 10-11v5c-3 1-4 3-4 5h4v9h-10z"
      />
      <rect class="illus__code" x="146" y="86" width="132" height="7" rx="3.5" />
      <rect class="illus__code" x="146" y="100" width="104" height="7" rx="3.5" />
      <rect class="illus__cite" x="104" y="118" width="98" height="20" rx="10" />
      <rect
        class="illus__code illus__code--mist"
        x="116"
        y="124.5"
        width="62"
        height="7"
        rx="3.5"
      />
      <path
        class="illus__quote"
        d="M272 120l3.2 8.8 8.8 3.2-8.8 3.2-3.2 8.8-3.2-8.8-8.8-3.2 8.8-3.2z"
      />
    </svg>
  );
}
