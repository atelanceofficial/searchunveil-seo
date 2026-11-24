const WIDTH = 240;
const HEIGHT = 48;
const PAD = 4;

/**
 * A small trend line for a metric tile. It shows shape only: the exact numbers are in the tile,
 * the chart and the chart's table, so it is hidden from assistive technology.
 * `highlightFrom` tints the recent period; `inverted` puts low values on top.
 */
export function Sparkline(props: {
  readonly values: readonly (number | null)[];
  readonly inverted?: boolean;
  readonly highlightFrom?: number | undefined;
}) {
  const { values } = props;
  const known = values.filter((v): v is number => v !== null);
  if (known.length < 2 || values.length < 2) return null;

  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min || 1;
  const x = (i: number) => (i * WIDTH) / (values.length - 1);
  const y = (v: number) => {
    const share = (v - min) / span;
    return props.inverted === true
      ? PAD + share * (HEIGHT - 2 * PAD)
      : HEIGHT - PAD - share * (HEIGHT - 2 * PAD);
  };

  // One line per unbroken run of values; gaps stay gaps.
  let line = '';
  let drawing = false;
  values.forEach((value, i) => {
    if (value === null) {
      drawing = false;
      return;
    }
    line += `${drawing ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)}`;
    drawing = true;
  });

  const from = props.highlightFrom;
  return (
    <svg
      class="sparkline"
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {from === undefined || from <= 0 || from >= values.length ? null : (
        <rect class="sparkline__recent" x={x(from)} y="0" width={WIDTH - x(from)} height={HEIGHT} />
      )}
      <path class="sparkline__line" d={line} />
    </svg>
  );
}
