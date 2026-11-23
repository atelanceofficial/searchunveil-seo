import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PATTERN_FILES } from './assets.ts';
import { closedSpline, formatNumber, lensRings, type LensOptions } from './lens.ts';

const OPTIONS: LensOptions = {
  rings: 12,
  samples: 24,
  width: 600,
  height: 420,
  padding: 10,
  phase: 0.9,
};

/** Follows a path written by `closedSpline` and returns every end point, in absolute terms. */
function anchors(d: string): { x: number; y: number }[] {
  const match = /^M([^cs]+)c([^s]+)s([^z]+)z$/.exec(d);
  if (match === null) throw new Error(`Unexpected path shape: ${d.slice(0, 40)}`);
  const numbers = (text: string | undefined) =>
    (text ?? '').match(/-?(?:\d+\.?\d*|\.\d+)/g)?.map(Number) ?? [];
  const [x0 = NaN, y0 = NaN] = numbers(match[1]);
  const curve = numbers(match[2]);
  const smooth = numbers(match[3]);
  expect(curve).toHaveLength(6);
  expect(smooth.length % 4).toBe(0);

  const points = [{ x: x0, y: y0 }];
  let x = x0 + (curve[4] ?? NaN);
  let y = y0 + (curve[5] ?? NaN);
  points.push({ x, y });
  for (let i = 0; i < smooth.length; i += 4) {
    x += smooth[i + 2] ?? NaN;
    y += smooth[i + 3] ?? NaN;
    points.push({ x, y });
  }
  return points;
}

describe('formatNumber', () => {
  it.each([
    [0.5, '.5'],
    [-0.5, '-.5'],
    [-0.04, '0'],
    [0, '0'],
    [12, '12'],
    [3.14159, '3.1'],
    [-120.05, '-120'],
  ])('writes %d as %s', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });
});

describe('closedSpline', () => {
  it('passes through every point and returns exactly to the start', () => {
    const square = [
      { x: 10, y: 10 },
      { x: 90, y: 10.04 },
      { x: 90, y: 90 },
      { x: 10, y: 90 },
    ];
    const points = anchors(closedSpline(square));
    expect(points).toHaveLength(5);
    expect(points.slice(0, 4).map((p) => [p.x, p.y])).toEqual([
      [10, 10],
      [90, 10],
      [90, 90],
      [10, 90],
    ]);
    expect(points[4]?.x).toBeCloseTo(10, 9);
    expect(points[4]?.y).toBeCloseTo(10, 9);
  });

  it('rejects shapes with fewer than three points', () => {
    expect(() =>
      closedSpline([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toThrow(RangeError);
  });
});

describe('lensRings', () => {
  const rings = lensRings(OPTIONS);

  it('is deterministic', () => {
    expect(lensRings(OPTIONS)).toEqual(rings);
  });

  it('draws one closed ring per step, with brighter accent rings', () => {
    expect(rings).toHaveLength(OPTIONS.rings);
    expect(rings.map((ring) => ring.accent)).toEqual(
      Array.from({ length: OPTIONS.rings }, (_, i) => i % 4 === 0),
    );
    for (const ring of rings) {
      expect(ring.glow).toBeGreaterThanOrEqual(0);
      expect(ring.glow).toBeLessThanOrEqual(1);
      const points = anchors(ring.d);
      expect(points).toHaveLength(OPTIONS.samples + 1);
      expect(points.at(-1)?.x).toBeCloseTo(points[0]?.x ?? NaN, 6);
      expect(points.at(-1)?.y).toBeCloseTo(points[0]?.y ?? NaN, 6);
    }
  });

  it('fits inside the drawing, padding included', () => {
    const all = rings.flatMap((ring) => anchors(ring.d));
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(OPTIONS.padding);
    expect(Math.max(...xs)).toBeLessThanOrEqual(OPTIONS.width - OPTIONS.padding);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(OPTIONS.padding);
    expect(Math.max(...ys)).toBeLessThanOrEqual(OPTIONS.height - OPTIONS.padding);
    // Centered: the free space is shared equally on opposite sides, to within a tenth.
    expect(Math.min(...xs) - (OPTIONS.width - Math.max(...xs))).toBeCloseTo(0, 0);
    expect(Math.min(...ys) - (OPTIONS.height - Math.max(...ys))).toBeCloseTo(0, 0);
  });
});

describe('pattern files', () => {
  it.each(Object.entries(PATTERN_FILES))(
    '%s matches its source (run `npm run patterns` after changing it)',
    (name, render) => {
      const committed = readFileSync(
        new URL(`../assets/patterns/${name}`, import.meta.url),
        'utf8',
      );
      expect(committed).toBe(render());
    },
  );

  it('contains only drawing elements: no scripts, links, styles or external references', () => {
    for (const render of Object.values(PATTERN_FILES)) {
      const svg = render();
      expect(svg).not.toMatch(/<script|<style|<a[\s>]|<image|<foreignObject|href=|on\w+=/i);
      expect(svg).not.toMatch(/url\((?!#)/);
    }
  });
});
