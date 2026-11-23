import { useId } from 'preact/hooks';

const WIDTH = 240;
const HEIGHT = 48;
const PAD = 4;

/**
 * A small trend line with a soft fill, for a metric tile. It shows shape only: the exact
 * numbers are in the tile, the chart and the chart's table, so it is hidden from assistive
 * technology. `highlightFrom` tints the recent period; `inverted` puts low values on top.
 */
export function Sparkline(props: {
  readonly values: readonly (number | null)[];
  readonly inverted?: boolean;
  readonly highlightFrom?: number | undefined;
}) {
  const id = useId();
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

  // One line and one filled area per unbroken run of values.
  let line = '';
  let area = '';
  let run: string[] = [];
  let runStart = -1;
  const close = (end: number) => {
    if (run.length > 1) {
      line += `M${run.join('L')}`;
      area += `M${x(runStart).toFixed(1)} ${String(HEIGHT)}L${run.join('L')}L${x(end).toFixed(1)} ${String(HEIGHT)}Z`;
    }
    run = [];
  };
  values.forEach((value, i) => {
    if (value === null) {
      close(i - 1);
      return;
    }
    if (run.length === 0) runStart = i;
    run.push(`${x(i).toFixed(1)} ${y(value).toFixed(1)}`);
  });
  close(values.length - 1);

  const from = props.highlightFrom;
  return (
    <svg
      class="sparkline"
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop class="sparkline__stop" offset="0" />
          <stop class="sparkline__stop sparkline__stop--end" offset="1" />
        </linearGradient>
      </defs>
      {from === undefined || from <= 0 || from >= values.length ? null : (
        <rect class="sparkline__recent" x={x(from)} y="0" width={WIDTH - x(from)} height={HEIGHT} />
      )}
      <path d={area} fill={`url(#${id}-fill)`} />
      <path class="sparkline__line" d={line} />
    </svg>
  );
}
