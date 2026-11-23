import { useId, useMemo } from 'preact/hooks';
import { lensRings } from '../patterns/lens.ts';

const WIDTH = 560;
const HEIGHT = 440;
const RING_HEIGHT = 300;
const TOP = 34;

/** Grid lines every 40 units, like the measurement grid on the cover. */
const GRID = [
  ...Array.from({ length: 13 }, (_, i) => `M${String(40 + i * 40)} 0V${String(HEIGHT)}`),
  ...Array.from({ length: 10 }, (_, i) => `M0 ${String(20 + i * 40)}H${String(WIDTH)}`),
].join('');

/**
 * The brand's lens, drawn live: fine rings around a dashed crosshair, a gold arc and a line of
 * search data passing through. Purely decorative, so it is hidden from assistive technology.
 * When motion is welcome, the rings draw themselves once and then hold still.
 */
export function Lens(props: { readonly class?: string }) {
  const id = useId();
  const rings = useMemo(
    () =>
      lensRings({
        rings: 26,
        samples: 36,
        width: WIDTH,
        height: RING_HEIGHT,
        padding: 18,
        phase: 0.9,
      }),
    [],
  );

  return (
    <svg
      class={props.class === undefined ? 'lens' : `lens ${props.class}`}
      viewBox={`0 0 ${String(WIDTH)} ${String(HEIGHT)}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wire`} x1="0" y1="0" x2="1" y2="0">
          <stop class="lens__wire-a" offset="0" />
          <stop class="lens__wire-b" offset="0.48" />
          <stop class="lens__wire-c" offset="1" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="0">
          <stop class="lens__gold-a" offset="0" />
          <stop class="lens__gold-b" offset="0.56" />
          <stop class="lens__gold-c" offset="1" />
        </linearGradient>
        <linearGradient id={`${id}-wave`} x1="0" y1="0" x2="1" y2="0">
          <stop class="lens__wave-a" offset="0" />
          <stop class="lens__wave-b" offset="0.45" />
          <stop class="lens__wave-c" offset="1" />
        </linearGradient>
      </defs>
      <path class="lens__grid" d={GRID} />
      <g class="lens__rings" stroke={`url(#${id}-wire)`} transform={`translate(0 ${String(TOP)})`}>
        {rings.map((ring, i) => (
          <path
            key={i}
            class={ring.accent ? 'lens__ring lens__ring--accent' : 'lens__ring'}
            d={ring.d}
            stroke-opacity={(0.3 + 0.7 * ring.glow).toFixed(2)}
            pathLength={1}
            style={{ '--ring': i }}
          />
        ))}
      </g>
      <path class="lens__crosshair" d="M280 12V428M28 184H532" />
      <path
        class="lens__arc"
        stroke={`url(#${id}-gold)`}
        d="M10 184A270 150 0 0 1 540.8 145.2"
        pathLength={1}
      />
      <path
        class="lens__wave lens__wave--faint"
        d="M18 410C96 402 144 352 196 362S292 394 344 340S454 288 548 306"
      />
      <path
        class="lens__wave"
        stroke={`url(#${id}-wave)`}
        d="M6 386C84 385 116 308 168 308S246 386 304 304S426 198 554 254"
      />
      <circle class="lens__dot-halo" cx="304" cy="304" r="12" />
      <circle class="lens__dot" cx="304" cy="304" r="5" />
    </svg>
  );
}
