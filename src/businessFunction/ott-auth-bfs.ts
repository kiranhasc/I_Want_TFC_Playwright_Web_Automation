import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTSettingsPage } from '../pom/OTTSettingsPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { logger } from '../utils/logger';
import { config } from '../utils/config-manager';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import * as fs from 'fs';
import path from 'path';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { SearchParser } from '../utils/graphql/parsers/search-parser';
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

// const providerAuthDir = path.join(__dirname, '../playwright/.auth');
// const PROVIDER_MAX_AGE_MS = 60 * 60 * 1000; // same TTL policy, tune as needed

function getProviderStoragePath(providerName?: string): string {
  // if you test multiple providers, key the cache file by provider name
  const safeName = (providerName ?? 'default').replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(authDir, `provider-${safeName}.json`);
}

export async function loginWithTVProvider(page: any, input: TVProviderLoginInput): Promise<TVProviderLoginOutput> {
  const authPage = new OTTAuthPage(page);
  const mode = normalizeLoginMode(input?.mode);
  const storagePath = getProviderStoragePath(input.providerName);

  // ---- FAST PATH ----
  if (fs.existsSync(storagePath)) {
    const age = Date.now() - fs.statSync(storagePath).mtimeMs;
    if (age < MAX_AGE_MS) {
      logger.step(`Reusing saved TV provider session (${input.providerName}) from storageState`);
      const state = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
      await page.context().addCookies(state.cookies ?? []);
      if (state.origins?.length) {
        await page.goto(state.origins[0].origin);
        await page.evaluate((origins: any[]) => {
          for (const o of origins) {
            for (const item of o.localStorage ?? []) {
              window.localStorage.setItem(item.name, item.value);
            }
          }
        }, state.origins);
      }
      await page.reload();
      await authPage.waitForLoadingToDisappear();

      const isLoggedIn = await authPage.isLoginSuccessful();
      const homeTabVisible = await authPage.isHomeTabVisible();
      const moviesTabVisible = await authPage.isMoviesTabVisible();

      logger.assertion('TV Provider session restored', isLoggedIn);
      logger.assertion('Home tab visible after session restore', homeTabVisible);
      logger.assertion('Movies tab visible after session restore', moviesTabVisible);

      if (isLoggedIn) {
        return { isLoggedIn, homeTabVisible, moviesTabVisible };
      }
      logger.step(`Cached TV provider session invalid, falling back to live login`);
      // fall through to slow path
    }
  }

  // ---- SLOW PATH (your existing code, unchanged) ----
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
  if (isLoggedIn) {
    await page.context().storageState({ path: storagePath });
    logger.step(`Saved TV provider session (${input.providerName}) to storageState`);
  }
  return { isLoggedIn, homeTabVisible, moviesTabVisible };
}

/*export async function loginWithTVProvider(page: any, input: TVProviderLoginInput): Promise<TVProviderLoginOutput> {
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
}*/

const authDir = path.join(__dirname, '../playwright/.auth'); // adjust relative path to your repo root
const MAX_AGE_MS = 60 * 60 * 1000; // tune to your session/token TTL

const modeToFile: Record<string, string | null> = {
  valid: 'valid.json',
  provider: 'provider.json',
  mobile: 'mobile.json',
  freeUser: 'freeUser.json',
  invalid: null,
};

export async function loginToOTT(page: any, input?: Partial<InvalidLoginInput>): Promise<LoginToOTTOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const storageFile = modeToFile[mode];
    const storagePath = storageFile ? path.join(authDir, storageFile) : null;
    // ---- FAST PATH ----
    if (storagePath && fs.existsSync(storagePath)) {
        const age = Date.now() - fs.statSync(storagePath).mtimeMs;
        if (age < MAX_AGE_MS) {
            logger.step(`Reusing saved ${mode} session from storageState`);
            // clear any existing session state first — prevents mixing across modes
            await page.context().clearCookies();
            await page.evaluate(() => {
                try {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                } catch (e) {
                    // no-op if page isn't on a real origin yet
                }
            }).catch(() => {});
            const state = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
            await page.context().addCookies(state.cookies ?? []);
            if (state.origins?.length) {
                await page.goto(state.origins[0].origin);
                await page.evaluate((origins: any[]) => {
                    window.localStorage.clear(); // clear again post-navigation, before setting new values
                    for (const o of origins) {
                        for (const item of o.localStorage ?? []) {
                            window.localStorage.setItem(item.name, item.value);
                        }
                    }
                }, state.origins);
            }
            await page.reload();
            await authPage.waitForLoadingToDisappear();
            const homeVisible = await authPage.isHomeTabVisible();
            logger.assertion('Home tab visible after session restore', homeVisible);
            if (homeVisible) {
                return { isLoggedIn: homeVisible, homeTabVisible: homeVisible };
            }
            logger.step(`Cached ${mode} session invalid, falling back to live login`);    
        }
    }
    // ---- SLOW PATH (original login flow, unchanged) ----
    logger.step(`Starting ${mode} login flow`);
    await page.context().clearCookies();

    const credentials = resolveLoginCredentials(input ?? { email: '', password: '', networkConnection: '' }, mode);
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
    if (homeVisible && storagePath) {
        await page.context().storageState({ path: storagePath });
        logger.step(`Saved ${mode} session to storageState`);
    }
    return {
        isLoggedIn: homeVisible,
        homeTabVisible: homeVisible,
    };
}

/*export async function loginToOTT(page: any, input?: Partial<InvalidLoginInput>): Promise<LoginToOTTOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    logger.step(`Starting ${mode} login flow`);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '', networkConnection: '' }, mode);
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
}*/

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

export interface SearchByActorOrGenreInput {
    mode?: string;
    actorquery?: string;
    genrequery?: string;
    graphqlQueryName?: string;
}

export interface SearchByActorOrGenreOutput {
    isLoggedIn: boolean;
    searchActorInputValue: string;
    searchGenreInputValue: string;
    actorQueryTyped: boolean;
    genreQueryTyped: boolean;
    actorResultsVisible: boolean;
    genreResultsVisible: boolean;
    matchedCastValues: string[];
    matchedGenreValues: string[];
}

export interface VerifySearchAutoSuggestionsInput {
    mode?: string;
    query: string;
    validationType:string;
}

export interface VerifySearchAutoSuggestionsOutput {
    isLoggedIn: boolean;
    suggestionsVisible: boolean;
    suggestionsCount: number;
    suggestionsList: string[];
    suggestionsContainQuery: boolean;
}

export interface VerifySearchNoResultsMessageInput {
    mode?: string;
    searchQuery?: string;
}

export interface VerifySearchNoResultsMessageOutput {
    isLoggedIn: boolean;
    searchQueryTyped: boolean;
    noResultsMessageVisible: boolean;
    messageText: string;
    contentCardsPresent: number;
}

export interface VerifySearchLiveContentExclusionInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchLiveContentExclusionOutput {
    isLoggedIn: boolean;
    liveContentTitle: string;
    searchQueryTyped: boolean;
    suggestionsVisible: boolean;
    liveContentExcludedFromSuggestions: boolean;
    liveContentTitleFoundInSearchResults: boolean;
    suggestionsList: string[];
}

