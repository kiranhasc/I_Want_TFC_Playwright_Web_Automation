import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    channel: 'chrome',     
    launchOptions: {       
    ignoreDefaultArgs: ['--disable-component-update'],     },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  // /* Configure projects for major browsers */
  // projects: [
  //   {
  //     name: 'chromium',
  //     use: { ...devices['Desktop Chrome'] },
  //   },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  //],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },

  testIgnore: [
    '**/parential-pin.spec.ts',
    '**/vpn-page-launch.spec.ts',
    '**/ph_region.spec.ts',
  ],

  projects: [
    {
      name: 'account',
      testDir: 'tests/home',
      testMatch: [
        '**/account-subscriptions-profile.spec.ts',
        '**/create-account-ui.spec.ts',
        '**/parential-pin.spec.ts',
        '**/subscription.spec.ts',
      ],
    },

    {
      name: 'playback',
      testDir: 'tests/home',
      testMatch: [
        '**/playback.spec.ts',
        '**/skip-intro.spec.ts',
        '**/continue-watching.spec.ts',
      ],
    },

    {
      name: 'launch',
      testDir: 'tests/home',
      testMatch: [
        '**/home-page-launch.spec.ts',
        '**/landing-page-launch.spec.ts',
        '**/login-page-launch.spec.ts',
        '**/early-access-launch.spec.ts',
        '**/synacor-page-launch.spec.ts',
        '**/vpn-page-launch.spec.ts',
      ],
    },

    {
      name: 'search',
      testDir: 'tests/home',
      testMatch: '**/search.spec.ts',
    },

    {
      name: 'watchlist',
      testDir: 'tests/home',
      testMatch: '**/watchlist-management.spec.ts',
    },

    {
      name: 'region',
      testDir: 'tests/home',
      testMatch: '**/ph_region.spec.ts',
    },
  ], 
});
