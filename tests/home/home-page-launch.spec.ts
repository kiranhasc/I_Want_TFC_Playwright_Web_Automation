import { test, expect } from '@playwright/test';
import { loginWithInvalidCredentials, loginToOTT, loginWithMobileNumber, navigateToForgotPassword, submitForgotPasswordEmail, submitForgotPasswordMobileNumber, verifyWelcomeScreenUI, navigateAndVerifyTabs } from '../../src/businessFunction/ott-auth-bfs';
import { playFreeAsset } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';


test.describe('Home Page Launch', () => {
    test('@Low - IW3-T1859: Verify the message displayed on entering invalid credentials during login', async ({ page }) => {
        const data = testCaseData['tc-auth-001-invalid-credentials'];
        const result = await loginWithInvalidCredentials(page, {
            mode: data.mode
        });

        expect(result.isLoggedIn).toBe(false);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
    });

    test('@High - IW3-T1860: Verify the navigation on tapping Forgot Password? option', async ({ page }) => {
        const data = testCaseData['tc-auth-002-forgot-password'];
        const result = await navigateToForgotPassword(page, { expectedHeading: data.expectedHeading });
        expect(result.isVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
    });

    test('@Medium - IW3-T1861: Verify the navigation on entering Email and tapping Proceed button on the Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-003-forgot-password-proceed'];
        const result = await submitForgotPasswordEmail(page, {
            email: data.email,
            expectedOTPHeading: data.expectedOTPHeading,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toBe(data.expectedOTPHeading);
    });

    test('@Medium - IW3-T1864: Verify the message displayed on entering the mobile number on Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-004-forgot-password-mobile'];
        const result = await submitForgotPasswordMobileNumber(page, {
            mobileNumber: data.mobileNumber,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isMobileErrorDisplayed).toBe(true);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
        expect(result.isOTPPageVisible).toBe(false);
    });

    test('IW3-T1865: Verify the mobile number login functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-008-mobile-login'];
        const result = await loginWithMobileNumber(page, {
            mode: data.mode
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test('@Medium - IW3-T1869: Verify the UI/UX of the Welcome to iWant screen for PH region', async ({ page }) => {
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

    test('IW3-T1870: Verify user is able to login with valid credentials', async ({ page }) => {
        const data = testCaseData['tc-auth-006-valid-login'];
        const result = await loginToOTT(page, { mode: data.mode });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test('@High - IW3-T1871: Verify the content starts playing on tapping the Play button for a free asset', async ({ page }) => {
        const data = testCaseData['tc-play-001-free-asset-playback'];
        const result = await playFreeAsset(page, {
            email: process.env.VALID_LOGIN_EMAIL,
            password: process.env.VALID_LOGIN_PASSWORD
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.isPlayableContentDetected).toBe(true);
        expect(result.playAttempted).toBe(true);
        expect(result.playbackStarted).toBe(true);
    });

    test('@Medium - IW3-T1880: Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons', async ({ page }) => {
        const data = testCaseData['tc-auth-007-navigate-tabs'];
        const result = await navigateAndVerifyTabs(page, {
            mode: data.mode,
            expectedSearchPlaceholder: data.expectedSearchPlaceholder,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeRailVisible).toBe(true);
        expect(result.moviesRailVisible).toBe(true);
        expect(result.showsRailVisible).toBe(true);
        expect(result.watchlistRailVisible).toBe(true);
        expect(result.gmaRailVisible).toBe(true);
        expect(result.searchBarPlaceholderMatches).toBe(true);
        expect(result.searchBarPlaceholder).toContain(data.expectedSearchPlaceholder);
        expect(result.signOutOptionVisible).toBe(true);
    });
});
