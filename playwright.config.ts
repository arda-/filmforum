import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for component and e2e tests.
 * Separates component tests (against demo pages) from integration tests (against full calendar page).
 */

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* Run tests serially to avoid test interference */
  fullyParallel: false,
  workers: 1,

  /* Retry failed tests once */
  retries: 1,

  /* Reporter configuration */
  reporter: 'html',

  /* Shared settings for all tests */
  use: {
    /* Use a single baseURL for all tests */
    baseURL: 'http://localhost:3000',

    /* Collect trace on failure for debugging */
    trace: 'on-first-retry',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Run dev server before starting tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
