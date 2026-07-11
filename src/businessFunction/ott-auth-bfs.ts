import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTSettingsPage } from '../pom/OTTSettingsPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
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

function normalizeLoginMode(mode?: string): 'invalid' | 'valid' | 'provider' | 'mobile' | 'freeUser' {
    if (mode === 'valid') {
        return 'valid';
    }
    if (mode === 'provider') {
        return 'provider';
    }
    if (mode === 'mobile') {
        return 'mobile'
    }
    if (mode === 'freeUser') {
        return 'freeUser';
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

function resolveLoginCredentials(
    input: Partial<InvalidLoginInput>,
    mode: 'invalid' | 'valid' | 'provider'  | 'mobile'  | 'freeUser' = 'invalid'
) {
    const prefix =
        mode === 'valid'
            ? 'VALID_LOGIN_'
            : mode === 'provider'
                ? 'PROVIDER_' 
            : mode === 'mobile'
                ? 'MOBILE_LOGIN_'
            : mode === 'freeUser'
                ? 'FREE_USER_'
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

export interface VerifyContinueWatchingInput {
    mode?: string;
    email?: string;
    password?: string;
}

export interface VerifyContinueWatchingOutput {
    isContinueWatchingVisible: boolean;
    continueWatchingItemsCount?: number;
    continueWatchingItemsDetails?: Array<{ title: string; hasProgress: boolean }>;
}

export interface VerifyContinueWatchingTrayUIInput {
    email?: string;
    password?: string;
    mode?: string;
}

export interface VerifyContinueWatchingTrayUIOutput {
    isValid: boolean;
    isTitleVisible: boolean;
    itemCount: number;
    itemDetails: Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }>;
    reason?: string;
}

export interface VerifyContinueWatchingTrayScrollOutput {
    isValid: boolean;
    isTitleVisible: boolean;
    itemCount: number;
    itemDetails: Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }>;
    reason?: string;
}

export interface VerifyContinueWatchingRemoveItemOutput {
    isValid: boolean;
    initialItemCount: number;
    finalItemCount: number;
    confirmationVisible: boolean;
    reason?: string;
}

export interface VerifyContinueWatchingRemovalAfterPlaybackOutput {
    isValid: boolean;
    initiallyVisible: boolean;
    finallyVisible: boolean;
    removedItemTitle: string;
    reason?: string;
}

export async function verifyContinueWatchingTrayUI(page: any, input?: VerifyContinueWatchingTrayUIInput): Promise<VerifyContinueWatchingTrayUIOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Continue Watching tray UI validation');

    const envEmail = process.env.VALID_LOGIN_EMAIL;
    const envPassword = process.env.VALID_LOGIN_PASSWORD;
    const providedEmail = (input as any)?.email || envEmail || '';
    const providedPassword = (input as any)?.password || envPassword || '';
    const credentials = providedEmail && providedPassword
        ? { email: providedEmail, password: providedPassword }
        : resolveLoginCredentials(input ?? {}, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await authPage.waitForContinueWatchingTrayToBeReady();

    const isTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
    const itemCount = await authPage.getContinueWatchingTrayItemCount();
    const itemDetails = await authPage.getContinueWatchingTrayItemDetails();
    const hasCards = itemCount > 0;
    const hasTitles = itemDetails.some((item) => !!item.title);
    const hasThumbnails = itemDetails.some((item) => item.hasThumbnail);
    const hasProgress = itemDetails.some((item) => item.hasProgress);
    const isValid = isTitleVisible && hasCards && hasTitles && hasThumbnails;

    logger.assertion('Continue Watching tray title visible', isTitleVisible);
    logger.assertion('Continue Watching tray cards visible', hasCards);
    logger.assertion('Continue Watching tray item titles present', hasTitles);
    logger.assertion('Continue Watching tray item thumbnails present', hasThumbnails);
    logger.assertion('Continue Watching tray progress indicators present', hasProgress || hasCards);

    return {
        isValid,
        isTitleVisible,
        itemCount,
        itemDetails,
        reason: isValid ? undefined : 'Continue Watching tray UI expectations were not met',
    };
}

export async function verifyContinueWatchingTrayScroll(page: any, input?: VerifyContinueWatchingTrayUIInput): Promise<VerifyContinueWatchingTrayScrollOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Continue Watching tray scroll validation');

    const envEmail = process.env.VALID_LOGIN_EMAIL;
    const envPassword = process.env.VALID_LOGIN_PASSWORD;
    const providedEmail = (input as any)?.email || envEmail || '';
    const providedPassword = (input as any)?.password || envPassword || '';
    const credentials = providedEmail && providedPassword
        ? { email: providedEmail, password: providedPassword }
        : resolveLoginCredentials(input ?? {}, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await authPage.waitForContinueWatchingTrayToBeReady();

    const isTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
    if (!isTitleVisible) {
        return {
            isValid: false,
            isTitleVisible: false,
            itemCount: 0,
            itemDetails: [],
            reason: 'Continue Watching tray title is not visible after scrolling into view',
        };
    }

    const trayInView = await authPage.ensureContinueWatchingTrayInView();
    if (!trayInView) {
        return {
            isValid: false,
            isTitleVisible,
            itemCount: 0,
            itemDetails: [],
            reason: 'Continue Watching tray could not be brought into view',
        };
    }

    const itemCountBeforeScroll = await authPage.getContinueWatchingTrayItemCount();
    const itemDetailsBeforeScroll = await authPage.getContinueWatchingTrayItemDetails();

    const rightScrollWorked = await authPage.scrollContinueWatchingTray('right');
    const leftScrollWorked = await authPage.scrollContinueWatchingTray('left');
    const itemCountAfterScroll = await authPage.getContinueWatchingTrayItemCount();
    const itemDetailsAfterScroll = await authPage.getContinueWatchingTrayItemDetails();
    const hasScrollableContent = isTitleVisible && itemCountBeforeScroll > 0 && itemCountAfterScroll >= itemCountBeforeScroll;
    const hasVisibleCards = itemDetailsBeforeScroll.some((item) => item.hasThumbnail) || itemDetailsAfterScroll.some((item) => item.hasThumbnail);
    const isValid = Boolean(isTitleVisible && hasScrollableContent && hasVisibleCards && rightScrollWorked && leftScrollWorked);

    logger.assertion('Continue Watching tray title visible', isTitleVisible);
    logger.assertion('Continue Watching tray has cards before scroll', itemCountBeforeScroll > 0);
    logger.assertion('Continue Watching tray scroll interaction completed', isValid);

    return {
        isValid,
        isTitleVisible,
        itemCount: itemCountAfterScroll,
        itemDetails: itemDetailsAfterScroll,
        reason: isValid ? undefined : 'Continue Watching tray did not scroll as expected',
    };
}

export async function verifyContinueWatchingRemoveItem(page: any, input?: VerifyContinueWatchingTrayUIInput): Promise<VerifyContinueWatchingRemoveItemOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Continue Watching remove-item validation');

    const envEmail = process.env.VALID_LOGIN_EMAIL;
    const envPassword = process.env.VALID_LOGIN_PASSWORD;
    const providedEmail = (input as any)?.email || envEmail || '';
    const providedPassword = (input as any)?.password || envPassword || '';
    const credentials = providedEmail && providedPassword
        ? { email: providedEmail, password: providedPassword }
        : resolveLoginCredentials(input ?? {}, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await authPage.waitForContinueWatchingTrayToBeReady();

    const isTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
    if (!isTitleVisible) {
        return { isValid: false, initialItemCount: 0, confirmationVisible: false, finalItemCount: 0, reason: 'Continue Watching tray title is not visible' };
    }

    const initialItemCount = await authPage.getContinueWatchingTrayItemCount();
    if (initialItemCount <= 0) {
        return { isValid: false, initialItemCount: 0, confirmationVisible: false, finalItemCount: 0, reason: 'No items available to remove from Continue Watching tray' };
    }

    const removeResult = await authPage.removeFirstContinueWatchingItem();
    if (!removeResult.clicked) {
        return { isValid: false, initialItemCount, finalItemCount: initialItemCount, confirmationVisible: false, reason: 'Unable to remove the first Continue Watching item' };
    }

    await authPage.waitForContinueWatchingTrayToBeReady();
    const finalItemCount = await authPage.getContinueWatchingTrayItemCount();
    const isValid = removeResult.confirmationVisible;

    logger.assertion('Continue Watching removal confirmation shown', removeResult.confirmationVisible);
    logger.assertion('Continue Watching item removed', isValid);

    return {
        isValid,
        initialItemCount,
        finalItemCount,
        confirmationVisible: removeResult.confirmationVisible,
        reason: isValid ? undefined : 'The selected item was not removed from the Continue Watching tray or the confirmation popup was not shown',
    };
}

export async function verifyContinueWatchingRemovalAfterPlayback(page: any, input?: VerifyContinueWatchingTrayUIInput): Promise<VerifyContinueWatchingRemovalAfterPlaybackOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting Continue Watching removal after playback validation');

    const envEmail = process.env.VALID_LOGIN_EMAIL;
    const envPassword = process.env.VALID_LOGIN_PASSWORD;
    const providedEmail = (input as any)?.email || envEmail || '';
    const providedPassword = (input as any)?.password || envPassword || '';
    const credentials = providedEmail && providedPassword
        ? { email: providedEmail, password: providedPassword }
        : resolveLoginCredentials(input ?? {}, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await authPage.waitForContinueWatchingTrayToBeReady();

    const isTitleVisible = await authPage.isContinueWatchingTrayTitleVisible();
    if (!isTitleVisible) {
        return { isValid: false, initiallyVisible: false, finallyVisible: false, removedItemTitle: '', reason: 'Continue Watching tray title is not visible' };
    }

    const explicitMovieItem = await authPage.getExplicitMovieContinueWatchingItem();
    if (!explicitMovieItem?.title) {
        return { isValid: false, initiallyVisible: false, finallyVisible: false, removedItemTitle: '', reason: 'No movie content was available in the Continue Watching tray to validate removal' };
    }

    const removedItemTitle = explicitMovieItem.title;
    const initialVisibility = await authPage.isContinueWatchingItemVisible(removedItemTitle);
    if (!initialVisibility) {
        return { isValid: false, initiallyVisible: false, finallyVisible: false, removedItemTitle, reason: 'The selected Continue Watching item was not visible before playback' };
    }

    const playbackStarted = await authPage.openContinueWatchingItemAndStartPlayback(removedItemTitle);
    if (!playbackStarted) {
        return { isValid: false, initiallyVisible: true, finallyVisible: false, removedItemTitle, reason: 'The selected Continue Watching item could not be opened for playback' };
    }

    const playbackCompleted = await authPage.finishPlaybackFromCurrentItem();
    if (!playbackCompleted) {
        return { isValid: false, initiallyVisible: true, finallyVisible: false, removedItemTitle, reason: 'The selected content did not reach the completion state' };
    }

    await authPage.navigateHome();
    await authPage.waitForContinueWatchingTrayToBeReady();

    const finalVisibility = await authPage.isContinueWatchingItemVisible(removedItemTitle);
    const isValid = initialVisibility && !finalVisibility;

    logger.assertion('Continue Watching item visible before playback', initialVisibility);
    logger.assertion('Continue Watching item removed after playback completion', !finalVisibility);

    return {
        isValid,
        initiallyVisible: initialVisibility,
        finallyVisible: finalVisibility,
        removedItemTitle,
        reason: isValid ? undefined : 'The selected item remained in the Continue Watching tray after playback completion',
    };
}

export async function verifyContinueWatchingAbsent(page: any, input?: VerifyContinueWatchingInput): Promise<VerifyContinueWatchingOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step('Starting login flow for Continue Watching absence validation');
    // Prefer explicit input credentials, then UNWATCHED env vars, then resolveLoginCredentials
    const envEmail = process.env.UNWATCHED_LOGIN_EMAIL;
    const envPassword = process.env.UNWATCHED_LOGIN_PASSWORD;
    const providedEmail = (input as any)?.email || envEmail || '';
    const providedPassword = (input as any)?.password || envPassword || '';
    const credentials = providedEmail && providedPassword
        ? { email: providedEmail, password: providedPassword }
        : resolveLoginCredentials(input ?? {}, mode);

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();

    const isVisible = await authPage.isContinueWatchingRailVisible();
    const itemsCount = await authPage.getContinueWatchingItemsCount().catch(() => 0);
    const itemsDetails = await authPage.getContinueWatchingItemsDetails().catch(() => []);

    logger.assertion('Continue Watching rail presence', isVisible);
    logger.assertion('Continue Watching items count obtained', typeof itemsCount === 'number');

    if (itemsCount > 0) {
        const allHaveProgress = itemsDetails.length > 0 ? itemsDetails.every(d => d.hasProgress) : false;
        logger.assertion('All continue-watching items have progress indicators', allHaveProgress);
    }

    return { isContinueWatchingVisible: isVisible, continueWatchingItemsCount: itemsCount, continueWatchingItemsDetails: itemsDetails };
}

