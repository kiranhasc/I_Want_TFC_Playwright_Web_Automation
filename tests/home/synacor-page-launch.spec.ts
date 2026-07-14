import { test, expect } from '@playwright/test';
import { loginWithTVProvider, logoutFromOTT, verifySynacorProfileEditRestriction } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Synacor Logout', () => {
    test('@High IW3-T3657: Verify the user is able log in with any TV provider credentials', async ({ page }) => {
        const data = testCaseData['tc-auth-018-synacor-provider-login'];
        const result = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.moviesTabVisible).toBe(true);
    });

    test('@High IW3-T3663: Verify Synacor user is able to logout from the application', async ({ page }) => {
        const data = testCaseData['tc-auth-016-synacor-logout'];
        const result = await logoutFromOTT(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(result.isLoggedOut).toBe(true);
        expect(result.welcomeScreenVisible).toBe(true);
    });

    test('@High IW3-T3664: Verify Synacor user will not be able to edit the profile in account page', async ({ page }) => {
        test.setTimeout(50000)
        const data = testCaseData['tc-auth-017-synacor-profile-edit-restriction'];
        const result = await verifySynacorProfileEditRestriction(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isRestricted).toBe(true);
        expect(result.editProfileVisible).toBe(false);
    });
});