/**
 * Allows `limit` uses per key within a sliding `windowMs`. In memory: limits reset when the
 * server restarts, which is enough to stop one visitor from monopolizing a small server.
 */
export class RateLimiter {
  readonly #limit: number;
  readonly #windowMs: number;
  readonly #now: () => number;
  readonly #uses = new Map<string, number[]>();

  constructor(limit: number, windowMs: number, now: () => number = Date.now) {
    this.#limit = limit;
    this.#windowMs = windowMs;
    this.#now = now;
  }

  /** Records a use and returns `true`, or returns `false` when the key has used its share. */
  take(key: string): boolean {
    const now = this.#now();
    const recent = (this.#uses.get(key) ?? []).filter((time) => now - time < this.#windowMs);
    if (recent.length >= this.#limit) {
      this.#uses.set(key, recent);
      return false;
    }
    recent.push(now);
    this.#uses.set(key, recent);
    // Forget keys that have gone quiet, so the map cannot grow without bound.
    if (this.#uses.size > 10_000) {
      for (const [other, times] of this.#uses) {
        if (times.every((time) => now - time >= this.#windowMs)) this.#uses.delete(other);
      }
    }
    return true;
  }
}
