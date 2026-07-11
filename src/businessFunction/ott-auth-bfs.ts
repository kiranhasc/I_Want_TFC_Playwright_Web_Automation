import { OTTAuthPage } from '../pom/OTTAuthPage';
import { logger } from '../utils/logger';
import { config } from '../utils/config-manager';
import { GraphQLHelper } from '../utils/graphql/graphql-helper.ts';
import * as fs from 'fs';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser.ts';
import { CollectionResponse } from '../utils/graphql/graphql-types';

export interface InvalidLoginInput {
    email?: string;
    password?: string;
    mobileNumberContryCode?: string;
    mobileNumber?: string;
    mode?: string;
    networkConnection?:string
}

export interface TVProviderLoginInput {
    email?: string;
    password?: string;
    providerName: string;
    mode?: string;
}

export interface InvalidLoginOutput {
    isLoggedIn: boolean;
    errorMessage: string;
}

// export interface TVProviderLoginInput {
//     providerName: string;
//     providerUsername: string;
//     providerPassword: string;
// }

export interface TVProviderLoginOutput {
    isLoggedIn: boolean;
    homeTabVisible: boolean;
    moviesTabVisible: boolean;
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

export interface VerifySupportAndPolicyLinksInput {
    mode?: string;
    expectedHelpAndSupportHeading?: string;
    expectedTermsHeading?: string;
    expectedPrivacyHeading?: string;
    expectedCookieHeading?: string;
}

export interface VerifySupportAndPolicyLinksOutput {
    isLoggedIn: boolean;
    helpAndSupportPageVisible: boolean;
    termsPageVisible: boolean;
    privacyPageVisible: boolean;
    cookiePageVisible: boolean;
    allPagesAccessible: boolean;
}

export interface NavigateToTermsAndConditionsSectionInput {
    mode?: string;
    sectionLinkText: string;
    subHeadingName: string
    expectedUrlPart?: string;
    expectedHeading?: string;
}

export interface NavigateToTermsAndConditionsSectionOutput {

