import { test, expect } from '@playwright/test';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyLiveContentWatchlistAbsence } from '../../src/businessFunction/ott-watchlist-bfs';
import { playContentFromWatchlist } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Watchlist management', () => {
  
  test('@Medium  IW3-T2049: Verify that "Free" tag is displayed for free content in my watchlist', async ({ page }) => {
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
    await detailsPage.clickFirstFreeContentOnHome();
    await page.waitForTimeout(5000);
    const addToast = await detailsPage.addToWatchlistAndGetToast();
    expect(addToast.toLowerCase()).toContain('added');
    await authPage.clickMyWatchlistTab();
    await page.waitForTimeout(5000);

    const isFreeTagVisible = await detailsPage.isFreeTagVisibleInWatchlist();
    expect(isFreeTagVisible).toBe(true);
    console.log('Free tag is visible?',isFreeTagVisible);
    await detailsPage.clickFirstFreeContentOnHome();
    await detailsPage.removeFromWatchlistAndGetToast();
  });

test('@Medium  IW3-T2047: Verify Add to Watchlist option is not displayed for Live content', async ({ page }) => {
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

test('@Medium  IW3-T2050: Verify that user is able to add free content into my watchlist', async ({ page }) => {
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
  
   await detailsPage.clickFirstFreeContentOnHome();
   await page.waitForTimeout(5000);
   const addToast = await detailsPage.addToWatchlistAndGetToast();
   expect(addToast.toLowerCase()).toContain('added');
   await authPage.clickMyWatchlistTab();
   await page.waitForTimeout(5000);

   await detailsPage.clickFirstFreeContentOnHome();
   await detailsPage.removeFromWatchlistAndGetToast();

});

test('@Medium  IW3-T2051: Verify that user is able to remove free content from my watchlist', async ({ page }) => {
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
  
  await detailsPage.clickFirstFreeContentOnHome();
  await page.waitForTimeout(5000);
  await detailsPage.addToWatchlistAndGetToast();
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(5000);

   await detailsPage.clickFirstFreeContentOnHome();
   const removeToast = await detailsPage.removeFromWatchlistAndGetToast();
   expect(removeToast.toLowerCase()).toContain('removed');
  
});

test('@Medium  IW3-T2052: Verify that user is able to add premium content into my watchlist', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-sub-035-add-premium-watchlist'];
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
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  const popupResult = await detailsPage.validateAddedToWatchlistPopup();
  expect(popupResult.toLowerCase()).toContain('added');
  
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(5000);
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  
});

test('@Medium  IW3-T2048: Verify that Movie/Show content in my watchlist page loads correctly with correct thumbnails and meta data', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-watch-002-metadata-validation'];
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  
  await authPage.navigate();
  await authPage.acceptCookieSettingsIfVisible();
  await authPage.clickEmailField();
  await authPage.enterEmail(data.email);
  await authPage.clickPasswordField();
  await authPage.enterPassword(data.password);
  await authPage.clickContinue();
  await page.waitForTimeout(3000);
  
  await authPage.clickMoviesTab();
  await page.waitForTimeout(5000);
  
  await detailsPage.assertContentTitle();

  await detailsPage.clickWatchlistIcon();
  await page.waitForTimeout(2000);
  
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(5000);
  
  await detailsPage.clickFirstContentInWatchlist();
  await page.waitForTimeout(3000);
  
  await detailsPage.assertContentTitle();
  await page.waitForTimeout(1000);

  await detailsPage.assertBothContentsMatch();
  await page.waitForTimeout(1000);

  await detailsPage.removeFromWatchlistAndGetToast();
  
});

test('@Medium  IW3-T2053: Verify that user is able to remove premium content from my watchlist', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-sub-035-add-premium-watchlist'];
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
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  await page.waitForTimeout(2000);
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  const removePopupResult = await detailsPage.validateRemovedFromWatchlistPopup();
  expect(removePopupResult.toLowerCase()).toContain('removed');
  
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(2000);
  const isContentAbsent = await detailsPage.isContentAbsentInWatchlist(data.contentTitle);
  expect(isContentAbsent).toBe(true);
});


test('@Medium  IW3-T2056: Verify that user is able to add content to my watchlist from search page', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-sub-035-add-premium-watchlist'];
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
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  const popupResult = await detailsPage.validateAddedToWatchlistPopup();
  expect(popupResult.toLowerCase()).toContain('added');
  
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(5000);
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  
});


test('@Medium  IW3-T2057: Verify that user is able to remove content from my watchlist from search page', async ({ page }) => {
  test.setTimeout(120000);
  const data = testCaseData['tc-sub-035-add-premium-watchlist'];
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
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  await page.waitForTimeout(2000);
  await detailsPage.hoverContentThumbnailAndClickWatchlistIcon(data.contentTitle);
  const removePopupResult = await detailsPage.validateRemovedFromWatchlistPopup();
  expect(removePopupResult.toLowerCase()).toContain('removed');
  
  await authPage.clickMyWatchlistTab();
  await page.waitForTimeout(2000);
  const isContentAbsent = await detailsPage.isContentAbsentInWatchlist(data.contentTitle);
  expect(isContentAbsent).toBe(true);
});
test('@High IW3-T2030: Verify that a selected item from My Watchlist can be played', async ({ page }) => {
        test.setTimeout(180000);
        const result = await playContentFromWatchlist(page, {
            email: process.env.VALID_LOGIN_EMAIL,
            password: process.env.VALID_LOGIN_PASSWORD,
        });

        expect(result.isLoggedIn).toBeTruthy();
        expect(result.watchlistOpened).toBeTruthy();
        expect(result.contentSelected).toBeTruthy();
        expect(result.playClicked).toBeTruthy();
        expect(result.contentPlayed).toBeTruthy();
        expect(result.playbackStarted).toBeTruthy();
    });

  });
