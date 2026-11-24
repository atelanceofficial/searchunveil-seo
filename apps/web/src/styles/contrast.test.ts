import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Reads the color tokens straight from app.css and checks WCAG 2.2 contrast in both themes,
 * so a palette change cannot quietly make text unreadable.
 */

const css = readFileSync(new URL('./app.css', import.meta.url), 'utf8');

/** The declarations of the first rule written exactly as `selector {`. */
function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`app.css has no rule for ${selector}`);
  return css.slice(start, css.indexOf('}', start));
}

function hexTokens(source: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const match of source.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)) {
    result.set(match[1] ?? '', match[2] ?? '');
  }
  return result;
}

const LIGHT = hexTokens(block(':root'));
const DARK = hexTokens(block('.tone-dark'));
const DARK_BY_SYSTEM = hexTokens(block(":root:not([data-theme='light'])"));

function tokens(theme: 0 | 1): Map<string, string> {
  return theme === 0 ? LIGHT : new Map([...LIGHT, ...DARK]);
}

describe('theme blocks', () => {
  it('redefines every colour for the dark theme', () => {
    expect([...DARK.keys()].sort()).toEqual([...LIGHT.keys()].sort());
  });

  it('gives the system dark setting and the explicit dark choice the same colours', () => {
    expect(DARK_BY_SYSTEM).toEqual(DARK);
  });
});

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

/** [foreground, background, minimum ratio]: 4.5 for text, 3 for icons, borders and focus. */
const PAIRS: readonly (readonly [string, string, number])[] = [
  ['color-text', 'color-canvas', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text', 'color-surface-sunken', 4.5],
  ['color-text-soft', 'color-canvas', 4.5],
  ['color-text-soft', 'color-surface', 4.5],
  ['color-text-muted', 'color-canvas', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-text-muted', 'color-surface-sunken', 4.5],
  ['color-accent', 'color-canvas', 4.5],
  ['color-accent', 'color-surface', 4.5],
  ['color-text', 'color-accent-soft', 4.5],
  ['color-on-primary', 'color-primary', 4.5],
  ['color-primary', 'color-canvas', 3],
  ['color-focus', 'color-canvas', 3],
  ['color-focus', 'color-surface', 3],
  ['color-border-strong', 'color-surface', 3],
  ['color-border-strong', 'color-canvas', 3],
  ['color-attention', 'color-surface', 4.5],
  ['color-review', 'color-surface', 4.5],
  ['color-good', 'color-surface', 4.5],
  ['color-info', 'color-surface', 4.5],
  ['color-text', 'color-attention-soft', 4.5],
  ['color-text', 'color-review-soft', 4.5],
  ['color-text', 'color-good-soft', 4.5],
  ['color-text', 'color-info-soft', 4.5],
  // Metric changes are written in these colors on their tints, so they must read as text.
  ['color-attention', 'color-attention-soft', 4.5],
  ['color-review', 'color-review-soft', 3],
  ['color-good', 'color-good-soft', 4.5],
  ['color-info', 'color-info-soft', 3],
  ['color-chart', 'color-surface', 3],
  ['color-mist', 'color-surface', 3],
  ['color-chart-daily', 'color-surface', 3],
  ['color-text-muted', 'color-band-previous', 4.5],
  ['color-text-muted', 'color-band-recent', 4.5],
];

describe.each([
  ['light', 0],
  ['dark', 1],
] as const)('%s theme', (_, theme) => {
  const palette = tokens(theme);

  it('defines every token the checks need', () => {
    for (const [foreground, background] of PAIRS) {
      expect(palette.has(foreground), foreground).toBe(true);
      expect(palette.has(background), background).toBe(true);
    }
  });

  it.each(PAIRS)('%s on %s reaches %d:1', (foreground, background, minimum) => {
    const ratio = contrast(palette.get(foreground) ?? '', palette.get(background) ?? '');
    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});

describe('contrast', () => {
  it('matches the WCAG reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });
});

describe('dark-only surfaces', () => {
  // The footer is an ink band in both themes, so its text always uses the dark tokens.
  const dark = tokens(1);
  it.each([
    ['color-text', 4.5],
    ['color-text-muted', 4.5],
    ['color-gold', 3],
  ] as const)('%s on the footer band reaches %d:1', (foreground, minimum) => {
    expect(
      contrast(dark.get(foreground) ?? '', dark.get('color-band') ?? ''),
    ).toBeGreaterThanOrEqual(minimum);
  });
});