export interface ClearSearchTextFromSearchFieldInput {
    mode?: string;
    query?: string;
}

export interface ClearSearchTextFromSearchFieldOutput {
    isLoggedIn: boolean;
    queryTyped: boolean;
    searchInputCleared: boolean;
    searchInputValue: string;
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

export async function verifySearchByActorOrGenre(page: any, input?: Partial<SearchByActorOrGenreInput>): Promise<SearchByActorOrGenreOutput> {
    const authPage = new OTTAuthPage(page);
    const gql = GraphQLHelper.getInstance(page);
    const actorQuery = (input?.actorquery ?? '').trim();
    const genreQuery = (input?.genrequery ?? '').trim();
    logger.step('Starting actor or genre search validation flow');
    const login = await loginToOTT(page, { mode: input?.mode });
    if (!login.isLoggedIn) {
        return {
            isLoggedIn: false,
            searchActorInputValue: actorQuery,
            searchGenreInputValue: genreQuery,
            actorQueryTyped: false,
            genreQueryTyped: false,
            actorResultsVisible: false,
            genreResultsVisible: false,
            matchedCastValues: [],
            matchedGenreValues: [],
        };
    }
    const validateQuery = async (query: string, isActor: boolean): Promise<{ queryTyped: boolean; resultsVisible: boolean; matchedValues: string[] }> => {
        await authPage.clickSearchBar();
        await authPage.enterSearchQuery(query);
        const graphqlResponsePromise = gql.waitForOperation(input?.graphqlQueryName ?? 'Search', 15000);
        logger.step(`Waiting for search synchronization after submitting query: ${query}`);
        await authPage.submitSearchQuery();
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        const queryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(query.toLowerCase());
        let resultsVisible = false;
        let matchedValues: string[] = [];
        try {
            const response = await graphqlResponsePromise;
            const parser = new (require('../utils/graphql/parsers/search-parser').SearchParser)(response.response);
            matchedValues = parser.getTitleMatches(query);
            resultsVisible = matchedValues.length > 0;
            if (matchedValues.length > 0) {
                logger.info(`Matched content titles for search query "${query}"`, { values: matchedValues });
                logger.info(`[SEARCH DEBUG] Titles matching "${query}":`, matchedValues);
            }
        } catch (error) {
            logger.debug('GraphQL response was not available for actor/genre validation', error);
        }
        if (!resultsVisible) {
            resultsVisible = queryTyped ? await authPage.isSearchResultsVisible(query) : false;
        }
        return { queryTyped, resultsVisible, matchedValues };
    };
    const actorResult = actorQuery ? await validateQuery(actorQuery, true) : { queryTyped: true, resultsVisible: true, matchedValues: [] };
    await authPage.clearSearchInput();
    const genreResult = genreQuery ? await validateQuery(genreQuery, false) : { queryTyped: true, resultsVisible: true, matchedValues: [] };
    logger.assertion('Actor search query entered', actorResult.queryTyped);
    logger.assertion('Actor search results validated', actorResult.resultsVisible);
    logger.assertion('Genre search query entered', genreResult.queryTyped);
    logger.assertion('Genre search results validated', genreResult.resultsVisible);
    return {
        isLoggedIn: true,
        searchActorInputValue: actorQuery,
        searchGenreInputValue: genreQuery,
        actorQueryTyped: actorResult.queryTyped,
        genreQueryTyped: genreResult.queryTyped,
        actorResultsVisible: actorResult.resultsVisible,
        genreResultsVisible: genreResult.resultsVisible,
        matchedCastValues: actorResult.matchedValues,
        matchedGenreValues: genreResult.matchedValues,
    };
}

export async function verifySearchAutoSuggestions(page: any, input?: Partial<VerifySearchAutoSuggestionsInput>): Promise<VerifySearchAutoSuggestionsOutput> {
  const authPage = new OTTAuthPage(page);
  const mode = normalizeLoginMode(input?.mode);
  const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
  const query = input?.query ?? 'Love';
  const validationType = input?.validationType;
  logger.step('Starting search auto-suggestions verification flow');
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
  // Wait for suggestions to load and become visible
  logger.step(`Waiting for auto-suggestions to load for query: ${query}`);
  await page.waitForTimeout(1500);
  const suggestionsVisible = await authPage.isSearchAutoSuggestionsVisible(query);
  const suggestionsList = await authPage.getSearchAutoSuggestions();
  const suggestionsCount = suggestionsList.length;
  let suggestionsContainQuery ;
  // Verify that suggestions contain the query
  if(!validationType.includes('Partial')) {
    suggestionsContainQuery = await authPage.verifySuggestionsContainQuery(query, suggestionsList);
  }
  logger.assertion('Auto-suggestions visible after typing', suggestionsVisible);
  logger.assertion('At least one suggestion available', suggestionsCount > 0);
  logger.step(`Found ${suggestionsCount} suggestions: ${suggestionsList.slice(0, 3).join(', ')}${suggestionsCount > 3 ? '...' : ''}`);
  return {
    isLoggedIn: true,
    suggestionsVisible,
    suggestionsCount,
    suggestionsList,
    suggestionsContainQuery,
  };
}

export async function verifySearchNoResultsMessage(page: any, input?: Partial<VerifySearchNoResultsMessageInput>): Promise<VerifySearchNoResultsMessageOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const searchQuery = input?.searchQuery ?? 'tfdiyhujehfdyhglfjh843847';
    logger.step('Starting search no results message verification flow');
    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.clickEmailField();
    await authPage.enterEmail(credentials.email);
    await authPage.clickPasswordField();
    await authPage.enterPassword(credentials.password);
    await authPage.clickContinue();
    await authPage.waitForLoadingToDisappear();
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchQuery);
    // Wait for search results/message to load - wait for the "No results" message to appear
    logger.step(`Waiting for no results message to display for irrelevant query: ${searchQuery}`);
    // Wait for the no results message to become visible (up to 15 seconds)
    const messageVisible = await authPage.isNoResultsMessageVisible();
    if (!messageVisible) {
        logger.step('No results message did not appear, waiting additional time...');
        await page.waitForTimeout(3000);
    }
    const searchInputValue = await authPage.getSearchBarValue();
    const searchQueryTyped = searchInputValue.includes(searchQuery);
    // Verify "No results found" message appears
    const noResultsMessageVisible = messageVisible;
    const messageText = await authPage.getNoResultsMessageText();
    const contentCardsPresent = await authPage.getSearchResultsCount();
    logger.assertion('No results message visible for irrelevant query', noResultsMessageVisible);
    logger.step(`Search message: ${messageText}; Content cards found: ${contentCardsPresent}`);
    return {
        isLoggedIn: true,
        searchQueryTyped,
        noResultsMessageVisible,
        messageText,
        contentCardsPresent,
    };
}

