import { test, expect } from '@playwright/test';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(120000);

test.describe('Watchlist add free content', () => {
  test('IW3-T2050: Verify that user is able to add free content into my watchlist', async ({ page }) => {
    const data = testCaseData['tc-auth-021-add-free-watchlist'];
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

    await detailsPage.hoverIAmYourDaughterThumbnailAndClickWatchlistIcon();
    const popupResult = await detailsPage.validateAddedToWatchlistPopup();

    expect(popupResult.toLowerCase()).toContain('added');
    console.log(`Added popup for "${data.contentTitle}": ${popupResult}`);
    await detailsPage.hoverIAmYourDaughterThumbnailAndClickWatchlistIcon();
  });
});
