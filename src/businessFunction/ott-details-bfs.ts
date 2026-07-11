import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { loginToOTT } from './ott-auth-bfs';
import { logger } from '../utils/logger';

export interface NavigateToShowDetailsInput {
  expectedHeading?: string;
  expectedYear?: string;
  expectedGenre?: string;
}

export interface NavigateToShowDetailsOutput {
  isDetailsPageVisible: boolean;
  showDetailsHeading: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  metadataText: string;
  yearVisible: boolean;
  genreVisible: boolean;
}

export interface VerifyVPNPlaybackRestrictionInput {
  mode?: string;
  searchQuery: string;
  expectedVPNErrorMessage: string;
}

export interface VerifyVPNPlaybackRestrictionOutput {
  isLoggedIn: boolean;
  vpnErrorVisible: boolean;
  errorMessage: string;
  playbackStarted: boolean;
}

export async function verifyVPNPlaybackRestriction(
  page: any,
  input: VerifyVPNPlaybackRestrictionInput
): Promise<VerifyVPNPlaybackRestrictionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting VPN playback restriction validation');

  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before VPN playback check', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      vpnErrorVisible: false,
      errorMessage: '',
      playbackStarted: false,
    };
  }

  await authPage.clickSearchBar();
  await authPage.searchAndGetResults(input.searchQuery);
  await page.locator(`img[alt="${input.searchQuery}"]`).click({ timeout: 10000 }).catch(() => { });
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

  await detailsPage.clickPlayButton();
  await page.waitForTimeout(5000);

  const vpnErrorVisible = await detailsPage.isVPNErrorMessageVisible(input.expectedVPNErrorMessage);
  const playbackStarted = await detailsPage.isPlaybackStarted();
  const errorMessage = vpnErrorVisible ? input.expectedVPNErrorMessage : '';

  logger.assertion('VPN-specific error displayed', vpnErrorVisible);
  logger.assertion('Playback did not start when VPN error is displayed', !playbackStarted);

  return {
    isLoggedIn,
    vpnErrorVisible,
    errorMessage,
    playbackStarted,
  };
}

export async function navigateToShowDetailsFromShowsPage(
  page: any,
  input?: NavigateToShowDetailsInput
): Promise<NavigateToShowDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting navigation to show details from Shows page');
  await authPage.acceptCookieSettingsIfVisible();
  await detailsPage.clickShowsSection();
  await detailsPage.clickFirstShowContent();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  const metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  const yearVisible = input?.expectedYear
    ? metadataText.toLowerCase().includes(input.expectedYear.toLowerCase())
    : false;
  const genreVisible = input?.expectedGenre
    ? metadataText.toLowerCase().includes(input.expectedGenre.toLowerCase())
    : false;

  logger.assertion('Show details page visible', isDetailsPageVisible);
  logger.assertion('Content metadata visible', isContentMetadataVisible);
  logger.assertion('Details page year visible', yearVisible);
  logger.assertion('Details page genre visible', genreVisible);

  return {
    isDetailsPageVisible,
    showDetailsHeading,
    isContentMetadataVisible,
    contentDescriptionText,
    metadataText,
    yearVisible,
    genreVisible,
  };
}

export interface VerifyGuestSearchNavigationInput {
  searchTerm?: string;
  expectedTitle?: string;
}

export interface VerifyGuestSearchNavigationOutput {
  isSearchInputPopulated: boolean;
  isDetailsPageVisible: boolean;
  headingText: string;
  titleMatchesSearchTerm: boolean;
}

export interface PlayEpisodeFromDetailsInput {
  mode?: string;
  searchTerm?: string;
}

export interface PlayEpisodeFromDetailsOutput {
  isDetailsPageVisible: boolean;
  isEpisodeListVisible: boolean;
  isPlayerVisible: boolean;
  showDetailsHeading: string;
  playbackContentTitle: string;
  selectedEpisodeTitle: string;
  playerTopLeftVisible: boolean;
  playerContainsTitleEpisode: boolean;
}

export async function verifyGuestSearchNavigationFromFreeAsset(
  page: any,
  input?: VerifyGuestSearchNavigationInput
): Promise<VerifyGuestSearchNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting guest search navigation validation flow');

  const searchTerm = input?.searchTerm ?? 'Lavender Fields';
  const expectedTitle = input?.expectedTitle ?? searchTerm;
