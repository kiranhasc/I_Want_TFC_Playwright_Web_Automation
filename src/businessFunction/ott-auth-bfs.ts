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