    sectionPageVisible: boolean;
    currentUrl: string;
}

export interface SearchFromTermsPageInput {
    mode?: string;
    searchQuery: string;
}

export interface SearchFromTermsPageOutput {
    searchResultsDisplayed: boolean;
    currentUrl: string;
}

export interface VerifyTermsPageDetailsInput {
    mode?: string;
    sectionLinkText: string;
    subHeadingName: string;
    expectedUrlPart?: string;
    expectedHeading?: string;
}

export interface VerifyTermsPageDetailsOutput {
    pageDetailsVisible: boolean;
    currentUrl: string;
}

// function normalizeLoginMode(mode?: string): 'invalid' | 'valid' {
//     return mode === 'valid' ? 'valid' : 'invalid';
// }

function normalizeLoginMode(mode?: string): 'invalid' | 'valid' | 'provider' | 'mobile' {
    if (mode === 'valid') {
        return 'valid';
    }
    if (mode === 'provider') {
        return 'provider';
    }
    if (mode === 'mobile') {
        return 'mobile'
    }
    return 'invalid';
}

export interface VerifyCreateAccountScreenInput {
    expectedHeading: string;
    expectedEmailLabel: string;
    expectedPasswordLabel: string;
    expectedTermsText: string;
    expectedMarketingText: string;
    expectedContinueLabel: string;
    expectedLoginPrompt: string;
    expectedLoginLinkText: string;
}

export interface VerifyCreateAccountScreenOutput {
    isHeadingVisible: boolean;
    headingText: string;
    isEmailFieldVisible: boolean;
    isPasswordFieldVisible: boolean;
    isTermsCheckboxVisible: boolean;
    isMarketingCheckboxVisible: boolean;
    isContinueButtonVisible: boolean;
    isAlreadyHaveAccountTextVisible: boolean;
    isLoginLinkVisible: boolean;
}

export interface EmptyCredentialsInput {
    email: string;
    password: string;
    expectedErrorMessage?: string;
}

export interface EmptyCredentialsOutput {
    isErrorDisplayed: boolean;
    errorMessage: string;
}
// MOBILE_LOGIN_COUNTRY_CODE=63
// MOBILE_LOGIN_MOBILE_NUMBER=9178039002

function resolveLoginCredentials(
    input: Partial<InvalidLoginInput>,
    mode: 'invalid' | 'valid' | 'provider' | 'mobile' = 'invalid'
) {
    const prefix =
        mode === 'valid'
            ? 'VALID_LOGIN_'
            : mode === 'provider'
                ? 'PROVIDER_'
                : mode === 'mobile'
                    ? 'MOBILE_LOGIN_'
                    : 'INVALID_LOGIN_';

    const email = (config.get(`${prefix}EMAIL`, input.email ?? '') as string).trim();
    const password = (config.get(`${prefix}PASSWORD`, input.password ?? '') as string).trim();
    const mobileNumberContryCode = String(config.get(`${prefix}COUNTRYCODE`, input.mobileNumberContryCode ?? '')).trim();
    const mobileNumber = String(config.get(`${prefix}MOBILENUMBER`, input.mobileNumber ?? '')).trim();

    return { email, password, mobileNumberContryCode, mobileNumber };
}

export async function loginWithInvalidCredentials(page: any, input?: Partial<InvalidLoginInput>): Promise<InvalidLoginOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} login flow`);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    const errorMessage = await authPage.getInvalidCredentialsErrorMessage();
    logger.assertion('Invalid login error displayed', !!errorMessage);
    return {
        isLoggedIn: false,
        errorMessage,
    };
}

export interface LoginToOTTOutput {
    isLoggedIn: boolean;
    homeTabVisible: boolean;
}

export interface MobileLoginInput {
    mobileNumberContryCode?: string;
    mobileNumber?: string;
    password?: string;
    mode?: string;
}

export interface MobileLoginOutput {
    isLoggedIn: boolean;
    homeTabVisible: boolean;
}

export async function loginWithMobileNumber(page: any, input?: Partial<MobileLoginInput>): Promise<MobileLoginOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} login flow`);
    const credentials = resolveLoginCredentials(input ?? { mobileNumberContryCode: '', mobileNumber: '', password: '' }, mode);
    logger.step('Starting mobile number login flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickUseMobileNumberLink();
    await authPage.selectCountryCode(input?.mobileNumberContryCode ?? '');
    await authPage.enterMobileNumber(input?.mobileNumber ?? '');
    await authPage.enterMobilePassword(input?.password ?? '');
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    const homeVisible = await authPage.isHomeTabVisible();
    logger.assertion('Home tab visible after mobile login', homeVisible);

    return {
        isLoggedIn: homeVisible,
        homeTabVisible: homeVisible,
    };
}

export async function loginWithTVProvider(page: any, input: TVProviderLoginInput): Promise<TVProviderLoginOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} login flow`);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    logger.step('Starting TV Provider login flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickLoginWithTVProvider();
    await authPage.selectTVProvider(input.providerName);
    await authPage.clickContinue();
    await authPage.enterProviderEmail(credentials.email);
    await authPage.enterProviderPassword(credentials.password);
    await authPage.clickProviderSignIn();

    const isLoggedIn = await authPage.isLoginSuccessful();
    const homeTabVisible = await authPage.isHomeTabVisible();
    const moviesTabVisible = await authPage.isMoviesTabVisible();
    logger.assertion('TV Provider login successful', isLoggedIn);
    logger.assertion('Home tab visible after TV provider login', homeTabVisible);
    logger.assertion('Movies tab visible after TV provider login', moviesTabVisible);

    return { isLoggedIn, homeTabVisible, moviesTabVisible };
}
export async function loginToOTT(page: any, input?: Partial<InvalidLoginInput>): Promise<LoginToOTTOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} login flow`);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '',networkConnection:'' }, mode);
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    const homeVisible = await authPage.isHomeTabVisible();
    logger.assertion('Home tab visible after login', homeVisible);
    return {
        isLoggedIn: homeVisible,
        homeTabVisible: homeVisible,
    };
}