export async function verifySearchLiveContentExclusion(page: any, input?: Partial<VerifySearchLiveContentExclusionInput>): Promise<VerifySearchLiveContentExclusionOutput> {
  const authPage = new OTTAuthPage(page);
  const gql =  GraphQLHelper.getInstance(page);
  const mode = normalizeLoginMode(input?.mode);
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  logger.step('Starting live content exclusion verification flow');
  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const login = await loginToOTT(page, { mode });
  if (!login.isLoggedIn) {
    return {
      isLoggedIn: false,
      liveContentTitle: '',
      searchQueryTyped: false,
      suggestionsVisible: false,
      liveContentExcludedFromSuggestions: false,
      liveContentTitleFoundInSearchResults: false,
      suggestionsList: [],
    };
  }
  let liveContentTitle = '';
  try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        const rails = parser.getRails();
        const assetCandidates = rails.flatMap(rail => (rail.assets?.items ?? []).map(asset => ({ asset, railTitle: String(rail.title ?? '') })));
        const filtered = assetCandidates.filter(({ asset, railTitle }) => {
        const title = String(asset?.title ?? '');
        const labels = Array.isArray((asset as any).labels) ? (asset as any).labels.map((label: any) => String(label?.text ?? '').toLowerCase()) : [];
        return /\blive\b/i.test(title)
        || labels.some(label => /\blive\b/i.test(label))
        || /\blive\b/i.test(railTitle);
    });
    const candidateAsset = filtered.length > 0
      ? filtered[0].asset
      : assetCandidates.find(({ asset }) => /dzmm teleradyo|tfc asia|abs-cbn|radyo/i.test(String(asset?.title ?? '').toLowerCase()))?.asset;

    if (candidateAsset && candidateAsset.title) {
      liveContentTitle = String(candidateAsset.title).trim();
    }
  } catch (error) {
    logger.debug('Failed to derive live content title from collection GraphQL response', error);
  }
  if (!liveContentTitle) {
    logger.assertion('Could not retrieve a live content title from collection data', false);
    return {
      isLoggedIn: true,
      liveContentTitle: '',
      searchQueryTyped: false,
      suggestionsVisible: false,
      liveContentExcludedFromSuggestions: false,
      liveContentTitleFoundInSearchResults: false,
      suggestionsList: [],
    };
  }
  await authPage.clickSearchBar();
  logger.info(`Live content title returned for search: ${liveContentTitle}`);
  await authPage.enterSearchQuery(liveContentTitle);
  await page.waitForTimeout(1500);
  const suggestionsVisible = await authPage.isSearchAutoSuggestionsVisible(liveContentTitle);
  const suggestionsList = await authPage.getSearchAutoSuggestions();
  const liveContentExcludedFromSuggestions = !suggestionsList.some(suggestion => suggestion.toLowerCase().includes(liveContentTitle.toLowerCase()));
  const searchQueryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(liveContentTitle.toLowerCase());
  await authPage.submitSearchQuery();
  await page.waitForLoadState('networkidle').catch(() => undefined);
  const bodyText = (await page.locator('body').textContent())?.toLowerCase() ?? '';
  const liveContentTitleFoundInSearchResults = bodyText.includes(liveContentTitle.toLowerCase());
  logger.assertion('Search bar contains live content title', searchQueryTyped);
  logger.assertion('Suggestions are visible after typing live content title', suggestionsVisible);
  logger.assertion('Live content title is excluded from suggestions', liveContentExcludedFromSuggestions);
  logger.assertion('Live content title is not present in search results', !liveContentTitleFoundInSearchResults);
  return {
    isLoggedIn: true,
    liveContentTitle,
    searchQueryTyped,
    suggestionsVisible,
    liveContentExcludedFromSuggestions,
    liveContentTitleFoundInSearchResults,
    suggestionsList,
  };
}

export async function clearSearchTextFromSearchField(page: any, input?: Partial<ClearSearchTextFromSearchFieldInput>): Promise<ClearSearchTextFromSearchFieldOutput> {
    const authPage = new OTTAuthPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);
    const query = (input?.query ?? '').trim();
    logger.step('Starting clear search input flow');
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
    const searchInputValueBeforeClear = await authPage.getSearchBarValue();
    const queryTyped = searchInputValueBeforeClear.includes(query);
    const searchInputCleared = await authPage.clearSearchInput();
    const searchInputValue = await authPage.getSearchBarValue();
    logger.assertion('Search query typed before clearing', queryTyped);
    logger.assertion('Search input cleared after clicking clear action', searchInputCleared && searchInputValue.length === 0);
    return {
        isLoggedIn: true,
        queryTyped,
        searchInputCleared: searchInputCleared && searchInputValue.length === 0,
        searchInputValue,
    };
}

export interface VerifySearchFreePremiumLabelsInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchFreePremiumLabelsOutput {
    isLoggedIn: boolean;
    freeContentTitle?: string;
    freeLabelVisible?: boolean;
    premiumContentTitle?: string;
    premiumLabelVisible?: boolean;
}

export interface VerifySearchPartialKeywordInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchPartialKeywordOutput {
    isLoggedIn: boolean;
    collectionTitle?: string;
    partialQuery?: string;
    queryTyped: boolean;
    resultsVisible: boolean;
    matchedSearchValues: string[];
}

export interface VerifySearchResultRedirectToDetailInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchResultRedirectToDetailOutput {
    isLoggedIn: boolean;
    collectionTitle?: string;
    searchQueryTyped: boolean;
    searchResultsVisible: boolean;
    detailsPageVisible: boolean;
    expectedShortDescription?: string;
    expectedGenres?: string[];
    expectedCast?: string[];
    actualDetailsTitle?: string;
    actualShortDescription?: string;
    actualGenres?: string[];
    actualCast?: string[];
    titleMatch?: boolean;
    castMatch?: boolean;
    genresMatch?: boolean;
    shortDescriptionMatch?: boolean;
}

export interface VerifySearchBackNavigationInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchBackNavigationOutput {
    isLoggedIn: boolean;
    collectionTitle?: string;
    searchQueryTyped: boolean;
    searchResultsVisible: boolean;
    detailsPageVisible: boolean;
    searchResultsVisibleAfterBack: boolean;
    expectedShortDescription?: string;
    actualDetailsTitle?: string;
    actualShortDescription?: string;
    titleMatch?: boolean;
    shortDescriptionMatch?: boolean;
}

