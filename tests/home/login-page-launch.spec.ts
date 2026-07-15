import { test, expect } from '../../src/fixtures/test-hooks'
import {
    verifyWelcomeScreenUI,
    loginWithInvalidCredentials,
    submitForgotPasswordMobileNumber,
    loginWithMobileNumber,
    submitUnregisteredUserLogin,
    verifyPasswordVisibilityToggle,
} from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Login Page Launch', () => {
    test(' @high IW3-T1846: Verify that user navigates to "Welcome to iWant" screen on entering the URL from Non-PH region', async ({ page }) => {
        const data = testCaseData['tc-auth-009-welcome-screen-navigation'];
        const expectedHeading = data.expectedHeading ;
        const expectedSubheading = data.expectedSubheading ?? '';
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading,
            expectedSubheading,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(expectedHeading);
    });

    test(' @low IW3-T1847 Verify the UI/UX of the "Welcome to iWant" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-010-welcome-screen-ui'];
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedSubheading: data.expectedSubheading,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isSubheadingVisible).toBe(true);
        expect(result.subheadingText).toContain(data.expectedSubheading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isLoginWithFacebookVisible).toBe(true);
        expect(result.isLoginWithTVProviderVisible).toBe(true);
        expect(result.isNewHereLinkVisible).toBe(true);
        expect(result.isCreateAccountLinkVisible).toBe(true);
    });

    test(' @low IW3-T1857: Verify the message displayed when new user try to login without registration', async ({ page }) => {
        const data = testCaseData['tc-auth-013-unregistered-user-login'];
        const result = await submitUnregisteredUserLogin(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('IW3-T1865: Verify the mobile number login functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-008-mobile-login'];
        const result = await loginWithMobileNumber(page, {
            mode: 'mobile',
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test(' @low IW3-T1858: Verify the password visibility toggle', async ({ page }) => {
        const data = testCaseData['tc-auth-014-password-visibility-toggle'];
        const result = await verifyPasswordVisibilityToggle(page, {
            email: data.email,
            password: data.password,
        });

        // Verify password field type changes from 'password' to 'text' after toggle
        expect(result.initialPasswordType).toBe('password');
        expect(result.afterTogglePasswordType).toBe('text');
        
        // Verify password is now visible as plain text
        expect(result.isPasswordTextVisible).toBe(true);
        
        // Click toggle again to verify it can be toggled back to hide password
        // await page.locator('.absolute.top-\\[8px\\] > svg > path:nth-child(2)').click();
        // const finalPasswordType = await page.locator('input[type="password"], input[type="text"][name*="password"]').first().getAttribute('type');
        // expect(finalPasswordType).toBe('password');
    });
});
