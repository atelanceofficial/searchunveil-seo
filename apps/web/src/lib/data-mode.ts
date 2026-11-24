import { SERVER_BUILD } from './server-api.ts';

/**
 * Where data can go in this copy of the app, so privacy statements stay true:
 * - `local`: nothing leaves the device (the static and standalone builds);
 * - `server`: the app's own server downloads the pages people ask it to review.
 */
export type DataMode = 'local' | 'server';

export const DATA_MODE: DataMode = SERVER_BUILD ? 'server' : 'local';
