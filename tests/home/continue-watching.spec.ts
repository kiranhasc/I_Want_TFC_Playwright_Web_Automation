import { test, expect } from '../../src/fixtures/test-hooks';
import { validateContinueWatchingForNoHistory, verifyContinueWatchingRemovalAfterPlayback, verifyContinueWatchingRemoveItem, verifyContinueWatchingTrayScroll, verifyContinueWatchingTrayUI } from '../../src/businessFunction/ott-auth-bfs';
import { verifyContinueWatchingAcrossTabs, verifyContinueWatchingDetailsAndMoreNavigation, verifyContinueWatchingPlaybackFromTray, verifyContinueWatchingResumePlayback, verifyContinueWatchingTrayPersistence, verifyResumeCtaOnContentDetailsPage } from '../../src/businessFunction/ott-continue-watching-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Continue Watching - No Watch History', () => {
    test('@Medium IW3-T1951: Verify the Continue Watching tray upon logout and login with same account', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-014-continue-watching-persistence'] || {};
        const email =process.env.VALID_LOGIN_EMAIL;
        const password =process.env.VALID_LOGIN_PASSWORD;

        const result = await verifyContinueWatchingTrayPersistence(page, { email, password, mode: data.mode });
        console.log('IW3-T1951 result:', JSON.stringify(result, null, 2));
        expect(result.isValid).toBeTruthy();
    });
    
    test('@High IW3-T1931: Verify the Continue Watching tray for logged-in user with no watch history', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-009-continue-watching-no-history'];
        const email = process.env.UNWATCHED_LOGIN_EMAIL;
        const password = process.env.UNWATCHED_LOGIN_PASSWORD;

        const result = await validateContinueWatchingForNoHistory(page, { email, password, mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1932: Verify the UI/UX of the Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-010-continue-watching-tray-ui'];
        const result = await verifyContinueWatchingTrayUI(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1933: Verify the scroll functionality for the contents under Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-011-continue-watching-tray-scroll'];
        const result = await verifyContinueWatchingTrayScroll(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
    });

    test('@High IW3-T1936: Verify the functionality of "Remove From Continue Watching" CTA displayed on the CW tray bottom bar popup from Home screen', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-012-continue-watching-remove-item'];
        const result = await verifyContinueWatchingRemoveItem(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
        expect(result.initialItemCount).toBeGreaterThan(0);
        expect(result.confirmationVisible).toBeTruthy();
    });

    test('@Medium IW3-T1935: Verify the Navigation on tapping 3 dots and "Details and More" option displayed on the CW tray bottom bar popup', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-auth-014-continue-watching-details-and-more'] as { mode?: string } | undefined;
        const result = await verifyContinueWatchingDetailsAndMoreNavigation(page, { mode: data?.mode });

        expect(result.isValid).toBeTruthy();
        expect(result.detailsAndMoreVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
    });

    test('@High IW3-T1960: Verify that movie content gets removed from CW tray post completely watching the same content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-013-continue-watching-removal-after-playback'];
        const result = await verifyContinueWatchingRemovalAfterPlayback(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
        expect(result.removedItemTitle).toBeTruthy();
        expect(result.initiallyVisible).toBeTruthy();
        expect(result.finallyVisible).toBeFalsy();
    });

    test('@High IW3-T1934: Verify the content playback from the Continue Watching tray', async ({ page }) => {
        test.setTimeout(240000);
        const data = testCaseData['tc-auth-023-continue-watching-playback'] as { mode?: string } | undefined;
        const email = process.env.VALID_LOGIN_EMAIL;
        const password = process.env.VALID_LOGIN_PASSWORD;

        const result = await verifyContinueWatchingPlaybackFromTray(page, { email, password, mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.itemFound).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
        expect(result.progressBarVisible).toBeTruthy();
    });

    test('@Medium IW3-T1958: Verify that "Resume" CTA is displayed inside the details screen for the partially watched contents', async ({ page }) => {
        const data = testCaseData['tc-auth-025-continue-watching-resume-cta'] as { mode?: string } | undefined;
        const email = process.env.VALID_LOGIN_EMAIL;
        const password = process.env.VALID_LOGIN_PASSWORD;

        const result = await verifyResumeCtaOnContentDetailsPage(page, { email, password, mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.resumeCtaVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
    });

    test('@Medium IW3-T1959: Verify that content gets resumed on tapping "Resume" CTA', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-026-continue-watching-resume-playback'] as { mode?: string } | undefined;
        const email = process.env.VALID_LOGIN_EMAIL;
        const password = process.env.VALID_LOGIN_PASSWORD;

        const result = await verifyContinueWatchingResumePlayback(page, { email, password, mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.resumeActionVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
    });

    test('@Medium IW3-T1945: Verify the content under Continue Watching tray upon watching the content from different tabs', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-024-continue-watching-across-tabs'] as { mode?: string; tabs?: string[] } | undefined;
        const result = await verifyContinueWatchingAcrossTabs(page, { mode: data?.mode, tabs: data?.tabs });

        expect(result.isValid).toBeTruthy();
        expect(result.contentVisibleInTray).toBeTruthy();
    });
});
