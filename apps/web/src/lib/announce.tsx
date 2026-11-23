import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useContext, useState } from 'preact/hooks';

/**
 * A polite live region shared by the whole app, so status changes ("Analysis ready.") reach
 * screen reader users without moving their focus.
 */
const AnnounceContext = createContext<(message: string) => void>(() => undefined);

export function AnnouncerProvider(props: { readonly children: ComponentChildren }) {
  const [message, setMessage] = useState('');
  const announce = useCallback((next: string) => {
    // Clearing first makes repeated identical messages announce again.
    setMessage('');
    window.setTimeout(() => {
      setMessage(next);
    }, 50);
  }, []);
  return (
    <AnnounceContext.Provider value={announce}>
      {props.children}
      <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce(): (message: string) => void {
  return useContext(AnnounceContext);
}
