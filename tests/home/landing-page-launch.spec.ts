import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithTVProvider, verifyMidRailAds, verifyTop10TagOnContentThumbnail, verifyMidRailAdAutoRefresh } from '../../src/businessFunction/ott-auth-bfs';
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

    test('@High IW3-T2129: Verify mid rail banner ads are from GAM', async ({ page }) => {
        const data = testCaseData['tc-ad-002-mid-rail-gam'] as Record<string, any>;
        const result = await verifyMidRailAds(page, {
        mode: data.mode,
        expectedAdHost: data.expectedAdHost,
        });
        expect(result.adElementVisible).toBe(true);
        expect(result.adRequestsFound).toBe(true);
        expect(result.matchedUrls.length).toBeGreaterThan(0);
    });

    test('@High - IW3-T2133: Verify Mid rail Ad banner auto refreshes after every 30 sec', async ({ page }) => {
        test.setTimeout(200000);
        const data = testCaseData['tc-ad-003-mid-rail-refresh'] as Record<string, any>;
        const result = await verifyMidRailAdAutoRefresh(page, {
            mode: data.mode,
            expectedAdHost: data.expectedAdHost,
            refreshWindowMs: data.refreshWindowMs,
            minimumRefreshRequests: data.minimumRefreshRequests,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.tabResults.length).toBe(3);
        for (const tabResult of result.tabResults) {
            expect(tabResult.adVisible).toBe(true);
            expect(tabResult.refreshObserved).toBe(true);
            expect(tabResult.finalRequestCount).toBeGreaterThanOrEqual(tabResult.initialRequestCount + data.minimumRefreshRequests);
        }
        expect(result.refreshObserved).toBe(true);
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
