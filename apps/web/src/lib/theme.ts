import { readStored, writeStored } from './storage.ts';

export const THEMES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEMES)[number];

export function readTheme(): ThemePreference {
  const stored = readStored('theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

/** Applies a theme by attribute; "system" leaves the choice to `prefers-color-scheme`. */
export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset['theme'];
  else root.dataset['theme'] = theme;
}

export function saveTheme(theme: ThemePreference): void {
  applyTheme(theme);
  writeStored('theme', theme);
}