export interface NavigateTabsInput {
    mode?: string;
    expectedSearchPlaceholder?: string;
}

export interface NavigateTabsOutput {
    isLoggedIn: boolean;
    homeRailVisible: boolean;
    moviesRailVisible: boolean;
    showsRailVisible: boolean;
    watchlistRailVisible: boolean;
    gmaRailVisible: boolean;
    searchBarPlaceholder: string;
    searchBarPlaceholderMatches: boolean;
    signOutOptionVisible: boolean;
}

export interface LogoutFromOTTInput {
    providerName?: string;
    mode?: string;
}

export interface LogoutFromOTTOutput {
    isLoggedOut: boolean;
    welcomeScreenVisible: boolean;
}

export interface VerifySynacorProfileEditRestrictionInput {
    providerName?: string;
    mode?: string;
}

export interface VerifySynacorProfileEditRestrictionOutput {
    isLoggedIn: boolean;
    accountSettingsVisible: boolean;
    editProfileVisible: boolean;
    isRestricted: boolean;
}

export async function navigateAndVerifyTabs(page: any, input?: Partial<NavigateTabsInput>): Promise<NavigateTabsOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const expectedSearchPlaceholder = (input?.expectedSearchPlaceholder ?? '').trim();
    logger.step(`Starting valid login flow for tab navigation`);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    const homeRailVisible = await authPage.isContinueWatchingRailVisible();
    logger.assertion('Home tab rail active', homeRailVisible);

    await authPage.clickMoviesTab();
    const moviesRailVisible = await authPage.isTrendingMoviesRailVisible();
    logger.assertion('Movies tab rail active', moviesRailVisible);

    await authPage.clickShowsTab();
    const showsRailVisible = await authPage.isTrendingShowsRailVisible();
    logger.assertion('Shows tab rail active', showsRailVisible);

    await authPage.clickMyWatchlistTab();
    const watchlistRailVisible = await authPage.isMyWatchlistRailVisible();
    logger.assertion('Watchlist tab rail active', watchlistRailVisible);

    await authPage.clickGMATab();
    const gmaRailVisible = await authPage.isTopStreamedRailVisible();
    logger.assertion('GMA tab rail active', gmaRailVisible);

    await authPage.clickSearchBar();

    const searchBarPlaceholder = await authPage.getSearchBarPlaceholder();
    const normalizePlaceholderText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const normalizedActual = normalizePlaceholderText(searchBarPlaceholder);
    const normalizedExpected = normalizePlaceholderText(expectedSearchPlaceholder);
    const searchBarPlaceholderMatches = normalizedExpected
        ? normalizedActual.includes(normalizedExpected)
        : normalizedActual.includes('search');
    logger.assertion('Search bar placeholder visible', searchBarPlaceholder.length > 0);

    await authPage.clickAccountIcon();
    const signOutOptionVisible = await authPage.isSignOutOptionVisible();
    logger.assertion('Sign Out option visible', signOutOptionVisible);

    return {
        isLoggedIn: homeRailVisible,
        homeRailVisible,
        moviesRailVisible,
        showsRailVisible,
        watchlistRailVisible,
        gmaRailVisible,
        searchBarPlaceholder,
        searchBarPlaceholderMatches,
        signOutOptionVisible,
    };
}

