import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTSettingsPage } from '../pom/OTTSettingsPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage.ts';
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

export interface SearchIconVisibilityInput {
    mode?: string;
}

export interface SearchIconVisibilityOutput {
    isLoggedIn: boolean;
    homePageSearchIconVisible: boolean;
    moviesPageSearchIconVisible: boolean;
    showsPageSearchIconVisible: boolean;
    watchlistPageSearchIconVisible: boolean;
    gmaPageSearchIconVisible: boolean;
}

export interface SearchQueryInput {
    mode?: string;
    query?: string;
}

export interface SearchQueryOutput {
    isLoggedIn: boolean;
    searchInputValue: string;
    queryTyped: boolean;
}

export interface SearchResultsOutput {
    isLoggedIn: boolean;
    queryTyped: boolean;
    resultsVisible: boolean;
}

export interface ParentalPinVisibilityOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
}

export interface ParentalPinToggleStateOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    toggleDisabled: boolean;
}

export interface ParentalPinPasswordFieldOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible: boolean;
}

export async function verifySearchQueryTyping(page: any, input?: Partial<SearchQueryInput>): Promise<SearchQueryOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const query = (input?.query ?? '').trim();

    logger.step('Starting search query typing flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    const searchInputValue = await authPage.getSearchBarValue();
    const queryTyped = searchInputValue.includes(query);

    logger.assertion('Search query typed into input box', queryTyped);

    return {
        isLoggedIn: true,
        searchInputValue,
        queryTyped,
    };
}

export async function verifySearchResults(page: any, input?: Partial<SearchQueryInput>): Promise<SearchResultsOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const query = (input?.query ?? '').trim();

    logger.step('Starting search results verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    const searchInputValue = await authPage.getSearchBarValue();
    const queryTyped = searchInputValue.includes(query);
    const resultsVisible = queryTyped ? await authPage.isSearchResultsVisible(query) : false;

    logger.assertion('Search results appear for a valid query', resultsVisible);

    return {
        isLoggedIn: true,
        queryTyped,
        resultsVisible,
    };
}

export async function verifyParentalPinOptionVisibility(page: any, input?: Partial<InvalidLoginInput>): Promise<ParentalPinVisibilityOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting parental controls visibility flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();

    logger.assertion('Parental Controls section visible in Settings page', parentalControlsVisible);

    return {
        isLoggedIn: true,
        parentalControlsVisible,
    };
}

export async function verifyParentalPinToggleState(page: any, input?: Partial<InvalidLoginInput>): Promise<ParentalPinToggleStateOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting parental PIN toggle state verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    const toggleDisabled = parentalControlsVisible ? await settingsPage.isParentalPinToggleDisabled() : false;
    logger.assertion('Parental PIN toggle is disabled by default', toggleDisabled);
    return {
        isLoggedIn: true,
        parentalControlsVisible,
        toggleDisabled,
    };
}

export async function verifyParentalPinPasswordField(page: any, input?: Partial<InvalidLoginInput>): Promise<ParentalPinPasswordFieldOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting parental PIN password field verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();

    // If the toggle is Off (or disabled), enable it and perform PIN setup flow.
    const toggleOff = parentalControlsVisible ? await settingsPage.isParentalPinToggleDisabled() : false;
    let passwordFieldVisible = false;
    if (toggleOff) {
        // Turn ON the toggle which should reveal the password field
        await settingsPage.clickParentalPinToggle();
        passwordFieldVisible = await settingsPage.isParentalPinPasswordFieldVisible();
    } else {
        // Toggle already ON, proceed to next steps
        passwordFieldVisible = await settingsPage.isParentalPinPasswordFieldVisible();
    }

    logger.assertion('Password field appears when parental PIN toggle is clicked', passwordFieldVisible);

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordFieldVisible,
    };
}

