import { test, expect } from '@playwright/test';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { verifySubscribeToWatchCTA, navigateToUpgradePlanFromSubscriptionBlocker } from '../../src/businessFunction/ott-subscription-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Premium content subscription', () => {
  test(' @high IW3-T2033: Verify that "Subscribe to watch" CTA is displayed for premium contents inside content details', async ({ page }) => {
    const data = testCaseData['tc-sub-001-subscribe-to-watch'];

    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);

    const result = await verifySubscribeToWatchCTA(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });

    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isSubscribeToWatchCtaVisible).toBe(true);
  });

  test('@high IW3-T2039: Verify navigation on tapping "Upgrade Plan" button from the subscription blocker screen', async ({ page }) => {
    const data = testCaseData['tc-sub-002-upgrade-plan'];

    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);
    const result = await navigateToUpgradePlanFromSubscriptionBlocker(page, {
      mode: data.mode,
    });
    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isUpgradePlanVisible).toBe(true);
    expect(result.isPlansPageVisible).toBe(true);
  });
});
