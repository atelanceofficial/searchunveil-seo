import { useEffect, useState } from 'preact/hooks';

/**
 * Hash-based routes, so the static build works from any folder or host without server rules.
 */
export const ROUTES = ['home', 'search-console', 'page-review', 'mentions', 'privacy'] as const;

export type Route = (typeof ROUTES)[number] | 'not-found';

export function href(route: (typeof ROUTES)[number]): string {
  return route === 'home' ? '#/' : `#/${route}`;
}

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (path === '') return 'home';
  return (ROUTES as readonly string[]).includes(path) ? (path as Route) : 'not-found';
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(window.location.hash));
    };
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('hashchange', update);
    };
  }, []);
  return route;
}
