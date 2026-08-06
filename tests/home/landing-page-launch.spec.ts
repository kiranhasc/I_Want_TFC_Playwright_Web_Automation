import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithTVProvider, verifyTop10TagOnContentThumbnail } from '../../src/businessFunction/ott-auth-bfs';
import { verifyMidRailAdSpacingAcrossTabs } from '../../src/businessFunction/ott-playback-bfs';
import { navigateToMovieDetailsFromLandingPage, verifyDetailsPageFromCarouselInfoIcon, verifySubscriptionPageFromCarouselSubscribeCta } from '../../src/businessFunction/ott-landing-bfs';
import { verifyBecauseYouWatchedRail, verifyBecauseYouWatchedRailGenreUpdate, verifyLandingPageRelatedContentTraysOutsidePH, verifyMidRailBannerAdlRefresh, verifyMidRailBannerAdlVisibility, verifyTop10TagOnSearchResults, verifyTop10TagOnWatchlist } from '../../src/businessFunction/ott-landing-bfs';
import { verifyMidRailBannerGoogleAds } from '../../src/businessFunction/ott-landing-bfs';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Home Page Landing', () => {

    test('@High - IW3-T1867: Verify the "Login with TV Provider" functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-005-tv-provider-login'];
        const result = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
    });

    test('@High - IW3-T4703: Verify the "Top 10" tag on content thumbnails across home rails', async ({ page }) => {
        const data = testCaseData['tc-home-top10-tag'];
        const result = await verifyTop10TagOnContentThumbnail(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.top10Titles.length).toBeGreaterThan(0);
        expect(result.matchedCount).toBeGreaterThan(0);
    });

    test('@High - IW3-T4704: Verify the "Top 10" tag is displayed at the top-right corner of the content thumbnail', async ({ page }) => {
        const data = testCaseData['tc-home-top10-tag'];
        const result = await verifyTop10TagOnContentThumbnail(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.top10Titles.length).toBeGreaterThan(0);
        expect(result.matchedRails.some((entry) => entry.hasTop10Tag && entry.isTopRightPosition)).toBe(true);
        expect(result.topRightPositionMatches).toBeGreaterThan(0);
    });
    test('@High - IW3-T2132: Verify the spacing between the contents and other rails post configuring the Mid rail banner Ad', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-001-mid-rail-spacing'];
        const result = await verifyMidRailAdSpacingAcrossTabs(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeSpacingValid).toBe(true);
        expect(result.moviesSpacingValid).toBe(true);
        expect(result.showsSpacingValid).toBe(true);
    });
});