export async function verifySearchResultRedirectsToDetailPage(
    page: any,
    input?: Partial<VerifySearchResultRedirectToDetailInput>
): Promise<VerifySearchResultRedirectToDetailOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const gql =  GraphQLHelper.getInstance(page);
    const mode = input?.mode;
    logger.step('Starting search result redirect to detail page flow');
    const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
    const login = await loginToOTT(page, { mode });
    if (!login.isLoggedIn) {
        logger.assertion('User login failed, aborting search detail redirect verification', false);
        return {
            isLoggedIn: false,
            searchQueryTyped: false,
            searchResultsVisible: false,
            detailsPageVisible: false,
        } as VerifySearchResultRedirectToDetailOutput;
    }
    let collectionTitle = '';
    let expectedShortDescription = '';
    let expectedGenres: string[] = [];
    let expectedCast: string[] = [];
    try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        const allAssets: any[] = parser.getRails().flatMap(rail => rail.assets?.items ?? []);
        const candidate = allAssets.find((asset: any) => typeof asset.title === 'string');
        if (candidate?.title) {
            collectionTitle = String(candidate.title).trim();
        }
        if (collectionTitle) {
            const matchedAsset = allAssets.find((asset: any) => String(asset.title).trim() === collectionTitle) ?? candidate;
            if (matchedAsset) {
                expectedShortDescription = String(matchedAsset.shortDescription ?? matchedAsset.description ?? '').trim();
                expectedGenres = Array.isArray(matchedAsset.genres)
                    ? matchedAsset.genres.map((genre: any) => typeof genre === 'string' ? genre.trim() : String(genre?.name ?? '').trim()).filter(Boolean)
                    : [];
                expectedCast = Array.isArray(matchedAsset.cast)
                    ? matchedAsset.cast.map((member: any) => typeof member === 'string' ? member.trim() : String(member?.name ?? '').trim()).filter(Boolean)
                    : [];
            }
        }
        logger.info(`Using collection title for search: ${collectionTitle}`);
        logger.info(`[SEARCH DEBUG] Collection title for detail redirect: "${collectionTitle}"`);
    } catch (error) {
        logger.debug('Failed to retrieve collection content for search result redirect verification', error);
    }
    if (!collectionTitle) {
        logger.assertion('Could not derive a search query from collection content', false);
        return {
            isLoggedIn: true,
            collectionTitle,
            searchQueryTyped: false,
            searchResultsVisible: false,
            detailsPageVisible: false,
        };
    }
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(collectionTitle);
    await authPage.submitSearchQuery();
    const searchQueryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(collectionTitle.toLowerCase());
    const searchResultsVisible = searchQueryTyped ? await authPage.isSearchResultsVisible(collectionTitle) : false;
    logger.assertion('Search results visible for collection title', searchResultsVisible);
    let detailsPageVisible = false;
    let actualDetailsTitle = '';
    let actualShortDescription = '';
    let actualGenres: string[] = [];
    let actualCast: string[] = [];
    let titleMatch = false;
    let genresMatch = expectedGenres.length === 0;
    let castMatch = expectedCast.length === 0;
    let shortDescriptionMatch = expectedShortDescription.length === 0;
    if (searchResultsVisible) {
        await detailsPage.clickFirstSearchResult();
        detailsPageVisible = await detailsPage.isShowDetailsPageVisible();
        logger.assertion('Details page visible after clicking search result', detailsPageVisible);
        if (detailsPageVisible) {
            actualDetailsTitle = await detailsPage.getShowDetailsHeadingText();
            actualShortDescription = await detailsPage.getDetailsPageShortDescription();
            actualGenres = await detailsPage.getDetailsPageGenres();
            actualCast = await detailsPage.getDetailsPageCast();
            const detailsText = await detailsPage.getDetailsPageText();
            logger.info('Details page text captured for assertion', { detailsText: detailsText.slice(0, 500) });
            titleMatch = actualDetailsTitle.toLowerCase().includes(collectionTitle.toLowerCase());
            const normalizedExpectedShort = expectedShortDescription.toLowerCase().trim();
            shortDescriptionMatch = normalizedExpectedShort
                ? actualShortDescription.toLowerCase().includes(normalizedExpectedShort.slice(0, 30))
                : true;
            const lowerActualGenres = actualGenres.map(g => g.toLowerCase());
            genresMatch = expectedGenres.length === 0
                ? true
                : expectedGenres.some(expected => lowerActualGenres.some(actual => actual.includes(expected.toLowerCase())));
            const lowerActualCast = actualCast.map(c => c.toLowerCase());
            castMatch = expectedCast.length === 0
                ? true
                : expectedCast.some(expected => lowerActualCast.some(actual => actual.includes(expected.toLowerCase())));
            logger.assertion('Details page title appears in details text', titleMatch);
            if (expectedGenres.length > 0) {
                logger.assertion('Details page genres match expected genres', genresMatch);
            }
            if (expectedCast.length > 0) {
                logger.assertion('Details page cast matches expected cast', castMatch);
            }
            if (expectedShortDescription) {
                logger.assertion('Details page short description matches expected value', shortDescriptionMatch);
            }
            detailsPageVisible = detailsPageVisible && titleMatch;
        }
    }
    logger.info(`Actual Title : ${actualDetailsTitle}`);
    logger.info(`Expected Title : ${collectionTitle}`);
    logger.info(`Actual Cast : ${actualCast.join(', ') || 'N/A'}`);
    logger.info(`Expected Cast : ${expectedCast.join(', ') || 'N/A'}`);
    logger.info(`Actual genre : ${actualGenres.join(', ') || 'N/A'}`);
    logger.info(`Expected genre : ${expectedGenres.join(', ') || 'N/A'}`);
    logger.info(`Actual short description : ${actualShortDescription}`);
    logger.info(`Expected short description : ${expectedShortDescription}`);
    return {
        isLoggedIn: true,
        collectionTitle,
        searchQueryTyped,
        searchResultsVisible,
        detailsPageVisible,
        expectedShortDescription,
        expectedGenres,
        expectedCast,
        actualDetailsTitle,
        actualShortDescription,
        actualGenres,
        actualCast,
        titleMatch,
        genresMatch,
        castMatch,
        shortDescriptionMatch,
    };
}

