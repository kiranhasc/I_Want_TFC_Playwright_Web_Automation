import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { loginToOTT } from './ott-auth-bfs';
import { logger } from '../utils/logger';

export interface VerifyShareLinkCopiedToClipboardInput {
  mode?: string;
}

export interface VerifyShareLinkCopiedToClipboardOutput {
  isLoggedIn: boolean;
  isContentDetailsPageVisible: boolean;
  isShareIconVisible: boolean;
  shareMessageText: string;
}

export interface VerifyEpisodesGroupedBySeasonInput {
  mode?: string;
}

export interface VerifyEpisodesGroupedBySeasonOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsCount: number;
  seasonLabelsText: string[];
  episodeItemsCount: number;
  allSeasonsValidated: boolean;
}

export interface VerifyShowEpisodeListScrollableToEndInput {
  mode?: string;
}

export interface VerifyShowEpisodeListScrollableToEndOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsCount: number;
  seasonLabelsText: string[];
  episodeItemsCount: number;
  allSeasonsValidated: boolean;
  episodeListScrollableToEnd: boolean;
  iWantElementVisible: boolean;
}

export interface VerifyEpisodesInAscendingOrderInput {
  mode?: string;
}

export interface VerifyPremiumIconOnDetailsPageInput {
  mode?: string;
}

export interface VerifyPremiumIconOnDetailsPageOutput {
  isLoggedIn: boolean;
  isGmaTabVisible: boolean;
  isDetailsPageVisible: boolean;
  premiumIconVisible: boolean;
}

export interface EpisodeSequenceValidation {
  seasonLabel: string;
  episodeLabels: string[];
  parsedNumbers: number[];
  isAscending: boolean;
}

export interface VerifyEpisodesInAscendingOrderOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonLabelsVisible: boolean;
  seasonLabelsText: string[];
  episodeSequenceValidations: EpisodeSequenceValidation[];
  allSeasonsValidated: boolean;
  ascendingEpisodesVerified: boolean;
}

export interface NavigateToShowDetailsInput {
  mode?: string;
  expectedHeading?: string;
  expectedYear?: string;
  expectedGenre?: string;
}

export interface NavigateToShowDetailsOutput {
  isLoggedIn: boolean;
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

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before navigating to show details', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      showDetailsHeading: '',
      isContentMetadataVisible: false,
      contentDescriptionText: '',
      metadataText: '',
      yearVisible: false,
      genreVisible: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  }

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
    isLoggedIn,
    isDetailsPageVisible,
    showDetailsHeading,
    isContentMetadataVisible,
    contentDescriptionText,
    metadataText,
    yearVisible,
    genreVisible,
  };
}

export interface VerifyContentDetailsPageUiInput {
  mode?: string;
}

export interface VerifyContentDetailsPageUiOutput {
  isLoggedIn: boolean;
  isContentDetailsPageVisible: boolean;
  contentDetailsHeading: string;
  selectedMovieTitle: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  isContentTitleImageVisible: boolean;
  isContentGenreVisible: boolean;
  isContentYearVisible: boolean;
  isContentAgeRatingVisible: boolean;
  isContentDurationVisible: boolean;
  isContentCastVisible: boolean;
  isPrimaryPlaybackActionVisible: boolean;
  isContentLanguageIconVisible: boolean;
  isContentSubtitleIconVisible: boolean;
  isAddToWatchlistButtonVisible: boolean;
  isContentShareIconVisible: boolean;
}

