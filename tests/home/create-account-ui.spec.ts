import { test, expect } from '@playwright/test';
import { verifyCreateAccountScreenUI, enterCreateAccountEmailOnly, submitCreateAccountInvalidCredentials, validateEditProfileNameFields } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { submitEmptyCredentials } from '../../src/businessFunction/ott-auth-bfs';
import {verifyWelcomeScreenUI,loginWithInvalidCredentials,submitForgotPasswordMobileNumber,loginWithMobileNumber,submitUnregisteredUserLogin,verifyPasswordVisibilityToggle} from '../../src/businessFunction/ott-auth-bfs';

test.describe('Account creation UI', () => {
    test('@Low  IW3-T1849: Verify the UI/UX of the Create an account screen', async ({ page }) => {
        const data = testCaseData['tc-auth-006-create-account-ui'];
        const result = await verifyCreateAccountScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedEmailLabel: data.expectedEmailLabel,
            expectedPasswordLabel: data.expectedPasswordLabel,
            expectedTermsText: data.expectedTermsText,
            expectedMarketingText: data.expectedMarketingText,
            expectedContinueLabel: data.expectedContinueLabel,
            expectedLoginPrompt: data.expectedLoginPrompt,
            expectedLoginLinkText: data.expectedLoginLinkText,
        });
        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isAlreadyHaveAccountTextVisible).toBe(true);
        expect(result.isLoginLinkVisible).toBe(true);
    });

    test('@High  IW3-T1848: Verify the navigation on tapping of Create Account', async ({ page }) => {
        const data = testCaseData['tc-auth-006-create-account-ui'];
        const result = await verifyCreateAccountScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedEmailLabel: data.expectedEmailLabel,
            expectedPasswordLabel: data.expectedPasswordLabel,
            expectedTermsText: data.expectedTermsText,
            expectedMarketingText: data.expectedMarketingText,
            expectedContinueLabel: data.expectedContinueLabel,
            expectedLoginPrompt: data.expectedLoginPrompt,
            expectedLoginLinkText: data.expectedLoginLinkText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
    });

    test('@High  IW3-T1850: Verify the functionality of entering email id in the "Let\'s Get Started" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-011-create-account-credentials'];
        const result = await enterCreateAccountEmailOnly(page, {
            email: data.email,
        });

        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.emailFieldValue).toBe(data.email);
    });

    test('@High  IW3-T1855: Verify the error message on entering invalid email/phone number and password on the Email text field on Get Started screen', async ({ page }) => {
        const data = testCaseData['tc-auth-012-create-account-invalid-credentials'];
        const result = await submitCreateAccountInvalidCredentials(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('@Low  IW3-T1856: Verify error message is displayed when email and password fields are left empty', async ({ page }) => {
        const data = testCaseData['tc-auth-007-empty-credentials'];
        const result = await submitEmptyCredentials(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('@High  IW3-T1846: Verify that user navigates to "Welcome to iWant" screen on entering the URL from Non-PH region', async ({ page }) => {
        const data = testCaseData['tc-auth-009-welcome-screen-navigation'];
        const expectedHeading = data.expectedHeading;
        const expectedSubheading = data.expectedSubheading ?? '';
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading,
            expectedSubheading,
        });
        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(expectedHeading);
    });

    test('@Low  IW3-T1847: Verify the UI/UX of the "Welcome to iWant" screen', async ({ page }) => {
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

    test('@Low  IW3-T1857: Verify the message displayed when new user try to login without registration', async ({ page }) => {
        const data = testCaseData['tc-auth-013-unregistered-user-login'];
        const result = await submitUnregisteredUserLogin(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('@Low  IW3-T1859: Verify the message displayed on entering invalid credentials during login', async ({ page }) => {
        const data = testCaseData['tc-auth-001-invalid-credentials'];
        const result = await loginWithInvalidCredentials(page, {
            email: data.email,
            password: data.password,
            mode: 'invalid',
        });
        expect(result.isLoggedIn).toBe(false);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('IW3-T1864: Verify the message displayed on entering the mobile number on "Forgot Password?" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-004-forgot-password-mobile'];
        const result = await submitForgotPasswordMobileNumber(page, {
            mobileNumber: data.mobileNumber,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isMobileErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
        expect(result.isOTPPageVisible).toBe(false);
    });

    test('IW3-T1865: Verify the mobile number login functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-008-mobile-login'];
        const result = await loginWithMobileNumber(page, {
            mode: 'mobile',
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test('@Low  IW3-T1858: Verify the password visibility toggle', async ({ page }) => {
        const data = testCaseData['tc-auth-014-password-visibility-toggle'];
        const result = await verifyPasswordVisibilityToggle(page, {
            email: data.email,
            password: data.password,
        });
        expect(result.initialPasswordType).toBe('password');
        expect(result.afterTogglePasswordType).toBe('text');
        expect(result.isPasswordTextVisible).toBe(true);
    });
});

test('@Medium  IW3-T4024 Verify the validation of first name and last name fields inside the Edit Profile screen', async ({ page }) => {
    const data = testCaseData['tc-auth-017-edit-profile-name-validation'];
    const result = await validateEditProfileNameFields(page, {
      mode: data.mode,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    expect(result.isFirstNameFieldVisible).toBe(true);
    expect(result.isLastNameFieldVisible).toBe(true);
    expect(result.isValidationErrorDisplayed).toBe(true);
  });