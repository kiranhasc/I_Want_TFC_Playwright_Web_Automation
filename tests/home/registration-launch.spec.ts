import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyRegistrationNavigation, verifyRegistrationNavigationToHomePage, verifyRegistrationOTPScreen, verifyForgotPasswordOtpNavigation, verifyForgotPasswordResetFlow, verifyLoginWithNewPasswordCredentials } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { getOtpFromYopmail, getRandomYopmailAddress } from '../../src/utils/yopmail-helper.js';

test.describe('Registration navigation', () => {
    test ('@High IW3-T1852: Verify the navigation on entering a valid email and password on the "Let\'s Get Started" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-026-registration-navigation'];
        const result = await verifyRegistrationNavigation(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isConfirmPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.termsText).toContain(data.expectedTermsText);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.marketingText).toContain(data.expectedMarketingText);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.emailFieldValue).toBe(data.email);
        expect(result.passwordFieldValue).toBe(data.password);
        expect(result.confirmPasswordFieldValue).toBe(data.password);
        expect(result.isVerifyOTPPageVisible).toBe(true);
    });

    test('@Medium IW3-T1862: Verify the navigation on entering OTP for the forgot password', async ({ page }) => {
        test.setTimeout(180000);
        const staticData = testCaseData['tc-auth-020-forgot-password-otp'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email }; // overrides the JSON's email field

        const result = await verifyForgotPasswordOtpNavigation(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toContain(data.expectedOTPHeading);
        expect(result.isSetNewPasswordScreenVisible).toBe(true);
        expect(result.setNewPasswordHeadingText).toContain(data.expectedNewPasswordHeading);
    });

    test('@High IW3-T1854: Verify the navigation on entering a valid email and password on the "Let\'s Get Started" screen', async ({ page }) => {
    test.setTimeout(120000);   
        const staticData = testCaseData['tc-auth-026-registration-navigation'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email }; // overrides the JSON's email field

        const result = await verifyRegistrationNavigationToHomePage(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isConfirmPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.termsText).toContain(data.expectedTermsText);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.marketingText).toContain(data.expectedMarketingText);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isGeneratedEmailVisibleOnAccountPage).toBe(true);
    });

    test ('@High IW3-T1853: Verify the UI/UX of the "Verify Your Email" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-026-registration-navigation'];
        const result = await verifyRegistrationOTPScreen(page, {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPMessagePrefix: data.expectedOTPMessagePrefix,
            expectedOTPInputText: data.expectedOTPInputText,
            expectedVerifyButtonText: data.expectedVerifyButtonText,
            expectedBackToLoginText: data.expectedBackToLoginText,
        });

        expect(result.isVerifyOTPPageVisible).toBe(true);
        expect(result.isVerifyOTPMessageVisible).toBe(true);
        expect(result.verifyOTPMessageText).toContain(data.expectedOTPMessagePrefix);
        expect(result.isVerifyOTPEmailVisible).toBe(true);
        expect(result.verifyOTPEmailText).toContain(data.email);
        expect(result.isInputCodeInstructionVisible).toBe(true);
        expect(result.inputCodeInstructionText).toContain(data.expectedOTPInputText);
        expect(result.isVerifyButtonVisible).toBe(true);
        expect(result.isBackToLoginLinkVisible).toBe(true);
    });

    test('@Medium IW3-T1863: Verify the UI/UX and "Forgot Password" functionality popup', async ({ page }) => {
        test.setTimeout(300000);
        const staticData = testCaseData['tc-auth-021-forgot-password-reset-popup'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email };

        const result = await verifyForgotPasswordResetFlow(page, {
            email: data.email,
            password: data.password,
            newPassword: data.newPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
            expectedSuccessMessage: data.expectedSuccessMessage,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toContain(data.expectedOTPHeading);
        expect(result.isSetNewPasswordScreenVisible).toBe(true);
        expect(result.setNewPasswordHeadingText).toContain(data.expectedNewPasswordHeading);
        expect(result.isSuccessPopupVisible).toBe(true);
        expect(result.successMessageText).toContain(data.expectedSuccessMessage);
        expect(result.isLoginScreenVisible).toBe(true);
    });

    test('@Medium IW3-T1866: Verify that user can able to login with new password credentials', async ({ page }) => {
        test.setTimeout(300000);
        const staticData = testCaseData['tc-auth-022-reset-password-login'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email };

        const result = await verifyLoginWithNewPasswordCredentials(page, {
            email: data.email,
            password: data.password,
            newPassword: data.newPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
            expectedSuccessMessage: data.expectedSuccessMessage,
        });

        expect(result.isHomeScreenVisible).toBe(true);
        expect(result.isAccountPageVisible).toBe(true);
        expect(result.displayedEmail).toBe(data.email);
    });
});