export async function verifySearchIconVisibilityOnAllPages(page: any, input?: Partial<SearchIconVisibilityInput>): Promise<SearchIconVisibilityOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting search icon visibility verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    const homePageSearchIconVisible = await authPage.isSearchIconVisible();
    logger.assertion('Search icon visible on Home page', homePageSearchIconVisible);

    await authPage.clickMoviesTab();
    const moviesPageSearchIconVisible = await authPage.isSearchIconVisible();
    logger.assertion('Search icon visible on Movies page', moviesPageSearchIconVisible);

    await authPage.clickShowsTab();
    const showsPageSearchIconVisible = await authPage.isSearchIconVisible();
    logger.assertion('Search icon visible on Shows page', showsPageSearchIconVisible);

    await authPage.clickMyWatchlistTab();
    const watchlistPageSearchIconVisible = await authPage.isSearchIconVisible();
    logger.assertion('Search icon visible on My Watchlist page', watchlistPageSearchIconVisible);

    await authPage.clickGMATab();
    const gmaPageSearchIconVisible = await authPage.isSearchIconVisible();
    logger.assertion('Search icon visible on GMA page', gmaPageSearchIconVisible);

    return {
        isLoggedIn: homePageSearchIconVisible,
        homePageSearchIconVisible,
        moviesPageSearchIconVisible,
        showsPageSearchIconVisible,
        watchlistPageSearchIconVisible,
        gmaPageSearchIconVisible,
    };
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

export interface ParentalPinSubmissionInput {
    password?: string;
    expectedPinSetupMessage?: string;
    mode?: string;
}

export interface ParentalPinSubmissionOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordSubmitted: boolean;
    pinSetupMessageVisible: boolean;
    toggleDisabledAfterSubmission: boolean;
    pinSetupMessage: string;
}

export interface PasswordVisibilityInput {
    password?: string;
    mode?: string;
}

export interface PasswordVisibilityOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible: boolean;
    eyeIconVisible: boolean;
    passwordVisibleAfterToggle: boolean;
    passwordValue: string;
}

export interface ParentalPinInvalidPasswordInput {
    invalidPassword?: string;
    expectedErrorMessage?: string;
    mode?: string;
}

export interface ParentalPinInvalidPasswordOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible: boolean;
    errorMessageVisible: boolean;
    errorMessageText: string;
}

export interface ParentalPinFourDigitInputOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible: boolean;
    pinInputBoxesVisible: boolean;
    pinInputCount: number;
    pinAcceptsNumericOnly: boolean;
}

export interface ParentalPinSaveSuccessInput {
    password?: string;
    pin?: string;
    mode?: string;
    expectedSuccessHeader?: string;
    expectedSuccessDetails?: string;
}

export interface ParentalPinSaveSuccessOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible: boolean;
    pinInputBoxesVisible: boolean;
    pinInputCount: number;
    pinAcceptsNumericOnly: boolean;
    successMessageVisible: boolean;
    successMessage: string;
    successHeaderVisible?: boolean;
    successDetails?: string;
    continueButtonVisible?: boolean;
}

export interface ParentalPinPlaybackPromptInput {
    mode?: string;
    pin?: string;
    expectedPromptText?: string;
}

export interface ParentalPinPlaybackPromptOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible?: boolean;
    pinInputBoxesVisible?: boolean;
    pinInputCount?: number;
    successMessageVisible?: boolean;
    parentalPinPromptVisible: boolean;
    parentalPinPromptText: string;
}

export async function submitParentalPinPassword(page: any, input?: Partial<ParentalPinSubmissionInput>): Promise<ParentalPinSubmissionOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const pinPassword = (input?.password ?? '').trim() || credentials.password;

    logger.step('Starting parental PIN password submission flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = parentalControlsVisible ? await settingsPage.isParentalPinPasswordFieldVisible() : false;
    
    let passwordSubmitted = false;
    let pinSetupMessageVisible = false;
    let pinSetupMessage = '';

    if (passwordFieldVisible && pinPassword) {
        await settingsPage.enterParentalPinPassword(pinPassword);
        await settingsPage.clickParentalPinSubmitButton();
        
        // Wait for the PIN setup message to become visible
        pinSetupMessageVisible = await settingsPage.waitForParentalPinSetupMessageVisible(5000);
        
        if (pinSetupMessageVisible) {
            pinSetupMessage = await settingsPage.getParentalPinSetupMessage();
            passwordSubmitted = true;
        } else {
            logger.debug('PIN setup message did not appear within timeout');
        }
    }

    const toggleDisabledAfterSubmission = await settingsPage.isParentalPinToggleDisabled();
    logger.assertion('PIN setup message contains expected text', pinSetupMessage.includes('Set an account owner PIN'));
    logger.assertion('Parental PIN password submitted successfully', passwordSubmitted);
    logger.assertion('PIN setup message displayed', pinSetupMessageVisible);
    logger.assertion('Parental PIN toggle is disabled after submitting password', toggleDisabledAfterSubmission);
    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordSubmitted,
        pinSetupMessageVisible,
        toggleDisabledAfterSubmission,
        pinSetupMessage: pinSetupMessage?.trim() || '',
    };
}

