import { test, expect } from '@playwright/test';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs.ts';
import { navigateToShowDetailsFromShowsPage } from '../../src/businessFunction/ott-details-bfs.ts';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Shows content details navigation', () => {
  test('High - IW3-T1895: Verify the user navigates to content details page post tapping on Show contents from Shows page', async ({ page }) => {
    const data = testCaseData['tc-disc-001-show-details-navigation'];
    const loginResult = await loginToOTT(page, {
      mode: data.mode
    });

    expect(loginResult.isLoggedIn).toBe(true);

    const detailsResult = await navigateToShowDetailsFromShowsPage(page, {
      expectedYear: data.expectedYear,
      expectedGenre: data.expectedGenre,
    });

    expect(detailsResult.isDetailsPageVisible).toBe(true);
    expect(detailsResult.isContentMetadataVisible).toBe(true);
    expect(detailsResult.contentDescriptionText.trim().length).toBeGreaterThan(0);
    expect(detailsResult.yearVisible).toBe(true);
    expect(detailsResult.genreVisible).toBe(true);
  });
});
