/**
 * Reads robots.txt the way the Robots Exclusion Protocol (RFC 9309) describes: crawlers follow
 * the group for their own name, or the `*` group when none names them; within a group the
 * longest matching rule wins, and `Allow` wins a tie. Paths may use `*` and a final `$`.
 */

export interface RobotsGroup {
  /** The crawler names the group applies to, lower-cased; `*` for every crawler. */
  readonly agents: readonly string[];
  readonly rules: readonly { readonly allow: boolean; readonly path: string }[];
}

export interface RobotsFile {
  readonly groups: readonly RobotsGroup[];
  /** Sitemap addresses the file lists. */
  readonly sitemaps: readonly string[];
}

/** Larger files are cut here, as RFC 9309 lets crawlers do (it names at least 500 KiB). */
export const ROBOTS_MAX_CHARS = 500 * 1024;

export function parseRobots(text: string): RobotsFile {
  const groups: { agents: string[]; rules: { allow: boolean; path: string }[] }[] = [];
  const sitemaps: string[] = [];
  let current: { agents: string[]; rules: { allow: boolean; path: string }[] } | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.slice(0, ROBOTS_MAX_CHARS).split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === 'user-agent') {
      // Consecutive user-agent lines share one group.
      if (current === null || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (field === 'sitemap') {
      if (value !== '') sitemaps.push(value);
    } else if ((field === 'allow' || field === 'disallow') && current !== null) {
      // An empty Disallow allows everything; it adds no rule.
      if (value !== '') current.rules.push({ allow: field === 'allow', path: value });
    }
  }
  return { groups, sitemaps };
}

export interface RobotsRule {
  readonly allow: boolean;
  readonly path: string;
}

/**
 * The rule that decides whether `agent` (such as `googlebot`) may crawl `path` (the URL path
 * with its query, such as `/shop/?page=2`), or `null` when no rule matches: then crawling is
 * allowed. With no group for the agent and no `*` group, no rule applies.
 */
export function robotsRule(robots: RobotsFile, agent: string, path: string): RobotsRule | null {
  const name = agent.toLowerCase();
  const own = robots.groups.filter((g) => g.agents.some((a) => a !== '*' && name.startsWith(a)));
  const groups = own.length > 0 ? own : robots.groups.filter((g) => g.agents.includes('*'));
  let best: RobotsRule | null = null;
  for (const group of groups) {
    for (const rule of group.rules) {
      if (!pathMatches(rule.path, path)) continue;
      if (
        best === null ||
        rule.path.length > best.path.length ||
        (rule.path.length === best.path.length && rule.allow)
      ) {
        best = rule;
      }
    }
  }
  return best;
}

/** Whether `agent` may crawl `path`; see {@link robotsRule}. */
export function robotsAllows(robots: RobotsFile, agent: string, path: string): boolean {
  return robotsRule(robots, agent, path)?.allow ?? true;
}

function pathMatches(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith('$');
  // Rules and paths are compared decoded, so `/%C3%BCr%C3%BCn` and `/ürün` are the same path.
  const body = decodeSafely(anchored ? pattern.slice(0, -1) : pattern);
  const expression = body
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${expression}${anchored ? '$' : ''}`).test(decodeSafely(path));
}

function decodeSafely(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}