export async function verifyParentalPinPasswordVisibility(page: any, input?: Partial<PasswordVisibilityInput>): Promise<PasswordVisibilityOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const pinPassword = (input?.password ?? '').trim() || credentials.password;

    logger.step('Starting parental PIN password visibility verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = parentalControlsVisible ? await settingsPage.isParentalPinPasswordFieldVisible() : false;
    
    let eyeIconVisible = false;
    let passwordVisibleAfterToggle = false;
    let passwordValue = '';

    if (passwordFieldVisible && pinPassword) {
        await settingsPage.enterParentalPinPassword(pinPassword);
        
        // Check if eye icon is visible
        eyeIconVisible = await settingsPage.isPasswordVisibilityIconVisible();
        logger.assertion('Password visibility toggle icon is visible', eyeIconVisible);
        
        // Get initial password type (should be 'password')
        const initialType = await settingsPage.getPasswordInputType();
        logger.debug(`Initial password input type: ${initialType}`);
        
        if (eyeIconVisible) {
            // Toggle password visibility
            await settingsPage.togglePasswordVisibility();
            
            // Check if password is now visible
            passwordVisibleAfterToggle = await settingsPage.isPasswordInputValueVisible();
            logger.assertion('Password becomes visible after toggling eye icon', passwordVisibleAfterToggle);
            
            // Get the password value to verify it matches what was entered
            passwordValue = await settingsPage.getPasswordInputValue();
            const passwordMatches = passwordValue === pinPassword;
            logger.assertion('Visible password matches entered password', passwordMatches);
            logger.assertion('Password text is visible in input field', !!passwordValue && passwordValue.length > 0);
        }
    }

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordFieldVisible,
        eyeIconVisible,
        passwordVisibleAfterToggle,
        passwordValue,
    };
}

export async function verifyParentalPinInvalidPasswordError(page: any, input?: Partial<ParentalPinInvalidPasswordInput>): Promise<ParentalPinInvalidPasswordOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const invalidPassword = (input?.invalidPassword ?? '').trim() || 'wrongpassword123';

    logger.step('Starting parental PIN invalid password error verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = parentalControlsVisible ? await settingsPage.isParentalPinPasswordFieldVisible() : false;
    
    let errorMessageVisible = false;
    let errorMessageText = '';

    if (passwordFieldVisible && invalidPassword) {
        // Enter incorrect password
        await settingsPage.enterParentalPinPassword(invalidPassword);
        logger.step('Entered incorrect password for parental PIN');
        
        // Click submit button
        await settingsPage.clickParentalPinSubmitButton();
        logger.step('Clicked submit button with incorrect password');
        
        // Wait for error message to appear
        errorMessageVisible = await settingsPage.waitForParentalPinErrorMessageVisible(5000);
        logger.assertion('Error message appears after incorrect password submission', errorMessageVisible);
        
        if (errorMessageVisible) {
            // Get error message text
            errorMessageText = await settingsPage.getParentalPinErrorMessage();
            logger.debug(`Error message text: ${errorMessageText}`);
            
            // Verify error message matches expected value
            if (input?.expectedErrorMessage) {
                const errorMatches = errorMessageText.includes(input.expectedErrorMessage);
                logger.assertion('Error message matches expected text', errorMatches);
            }
        }
    }

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordFieldVisible,
        errorMessageVisible,
        errorMessageText: errorMessageText?.trim() || '',
    };
}

