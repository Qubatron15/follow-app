import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [["html"], ["list"], ...(process.env.CI ? [["github"] as const] : [])],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || "https://follow-app.vercel.app",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",

    /* Timeout for each action (e.g., click, fill) */
    actionTimeout: 15000,

    /* Timeout for navigation actions (e.g., goto, waitForURL) */
    navigationTimeout: 30000,
  },

  /* Global timeout for each test */
  timeout: 120000,

  /* Configure projects for major browsers - only Chromium as per guidelines */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Removed webServer configuration - testing deployed app on Vercel */
});
