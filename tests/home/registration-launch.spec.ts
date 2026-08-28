import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyRegistrationNavigation, verifyRegistrationNavigation1, verifyRegistrationOTPScreen } from '../../src/businessFunction/ott-auth-bfs';
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

    test('@High IW3-T1854: Verify the navigation on entering a valid email and password on the "Let\'s Get Started" screen', async ({ page }) => {
        const staticData = testCaseData['tc-auth-026-registration-navigation'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email }; // overrides the JSON's email field

        const result = await verifyRegistrationNavigation1(page, {
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

    test('Read OTP from Yopmail', async () => {
        const otp = await getOtpFromYopmail('playwright_test_001', {
            subjectContains: 'Verification Code', // optional, filters to the right email
        });

        console.log(otp);
    });
});
