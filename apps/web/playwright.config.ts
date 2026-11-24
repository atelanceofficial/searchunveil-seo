import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against the production build, so they exercise the real Content Security
 * Policy and Trusted Types enforcement, not the looser development server.
 */
const PORT = 4173;
const SERVER_PORT = 4174;
const CI = process.env['CI'] !== undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: `npm run build && npm run build:standalone && npx vite preview --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      // The server build; its API is stood in for by each test, so no network is needed.
      command: `npm run build:server && npx vite preview --mode server --port ${SERVER_PORT} --strictPort`,
      url: `http://localhost:${SERVER_PORT}`,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
});
