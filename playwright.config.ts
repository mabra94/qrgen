import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,

  // Retry once on CI to absorb transient runner slowness; genuine failures keep
  // their trace so they can still be triaged from the uploaded artifact.
  retries: process.env.CI ? 1 : 0,
  // Guard against a stray test.only silencing the rest of the suite.
  forbidOnly: !!process.env.CI,

  // On CI the github reporter annotates failures with the test name (so the run
  // summary says which test failed), and html writes the playwright-report/
  // artifact the workflow uploads. Locally, keep the human-readable list output.
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