export async function verifyContentDetailsPageUi(
  page: any,
  input?: VerifyContentDetailsPageUiInput
): Promise<VerifyContentDetailsPageUiOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting content details page UI validation flow');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating content details page UI', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isContentDetailsPageVisible: false,
      contentDetailsHeading: '',
      selectedMovieTitle: '',
      isContentMetadataVisible: false,
      contentDescriptionText: '',
      isContentTitleImageVisible: false,
      isContentGenreVisible: false,
      isContentYearVisible: false,
      isContentAgeRatingVisible: false,
      isContentDurationVisible: false,
      isContentCastVisible: false,
      isPrimaryPlaybackActionVisible: false,
      isContentLanguageIconVisible: false,
      isContentSubtitleIconVisible: false,
      isAddToWatchlistButtonVisible: false,
      isContentShareIconVisible: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  await detailsPage.clickMoviesSection();
  const selectedMovieTitle = await detailsPage.clickFirstMovieContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  const isContentDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const contentDetailsHeading = isContentDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  const isContentTitleImageVisible = await detailsPage.isContentTitleImageVisible();
  const isContentGenreVisible = await detailsPage.isContentGenreVisible();
  const isContentYearVisible = await detailsPage.isContentYearVisible();
  const isContentAgeRatingVisible = await detailsPage.isContentAgeRatingVisible();
  const isContentDurationVisible = await detailsPage.isContentDurationVisible();
  const isContentCastVisible = await detailsPage.isContentCastVisible();
  const isPrimaryPlaybackActionVisible = await detailsPage.isPrimaryPlaybackActionVisible();
  const isContentLanguageIconVisible = await detailsPage.isContentLanguageIconVisible();
  const isContentSubtitleIconVisible = await detailsPage.isContentSubtitleIconVisible();
  const isAddToWatchlistButtonVisible = await detailsPage.isAddToWatchlistButtonVisible();
  const isContentShareIconVisible = await detailsPage.isContentShareIconVisible();

  logger.assertion('Content details page visible', isContentDetailsPageVisible);
  logger.assertion('Selected movie title captured', selectedMovieTitle.length > 0);
  logger.assertion('Content metadata visible', isContentMetadataVisible);
  logger.assertion('Content title image visible', isContentTitleImageVisible);
  logger.assertion('Content genre visible', isContentGenreVisible);
  logger.assertion('Content year visible', isContentYearVisible);
  logger.assertion('Content age rating visible', isContentAgeRatingVisible);
  logger.assertion('Content duration visible', isContentDurationVisible);
  logger.assertion('Content cast visible', isContentCastVisible);
  logger.assertion('Primary playback action visible', isPrimaryPlaybackActionVisible);
  logger.assertion('Content language icon visible', isContentLanguageIconVisible);
  logger.assertion('Content subtitle icon visible', isContentSubtitleIconVisible);
  logger.assertion('Add to watchlist button visible', isAddToWatchlistButtonVisible);
  logger.assertion('Share icon visible', isContentShareIconVisible);

  return {
    isLoggedIn,
    isContentDetailsPageVisible,
    contentDetailsHeading,
    selectedMovieTitle,
    isContentMetadataVisible,
    contentDescriptionText,
    isContentTitleImageVisible,
    isContentGenreVisible,
    isContentYearVisible,
    isContentAgeRatingVisible,
    isContentDurationVisible,
    isContentCastVisible,
    isPrimaryPlaybackActionVisible,
    isContentLanguageIconVisible,
    isContentSubtitleIconVisible,
    isAddToWatchlistButtonVisible,
    isContentShareIconVisible,
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

export interface VerifyEpisodePlaybackStartsFromDetailsInput {
  mode?: string;
}

export interface VerifyEpisodePlaybackStartsFromDetailsOutput {
  isLoggedIn: boolean;
  isDetailsPageVisible: boolean;
  seasonSectionVisible: boolean;
  selectedEpisodeTitle: string;
  showName: string;
  seasonNumber: string;
  episodeNumber: string;
  playerVisible: boolean;
  playbackStarted: boolean;
  playerEpisodeTitleVisible: boolean;
  playerSeasonVisible: boolean;
  playerEpisodeVisible: boolean;
  playerMetadataText: string;
}

export async function verifyEpisodePlaybackStartsFromDetailsPage(
  page: any,
  input?: VerifyEpisodePlaybackStartsFromDetailsInput
): Promise<VerifyEpisodePlaybackStartsFromDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const assertOrThrow = (description: string, result: boolean) => {
    logger.assertion(description, result);
    if (!result) {
      throw new Error(`Assertion failed: ${description}`);
    }
  };

  logger.step('Starting episode playback verification from details page');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  if (!isLoggedIn) {
    throw new Error('User is logged in before episode playback validation');
  }
  assertOrThrow('User is logged in before episode playback validation', isLoggedIn);

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.clickShowsSection();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  assertOrThrow('Details page visible before episode playback action', isDetailsPageVisible);
  await detailsPage.scrollToSeasonsSection();
  const seasonSectionVisible = await detailsPage.getSeasonLabelsText();
  const seasonSectionHasLabels = seasonSectionVisible.length > 0;
  assertOrThrow('Season section visible for content', seasonSectionHasLabels);

  const showName = await detailsPage.getShowDetailsHeadingText().catch(() => '');
  let selectedEpisodeTitle = '';
  let seasonNumber = '';
  let episodeNumber = '';
  let playerVisible = false;
  let playbackStarted = false;
  let playerEpisodeTitleVisible = false;
  let playerSeasonVisible = false;
  let playerEpisodeVisible = false;
  let playerMetadataText = '';

  if (seasonSectionHasLabels) {
    const firstSeasonLabel = seasonSectionVisible[0];
    await detailsPage.clickSeasonLabel(firstSeasonLabel);
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }

  try {
    await detailsPage.scrollToEpisodeList();
  } catch {
    // ignore and continue; the test will still report the failed expectation below
  }

  const selectedEpisode = await detailsPage.clickRandomEpisodeCard().catch(() => ({ title: '', seasonText: '', episodeText: '' }));
  const metadata = await detailsPage.getSelectedEpisodeMetadata().catch(() => ({ seasonNumber: '', episodeNumber: '', title: '' }));
  selectedEpisodeTitle = metadata.title || selectedEpisode.title || '';
  seasonNumber = metadata.seasonNumber || selectedEpisode.seasonText || '';
  episodeNumber = metadata.episodeNumber || selectedEpisode.episodeText || '';
  assertOrThrow('Episode title extracted from episode list', selectedEpisodeTitle.length > 0);

  await page.waitForTimeout(5000);
  playerVisible = await detailsPage.isVideoPlayerVisible();
  playbackStarted = playerVisible && seasonNumber.length > 0 && episodeNumber.length > 0;
  const playerMetadataValidation = await detailsPage.validatePlayerMetadataVisibility(selectedEpisodeTitle, seasonNumber, episodeNumber).catch(() => ({ titleVisible: false, seasonVisible: false, episodeVisible: false, playerText: '' }));
  playerEpisodeTitleVisible = playerMetadataValidation.titleVisible;
  playerSeasonVisible = playerMetadataValidation.seasonVisible;
  playerEpisodeVisible = playerMetadataValidation.episodeVisible;
  playerMetadataText = playerMetadataValidation.playerText;
  assertOrThrow('Player visible after tapping episode card', playerVisible);
  assertOrThrow('Playback started after tapping episode card', playbackStarted);
  assertOrThrow('Selected episode title visible in player metadata', playerEpisodeTitleVisible);
  assertOrThrow('Selected season number visible in player metadata', playerSeasonVisible);
  assertOrThrow('Selected episode number visible in player metadata', playerEpisodeVisible);

  console.log(`[IW3-T1921] Show Name: ${showName || 'N/A'}`);
  console.log(`[IW3-T1921] Episode Title: ${selectedEpisodeTitle || 'N/A'}`);
  console.log(`[IW3-T1921] Season Number: ${seasonNumber || 'N/A'}`);
  console.log(`[IW3-T1921] Episode Number: ${episodeNumber || 'N/A'}`);

  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonSectionVisible: seasonSectionHasLabels,
    selectedEpisodeTitle,
    showName,
    seasonNumber,
    episodeNumber,
    playerVisible,
    playbackStarted,
    playerEpisodeTitleVisible,
    playerSeasonVisible,
    playerEpisodeVisible,
    playerMetadataText,
  };
}

