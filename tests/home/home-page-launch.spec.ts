import { test, expect } from '@playwright/test';
import { loginWithInvalidCredentials, navigateToForgotPassword, submitForgotPasswordEmail, submitForgotPasswordMobileNumber, verifyWelcomeScreenUI } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';


test.describe('Home Page Launch', () => {
    test('IW3-T1859: Verify the message displayed on entering invalid credentials during login', async ({ page }) => {
        const data = testCaseData['tc-auth-001-invalid-credentials'];
        const result = await loginWithInvalidCredentials(page, {
            email: data.email,
            password: data.password,
        });

        expect(result.isLoggedIn).toBe(false);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
    });

    test('IW3-T1860: Verify the navigation on tapping Forgot Password? option', async ({ page }) => {
        const data = testCaseData['tc-auth-002-forgot-password'];
        const result = await navigateToForgotPassword(page, { expectedHeading: data.expectedHeading });
        expect(result.isVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
    });

    test('IW3-T1861: Verify the navigation on entering Email and tapping Proceed button on the Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-003-forgot-password-proceed'];
        const result = await submitForgotPasswordEmail(page, {
            email: data.email,
            expectedOTPHeading: data.expectedOTPHeading,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toBe(data.expectedOTPHeading);
    });

    test('IW3-T1864: Verify the message displayed on entering the mobile number on Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-004-forgot-password-mobile'];
        const result = await submitForgotPasswordMobileNumber(page, {
            mobileNumber: data.mobileNumber,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isMobileErrorDisplayed).toBe(true);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
        expect(result.isOTPPageVisible).toBe(false);
    });

    test('IW3-T1869: Verify the UI/UX of the Welcome to iWant screen for PH region', async ({ page }) => {
        const data = testCaseData['tc-auth-005-welcome-ui'];
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedSubheading: data.expectedSubheading,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
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
});