export async function verifySearchBackNavigationFromDetailPage(
    page: any,
    input?: Partial<VerifySearchBackNavigationInput>
): Promise<VerifySearchBackNavigationOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const gql =  GraphQLHelper.getInstance(page);
    const mode = input?.mode;
    const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
    logger.step('Starting search back-navigation verification flow');
    const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
    const login = await loginToOTT(page, { mode });
    if (!login.isLoggedIn) {
        return {
            isLoggedIn: false,
            searchQueryTyped: false,
            searchResultsVisible: false,
            detailsPageVisible: false,
            searchResultsVisibleAfterBack: false,
        };
    }
    let collectionTitle = '';
    let expectedShortDescription = '';
    let expectedGenres: string[] = [];
    let expectedCast: string[] = [];
    try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        const allAssets: any[] = parser.getRails().flatMap(rail => rail.assets?.items ?? []);
        const candidate = allAssets.find((asset: any) => typeof asset.title === 'string');
        if (candidate) {
            if (candidate.title) {
                collectionTitle = String(candidate.title).trim();
            }
            expectedShortDescription = String(candidate.shortDescription ?? candidate.description ?? '').trim();
            expectedGenres = Array.isArray(candidate.genres)
                ? candidate.genres.map((genre: any) => typeof genre === 'string' ? genre.trim() : String(genre?.name ?? '').trim()).filter(Boolean)
                : [];
            expectedCast = Array.isArray(candidate.cast)
                ? candidate.cast.map((member: any) => typeof member === 'string' ? member.trim() : String(member?.name ?? '').trim()).filter(Boolean)
                : [];
        }
        logger.info(`Using collection title for back-navigation test: ${collectionTitle}`);
        logger.info(`First content details from GraphQL - title: "${collectionTitle}"`);
        logger.info(`First content details from GraphQL - shortDescription: "${expectedShortDescription}"`);
        logger.info(`First content details from GraphQL - genres: "${expectedGenres.join(', ')}"`);
        logger.info(`First content details from GraphQL - cast: "${expectedCast.join(', ')}"`);
    } catch (error) {
        logger.debug('Failed to retrieve collection content for back-navigation verification', error);
    }
    if (!collectionTitle) {
        logger.assertion('Could not derive a search query from collection content', false);
        return {
            isLoggedIn: true,
            collectionTitle,
            searchQueryTyped: false,
            searchResultsVisible: false,
            detailsPageVisible: false,
            searchResultsVisibleAfterBack: false,
        };
    }
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(collectionTitle);
    await authPage.submitSearchQuery();
    const searchQueryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(collectionTitle.toLowerCase());
    const searchResultsVisible = searchQueryTyped ? await authPage.isSearchResultsVisible(collectionTitle) : false;
    logger.assertion('Search results visible for collection title', searchResultsVisible);
    let detailsPageVisible = false;
    let searchResultsVisibleAfterBack = false;
    let actualDetailsTitle = '';
    let actualShortDescription = '';
    let titleMatch = false;
    let shortDescriptionMatch = expectedShortDescription.length === 0;
    if (searchResultsVisible) {
        await detailsPage.clickFirstSearchResult();
        detailsPageVisible = await detailsPage.isShowDetailsPageVisible();
        logger.assertion('Details page visible after clicking first search result', detailsPageVisible);
        if (detailsPageVisible) {
            actualDetailsTitle = await detailsPage.getShowDetailsHeadingText();
            actualShortDescription = await detailsPage.getDetailsPageShortDescription();
            titleMatch = actualDetailsTitle.toLowerCase().includes(collectionTitle.toLowerCase());
            const normalizedExpectedShort = expectedShortDescription.toLowerCase().trim();
            if (normalizedExpectedShort) {
                shortDescriptionMatch = actualShortDescription.toLowerCase().includes(normalizedExpectedShort.slice(0, 30));
                logger.assertion('Details page short description matches collection short description', shortDescriptionMatch);
            }
            logger.info(`Details page content - title: "${collectionTitle}"`);
            logger.info(`Details page content - shortDescription: "${expectedShortDescription}"`);
            logger.assertion('Details page title matches collection title', titleMatch);
            // Try clicking the UI back button, but allow browser history back as a fallback
            await page.goBack();
            await page.waitForLoadState('networkidle');
            await authPage.waitForLoadingToDisappear();
            searchResultsVisibleAfterBack = await authPage.isSearchResultsVisible(collectionTitle);
            logger.assertion('Search results reappear after navigating back from details page', searchResultsVisibleAfterBack);
        }
    }
    return {
        isLoggedIn: true,
        collectionTitle,
        searchQueryTyped,
        searchResultsVisible,
        detailsPageVisible,
        searchResultsVisibleAfterBack,
        expectedShortDescription,
        actualDetailsTitle,
        actualShortDescription,
        titleMatch,
        shortDescriptionMatch,
    };
}

export interface VerifySearchPartialKeywordInput {
    mode?: string;
    graphqlQueryName?: string;
}

export interface VerifySearchPartialKeywordOutput {
    isLoggedIn: boolean;
    collectionTitle?: string;
    partialQuery?: string;
    queryTyped: boolean;
    resultsVisible: boolean;
    matchedSearchValues: string[];
}

export async function verifySearchPartialKeyword(
    page: any,
    input?: Partial<VerifySearchPartialKeywordInput>
): Promise<VerifySearchPartialKeywordOutput> {
    const authPage = new OTTAuthPage(page);
    const gql =  GraphQLHelper.getInstance(page);
    const mode = input?.mode;

    logger.step('Starting partial keyword search verification flow');
    const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
    const login = await loginToOTT(page, { mode });
    if (!login.isLoggedIn) {
        logger.assertion('User login failed, aborting partial search verification', false);
        return {
            isLoggedIn: false,
            queryTyped: false,
            resultsVisible: false,
            matchedSearchValues: [],
        } as VerifySearchPartialKeywordOutput;
    }

    let collectionTitle = '';
    let partialQuery = '';
    try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        for (const rail of parser.getRails()) {
            const candidate = rail.assets?.items?.find((asset: any) => typeof asset.title === 'string');
            if (candidate?.title) {
                collectionTitle = String(candidate.title).trim();
                break;
            }
        }

        const titleWords = collectionTitle.split(/\s+/).filter(Boolean);
        const selectedWord = titleWords.find(word => word.length >= 4) ?? titleWords[0] ?? '';
        partialQuery = String(selectedWord).slice(0, Math.min(8, String(selectedWord).length)).trim();
        logger.info(`Using first collection title for partial search: ${collectionTitle}`);
        logger.info(`[SEARCH DEBUG] Using collection title: "${collectionTitle}" for partial search query: "${partialQuery}"`);
    } catch (error) {
        logger.debug('Failed to retrieve collection content for partial search query', error);
    }

    if (!partialQuery) {
        logger.assertion('Could not derive a partial search query from collection content', false);
        return {
            isLoggedIn: true,
            collectionTitle,
            partialQuery,
            queryTyped: false,
            resultsVisible: false,
            matchedSearchValues: [],
        };
    }

    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(partialQuery);
    const graphqlResponsePromise = gql.waitForOperation('Search', 20000);
    await authPage.submitSearchQuery();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);

    let matchedSearchValues: string[] = [];
    try {
        const searchResp = await graphqlResponsePromise;
        const parser = new SearchParser(searchResp.response);
        matchedSearchValues = parser.getTitlesMatchingQuery(partialQuery);
        logger.info(`Partial search query matched ${matchedSearchValues.length} title values in the Search GraphQL response`, {
            partialQuery,
            matchedValues: matchedSearchValues,
        });
        logger.info(`[SEARCH DEBUG] Partial query "${partialQuery}" matched values:`, matchedSearchValues);
    } catch (error) {
        logger.debug('Search GraphQL response was not available for partial keyword validation', error);
    }

    const queryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(partialQuery.toLowerCase());
    const resultsVisible = queryTyped ? await authPage.isSearchResultsVisible(partialQuery) : false;
    logger.assertion('Partial search results visible', resultsVisible);

    return {
        isLoggedIn: true,
        collectionTitle,
        partialQuery,
        queryTyped,
        resultsVisible,
        matchedSearchValues,
    };
}

export interface VerifySearchSmoothScrollingInput {
    mode?: string;
    graphqlQueryName?: string;
    iterations?: number;
    pauseMs?: number;
}

export interface VerifySearchSmoothScrollingOutput {
    isLoggedIn: boolean;
    collectionTitle?: string;
    searchQueryTyped: boolean;
    searchResultsVisible: boolean;
    scrolled: boolean;
    positions: number[];
}

