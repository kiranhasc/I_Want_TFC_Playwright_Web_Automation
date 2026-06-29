import { OTTAuthPage } from '../pom/OTTAuthPage';
import { logger } from '../utils/logger';

export interface InvalidLoginInput {
    email: string;
    password: string;
}

export interface InvalidLoginOutput {
    isLoggedIn: boolean;
    errorMessage: string;
}

export interface ForgotPasswordInput {
    expectedHeading?: string;
}

export interface ForgotPasswordOutput {
    isVisible: boolean;
    headingText: string;
}

export interface SubmitForgotPasswordInput {
    email: string;
    expectedOTPHeading?: string;
}

export interface SubmitForgotPasswordOutput {
    isOTPPageVisible: boolean;
    otpHeadingText: string;
}

export interface SubmitForgotPasswordMobileInput {
    mobileNumber: string;
    expectedErrorMessage?: string;
}

export interface SubmitForgotPasswordMobileOutput {
    isMobileErrorDisplayed: boolean;
    errorMessage: string;
    isOTPPageVisible: boolean;
}

export interface VerifyWelcomeScreenInput {
    expectedHeading: string;
    expectedSubheading: string;
}

export interface VerifyWelcomeScreenOutput {
    isHeadingVisible: boolean;
    headingText: string;
    isSubheadingVisible: boolean;
    subheadingText: string;
    isEmailFieldVisible: boolean;
    isPasswordFieldVisible: boolean;
    isContinueButtonVisible: boolean;
    isLoginWithFacebookVisible: boolean;
    isLoginWithTVProviderVisible: boolean;
    isNewHereLinkVisible: boolean;
    isCreateAccountLinkVisible: boolean;
}

export async function loginWithInvalidCredentials(page: any, input: InvalidLoginInput): Promise<InvalidLoginOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting invalid login flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(input.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(input.password);
    await authPage.clickContinue();

    const errorMessage = await authPage.getInvalidCredentialsErrorMessage();
    logger.assertion('Invalid login error displayed', !!errorMessage);

    return {
        isLoggedIn: false,
        errorMessage,
    };
}

export async function navigateToForgotPassword(page: any, input?: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting Forgot Password navigation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickForgotPassword();

    const isVisible = await authPage.isForgotPasswordPageVisible();
    const headingText = isVisible ? await authPage.getForgotPasswordHeadingText() : '';
    logger.assertion('Forgot Password page visible', isVisible);
    if (input?.expectedHeading) {
        logger.assertion('Forgot Password heading matches expected', headingText === input.expectedHeading);
    }
    return {
        isVisible,
        headingText,
    };
}

export async function submitForgotPasswordEmail(page: any, input: SubmitForgotPasswordInput): Promise<SubmitForgotPasswordOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting Forgot Password email submission flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickForgotPassword();

    const isForgotPasswordPageVisible = await authPage.isForgotPasswordPageVisible();
    const forgotPasswordHeading = isForgotPasswordPageVisible ? await authPage.getForgotPasswordHeadingText() : '';
    logger.assertion('Forgot Password page visible', isForgotPasswordPageVisible);
    if (input.expectedOTPHeading) {
        logger.assertion('Forgot Password heading is present', forgotPasswordHeading.length > 0);
    }

    await authPage.clickEmailField();
    await authPage.enterEmail(input.email);
    await authPage.clickProceed();

    const isOTPPageVisible = await authPage.isVerifyOTPPageVisible();
    const otpHeadingText = isOTPPageVisible ? await authPage.getVerifyOTPHeadingText() : '';
    logger.assertion('Verify OTP page visible', isOTPPageVisible);
    if (input.expectedOTPHeading) {
        logger.assertion('Verify OTP heading matches expected', otpHeadingText === input.expectedOTPHeading);
    }

    return {
        isOTPPageVisible,
        otpHeadingText,
    };
}

export async function submitForgotPasswordMobileNumber(page: any, input: SubmitForgotPasswordMobileInput): Promise<SubmitForgotPasswordMobileOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting Forgot Password mobile number submission flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickForgotPassword();

    const isForgotPasswordPageVisible = await authPage.isForgotPasswordPageVisible();
    logger.assertion('Forgot Password page visible', isForgotPasswordPageVisible);

    await authPage.clickEmailField();
    await authPage.enterEmail(input.mobileNumber);
    await authPage.clickProceed();

    const isErrorDisplayed = await authPage.isErrorMessageVisible();
    const errorMessage = isErrorDisplayed ? await authPage.getErrorMessage() : '';
    const isOTPPageVisible = await authPage.isVerifyOTPPageVisible();

    logger.assertion('Mobile number error displayed', isErrorDisplayed);
    if (input.expectedErrorMessage) {
        logger.assertion('Error message matches expected', errorMessage === input.expectedErrorMessage);
    }
    logger.assertion('OTP page not shown for invalid mobile', !isOTPPageVisible);

    return {
        isMobileErrorDisplayed: isErrorDisplayed,
        errorMessage,
        isOTPPageVisible,
    };
}

export async function verifyWelcomeScreenUI(page: any, input: VerifyWelcomeScreenInput): Promise<VerifyWelcomeScreenOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting welcome screen UI validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();

    const isHeadingVisible = await authPage.isWelcomeHeadingVisible();
    const headingText = isHeadingVisible ? await authPage.getWelcomeHeadingText() : '';
    const isSubheadingVisible = await authPage.isWelcomeSubheadingVisible();
    const subheadingText = isSubheadingVisible ? await authPage.getWelcomeSubheadingText() : '';
    const isEmailFieldVisible = await authPage.isEmailFieldVisible();
    const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();
    const isContinueButtonVisible = await authPage.isContinueButtonVisible();
    const isLoginWithFacebookVisible = await authPage.isLoginWithFacebookVisible();
    const isLoginWithTVProviderVisible = await authPage.isLoginWithTVProviderVisible();
    await authPage.scrollToBottomLinks();
    const isNewHereLinkVisible = await authPage.isNewHereLinkVisible();
    const isCreateAccountLinkVisible = await authPage.isCreateAccountLinkVisible();

    logger.assertion('Welcome heading visible', isHeadingVisible);
    logger.assertion('Welcome subheading visible', isSubheadingVisible);
    logger.assertion('Email field visible', isEmailFieldVisible);
    logger.assertion('Password field visible', isPasswordFieldVisible);
    logger.assertion('Continue button visible', isContinueButtonVisible);
    logger.assertion('Login with Facebook visible', isLoginWithFacebookVisible);
    logger.assertion('Login with TV Provider visible', isLoginWithTVProviderVisible);
    logger.assertion('New here link visible', isNewHereLinkVisible);
    logger.assertion('Create Account link visible', isCreateAccountLinkVisible);

    return {
        isHeadingVisible,
        headingText,
        isSubheadingVisible,
        subheadingText,
        isEmailFieldVisible,
        isPasswordFieldVisible,
        isContinueButtonVisible,
        isLoginWithFacebookVisible,
        isLoginWithTVProviderVisible,
        isNewHereLinkVisible,
        isCreateAccountLinkVisible,
    };
}
