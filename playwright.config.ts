import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for component and e2e tests.
 * Separates component tests (against demo pages) from integration tests (against full calendar page).
 */

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  /* Component tests run in parallel (isolated demo pages).
     Integration tests run serially (shared calendar page). */
  fullyParallel: false,

  /* Retry failed tests once */
  retries: 1,

  /* Reporter: list for terminal feedback, html for detailed reports */
  reporter: process.env.CI ? 'html' : 'list',

  /* Shared settings for all tests */
  use: {
    /* Use a single baseURL for all tests */
    baseURL: 'http://localhost:4321',

    /* Collect trace on failure for debugging */
    trace: 'on-first-retry',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects: components parallel, integration serial */
  projects: [
    {
      name: 'components-chromium',
      testDir: './tests/components',
      fullyParallel: true,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'components-firefox',
      testDir: './tests/components',
      fullyParallel: true,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'integration-chromium',
      testDir: './tests/integration',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'integration-firefox',
      testDir: './tests/integration',
      fullyParallel: false,
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Run dev server before starting tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    timeout: 120000,
  },
});