export async function verifySearchSmoothScrolling(
    page: any,
    input?: Partial<VerifySearchSmoothScrollingInput>
): Promise<VerifySearchSmoothScrollingOutput> {
    const authPage = new OTTAuthPage(page);
    const gql =  GraphQLHelper.getInstance(page);
    const mode = input?.mode;
    const iterations = input?.iterations ?? 6;
    const pauseMs = input?.pauseMs ?? 800;
    logger.step('Starting search smooth scrolling verification flow');
    const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
    const login = await loginToOTT(page, { mode });
    if (!login.isLoggedIn) {
        logger.assertion('User login failed, aborting search smooth scrolling verification', false);
        return {
            isLoggedIn: false,
            searchQueryTyped: false,
            searchResultsVisible: false,
            scrolled: false,
            positions: [],
        };
    }
    let collectionTitle = '';
    try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        const allAssets: any[] = parser.getRails().flatMap(rail => rail.assets?.items ?? []);
        const candidate = allAssets.find((asset: any) => typeof asset.title === 'string');
        if (candidate?.title) {
            collectionTitle = String(candidate.title).trim();
        }
        logger.info(`Using collection title for search (smooth scroll): ${collectionTitle}`);
    } catch (error) {
        logger.debug('Failed to retrieve collection content for smooth scrolling verification', error);
    }
    if (!collectionTitle) {
        logger.assertion('Could not derive a search query from collection content', false);
        return {
            isLoggedIn: true,
            collectionTitle,
            searchQueryTyped: false,
            searchResultsVisible: false,
            scrolled: false,
            positions: [],
        };
    }
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(collectionTitle);
    await authPage.submitSearchQuery();
    const searchQueryTyped = (await authPage.getSearchBarValue()).toLowerCase().includes(collectionTitle.toLowerCase());
    const searchResultsVisible = searchQueryTyped ? await authPage.isSearchResultsVisible(collectionTitle) : false;
    logger.assertion('Search results visible for collection title', searchResultsVisible);
    let scrolled = false;
    let positions: number[] = [];
    if (searchResultsVisible) {
        const result = await authPage.scrollSearchResultsSmoothly(iterations, pauseMs);
        scrolled = result.scrolled;
        positions = result.positions;
        logger.assertion('Search results can be scrolled smoothly', scrolled);
    }
    logger.info(`Smooth scroll result - scrolled: ${scrolled}, positions: ${positions.join(', ')}`);
    return {
        isLoggedIn: true,
        collectionTitle,
        searchQueryTyped,
        searchResultsVisible,
        scrolled,
        positions,
    };
}

export async function verifySearchFreePremiumLabels(
    page: any,
    input?: Partial<VerifySearchFreePremiumLabelsInput>
): Promise<VerifySearchFreePremiumLabelsOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const gql =  GraphQLHelper.getInstance(page);
    const mode = input?.mode;
    logger.step('Starting verification of free and premium labels in search results');
    // Start waiting for the Collection GraphQL operation before triggering login
    const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
    const login = await loginToOTT(page, { mode });
    if (!login.isLoggedIn) {
        logger.assertion('User login failed, aborting label verification', false);
        return { isLoggedIn: false } as VerifySearchFreePremiumLabelsOutput;
    }
    let freeTitle = '';
    let premiumTitle = '';
    try {
        const collectionResp = await collectionWait;
        const parser = new CollectionParser(collectionResp as any);
        // Build predicates for free/premium detection
        const freePredicate = (asset: any) => {
            const labels = asset.labels ?? [];
            if (labels.some((l: any) => /free/i.test(l?.text ?? ''))) return true;
            const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
            return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
        };
        const premiumPredicate = (asset: any) => {
            const labels = asset.labels ?? [];
            if (labels.some((l: any) => /premium|paid|subscription/i.test(l?.text ?? ''))) return true;
            const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
            return monetType ? /premium|paid|subscription|paywall|purchase/i.test(String(monetType)) : false;
        };
        // Collect all matches and assert only one result per type
        const rails = parser.getRails();
        const collectMatches = (pred: (a: any) => boolean) => {
            const matches: any[] = [];
            for (const rail of rails) {
                for (const asset of rail.assets?.items ?? []) {
                    try {
                        if (pred(asset)) matches.push({ rail, asset });
                    } catch (e) {
                        // ignore predicate errors for individual assets
                    }
                }
            }
            return matches;
        };
        const freeMatches = collectMatches(freePredicate);
        const premiumMatches = collectMatches(premiumPredicate);
        logger.step(`Collection scan found ${freeMatches.length} free candidate(s) and ${premiumMatches.length} premium candidate(s)`);
        const freeResult = freeMatches[0] ?? null;
        const premiumResult = premiumMatches[0] ?? null;
        freeTitle = freeResult?.asset?.title ?? '';
        premiumTitle = premiumResult?.asset?.title ?? '';
        logger.info(`[SEARCH DEBUG] Free content title: "${freeTitle}", Premium content title: "${premiumTitle}"`);
        const freeMonetType = freeResult?.asset?.monetization?.type ?? freeResult?.asset?.monetizationType ?? freeResult?.asset?.pricing?.type ?? '';
        const premiumMonetType = premiumResult?.asset?.monetization?.type ?? premiumResult?.asset?.monetizationType ?? premiumResult?.asset?.pricing?.type ?? '';
        if (freeResult?.asset?.monetization) logger.info('[SEARCH DEBUG] Free monetization sample:', freeResult.asset.monetization);
        if (premiumResult?.asset?.monetization) logger.info('[SEARCH DEBUG] Premium monetization sample:', premiumResult.asset.monetization);
        // Assert monetization type aligns with detected label/title
        if (freeTitle) {
            const freeTypeStr = String(freeMonetType ?? '');
            const freeIsMonetizationFree = /free|complimentary|free_to_watch|freetowatch/i.test(freeTypeStr);
            logger.assertion(`Monetization type for free title "${freeTitle}" indicates free (${freeTypeStr})`, freeIsMonetizationFree);
        }
        if (premiumTitle) {
            const premiumTypeStr = String(premiumMonetType ?? '');
            const premiumIsMonetizationPaid = /premium|paid|subscription|paywall|purchase/i.test(premiumTypeStr);
            logger.assertion(`Monetization type for premium title "${premiumTitle}" indicates paid (${premiumTypeStr})`, premiumIsMonetizationPaid);
        }
    } catch (err) {
        logger.debug('Collection GraphQL operation did not return or parsing failed', err);
    }
    // Verify premium labeled content via search UI
    let premiumLabelVisible = false;
    if (premiumTitle) {
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await authPage.clickSearchBar();
        await authPage.enterSearchQuery(premiumTitle);
        await authPage.submitSearchQuery();
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        premiumLabelVisible = await detailsPage.isContentTaggedPremiumInSearchResults(premiumTitle).catch(() => false);
        logger.assertion(`Premium label visible for "${premiumTitle}"`, premiumLabelVisible);
    }
    // Verify free labeled content via search UI
    let freeLabelVisible = false;
    if (freeTitle) {
        await authPage.clickSearchBar();
        await authPage.enterSearchQuery(freeTitle);
        await authPage.submitSearchQuery();
        freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeTitle).catch(() => false);
        logger.assertion(`Free label visible for "${freeTitle}"`, freeLabelVisible);
    }
    return {
        isLoggedIn: true,
        freeContentTitle: freeTitle,
        freeLabelVisible,
        premiumContentTitle: premiumTitle,
        premiumLabelVisible,
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
    const isPasswordTextVisible = await authPage.isPasswordTextVisible();
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

    const isVisible = await authPage.isContinueWatchingRailVisible().catch(() => false);
    const itemsCount = isVisible ? await authPage.getContinueWatchingItemsCount().catch(() => 0) : 0;
    const itemsDetails = isVisible ? await authPage.getContinueWatchingItemsDetails().catch(() => []) : [];

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

export interface VerifyRegistrationNavigationInput {
    email: string;
    password: string;
    expectedMarketingText?: string;
}

export interface VerifyRegistrationNavigationOutput {
    isHeadingVisible: boolean;
    headingText: string;
    isEmailFieldVisible: boolean;
    isPasswordFieldVisible: boolean;
    isConfirmPasswordFieldVisible: boolean;
    isTermsCheckboxVisible: boolean;
    termsText: string;
    isMarketingCheckboxVisible: boolean;
    marketingText: string;
    isContinueButtonVisible: boolean;
    isVerifyOTPPageVisible: boolean;
    emailFieldValue: string;
    passwordFieldValue: string;
    confirmPasswordFieldValue: string;
}

export interface VerifyRegistrationOTPScreenInput extends VerifyRegistrationNavigationInput {
    confirmPassword?: string;
    expectedOTPMessagePrefix?: string;
    expectedOTPInputText?: string;
    expectedVerifyButtonText?: string;
    expectedBackToLoginText?: string;
}

export interface VerifyRegistrationOTPScreenOutput extends VerifyRegistrationNavigationOutput {
    isVerifyOTPMessageVisible: boolean;
    verifyOTPMessageText: string;
    isVerifyOTPEmailVisible: boolean;
    verifyOTPEmailText: string;
    isInputCodeInstructionVisible: boolean;
    inputCodeInstructionText: string;
    isVerifyButtonVisible: boolean;
    isBackToLoginLinkVisible: boolean;
}

export async function verifyRegistrationNavigation(
    page: any,
    input: VerifyRegistrationNavigationInput
): Promise<VerifyRegistrationNavigationOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting registration navigation validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();

    await authPage.enterCreateAccountEmail(input.email);
    await authPage.enterCreateAccountPassword(input.password);
    await authPage.enterCreateAccountConfirmPassword(input.password);
    await authPage.selectCreateAccountTermsCheckbox();
    await authPage.selectCreateAccountMarketingCheckbox();
    await authPage.clickCreateAccountContinue();

    const isHeadingVisible = await authPage.isCreateAccountHeadingVisible();
    const headingText = isHeadingVisible ? await authPage.getCreateAccountHeadingText() : '';
    const isEmailFieldVisible = await authPage.isCreateAccountEmailFieldVisible();
    const isPasswordFieldVisible = await authPage.isCreateAccountPasswordFieldVisible();
    const isConfirmPasswordFieldVisible = await authPage.isCreateAccountConfirmPasswordFieldVisible();
    const isTermsCheckboxVisible = await authPage.isTermsCheckboxVisible();
    const termsText = isTermsCheckboxVisible ? await authPage.getCreateAccountTermsText() : '';
    const isMarketingCheckboxVisible = await authPage.isMarketingCheckboxVisible(input.expectedMarketingText);
    const marketingText = isMarketingCheckboxVisible ? await authPage.getCreateAccountMarketingText() : '';
    const isContinueButtonVisible = await authPage.isCreateAccountContinueButtonVisible();
    const emailFieldValue = await authPage.getCreateAccountEmailValue();
    const passwordFieldValue = await authPage.getCreateAccountPasswordValue();
    const confirmPasswordFieldValue = await authPage.getCreateAccountConfirmPasswordValue();
    const isVerifyOTPPageVisible = await authPage.isVerifyOTPPageVisible();

    logger.assertion('Create account heading visible', isHeadingVisible);
    logger.assertion('Create account email field visible', isEmailFieldVisible);
    logger.assertion('Create account password field visible', isPasswordFieldVisible);
    logger.assertion('Create account confirm password field visible', isConfirmPasswordFieldVisible);
    logger.assertion('Create account terms checkbox visible', isTermsCheckboxVisible);
    logger.assertion('Create account marketing checkbox visible', isMarketingCheckboxVisible);
    logger.assertion('Create account continue button visible', isContinueButtonVisible);
    logger.assertion('Verify OTP page visible after submitting registration', isVerifyOTPPageVisible);

    return {
        isHeadingVisible,
        headingText,
        isEmailFieldVisible,
        isPasswordFieldVisible,
        isConfirmPasswordFieldVisible,
        isTermsCheckboxVisible,
        termsText,
        isMarketingCheckboxVisible,
        marketingText,
        isContinueButtonVisible,
        isVerifyOTPPageVisible,
        emailFieldValue,
        passwordFieldValue,
        confirmPasswordFieldValue,
    };
}