export async function verifyParentalPinFourDigitInput(page: any, input?: Partial<ParentalPinSubmissionInput>): Promise<ParentalPinFourDigitInputOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting parental PIN 4-digit input verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = parentalControlsVisible ? await settingsPage.isParentalPinPasswordFieldVisible() : false;

    // after successful password submission, the UI should show 4 digit PIN input boxes
    let pinInputBoxesVisible = false;
    let pinInputCount = 0;
    let pinAcceptsNumericOnly = false;

    if (passwordFieldVisible) {
        const pinPassword = (input?.password ?? '').trim() || credentials.password;
        if (pinPassword) {
            await settingsPage.enterParentalPinPassword(pinPassword);
            await settingsPage.clickParentalPinSubmitButton();
            // wait for PIN input boxes to appear
            pinInputBoxesVisible = await settingsPage.areParentalPinInputsVisible();
            pinInputCount = pinInputBoxesVisible ? await settingsPage.getParentalPinInputCount() : 0;
            pinAcceptsNumericOnly = pinInputBoxesVisible ? await settingsPage.areParentalPinInputsNumericOnlyTest() : false;
        }
    }

    logger.assertion('Parental PIN input boxes visible', pinInputBoxesVisible);
    logger.assertion('Parental PIN input count is 4', pinInputCount === 4);
    logger.assertion('Parental PIN inputs accept numeric only', pinAcceptsNumericOnly);

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordFieldVisible,
        pinInputBoxesVisible,
        pinInputCount,
        pinAcceptsNumericOnly,
    };
}

export async function verifyParentalPinSaveSuccess(page: any, input?: Partial<ParentalPinSaveSuccessInput>): Promise<ParentalPinSaveSuccessOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const pinPassword = (input?.password ?? '').trim() || credentials.password;
    const pinDigits = (input?.pin ?? '1234').trim();

    logger.step('Starting parental PIN save success verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    await settingsPage.clickParentalPinToggle();
    const passwordFieldVisible = parentalControlsVisible ? await settingsPage.isParentalPinPasswordFieldVisible() : false;

    let pinInputBoxesVisible = false;
    let pinInputCount = 0;
    let pinAcceptsNumericOnly = false;
    let successMessageVisible = false;
    let successMessage = '';
    let successHeaderVisible = false;
    let  successDetails = '';
    let  successHeader = '';
    let  continueButtonVisible = false;

    const expectedHeader = (input?.expectedSuccessHeader ?? '').trim();
    const expectedDetails = (input?.expectedSuccessDetails ?? '').trim();


    if (passwordFieldVisible && pinPassword) {
        await settingsPage.enterParentalPinPassword(pinPassword);
        await settingsPage.clickParentalPinSubmitButton();
        pinInputBoxesVisible = await settingsPage.areParentalPinInputsVisible();
        pinInputCount = pinInputBoxesVisible ? await settingsPage.getParentalPinInputCount() : 0;

        if (pinInputBoxesVisible) {
            await settingsPage.enterParentalPinDigits(pinDigits);
            await settingsPage.clickParentalPinSaveButton();
            successMessageVisible = await settingsPage.waitForParentalPinSuccessMessageVisible(5000);
            if (successMessageVisible) {
                successMessage = await settingsPage.getParentalPinSuccessMessage();
                // additional checks per updated test case: header, details, Continue button
                successHeaderVisible = await settingsPage.isParentalPinSuccessHeaderVisible();
                successHeader = await settingsPage.getParentalPinSuccessHeader();
                successDetails = await settingsPage.getParentalPinSuccessDetails();
                continueButtonVisible = await settingsPage.isParentalPinSuccessContinueButtonVisible();
            }
        }
    }

    logger.assertion('Parental PIN save success message displayed', successMessageVisible);
    if (successMessageVisible) {
        if (expectedHeader) {
            logger.assertion('Parental PIN save success message header matches expected', successHeaderVisible === true && successHeader.includes(expectedHeader));
        } else {
            logger.debug('No expected success header provided; skipping header assertion');
        }
        if (expectedDetails) {
            logger.assertion('Parental PIN success pop-up details text matches expected', successDetails.includes(expectedDetails));
        } else {
            logger.debug('No expected success details provided; skipping details assertion');
        }
        logger.assertion('Parental PIN success pop-up Continue button visible', continueButtonVisible === true);
    }

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordFieldVisible,
        pinInputBoxesVisible,
        pinInputCount,
        pinAcceptsNumericOnly,
        successMessageVisible,
        successMessage: successMessage?.trim() || '',
        successHeaderVisible,
        successDetails: successDetails?.trim() || '',
        continueButtonVisible,
    };
}