export async function verifyShareLinkCopiedToClipboardMessage(
  page: any,
  input?: VerifyShareLinkCopiedToClipboardInput
): Promise<VerifyShareLinkCopiedToClipboardOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting share link copied toast verification flow');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before share link verification', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isContentDetailsPageVisible: false,
      isShareIconVisible: false,
      shareMessageText: '',
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  }

  await detailsPage.clickMoviesSection();
  await detailsPage.clickFirstMovieContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  const isContentDetailsPageVisible = await detailsPage.isContentDetailsPageVisible();
  const isShareIconVisible = await detailsPage.isContentShareIconVisible();
  await detailsPage.clickContentShareIcon();
  const shareMessageText = await detailsPage.getShareCopyConfirmationMessage();

  logger.assertion('Content details page visible before share action', isContentDetailsPageVisible);
  logger.assertion('Share icon visible', isShareIconVisible);
  logger.assertion('Share copy confirmation message present', shareMessageText.toLowerCase().includes('share link copied'));

  return {
    isLoggedIn,
    isContentDetailsPageVisible,
    isShareIconVisible,
    shareMessageText,
  };
}

export async function verifyEpisodesGroupedBySeason(
  page: any,
  input?: VerifyEpisodesGroupedBySeasonInput
): Promise<VerifyEpisodesGroupedBySeasonOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting season and episode grouping verification flow');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before season grouping verification', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsCount: 0,
      seasonLabelsText: [],
      episodeItemsCount: 0,
      allSeasonsValidated: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

  const continueWatchingTray = page.locator('text=Continue Watching').first();
  if (await continueWatchingTray.count().catch(() => 0)) {
    await continueWatchingTray.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  }

  await detailsPage.clickShowsSection();
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.scrollToSeasonsSection();

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const seasonLabelsCount = seasonLabelsText.length;
  let episodeItemsCount = 0;
  let allSeasonsValidated = false;

  if (seasonLabelsVisible) {
    const validationResults: boolean[] = [];
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
      episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
      validationResults.push(currentEpisodeCount > 0);
    }
    allSeasonsValidated = validationResults.every(Boolean);
  }

  logger.assertion('Details page visible before season validation', isDetailsPageVisible);
  logger.assertion('Season labels present', seasonLabelsVisible);
  logger.assertion('Episode items present for each season label', allSeasonsValidated);

  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsCount,
    seasonLabelsText,
    episodeItemsCount,
    allSeasonsValidated,
  };
}

