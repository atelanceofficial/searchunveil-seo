/**
 * Browser storage for the little SearchUnveil keeps: the AI mention log and two preferences.
 * Storage can be missing or refuse writes (private browsing, full quota, blocked site data),
 * so every access is guarded and failures are reported instead of thrown.
 */

const PREFIX = 'searchunveil:v1:';
const KEYS = ['locale', 'theme', 'mentions'] as const;

export type StorageKey = (typeof KEYS)[number];

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStored(key: StorageKey): string | null {
  try {
    return storage()?.getItem(PREFIX + key) ?? null;
  } catch {
    return null;
  }
}

/** Returns false when the browser refused to save. */
export function writeStored(key: StorageKey, value: string): boolean {
  try {
    const target = storage();
    if (target === null) return false;
    target.setItem(PREFIX + key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: StorageKey): void {
  try {
    storage()?.removeItem(PREFIX + key);
  } catch {
    // Nothing stored that we could remove.
  }
}

/** Deletes everything SearchUnveil stored in this browser. */
export function clearStored(): void {
  for (const key of KEYS) removeStored(key);
}