export async function verifyParentalPinPromptOnContentPlayback(page: any, input?: Partial<ParentalPinPlaybackPromptInput>): Promise<ParentalPinPlaybackPromptOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const pinPassword = credentials.password;
    const pinDigits = (input?.pin ?? '1234').trim();
    const expectedPromptText = (input?.expectedPromptText ?? '').trim();

    logger.step('Starting parental PIN playback prompt verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    const toggleOff = parentalControlsVisible ? await settingsPage.isParentalPinToggleDisabled() : false;
    let passwordFieldVisible: boolean | undefined;

    if (toggleOff) {
        // If the toggle is Off, enable it and complete PIN setup.
        await settingsPage.clickParentalPinToggle();
        passwordFieldVisible = await settingsPage.isParentalPinPasswordFieldVisible();
    }

    let pinInputBoxesVisible: boolean | undefined;
    let pinInputCount: number | undefined;
    let successMessageVisible: boolean | undefined;
    let parentalPinPromptVisible = false;
    let parentalPinPromptText = '';

    if (toggleOff && passwordFieldVisible && pinPassword) {
        await settingsPage.enterParentalPinPassword(pinPassword);
        await settingsPage.clickParentalPinSubmitButton();
        pinInputBoxesVisible = await settingsPage.areParentalPinInputsVisible();
        pinInputCount = pinInputBoxesVisible ? await settingsPage.getParentalPinInputCount() : 0;

        if (pinInputBoxesVisible) {
            await settingsPage.enterParentalPinDigits(pinDigits);
            await settingsPage.clickParentalPinSaveButton();
            successMessageVisible = await settingsPage.waitForParentalPinSuccessMessageVisible(5000);
            if (successMessageVisible) {
                await settingsPage.clickParentalPinSuccessContinueButton();
                await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
            }
        }
    }

    // If the toggle is already On, or after successful setup, navigate back to the previous page and play content.
    await page.goBack({ waitUntil: 'networkidle' }).catch(() => undefined);
    const continueRailVisible = await authPage.isContinueWatchingRailVisible();
    if (continueRailVisible) {
        await detailsPage.clickFirstShowContent();
    } else {
        await detailsPage.clickFirstShowContent();
    }
    await detailsPage.clickResumeButton();
    parentalPinPromptVisible = await detailsPage.isParentalPinPlaybackPromptVisible();
    parentalPinPromptText = parentalPinPromptVisible ? await detailsPage.getParentalPinPlaybackPromptText() : '';

    if (expectedPromptText && parentalPinPromptVisible) {
        logger.assertion('Parental PIN playback prompt text matches expected', parentalPinPromptText.includes(expectedPromptText));
    }

    const output: ParentalPinPlaybackPromptOutput = {
        isLoggedIn: true,
        parentalControlsVisible,
        parentalPinPromptVisible,
        parentalPinPromptText,
    };

    if (typeof passwordFieldVisible !== 'undefined') {
        output.passwordFieldVisible = passwordFieldVisible;
    }
    if (typeof pinInputBoxesVisible !== 'undefined') {
        output.pinInputBoxesVisible = pinInputBoxesVisible;
    }
    if (typeof pinInputCount !== 'undefined') {
        output.pinInputCount = pinInputCount;
    }
    if (typeof successMessageVisible !== 'undefined') {
        output.successMessageVisible = successMessageVisible;
    }

    return output;
}

export interface ParentalPinInvalidPlaybackPromptInput {
    mode?: string;
    pin?: string;
    invalidPin?: string;
    expectedPromptText?: string;
    expectedInvalidPinErrorText?: string;
}

export interface ParentalPinInvalidPlaybackPromptOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordFieldVisible?: boolean;
    pinInputBoxesVisible?: boolean;
    pinInputCount?: number;
    successMessageVisible?: boolean;
    parentalPinPromptVisible: boolean;
    parentalPinPromptText: string;
    parentalPinInvalidErrorVisible: boolean;
    parentalPinInvalidErrorText: string;
}

