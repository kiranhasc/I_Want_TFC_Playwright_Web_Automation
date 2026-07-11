import { test, expect } from '@playwright/test';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyLiveContentWatchlistAbsence } from '../../src/businessFunction/ott-watchlist-bfs';

test.describe('Watchlist management', () => {
  
  test('@Medium IW3-T2049: Verify that "Free" tag is displayed for free content in my watchlist', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-auth-020-free-tag-watchlist'];
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
    await detailsPage.hoverFirstContentThumbnailAndClickWatchlistIcon();
    await authPage.clickMyWatchlistTab();
    await page.waitForTimeout(5000);
    const isFreeTagVisible = await detailsPage.isFreeTagVisibleInWatchlist(data.contentTitle);
    expect(isFreeTagVisible).toBe(true);
    console.log(`Free tag is visible for content "${data.contentTitle}" in My Watchlist.`);
    await page.waitForTimeout(5000);
    await detailsPage.hoverFirstContentThumbnailAndClickRemoveWatchlistIcon();
  });
});

test('@Medium IW3-T2047: Verify Add to Watchlist option is not displayed for Live content', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-auth-018-live-content-watchlist-absence'];
  const result = await verifyLiveContentWatchlistAbsence(page, {
    liveContentName: data.liveContentName,
    email: data.email,
    password: data.password,
  });
  expect(result.isLiveChannelsTrayVisible).toBe(true);
  expect(result.isLiveContentVisible).toBe(true);
  expect(result.isAddToWatchlistButtonVisible).toBe(false);
});

test('@Medium IW3-T2050: Verify that user is able to add free content into my watchlist', async ({ page }) => {
  test.setTimeout(120000);
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

test('@Medium IW3-T2051: Verify that user is able to remove free content from my watchlist', async ({ page }) => {
  const data = testCaseData['tc-auth-022-remove-free-watchlist'];
  test.setTimeout(120000);
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
