import { test, expect } from '@playwright/test';
import { verifyCreateAccountScreenUI } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { submitEmptyCredentials } from '../../src/businessFunction/ott-auth-bfs';


test.describe('Account creation UI', () => {
    test('Low - IW3-T1849: Verify the UI/UX of the Create an account screen', async ({ page }) => {
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
});

test.describe('Authentication validation', () => {
    test('@Low - IW3-T1856: Verify error message is displayed when email and password fields are left empty', async ({ page }) => {
        const data = testCaseData['tc-auth-007-empty-credentials'];
        const result = await submitEmptyCredentials(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });
});