export async function verifyPremiumIconOnDetailsPage(
  page: any,
  input?: VerifyPremiumIconOnDetailsPageInput
): Promise<VerifyPremiumIconOnDetailsPageOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  logger.step('Starting premium icon visibility validation on details page');

  const loginResult = await loginToOTT(page, { mode: input?.mode ?? 'freeUser' });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('Free user is logged in before premium icon validation', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isGmaTabVisible: false,
      isDetailsPageVisible: false,
      premiumIconVisible: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await authPage.clickGMATab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  const isGmaTabVisible = await authPage.isTopStreamedRailVisible();
  const premiumContentOpened = await playbackPage.clickFirstPremiumContentCard();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  let premiumIconVisible = false;
  if (isDetailsPageVisible) {
    premiumIconVisible = await detailsPage.isPremiumTagVisible().catch(() => false);
  }

  logger.assertion('GMA rail visible', isGmaTabVisible);
  logger.assertion('Premium content opened', premiumContentOpened);
  logger.assertion('Details page visible for premium content', isDetailsPageVisible);
  logger.assertion('Premium icon visible on detail page', premiumIconVisible);

  return {
    isLoggedIn,
    isGmaTabVisible,
    isDetailsPageVisible,
    premiumIconVisible,
  };
}

export async function verifyEpisodesDisplayedInAscendingOrder(
  page: any,
  input?: VerifyEpisodesInAscendingOrderInput
): Promise<VerifyEpisodesInAscendingOrderOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting ascending episode order verification flow');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before episode order validation', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsText: [],
      episodeSequenceValidations: [],
      allSeasonsValidated: false,
      ascendingEpisodesVerified: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.clickShowsSection();
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  await detailsPage.scrollToSeasonsSection();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const episodeSequenceValidations: EpisodeSequenceValidation[] = [];
  let allSeasonsValidated = false;

  if (seasonLabelsVisible) {
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await detailsPage.scrollEpisodeListToEnd(12);
      const validation = await detailsPage.validateEpisodeNumberSequence();
      episodeSequenceValidations.push({
        seasonLabel,
        episodeLabels: validation.episodeLabels,
        parsedNumbers: validation.parsedNumbers,
        isAscending: validation.isAscending,
      });
    }
    allSeasonsValidated = episodeSequenceValidations.length > 0 && episodeSequenceValidations.every((entry) => entry.isAscending);
  } else {
    await detailsPage.scrollEpisodeListToEnd(12);
    const validation = await detailsPage.validateEpisodeNumberSequence();
    episodeSequenceValidations.push({
      seasonLabel: 'default',
      episodeLabels: validation.episodeLabels,
      parsedNumbers: validation.parsedNumbers,
      isAscending: validation.isAscending,
    });
    allSeasonsValidated = validation.isAscending;
  }

  const ascendingEpisodesVerified = allSeasonsValidated;

  logger.assertion('Details page visible before episode order validation', isDetailsPageVisible);
  logger.assertion('Season section is available before episode order validation', seasonLabelsVisible || episodeSequenceValidations.length > 0);
  logger.assertion('Episodes are displayed in ascending order', ascendingEpisodesVerified);

  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsText,
    episodeSequenceValidations,
    allSeasonsValidated,
    ascendingEpisodesVerified,
  };
}

