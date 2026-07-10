import { test, expect } from '@playwright/test';
import { verifyGuestSearchNavigationFromFreeAsset } from '../../src/businessFunction/ott-details-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(180000);

test.describe('PH region guest search navigation', () => {
  test(' @medium IW3-T1876: Verify the search functionality for the PH region guest user', async ({ page }) => {
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