export async function verifyParentalPinInvalidPlaybackPrompt(page: any, input?: Partial<ParentalPinInvalidPlaybackPromptInput>): Promise<ParentalPinInvalidPlaybackPromptOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const pinPassword = credentials.password;
    const pinDigits = (input?.pin ?? '1234').trim();
    const invalidPin = (input?.invalidPin ?? '0000').trim();
    const expectedPromptText = (input?.expectedPromptText ?? '').trim();
    const expectedInvalidPinErrorText = (input?.expectedInvalidPinErrorText ?? '').trim();

    logger.step('Starting parental PIN invalid playback error verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await settingsPage.clickAccountIcon();
    await settingsPage.clickAccountAndSettings();
    await settingsPage.scrollToParentalControlsSection();
    const parentalControlsVisible = await settingsPage.isParentalControlsSectionVisible();
    const toggleOff = parentalControlsVisible ? await settingsPage.isParentalPinToggleDisabled() : false;
    let passwordFieldVisible: boolean | undefined;
    let pinInputBoxesVisible: boolean | undefined;
    let pinInputCount: number | undefined;
    let successMessageVisible: boolean | undefined;
    let parentalPinPromptVisible = false;
    let parentalPinPromptText = '';
    let parentalPinInvalidErrorVisible = false;
    let parentalPinInvalidErrorText = '';

    if (toggleOff) {
        await settingsPage.clickParentalPinToggle();
        passwordFieldVisible = await settingsPage.isParentalPinPasswordFieldVisible();
        if (passwordFieldVisible && pinPassword) {
            await settingsPage.enterParentalPinPassword(pinPassword);
            await settingsPage.clickParentalPinSubmitButton();
            pinInputBoxesVisible = await settingsPage.areParentalPinInputsVisible();
            pinInputCount = pinInputBoxesVisible ? await settingsPage.getParentalPinInputCount() : 0;
            if (pinInputBoxesVisible) {
                await settingsPage.enterParentalPinDigits(pinDigits);
                await settingsPage.clickParentalPinSaveButton();
                successMessageVisible = await settingsPage.waitForParentalPinSuccessMessageVisible(5000);
                if (successMessageVisible) {
                    await settingsPage.clickParentalPinSuccessContinueButton();
                    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
                }
            }
        }
    }

    await page.goBack({ waitUntil: 'networkidle' }).catch(() => undefined);
    await detailsPage.clickFirstShowContent();
    await detailsPage.clickResumeButton();
    parentalPinPromptVisible = await detailsPage.isParentalPinPlaybackPromptVisible();
    parentalPinPromptText = parentalPinPromptVisible ? await detailsPage.getParentalPinPlaybackPromptText() : '';

    if (parentalPinPromptVisible && invalidPin) {
        await detailsPage.enterParentalPlaybackPin(invalidPin);
        parentalPinInvalidErrorVisible = await detailsPage.isParentalPinInvalidErrorVisible();
        parentalPinInvalidErrorText = parentalPinInvalidErrorVisible ? await detailsPage.getParentalPinInvalidErrorText() : '';
    }

    if (expectedPromptText && parentalPinPromptVisible) {
        logger.assertion('Parental PIN playback prompt text matches expected', parentalPinPromptText.includes(expectedPromptText));
    }
    if (expectedInvalidPinErrorText && parentalPinInvalidErrorVisible) {
        logger.assertion('Invalid PIN error text matches expected', parentalPinInvalidErrorText.includes(expectedInvalidPinErrorText));
    }

    const output: ParentalPinInvalidPlaybackPromptOutput = {
        isLoggedIn: true,
        parentalControlsVisible,
        parentalPinPromptVisible,
        parentalPinPromptText,
        parentalPinInvalidErrorVisible,
        parentalPinInvalidErrorText,
    };

    if (typeof passwordFieldVisible !== 'undefined') {
        output.passwordFieldVisible = passwordFieldVisible;
    }
    if (typeof pinInputBoxesVisible !== 'undefined') {
        output.pinInputBoxesVisible = pinInputBoxesVisible;
    }
    if (typeof pinInputCount !== 'undefined') {
        output.pinInputCount = pinInputCount;
    }
    if (typeof successMessageVisible !== 'undefined') {
        output.successMessageVisible = successMessageVisible;
    }

    return output;
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