export async function logoutFromOTT(page: any, input?: Partial<LogoutFromOTTInput>): Promise<LogoutFromOTTOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} logout flow`);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickLoginWithTVProvider();
    await authPage.selectTVProvider(input?.providerName ?? 'Frontier, a Verizon Company');
    await authPage.clickContinue();

    const credentials = resolveLoginCredentials({}, 'provider');
    await authPage.enterProviderEmail(credentials.email);
    await authPage.enterProviderPassword(credentials.password);
    await authPage.clickProviderSignIn();

    await authPage.waitForLoadingToDisappear();
    const isLoggedIn = await authPage.isLoginSuccessful();
    logger.assertion('User is logged in before logout', isLoggedIn);

    if (!isLoggedIn) {
        return { isLoggedOut: false, welcomeScreenVisible: false };
    }

    await authPage.clickAccountIcon();
    await authPage.clickSignOut();
    await authPage.waitForLoadingToDisappear();

    const welcomeScreenVisible = await authPage.isWelcomeHeadingVisible();
    logger.assertion('Welcome screen visible after logout', welcomeScreenVisible);

    return {
        isLoggedOut: welcomeScreenVisible,
        welcomeScreenVisible,
    };
}

export async function verifySynacorProfileEditRestriction(page: any, input?: Partial<VerifySynacorProfileEditRestrictionInput>): Promise<VerifySynacorProfileEditRestrictionOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} profile edit restriction flow`);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickLoginWithTVProvider();
    await authPage.selectTVProvider(input?.providerName ?? 'Frontier, a Verizon Company');
    await authPage.clickContinue();

    const credentials = resolveLoginCredentials({}, 'provider');
    await authPage.enterProviderEmail(credentials.email);
    await authPage.enterProviderPassword(credentials.password);
    await authPage.clickProviderSignIn();

    await authPage.waitForLoadingToDisappear();
    const isLoggedIn = await authPage.isLoginSuccessful();
    logger.assertion('User is logged in before validating profile edit restriction', isLoggedIn);

    if (!isLoggedIn) {
        return {
            isLoggedIn: false,
            accountSettingsVisible: false,
            editProfileVisible: false,
            isRestricted: false,
        };
    }

    await authPage.clickAccountIcon();
    const accountSettingsVisible = await authPage.isAccountAndSettingsVisible();
    logger.assertion('Account & Settings option visible', accountSettingsVisible);

    let editProfileVisible = false;
    if (accountSettingsVisible) {
        await authPage.clickAccountAndSettings();
        editProfileVisible = await authPage.isEditProfileButtonVisible();
    }

    logger.assertion('Edit Profile button not visible for Synacor user', !editProfileVisible);

    return {
        isLoggedIn,
        accountSettingsVisible,
        editProfileVisible,
        isRestricted: !editProfileVisible,
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

export async function verifySupportAndPolicyLinks(page: any, input?: Partial<VerifySupportAndPolicyLinksInput>): Promise<VerifySupportAndPolicyLinksOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting support and policy links validation flow');
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();

    const loginFormVisible = await authPage.isLoginFormVisible();
    if (loginFormVisible) {
        logger.step('Login form detected; attempting sign-in before validating links');
        await authPage.clickEmailField();
        await authPage.enterEmail(credentials.email);
        await authPage.clickPasswordField();
        await authPage.enterPassword(credentials.password);
        await authPage.clickContinue();
        await authPage.waitForLoadingToDisappear();
    } else {
        logger.step('Login form not present; validating footer links from the current landing page');
    }

    const supportLinksVisible = await authPage.isSupportLinksVisible();
    if (!supportLinksVisible) {
        await authPage.scrollToSupportLinks();
    }

    const homeVisible = await authPage.isHomeTabVisible();
    const isLoggedIn = homeVisible || supportLinksVisible;
    logger.assertion('Support links available for verification', supportLinksVisible);

    const helpAndSupportPageVisible = await authPage.openHelpAndSupportPage(input?.expectedHelpAndSupportHeading);
    await authPage.closeCurrentTabAndReturnToMain();

    const termsPageVisible = await authPage.openTermsPage(input?.expectedTermsHeading);
    await authPage.closeCurrentTabAndReturnToMain();

    const privacyPageVisible = await authPage.openPrivacyPage(input?.expectedPrivacyHeading);
    await authPage.closeCurrentTabAndReturnToMain();

    const cookiePageVisible = await authPage.openCookiePolicyPage(input?.expectedCookieHeading);
    await authPage.closeCurrentTabAndReturnToMain();

    const allPagesAccessible = helpAndSupportPageVisible && termsPageVisible && privacyPageVisible && cookiePageVisible;
    logger.assertion('Help, Terms, Privacy, and Cookie policy pages accessible', allPagesAccessible);

    return {
        isLoggedIn,
        helpAndSupportPageVisible,
        termsPageVisible,
        privacyPageVisible,
        cookiePageVisible,
        allPagesAccessible,
    };
}

