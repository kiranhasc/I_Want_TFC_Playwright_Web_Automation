import { test, expect } from '@playwright/test';
import { verifyGuestSubscribeNavigationFromFreeAsset } from '../../src/businessFunction/ott-subscription-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(180000);

test.describe('PH region guest subscribe CTA navigation', () => {
  test(' @medium IW3-T1875: Verify the navigation on "Subscribe" CTA for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-019-ph-region-guest-subscribe'];
    const result = await verifyGuestSubscribeNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
    });

    expect(result.isLoginScreenVisible).toBe(true);
    //if (result.isLoginScreenVisible) {
      expect(result.isEmailFieldVisible).toBe(true);
      expect(result.isPasswordFieldVisible).toBe(true);
      expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
   // }
  });
});
