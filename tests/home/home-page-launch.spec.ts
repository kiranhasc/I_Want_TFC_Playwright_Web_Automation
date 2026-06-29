import { test, expect } from '@playwright/test';
import { loginWithInvalidCredentials, navigateToForgotPassword, submitForgotPasswordEmail, submitForgotPasswordMobileNumber } from '../../src/businessFunction/ott-auth-bfs';
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
});