console.log(" Title", expectedTitle);
  await authPage.navigate();
  await authPage.acceptCookieSettingsIfVisible();
  await authPage.clickSearchBar();
  await authPage.enterSearchText(searchTerm);
  const enteredSearchText = await authPage.getSearchBarValue();
  const isSearchInputPopulated = enteredSearchText.toLowerCase().includes(searchTerm.toLowerCase());
  await authPage.submitSearch();
  await detailsPage.clickFirstSearchResult();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const headingText = isDetailsPageVisible ? await detailsPage.getShowDetailsHeadingText() : '';
  const titleMatchesSearchTerm = headingText.toLowerCase().includes(expectedTitle.toLowerCase()) || headingText.toLowerCase().includes(searchTerm.toLowerCase());
  console.log("  serarched text", enteredSearchText);
  console.log("  Details page", isDetailsPageVisible);
  console.log(" Heading text in detail page", headingText);
  console.log(" Title", titleMatchesSearchTerm);
  logger.assertion('Search input accepts guest search term', isSearchInputPopulated);
  logger.assertion('Details page visible after guest search', isDetailsPageVisible);

  return {
    isSearchInputPopulated,
    isDetailsPageVisible,
    headingText,
    titleMatchesSearchTerm,
  };
}

export async function playEpisodeFromDetailsPage(
  page: any,
  input?: PlayEpisodeFromDetailsInput
): Promise<PlayEpisodeFromDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting episode playback flow from detail page');

  const searchTerm = input?.searchTerm ?? '';
  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickShowsSection();
    await detailsPage.clickFirstShowContent();
  }

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';

  const isEpisodeListVisible = await detailsPage.isEpisodeListVisible();
  const selectedEpisodeTitle = await detailsPage.getFirstEpisodeCardTitleText();
  await detailsPage.clickFirstEpisodeCard();

  let playerTopLeftVisible = false;
  try {
    if (!page.isClosed()) {
      const topLeftLocator = page.locator('text=/Episode/i').first();
      if (await topLeftLocator.count()) {
        playerTopLeftVisible = await topLeftLocator.isVisible().catch(() => false);
      }
    }
  } catch (err) {
    logger.debug('Immediate title visibility check failed', err);
  }

  const isPlayerVisible = await detailsPage.isVideoPlayerVisible();
  const isPlaybackStarted = isPlayerVisible
    ? await detailsPage.isPlaybackStarted()
    : false;

  const playbackEpisodeTitle = isPlayerVisible
    ? await detailsPage.getPlaybackEpisodeTitleText()
    : '';

  let playerContainsTitleEpisode = false;
  try {
    if (!page.isClosed()) {
      const playerText = await page.locator('body').textContent();
      playerContainsTitleEpisode = (playerText || '').toLowerCase().includes('episode');
    }
  } catch (err) {
    logger.debug('Player content text check failed', err);
  }

  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Playback started after episode tap', isPlaybackStarted);
  logger.assertion('Playback episode title visible', playbackEpisodeTitle.length > 0);

  return {
    isDetailsPageVisible,
    isEpisodeListVisible,
    isPlayerVisible,
    showDetailsHeading,
    playbackContentTitle: playbackEpisodeTitle,
    selectedEpisodeTitle,
    playerTopLeftVisible,
    playerContainsTitleEpisode,
  };
}

export interface VerifySkipIntroMarkerInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySkipIntroMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
}

export interface VerifySkipRecapMarkerInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySkipRecapMarkerOutput {
  isDetailsPageVisible: boolean;
  isSkipRecapMarkerVisible: boolean;
}

export async function verifySkipIntroMarkerDuringPlayback(
  page: any,
  input?: VerifySkipIntroMarkerInput
): Promise<VerifySkipIntroMarkerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip intro marker verification flow');

  const searchTerm = input?.searchTerm ?? '';
  await authPage.acceptCookieSettingsIfVisible();

  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickPlayButton();
    await page.waitForTimeout(3000);
  }

  const isSkipIntroMarkerVisible = await detailsPage.isSkipIntroMarkerVisible();

  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip intro marker visible', isSkipIntroMarkerVisible);

  return {
    isDetailsPageVisible,
    isSkipIntroMarkerVisible,
  };
}

export async function verifySkipRecapMarkerDuringPlayback(
  page: any,
  input?: VerifySkipRecapMarkerInput
): Promise<VerifySkipRecapMarkerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting skip recap marker verification flow');

  const searchTerm = input?.searchTerm ?? '';
  await authPage.acceptCookieSettingsIfVisible();

  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickEpisodeTwo();
    await page.waitForTimeout(3000);
  }

  const isSkipRecapMarkerVisible = await detailsPage.isSkipRecapMarkerVisible();

  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Skip recap marker visible', isSkipRecapMarkerVisible);

  return {
    isDetailsPageVisible,
    isSkipRecapMarkerVisible,
  };
}
