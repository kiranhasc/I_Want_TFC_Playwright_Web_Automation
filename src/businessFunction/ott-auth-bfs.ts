import { OTTAuthPage } from '../pom/OTTAuthPage';
import { logger } from '../utils/logger';
import { config } from '../utils/config-manager';

export interface InvalidLoginInput {
    email?: string;
    password?: string;
    mobileNumberContryCode?: string;
    mobileNumber?: string;
    mode?: string;
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

// function normalizeLoginMode(mode?: string): 'invalid' | 'valid~' {
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

export interface EnterCreateAccountCredentialsInput {
    email: string;
    password: string;
}

export interface EnterCreateAccountCredentialsOutput {
    isEmailFieldVisible: boolean;
    isPasswordFieldVisible: boolean;
    emailFieldValue: string;
    passwordFieldValue: string;
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
    mode: 'invalid' | 'valid' | 'provider'  | 'mobile' = 'invalid'
) {
    const prefix =
        mode === 'valid'
            ? 'VALID_LOGIN_'
            : mode === 'provider'
                ? 'PROVIDER_' 
            : mode === 'mobile'
                ? 'MOBILE_LOGIN_'
            :'INVALID_LOGIN_';

    const email = (config.get(`${prefix}EMAIL`, input.email ?? '') as string).trim();
    const password = (config.get(`${prefix}PASSWORD`, input.password ?? '') as string).trim();
    const mobileNumberContryCode = String(config.get(`${prefix}COUNTRYCODE`, input.mobileNumberContryCode ?? '')).trim();
    const mobileNumber = String(config.get(`${prefix}MOBILENUMBER`, input.mobileNumber ?? '')).trim();

    return { email, password , mobileNumberContryCode,  mobileNumber};
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

export interface SubmitUnregisteredUserLoginInput {
    email: string;
    password: string;
    expectedErrorMessage?: string;
}

export interface SubmitUnregisteredUserLoginOutput {
    isErrorDisplayed: boolean;
    errorMessage: string;
}

export async function submitUnregisteredUserLogin(
    page: any,
    input: SubmitUnregisteredUserLoginInput
): Promise<SubmitUnregisteredUserLoginOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting unregistered user login validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(input.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(input.password);
    await authPage.clickContinue();

    const errorMessage = await authPage.getInvalidCredentialsErrorMessage();
    const isErrorDisplayed = !!errorMessage;
    logger.assertion('Unregistered user login error displayed', isErrorDisplayed);

    if (input.expectedErrorMessage) {
        logger.assertion(
            'Unregistered user login error matches expected',
            errorMessage.includes(input.expectedErrorMessage)
        );
    }

    return {
        isErrorDisplayed,
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
    logger.assertion('TV Provider login successful', isLoggedIn);

    return { isLoggedIn };
}
export async function loginToOTT(page: any, input?: Partial<InvalidLoginInput>): Promise<LoginToOTTOutput> {
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
    const isMarketingCheckboxVisible = await authPage.isMarketingCheckboxVisible(input.expectedMarketingText);
    console.log('isTermsCheckboxVisible', isTermsCheckboxVisible);
    console.log('isMarketingCheckboxVisible', isMarketingCheckboxVisible);
    const isContinueButtonVisible = await authPage.isCreateAccountContinueButtonVisible();
    const isAlreadyHaveAccountTextVisible = await authPage.isAlreadyHaveAccountTextVisible();
    const isLoginLinkVisible = await authPage.isCreateAccountLoginLinkVisible();
    console.log('isAlreadyHaveAccountTextVisible', isAlreadyHaveAccountTextVisible);
    console.log('isLoginLinkVisible', isLoginLinkVisible);

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

export async function enterCreateAccountCredentials(page: any, input: EnterCreateAccountCredentialsInput): Promise<EnterCreateAccountCredentialsOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting create account credentials entry flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();
    await authPage.enterCreateAccountEmail(input.email);
    await authPage.enterCreateAccountPassword(input.password);

    const isEmailFieldVisible = await authPage.isCreateAccountEmailFieldVisible();
    const isPasswordFieldVisible = await authPage.isCreateAccountPasswordFieldVisible();
    const emailFieldValue = await authPage.getCreateAccountEmailValue();
    const passwordFieldValue = await authPage.getCreateAccountPasswordValue();

    logger.assertion('Create account email field visible', isEmailFieldVisible);
    logger.assertion('Create account password field visible', isPasswordFieldVisible);

    return {
        isEmailFieldVisible,
        isPasswordFieldVisible,
        emailFieldValue,
        passwordFieldValue,
    };
}

export interface EnterCreateAccountEmailOnlyInput {
    email: string;
}

export interface EnterCreateAccountEmailOnlyOutput {
    isEmailFieldVisible: boolean;
    emailFieldValue: string;
}

export async function enterCreateAccountEmailOnly(page: any, input: EnterCreateAccountEmailOnlyInput): Promise<EnterCreateAccountEmailOnlyOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting create account email-only entry flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();
    await authPage.enterCreateAccountEmail(input.email);

    const isEmailFieldVisible = await authPage.isCreateAccountEmailFieldVisible();
    const emailFieldValue = await authPage.getCreateAccountEmailValue();

    logger.assertion('Create account email field visible', isEmailFieldVisible);

    return {
        isEmailFieldVisible,
        emailFieldValue,
    };
}

export interface SubmitCreateAccountInvalidCredentialsInput {
    email: string;
    password: string;
    expectedErrorMessage?: string;
}

export interface SubmitCreateAccountInvalidCredentialsOutput {
    isErrorDisplayed: boolean;
    errorMessage: string;
}

export async function submitCreateAccountInvalidCredentials(
    page: any,
    input: SubmitCreateAccountInvalidCredentialsInput
): Promise<SubmitCreateAccountInvalidCredentialsOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting create account invalid credentials validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();
    await authPage.enterCreateAccountEmail(input.email);
    await authPage.enterCreateAccountPassword(input.password);
    await authPage.selectCreateAccountTermsCheckbox();
    await authPage.clickCreateAccountContinue();
    const errorMessage = await authPage.getErrorMessage();
    const isErrorDisplayed = !!errorMessage;
    logger.assertion('Create account invalid credentials error displayed', isErrorDisplayed);
    if (input.expectedErrorMessage) {
        logger.assertion(
            'Create account invalid credentials error matches expected',
            errorMessage.includes(input.expectedErrorMessage)
        );
    }

    return {
        isErrorDisplayed,
        errorMessage,
    };
}

export interface VerifyPasswordVisibilityToggleInput {
    email: string;
    password: string;
}

export interface VerifyPasswordVisibilityToggleOutput {
    isToggleVisible: boolean;
    initialPasswordType: string;
    afterTogglePasswordType: string;
    isPasswordTextVisible: boolean;
}

export interface VerifyAccountAndSubscriptionDetailsInput {
    mode?: string;
    providerName?: string;
    expectedSectionName?: string;
    expectedSubscriptionText?: string;
}

export interface VerifyAccountAndSubscriptionDetailsOutput {
    isProfileSectionVisible: boolean;
    isAccountAndSubscriptionDetailsVisible: boolean;
    profileSectionText: string;
    accountDetailsText: string;
}

export async function verifyAccountAndSubscriptionDetails(
    page: any,
    input?: Partial<VerifyAccountAndSubscriptionDetailsInput>
): Promise<VerifyAccountAndSubscriptionDetailsOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting account and subscription details verification flow');

    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickLoginWithTVProvider();
    await authPage.selectTVProvider(input?.providerName ?? '');
    await authPage.clickContinue();
    await authPage.enterProviderEmail(credentials.email);
    await authPage.enterProviderPassword(credentials.password);
    await authPage.clickProviderSignIn();
    // await authPage.clickEmailField();
    // await authPage.enterEmail(credentials.email);
    // await authPage.clickPasswordField();
    // await authPage.enterPassword(credentials.password);
    // await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    await authPage.openProfileSettings();

