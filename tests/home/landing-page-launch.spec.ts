import { test, expect } from '@playwright/test';
import { loginWithTVProvider } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Home Page Landing', () => {
    test('IW3-T1867: Verify the "Login with TV Provider" functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-005-tv-provider-login'];
        const result = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
    });
});