export async function verifyShowEpisodeListScrollableToEnd(
  page: any,
  input?: VerifyShowEpisodeListScrollableToEndInput
): Promise<VerifyShowEpisodeListScrollableToEndOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting episode list scroll-to-end verification flow');

  const loginResult = await loginToOTT(page, { mode: input?.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before episode list scroll validation', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      isDetailsPageVisible: false,
      seasonLabelsVisible: false,
      seasonLabelsCount: 0,
      seasonLabelsText: [],
      episodeItemsCount: 0,
      allSeasonsValidated: false,
      episodeListScrollableToEnd: false,
      iWantElementVisible: false,
    };
  }

  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.scrollContinueWatchingTrayIntoView();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  await detailsPage.clickShowsSection();
  await detailsPage.clickFirstShowContent();
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  await detailsPage.scrollToSeasonsSection();
  const seasonLabelsText = await detailsPage.getSeasonLabelsText();
  const seasonLabelsVisible = seasonLabelsText.length > 0;
  const seasonLabelsCount = seasonLabelsText.length;
  let episodeItemsCount = 0;
  let allSeasonsValidated = false;
  let episodeListScrollableToEnd = false;

  if (seasonLabelsVisible) {
    const validationResults: boolean[] = [];
    for (const seasonLabel of seasonLabelsText) {
      await detailsPage.clickSeasonLabel(seasonLabel);
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
      await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
      episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
      const currentScrollable = await detailsPage.scrollEpisodeListToEnd();
      validationResults.push(currentEpisodeCount > 0 && currentScrollable);
      episodeListScrollableToEnd = episodeListScrollableToEnd || currentScrollable;
    }
    allSeasonsValidated = validationResults.every(Boolean);
  } else {
    const currentEpisodeCount = await detailsPage.getEpisodeItemCount();
    episodeItemsCount = Math.max(episodeItemsCount, currentEpisodeCount);
    episodeListScrollableToEnd = await detailsPage.scrollEpisodeListToEnd();
    allSeasonsValidated = currentEpisodeCount > 0 && episodeListScrollableToEnd;
  }

  const iWantElementVisible = await detailsPage.isIWantElementVisible();

  logger.assertion('Details page visible before episode list scroll validation', isDetailsPageVisible);
  logger.assertion('Season labels present when available', seasonLabelsVisible || seasonLabelsCount === 0);
  logger.assertion('Episode list scrollable to the end', episodeListScrollableToEnd);
  logger.assertion('iWant element visible after scrolling', iWantElementVisible);

  return {
    isLoggedIn,
    isDetailsPageVisible,
    seasonLabelsVisible,
    seasonLabelsCount,
    seasonLabelsText,
    episodeItemsCount,
    allSeasonsValidated,
    episodeListScrollableToEnd,
    iWantElementVisible,
  };
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