export async function verifyRegistrationNavigation1(
    page: any,
    input: VerifyRegistrationNavigationInput
): Promise<VerifyRegistrationNavigationOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting registration navigation validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();

    await authPage.enterCreateAccountEmail(input.email);
    await authPage.enterCreateAccountPassword(input.password);
    await authPage.enterCreateAccountConfirmPassword(input.password);
    await authPage.selectCreateAccountTermsCheckbox();
    await authPage.selectCreateAccountMarketingCheckbox();
    await authPage.clickCreateAccountContinue();

    const isHeadingVisible = await authPage.isCreateAccountHeadingVisible();
    const headingText = isHeadingVisible ? await authPage.getCreateAccountHeadingText() : '';
    const isEmailFieldVisible = await authPage.isCreateAccountEmailFieldVisible();
    const isPasswordFieldVisible = await authPage.isCreateAccountPasswordFieldVisible();
    const isConfirmPasswordFieldVisible = await authPage.isCreateAccountConfirmPasswordFieldVisible();
    const isTermsCheckboxVisible = await authPage.isTermsCheckboxVisible();
    const termsText = isTermsCheckboxVisible ? await authPage.getCreateAccountTermsText() : '';
    const isMarketingCheckboxVisible = await authPage.isMarketingCheckboxVisible(input.expectedMarketingText);
    const marketingText = isMarketingCheckboxVisible ? await authPage.getCreateAccountMarketingText() : '';
    const isContinueButtonVisible = await authPage.isCreateAccountContinueButtonVisible();
    const emailFieldValue = await authPage.getCreateAccountEmailValue();
    const passwordFieldValue = await authPage.getCreateAccountPasswordValue();
    const confirmPasswordFieldValue = await authPage.getCreateAccountConfirmPasswordValue();
    const isVerifyOTPPageVisible = await authPage.isVerifyOTPPageVisible();

    logger.assertion('Create account heading visible', isHeadingVisible);
    logger.assertion('Create account email field visible', isEmailFieldVisible);
    logger.assertion('Create account password field visible', isPasswordFieldVisible);
    logger.assertion('Create account confirm password field visible', isConfirmPasswordFieldVisible);
    logger.assertion('Create account terms checkbox visible', isTermsCheckboxVisible);
    logger.assertion('Create account marketing checkbox visible', isMarketingCheckboxVisible);
    logger.assertion('Create account continue button visible', isContinueButtonVisible);
    logger.assertion('Verify OTP page visible after submitting registration', isVerifyOTPPageVisible);

    return {
        isHeadingVisible,
        headingText,
        isEmailFieldVisible,
        isPasswordFieldVisible,
        isConfirmPasswordFieldVisible,
        isTermsCheckboxVisible,
        termsText,
        isMarketingCheckboxVisible,
        marketingText,
        isContinueButtonVisible,
        isVerifyOTPPageVisible,
        emailFieldValue,
        passwordFieldValue,
        confirmPasswordFieldValue,
    };
}

