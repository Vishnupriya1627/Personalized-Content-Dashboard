import { defineConfig, devices } from '@playwright/test';

// Load E2E_EMAIL / E2E_PASSWORD from a local file (needs Node 20.12+)
try {
  process.loadEnvFile('.env.e2e.local');
} catch {
  /* file is optional: tests that need a login will be skipped */
}

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Starts the Vite dev server if it isn't already running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});