    const profileSectionText = await authPage.getProfileSectionText();
    const accountDetailsText = await authPage.getAccountDetailsText();
    const expectedSectionName = (input?.expectedSectionName ?? '').trim().toLowerCase();
    const expectedSubscriptionText = (input?.expectedSubscriptionText ?? '').trim().toLowerCase();
    const isProfileSectionVisible = expectedSectionName
        ? profileSectionText.toLowerCase().includes(expectedSectionName)
        : profileSectionText.length > 0;
    const isAccountAndSubscriptionDetailsVisible = expectedSubscriptionText
        ? accountDetailsText.toLowerCase().includes(expectedSubscriptionText)
        : accountDetailsText.length > 0;

    logger.assertion('Profile section visible', isProfileSectionVisible);
    logger.assertion('Account and subscription details visible', isAccountAndSubscriptionDetailsVisible);

    return {
        isProfileSectionVisible,
        isAccountAndSubscriptionDetailsVisible,
        profileSectionText,
        accountDetailsText,
    };
}

export interface ValidateEditProfileNameFieldsInput {
    mode?: string;
    firstName: string;
    lastName: string;
}

export interface ValidateEditProfileNameFieldsOutput {
    isEditProfileScreenVisible: boolean;
    isFirstNameFieldVisible: boolean;
    isLastNameFieldVisible: boolean;
    isValidationErrorDisplayed: boolean;
    validationErrorText: string;
}

