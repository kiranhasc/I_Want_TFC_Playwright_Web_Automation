import { test, expect } from '@playwright/test';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(120000);

test.describe('Watchlist remove free content', () => {
  test('IW3-T2051: Verify that user is able to remove free content from my watchlist', async ({ page }) => {
    const data = testCaseData['tc-auth-022-remove-free-watchlist'];
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(data.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(data.password);
    await authPage.clickContinue();

    await authPage.clickSearchBar();
    await authPage.enterSearchText(data.searchTerm);
    await authPage.submitSearch();

    await detailsPage.hoverAMomentInTimeThumbnailAndClickWatchlistIcon();
    await page.waitForTimeout(2000);
    await detailsPage.hoverAMomentInTimeThumbnailAndClickRemoveWatchlistIcon();

    const popupResult = await detailsPage.validateRemovedFromWatchlistPopup();
    expect(popupResult.toLowerCase()).toContain('removed');
    console.log(`Removed popup for "${data.contentTitle}": ${popupResult}`);
  });
});