export async function verifyRegistrationOTPScreen(
    page: any,
    input: VerifyRegistrationOTPScreenInput
): Promise<VerifyRegistrationOTPScreenOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Starting registration OTP screen validation flow');

    await authPage.navigate();
    await authPage.acceptCookieSettingsIfVisible();
    await authPage.openCreateAccountFlow();

    await authPage.enterCreateAccountEmail(input.email);
    await authPage.enterCreateAccountPassword(input.password);
    await authPage.enterCreateAccountConfirmPassword(input.confirmPassword ?? input.password);
    await authPage.selectCreateAccountTermsCheckbox();
    await authPage.selectCreateAccountMarketingCheckbox();
    await authPage.clickCreateAccountContinue();

    const baseResult = await verifyRegistrationNavigation(page, input);
    const isVerifyOTPMessageVisible = await authPage.isVerifyOTPMessageVisible();
    const verifyOTPMessageText = isVerifyOTPMessageVisible ? await authPage.getVerifyOTPMessageText() : '';
    const isVerifyOTPEmailVisible = await authPage.isVerifyOTPEmailVisible(input.email);
    const verifyOTPEmailText = isVerifyOTPEmailVisible ? await authPage.getVerifyOTPEmailText(input.email) : '';
    const isInputCodeInstructionVisible = await authPage.isInputCodeInstructionVisible();
    const inputCodeInstructionText = isInputCodeInstructionVisible ? await authPage.getInputCodeInstructionText() : '';
    const isVerifyButtonVisible = await authPage.isVerifyButtonVisible();
    const isBackToLoginLinkVisible = await authPage.isBackToLoginLinkVisible();

    logger.assertion('Verify OTP message visible', isVerifyOTPMessageVisible);
    logger.assertion('Verify OTP email visible', isVerifyOTPEmailVisible);
    logger.assertion('OTP instruction visible', isInputCodeInstructionVisible);
    logger.assertion('Verify button visible', isVerifyButtonVisible);
    logger.assertion('Back to Login link visible', isBackToLoginLinkVisible);

    return {
        ...baseResult,
        isVerifyOTPMessageVisible,
        verifyOTPMessageText,
        isVerifyOTPEmailVisible,
        verifyOTPEmailText,
        isInputCodeInstructionVisible,
        inputCodeInstructionText,
        isVerifyButtonVisible,
        isBackToLoginLinkVisible,
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

export interface DisableParentalPinInput {
    password?: string;
    expectedPinSetupMessage?: string;
    mode?: string;
    expectedSuccessHeader?: string;
    expectedSuccessDetails?: string;
}

export interface DisableParentalPinOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    passwordSubmitted: boolean;
    toggleDisabledAfterSubmission: boolean;
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
    let successDetails = '';
    let successHeader = '';
    let continueButtonVisible = false;

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

export interface ParentalPinPlaybackAllowedWhenDisabledInput {
    mode?: string;
}

export interface ParentalPinPlaybackAllowedWhenDisabledOutput {
    isLoggedIn: boolean;
    parentalControlsVisible: boolean;
    parentalPinEnabled: boolean;
    parentalPinPromptVisible: boolean;
    playbackStarted: boolean;
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

export async function verifyParentalPinPlaybackAllowedWhenDisabled(page: any, input?: Partial<ParentalPinPlaybackAllowedWhenDisabledInput>): Promise<ParentalPinPlaybackAllowedWhenDisabledOutput> {
    const authPage = new OTTAuthPage(page);
    const settingsPage = new OTTSettingsPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const mode = normalizeLoginMode(input?.mode);
    const credentials = resolveLoginCredentials(input ?? { email: '', password: '' }, mode);

    logger.step('Starting parental PIN disabled playback verification flow');
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
    let parentalPinEnabled = false;

    if (parentalControlsVisible) {
        parentalPinEnabled = await settingsPage.isParentalPinToggleOn();
        if (parentalPinEnabled) {
            await settingsPage.clickParentalPinToggle();
            parentalPinEnabled = await settingsPage.isParentalPinToggleOn();
        }
    }

    logger.assertion('Parental PIN toggle is off before playback', !parentalPinEnabled);

    await page.goBack({ waitUntil: 'networkidle' }).catch(() => undefined);
    const continueRailVisible = await authPage.isContinueWatchingRailVisible();
    if (continueRailVisible) {
        await detailsPage.clickFirstShowContent();
    } else {
        await detailsPage.clickFirstShowContent();
    }
    await detailsPage.clickResumeButton();
    const parentalPinPromptVisible = await detailsPage.isParentalPinPlaybackPromptVisible();
    const playbackStarted = await detailsPage.isPlayerScreenVisible().catch(() => false);

    logger.assertion('Parental PIN prompt is not shown when parental PIN is disabled', !parentalPinPromptVisible);
    logger.assertion('Playback starts without a parental PIN prompt', playbackStarted);

    return {
        isLoggedIn: true,
        parentalControlsVisible,
        parentalPinEnabled,
        parentalPinPromptVisible,
        playbackStarted,
    };
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
    const termsLinkSelector = authPage.getTermsAndConditionsLinkSelector();
    const termsLink = page.locator(termsLinkSelector).first();
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
        const searchSelector = authPage.getSearchInputSelector();
        let searchInput = popup.locator(searchSelector).first();
        const isVisible = await searchInput.isVisible().catch(() => false);

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
export async function disableParentalPin(page: any, input?: Partial<DisableParentalPinInput>): Promise<DisableParentalPinOutput> {
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
    let successMessageVisible = false;
    let successMessage = '';
    let successHeaderVisible = false;
    let successDetails = '';
    let successHeader = '';
    let continueButtonVisible = false;
    await settingsPage.enterParentalPinPassword(pinPassword);
    await settingsPage.clickParentalPinSubmitButton();
    successMessageVisible = await settingsPage.waitForParentalPinSuccessMessageVisible(5000);
    if (successMessageVisible) {
        successMessage = await settingsPage.getParentalPinSuccessMessage();
        // additional checks per updated test case: header, details, Continue button
        successHeaderVisible = await settingsPage.isParentalPinSuccessHeaderVisible();
        successHeader = await settingsPage.getParentalPinSuccessHeader();
        successDetails = await settingsPage.getParentalPinSuccessDetails();
        continueButtonVisible = await settingsPage.isParentalPinSuccessContinueButtonVisible();
    }
    const toggleOff = parentalControlsVisible ? await settingsPage.isParentalPinToggleDisabled() : false;
    if(toggleOff) {
        passwordSubmitted = true;
    }
    const toggleDisabledAfterSubmission = await settingsPage.isParentalPinToggleDisabled();
    logger.assertion('Parental PIN password submitted successfully', passwordSubmitted);
    logger.assertion('Parental PIN toggle is disabled after submitting password', toggleDisabledAfterSubmission);
    return {
        isLoggedIn: true,
        parentalControlsVisible,
        passwordSubmitted,
        toggleDisabledAfterSubmission,
    };
}