export async function validateEditProfileNameFields(
    page: any,
    input: ValidateEditProfileNameFieldsInput
): Promise<ValidateEditProfileNameFieldsOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting edit profile name validation flow');

    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    await authPage.openProfileSettings();
    await authPage.openEditProfile();

    const isEditProfileScreenVisible = await authPage.isEditProfileScreenVisible();
    const isFirstNameFieldVisible = await authPage.isFirstNameFieldVisible();
    const isLastNameFieldVisible = await authPage.isLastNameFieldVisible();

    await authPage.enterFirstName(input.firstName);
    await authPage.enterLastName(input.lastName);
    await authPage.clickSaveProfile();

    const isValidationErrorDisplayed = await authPage.isProfileValidationErrorVisible();
    const validationErrorText = isValidationErrorDisplayed ? await authPage.getProfileValidationErrorText() : '';

    logger.assertion('Edit profile screen visible', isEditProfileScreenVisible);
    logger.assertion('First name field visible', isFirstNameFieldVisible);
    logger.assertion('Last name field visible', isLastNameFieldVisible);
    logger.assertion('Validation error displayed for invalid names', isValidationErrorDisplayed);

    return {
        isEditProfileScreenVisible,
        isFirstNameFieldVisible,
        isLastNameFieldVisible,
        isValidationErrorDisplayed,
        validationErrorText,
    };
}

export async function verifyPasswordVisibilityToggle(
    page: any,
    input: VerifyPasswordVisibilityToggleInput
): Promise<VerifyPasswordVisibilityToggleOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting password visibility toggle validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(input.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(input.password);

    const initialPasswordType = await authPage.getPasswordFieldType();

    logger.step('Clicking password visibility toggle button');
    await authPage.clickPasswordVisibilityToggle();

    const afterTogglePasswordType = await authPage.getPasswordFieldType();
    
    // Verify password text is visible by checking if password field is now type="text"
    const passwordField = page.locator('input[type="text"][name*="password"], input[placeholder*="Password"][type="text"]').first();
    const isPasswordTextVisible = await passwordField.count() > 0;

    logger.assertion('Password field type changes after toggle', initialPasswordType !== afterTogglePasswordType);
    logger.assertion('Password text is visible after toggle', isPasswordTextVisible);

    return {
        isToggleVisible: true,
        initialPasswordType,
        afterTogglePasswordType,
        isPasswordTextVisible,
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