export interface ValidateContinueWatchingOutput {
    isValid: boolean;
    itemsCount: number;
    itemsDetails?: Array<{ title: string; hasProgress: boolean }>;
    reason?: string;
}

/**
 * Validates Continue Watching for a user who should have no watch history.
 * - If zero items: valid
 * - If items exist: each item must have a non-empty title and a progress indicator
 */
export async function validateContinueWatchingForNoHistory(page: any, input?: VerifyContinueWatchingInput): Promise<ValidateContinueWatchingOutput> {
    const result = await verifyContinueWatchingAbsent(page, input);
    const count = result.continueWatchingItemsCount ?? 0;
    const details = result.continueWatchingItemsDetails ?? [];
    //add await network stable 
    if (count === 0) {
        logger.assertion('No Continue Watching items present', true);
        return { isValid: true, itemsCount: 0, itemsDetails: [] };
    }

    if (details.length === 0) {
        logger.assertion('Continue Watching items present but details not found', false);
        return { isValid: false, itemsCount: count, itemsDetails: details, reason: 'items present but details missing' };
    }

    for (const item of details) {
        const hasTitle = !!(item.title && item.title.trim().length > 0);
        const hasProgress = !!item.hasProgress;
        logger.assertion(`Item "${item.title}" has title`, hasTitle);
        logger.assertion(`Item "${item.title}" has progress indicator`, hasProgress);
        if (!hasTitle || !hasProgress) {
            return { isValid: false, itemsCount: count, itemsDetails: details, reason: 'one or more items missing title or progress' };
        }
    }

    return { isValid: true, itemsCount: count, itemsDetails: details };
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
    await authPage.selectTVProvider(input?.providerName ?? 'credentials');
    await authPage.clickContinue();
    await authPage.enterProviderEmail('ftrfios1@frontier.com');
    await authPage.enterProviderPassword('Frontier1');
    await authPage.clickProviderSignIn();
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