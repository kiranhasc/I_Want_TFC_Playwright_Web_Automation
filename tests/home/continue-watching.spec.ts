import { test, expect } from '@playwright/test';
import { validateContinueWatchingForNoHistory } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Continue Watching - No Watch History', () => {
    test('IW3-T1931: Verify the Continue Watching tray for logged-in user with no watch history', async ({ page }) => {
        const data = testCaseData['tc-auth-009-continue-watching-no-history'];
        const email = process.env.UNWATCHED_LOGIN_EMAIL;
        const password = process.env.UNWATCHED_LOGIN_PASSWORD;

        const result = await validateContinueWatchingForNoHistory(page, { email, password, mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });
});
