import { test, expect } from '@playwright/test';
import { validateContinueWatchingForNoHistory, verifyContinueWatchingRemovalAfterPlayback, verifyContinueWatchingRemoveItem, verifyContinueWatchingTrayScroll, verifyContinueWatchingTrayUI } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Continue Watching - No Watch History', () => {
    test('@High IW3-T1931: Verify the Continue Watching tray for logged-in user with no watch history', async ({ page }) => {
        const data = testCaseData['tc-auth-009-continue-watching-no-history'];
        const email = process.env.UNWATCHED_LOGIN_EMAIL;
        const password = process.env.UNWATCHED_LOGIN_PASSWORD;

        const result = await validateContinueWatchingForNoHistory(page, { email, password, mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1932: Verify the UI/UX of the Continue Watching tray', async ({ page }) => {
        const data = testCaseData['tc-auth-010-continue-watching-tray-ui'];
        const result = await verifyContinueWatchingTrayUI(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1933: Verify the scroll functionality for the contents under Continue Watching tray', async ({ page }) => {
        const data = testCaseData['tc-auth-011-continue-watching-tray-scroll'];
        const result = await verifyContinueWatchingTrayScroll(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
    });

    test('@High IW3-T1936: Verify the functionality of "Remove From Continue Watching" CTA displayed on the CW tray bottom bar popup from Home screen', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-012-continue-watching-remove-item'];
        const result = await verifyContinueWatchingRemoveItem(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
        expect(result.initialItemCount).toBeGreaterThan(0);
        expect(result.confirmationVisible).toBeTruthy();
    });

    test('@High IW3-T1960: Verify that movie content gets removed from CW tray post completely watching the same content', async ({ page }) => {
        const data = testCaseData['tc-auth-013-continue-watching-removal-after-playback'];
        const result = await verifyContinueWatchingRemovalAfterPlayback(page, { mode: data.mode });

        expect(result.isValid).toBeTruthy();
        expect(result.removedItemTitle).toBeTruthy();
        expect(result.initiallyVisible).toBeTruthy();
        expect(result.finallyVisible).toBeFalsy();
    });
});
