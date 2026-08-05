import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const browser = process.env.BROWSER ?? 'chrome';

const browserConfig = {
  chrome: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    launchOptions: {
      ignoreDefaultArgs: ['--disable-component-update'],
    },
  },

  mchrome: {
    ...devices['Pixel 5'],
    channel: 'chrome',
    launchOptions: {
      ignoreDefaultArgs: ['--disable-component-update'],
    },
  },

  safari: {
    ...devices['Desktop Safari'],
  },

  msafari: {
    ...devices['iPhone 12'],
  },
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  timeout: 50 * 1000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    ...browserConfig[browser as keyof typeof browserConfig],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },


  testIgnore: [
    // '**/parential-pin.spec.ts',
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
        '**/details-page.spec.ts',
        '**/registration-launch.spec.ts',
        '**/iwant-originals.spec.ts',
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
      name: 'end-to-end',
      testDir: 'tests/home',
      testMatch: '**/end-to-end.spec.ts',
    },

    {
      name: 'region',
      testDir: 'tests/home',
      testMatch: '**/ph_region.spec.ts',
    },

  ],
});