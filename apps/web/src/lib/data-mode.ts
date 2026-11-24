import { useEffect, useState } from 'preact/hooks';
import { claudeSample } from './claude-runtime.ts';
import { SERVER_BUILD } from './server-api.ts';

/**
 * Where data can go in this copy of the app, so privacy statements stay true:
 * - `local`: nothing leaves the device (the static and standalone builds);
 * - `server`: the app's own server downloads pages and may run the AI analysis;
 * - `claude`: inside a claude.ai viewer, the AI analysis can ask Claude on the viewer's account.
 */
export type DataMode = 'local' | 'server' | 'claude';

export function useDataMode(): DataMode {
  const [mode, setMode] = useState<DataMode>(SERVER_BUILD ? 'server' : 'local');
  useEffect(() => {
    if (SERVER_BUILD) return;
    let current = true;
    void claudeSample().then((sample) => {
      if (current && sample !== null) setMode('claude');
    });
    return () => {
      current = false;
    };
  }, []);
  return mode;
}
