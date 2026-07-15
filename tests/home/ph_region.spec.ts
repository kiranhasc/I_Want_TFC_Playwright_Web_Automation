import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyGuestWatchlistNavigationFromFreeAsset } from '../../src/businessFunction/ott-watchlist-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyGuestSubscribeNavigationFromFreeAsset } from '../../src/businessFunction/ott-subscription-bfs';
import { verifyGuestSearchNavigationFromFreeAsset } from '../../src/businessFunction/ott-details-bfs';

test.describe('PH region guest watchlist navigation', () => {
  test.skip('@High IW3-T1872: Verify the navigation on tapping Watchlist icon for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-017-ph-region-guest-watchlist'];
    const result = await verifyGuestWatchlistNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
    });

    expect(result.isLoginScreenVisible).toBe(true);
    expect(result.isEmailFieldVisible).toBe(true);
    expect(result.isPasswordFieldVisible).toBe(true);
    expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
  });

  test.skip('@Medium IW3-T1875: Verify the navigation on "Subscribe" CTA for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-019-ph-region-guest-subscribe'];
    const result = await verifyGuestSubscribeNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
    });

      expect(result.isLoginScreenVisible).toBe(true);
      expect(result.isEmailFieldVisible).toBe(true);
      expect(result.isPasswordFieldVisible).toBe(true);
      expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
  });

  test.skip('@Medium IW3-T1876: Verify the search functionality for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-018-ph-region-guest-search'];
    const result = await verifyGuestSearchNavigationFromFreeAsset(page, {
      searchTerm: data.searchTerm,
      expectedTitle: data.expectedTitle,
    });

    expect(result.isSearchInputPopulated).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.titleMatchesSearchTerm).toBe(true);
    
  });
});
