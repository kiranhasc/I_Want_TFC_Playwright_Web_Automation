import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { logger } from '../utils/logger';

export interface ManageWatchlistItemInput {
  mode?: string;
  providerName?: string;
  searchTerm?: string;
}

export interface VerifyGuestWatchlistNavigationInput {
  expectedHeading?: string;
}

export interface VerifyGuestWatchlistNavigationOutput {
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export interface VerifyLiveContentWatchlistAbsenceInput {
  liveContentName: string;
  email?: string;
  password?: string;
}

export interface VerifyLiveContentWatchlistAbsenceOutput {
  isLiveChannelsTrayVisible: boolean;
  isLiveContentVisible: boolean;
  isAddToWatchlistButtonVisible: boolean;
}

export interface ManageWatchlistItemOutput {
  isAddedToWatchlist: boolean;
  addToastText: string;
  isRemovedFromWatchlist: boolean;
  removeToastText: string;
}

export async function verifyGuestWatchlistNavigationFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestWatchlistNavigationInput>
): Promise<VerifyGuestWatchlistNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting guest watchlist navigation validation flow');
  await authPage.navigate();
  await detailsPage.clickWatchlistIcon();
  const isLoginScreenVisible = await authPage.isWelcomeHeadingVisible();
  const headingText = isLoginScreenVisible ? await authPage.getWelcomeHeadingText() : '';
  const isEmailFieldVisible = await authPage.isEmailFieldVisible();
  const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();
  logger.assertion('Login screen visible after guest watchlist action', isLoginScreenVisible);
  return {
    isLoginScreenVisible,
    headingText,
    isEmailFieldVisible,
    isPasswordFieldVisible,
  };
}

export async function manageWatchlistItem(
  page: any,
  input?: Partial<ManageWatchlistItemInput>
): Promise<ManageWatchlistItemOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting watchlist management flow');

  await authPage.navigate();
  await authPage.acceptCookieSettingsIfVisible();
  await authPage.clickLoginWithTVProvider();
  await authPage.selectTVProvider(input?.providerName ?? 'Frontier, a Verizon Company');
  await authPage.clickContinue();
  await authPage.enterProviderEmail('ftrfios1@frontier.com');
  await authPage.enterProviderPassword('Frontier1');
  await authPage.clickProviderSignIn();
  await authPage.clickSearchBar();
  await authPage.enterSearchText(input?.searchTerm ?? 'Nurse The Dead');
  await authPage.submitSearch();
  await detailsPage.clickFirstSearchResult();
  const addToastText = await detailsPage.addToWatchlistAndGetToast();
  const isAddedToWatchlist = addToastText.toLowerCase().includes('added');
  logger.assertion('Add to Watchlist toast displayed', isAddedToWatchlist);
  const removeToastText = await detailsPage.removeFromWatchlistAndGetToast();
  const isRemovedFromWatchlist = removeToastText.toLowerCase().includes('removed');
  logger.assertion('Remove from Watchlist toast displayed', isRemovedFromWatchlist);

  return {
    isAddedToWatchlist,
    addToastText,
    isRemovedFromWatchlist,
    removeToastText,
  };
}

export async function verifyLiveContentWatchlistAbsence(
  page: any,
  input: Partial<VerifyLiveContentWatchlistAbsenceInput>
): Promise<VerifyLiveContentWatchlistAbsenceOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting live content watchlist absence validation flow');

  await authPage.navigate();
  await authPage.acceptCookieSettingsIfVisible();

  const email = input?.email;
  const password = input?.password;
  if (!email || !password) {
    throw new Error('Live content watchlist absence flow requires email and password from test data');
  }

  await authPage.clickEmailField();
  await authPage.enterEmail(email);
  await authPage.clickPasswordField();
  await authPage.enterPassword(password);
  await authPage.clickContinue();

  const isLiveChannelsTrayVisible = await detailsPage.isLiveChannelsTrayVisible();
  if (isLiveChannelsTrayVisible) {
    await detailsPage.openLiveChannelsTray();
    await detailsPage.clickLiveContentByName(input?.liveContentName ?? 'DZMM Teleradyo');
  }
  
  const isLiveIconVisible = await detailsPage.isLiveIconVisible();
  const isAddToWatchlistButtonVisible = await detailsPage.isAddToWatchlistButtonVisible();

  logger.assertion('Live channels tray visible', isLiveChannelsTrayVisible);
  logger.assertion('Live icon visible after content selection', isLiveIconVisible);
  logger.assertion('Watchlist icon not visible for live content', !isAddToWatchlistButtonVisible);

  return {
    isLiveChannelsTrayVisible,
    isLiveContentVisible: isLiveIconVisible,
    isAddToWatchlistButtonVisible,
  };
}
