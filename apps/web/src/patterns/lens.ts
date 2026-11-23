/**
 * The SearchUnveil lens: deformed concentric rings seen at an angle. It is built with the same
 * equations as the brand's wordmark render (.github/workflows/render-wordmark.yml), so the
 * interface and the cover art share one motif instead of imitating each other.
 *
 * Everything here is pure and deterministic. The same options always give the same paths, which
 * lets a test prove that the generated pattern files are up to date.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface LensOptions {
  /** Rings to draw, from the center outwards. */
  readonly rings: number;
  /** Samples per ring. The curve through them is smooth, so a few dozen are plenty. */
  readonly samples: number;
  /** Size of the drawing; the lens is centered and fitted inside. */
  readonly width: number;
  readonly height: number;
  /** Space kept free around the lens, in drawing units. */
  readonly padding: number;
  /** The moment of the brand animation to freeze, in radians. */
  readonly phase: number;
}

export interface LensRing {
  /** A closed, smooth path in drawing units. */
  readonly d: string;
  /** From 0 to 1: how brightly the brand art draws this ring. Inner and outer rings fade. */
  readonly glow: number;
  /** Every fourth ring is drawn brighter in the brand art. */
  readonly accent: boolean;
}

/** One ring before fitting, in the render's own units (the outer radius is about 335). */
function rawRing(index: number, rings: number, samples: number, phase: number): Point[] {
  const s = (index + 1) / rings;
  const taper = Math.sin(Math.PI * s);
  const points: Point[] = [];
  for (let i = 0; i < samples; i++) {
    const a = (2 * Math.PI * i) / samples;
    const deformation =
      (21 * Math.sin(3 * a + 0.4 * Math.sin(phase) + 0.5 * s) +
        15 * Math.cos(5 * a - 1.72 * s + 0.72 * Math.sin(phase))) *
      taper ** 0.72;
    const radius = 25 + 310 * s + deformation;
    const angle = a + 0.12 + 0.075 * Math.sin(phase);
    const tx = radius * Math.cos(angle);
    const ty = radius * Math.sin(angle);
    const depth =
      (34 * Math.sin(2 * angle + 5 * s + 0.63 * Math.sin(phase)) +
        10 * Math.sin(4 * angle + 2 * s - 0.5 * Math.cos(phase))) *
      taper ** 0.7;
    // Tilt the plane of the rings, then flatten it, so the lens is seen from slightly above.
    points.push({
      x: tx * 0.96 - ty * 0.265,
      y: 0.62 * (tx * 0.265 + ty * 0.96) - 0.78 * depth,
    });
  }
  return points;
}

/** A number with at most one decimal, written as briefly as SVG allows ("-.5", not "-0.5"). */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '0';
  return String(rounded).replace(/^(-?)0\./, '$1.');
}

/** Numbers separated by spaces, except before a minus sign, which separates on its own. */
function joinNumbers(values: readonly number[]): string {
  let result = '';
  for (const value of values) {
    const text = formatNumber(value);
    result += result === '' || text.startsWith('-') ? text : ` ${text}`;
  }
  return result;
}

function pointAt(points: readonly Point[], index: number): Point {
  const point = points[((index % points.length) + points.length) % points.length];
  if (point === undefined) throw new RangeError('A ring needs at least three points.');
  return point;
}

/**
 * A smooth closed curve through the points (a Catmull-Rom spline written as cubic Béziers).
 * Coordinates are relative and rounded to tenths; positions are rounded before differences are
 * taken, so the small steps add up exactly and the path closes where it started.
 */
export function closedSpline(points: readonly Point[]): string {
  const count = points.length;
  if (count < 3) throw new RangeError('A ring needs at least three points.');
  const tenths = (value: number) => Math.round(value * 10);
  const anchor = (i: number) => {
    const p = pointAt(points, i);
    return { x: tenths(p.x), y: tenths(p.y) };
  };
  // The tangent at each point runs parallel to the line between its neighbors.
  const handle = (i: number, sign: 1 | -1) => {
    const p = pointAt(points, i);
    const previous = pointAt(points, i - 1);
    const next = pointAt(points, i + 1);
    return {
      x: tenths(p.x + (sign * (next.x - previous.x)) / 6),
      y: tenths(p.y + (sign * (next.y - previous.y)) / 6),
    };
  };
  const start = anchor(0);
  const relative = (target: { x: number; y: number }, from: { x: number; y: number }) => [
    (target.x - from.x) / 10,
    (target.y - from.y) / 10,
  ];

  const first = anchor(1);
  let d = `M${joinNumbers([start.x / 10, start.y / 10])}c${joinNumbers([
    ...relative(handle(0, 1), start),
    ...relative(handle(1, -1), start),
    ...relative(first, start),
  ])}`;
  // Each later segment's first handle mirrors the previous one, which "s" assumes.
  const rest: number[] = [];
  let current = first;
  for (let i = 2; i <= count; i++) {
    const target = anchor(i);
    rest.push(...relative(handle(i, -1), current), ...relative(target, current));
    current = target;
  }
  d += `s${joinNumbers(rest)}z`;
  return d;
}

/** The lens as rings of smooth paths, centered in a `width` × `height` drawing. */
export function lensRings(options: LensOptions): LensRing[] {
  const { rings, samples, width, height, padding, phase } = options;
  const raw = Array.from({ length: rings }, (_, j) => rawRing(j, rings, samples, phase));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of raw) {
    for (const p of ring) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  const scale = Math.min(
    (width - 2 * padding) / (maxX - minX),
    (height - 2 * padding) / (maxY - minY),
  );
  // Leave room for the curve to bulge slightly past its samples.
  const fit = scale * 0.985;
  const offsetX = width / 2 - ((minX + maxX) / 2) * fit;
  const offsetY = height / 2 - ((minY + maxY) / 2) * fit;

  return raw.map((ring, j) => ({
    d: closedSpline(ring.map((p) => ({ x: offsetX + p.x * fit, y: offsetY + p.y * fit }))),
    glow: 0.5 + 0.5 * Math.cos((j / rings - 0.344) * Math.PI),
    accent: j % 4 === 0,
  }));
}