export async function navigateToTermsAndConditionsSection(page: any, input: NavigateToTermsAndConditionsSectionInput): Promise<NavigateToTermsAndConditionsSectionOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Terms and Conditions section navigation flow');
    const credentials = resolveLoginCredentials({ email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();

    const loginFormVisible = await authPage.isLoginFormVisible();
    if (loginFormVisible) {
        logger.step('Login form detected; attempting sign-in before validating the Terms page');
        await authPage.clickEmailField();
        await authPage.enterEmail(credentials.email);
        await authPage.clickPasswordField();
        await authPage.enterPassword(credentials.password);
        await authPage.clickContinue();
        await authPage.waitForLoadingToDisappear();
    }

    await authPage.scrollToSupportLinks();
    const termsPageVisible = await authPage.openTermsPageAndNavigateToSection(input.sectionLinkText, input.subHeadingName, input.expectedHeading, input.expectedUrlPart);
    const currentUrl = authPage.getCurrentUrl();

    logger.assertion('Terms and Conditions page visible', termsPageVisible);
    logger.assertion('Terms navigation section visible', termsPageVisible);

    return {
        sectionPageVisible: termsPageVisible,
        currentUrl,
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
export async function verifyCreateAccountScreenUI(page: any, input: VerifyCreateAccountScreenInput): Promise<VerifyCreateAccountScreenOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting create account screen UI validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();

    const isHeadingVisible = await authPage.isCreateAccountHeadingVisible();
    const headingText = isHeadingVisible ? await authPage.getCreateAccountHeadingText() : '';
    const isEmailFieldVisible = await authPage.isCreateAccountEmailFieldVisible();
    const isPasswordFieldVisible = await authPage.isCreateAccountPasswordFieldVisible();
    const isTermsCheckboxVisible = await authPage.isTermsCheckboxVisible();
    const isMarketingCheckboxVisible = await authPage.isMarketingCheckboxVisible();
    const isContinueButtonVisible = await authPage.isCreateAccountContinueButtonVisible();
    const isAlreadyHaveAccountTextVisible = await authPage.isAlreadyHaveAccountTextVisible();
    const isLoginLinkVisible = await authPage.isCreateAccountLoginLinkVisible();

    logger.assertion('Create account heading visible', isHeadingVisible);
    logger.assertion('Email field visible on create account screen', isEmailFieldVisible);
    logger.assertion('Password field visible on create account screen', isPasswordFieldVisible);
    logger.assertion('Terms checkbox visible', isTermsCheckboxVisible);
    logger.assertion('Marketing checkbox visible', isMarketingCheckboxVisible);
    logger.assertion('Continue button visible on create account screen', isContinueButtonVisible);
    logger.assertion('Already have account text visible', isAlreadyHaveAccountTextVisible);
    logger.assertion('Login link visible', isLoginLinkVisible);

    return {
        isHeadingVisible,
        headingText,
        isEmailFieldVisible,
        isPasswordFieldVisible,
        isTermsCheckboxVisible,
        isMarketingCheckboxVisible,
        isContinueButtonVisible,
        isAlreadyHaveAccountTextVisible,
        isLoginLinkVisible,
    };
}

export async function submitEmptyCredentials(page: any, input: EmptyCredentialsInput): Promise<EmptyCredentialsOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting empty credentials validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(input.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(input.password);
    await authPage.clickContinue();
    const errorMessage = await authPage.getEmptyCredentialsErrorMessage();
    const isErrorDisplayed = !!errorMessage;
    logger.assertion('Empty credential error displayed', isErrorDisplayed);
    if (input.expectedErrorMessage) {
        logger.assertion('Empty credential error matches expected', errorMessage === input.expectedErrorMessage);
    }
    return {
        isErrorDisplayed,
        errorMessage,
    };
}

export async function searchFromTermsPage(page: any, input: SearchFromTermsPageInput): Promise<SearchFromTermsPageOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting search from Terms and Conditions page flow');
    const credentials = resolveLoginCredentials({ email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();

    const loginFormVisible = await authPage.isLoginFormVisible();
    if (loginFormVisible) {
        logger.step('Login form detected; attempting sign-in before accessing Terms page');
        await authPage.clickEmailField();
        await authPage.enterEmail(credentials.email);
        await authPage.clickPasswordField();
        await authPage.enterPassword(credentials.password);
        await authPage.clickContinue();
        await authPage.waitForLoadingToDisappear();
    }

    await authPage.scrollToSupportLinks();

    // Get the popup for Terms page
    const popupPromise = page.context().waitForEvent('page', { timeout: 8000 });
    const termsLink = page.locator('a:has-text("Terms and Conditions")').first();
    await termsLink.click();
    await page.waitForTimeout(500);

    const popup = await popupPromise.catch(() => undefined);
    if (!popup || popup.url() === 'about:blank') {
        logger.warn('No popup detected for Terms page');
        return {
            searchResultsDisplayed: false,
            currentUrl: authPage.getCurrentUrl(),
        };
    }

    logger.step(`Popup detected: ${popup.url()}`);
    await popup.waitForLoadState('domcontentloaded').catch(() => undefined);

    // Try to find and interact with the search field
    let searchPerformed = false;
    try {
        // Try multiple search field selectors
        let searchInput = popup.locator('input[placeholder*="Search"]').first();
        let isVisible = await searchInput.isVisible().catch(() => false);

        if (!isVisible) {
            searchInput = popup.locator('input[type="search"]').first();
            isVisible = await searchInput.isVisible().catch(() => false);
        }

        if (!isVisible) {
            searchInput = popup.locator('[data-testid*="search"]').first();
            isVisible = await searchInput.isVisible().catch(() => false);
        }

        if (isVisible) {
            logger.step(`Found search field, entering query: ${input.searchQuery}`);
            await searchInput.fill(input.searchQuery);
            await popup.waitForTimeout(1500);
            searchPerformed = true;
            logger.step('Search query entered successfully');
        } else {
            logger.warn('Search field not found or not visible');
        }
    } catch (error) {
        logger.warn(`Error performing search: ${error}`);
    }

    logger.assertion('Search field accessible and query entered from Terms page', searchPerformed);

    return {
        searchResultsDisplayed: searchPerformed,
        currentUrl: popup.url(),
    };
}

export async function verifyTermsPageDetails(page: any, input: VerifyTermsPageDetailsInput): Promise<VerifyTermsPageDetailsOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Terms and Conditions page details verification flow');
    const credentials = resolveLoginCredentials({ email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();

    const loginFormVisible = await authPage.isLoginFormVisible();
    if (loginFormVisible) {
        logger.step('Login form detected; attempting sign-in before accessing Terms page');
        await authPage.clickEmailField();
        await authPage.enterEmail(credentials.email);
        await authPage.clickPasswordField();
        await authPage.enterPassword(credentials.password);
        await authPage.clickContinue();
        await authPage.waitForLoadingToDisappear();
    }

    await authPage.scrollToSupportLinks();
    const detailsPageVisible = await authPage.openTermsPageAndNavigateToSection(input.sectionLinkText, input.subHeadingName, input.expectedHeading, input.expectedUrlPart);
    const currentUrl = authPage.getCurrentUrl();

    logger.assertion('Terms page details visible', detailsPageVisible);

    return {
        pageDetailsVisible: detailsPageVisible,
        currentUrl,
    };
}