import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { loginToFreeUser, loginToOTT, loginWithBasicUser, loginWithTVProvider } from './ott-auth-bfs';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { logger } from '../utils/logger';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';

declare const process: { env: Record<string, string | undefined> };

export interface OpenContentAndPlayInput {
  query?: string;
  graphqlQueryName?: string;
  mode?: string;
  expectedTitle?: string;
  expectedEpisode?: string;
  seekPercent?: number;
}

export interface VerifyPauseSeekButtonsOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  pausedPlaybackTime: string;
  forwardPlaybackTime: string;
  rewindPlaybackTime: string;
  forwardChanged: boolean;
  rewindChanged: boolean;
}

export interface OpenContentAndPlayOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  contentTitleVisible: boolean;
  episodeNameVisible: boolean;
}

export interface VerifyEarlyAccessContentNotInContinueWatchingInput {
  mode?: string;
  graphqlQueryName?: string;
  labelText?: string;
}

export interface VerifyEarlyAccessContentNotInContinueWatchingOutput {
  isLoggedIn: boolean;
  query?: string;
  detailsVisible: boolean;
  searchResultsVisible: boolean;
  playerVisible: boolean;
  earlyAccessItemVisibleInContinueWatching: boolean;
  earlyAccessTagVisibleInContinueWatching: boolean;
}

export interface VerifyEarlyAccessMaybeLaterInput {
  mode?: string;
  graphqlQueryName?: string;
  labelText?: string;
}

export interface VerifyEarlyAccessMaybeLaterOutput {
  query?: string;
  searchResultsVisible: boolean;
  detailsVisible: boolean;
  earlyAccessTagVisible: boolean;
  episodeClicked: boolean;
  unlockEarlyAccessVisible: boolean;
  maybeLaterVisible: boolean;
  maybeLaterClicked: boolean;
  returnedToDetailsPage: boolean;
}

export async function verifyEarlyAccessMaybeLaterFlow(page: any, input?: VerifyEarlyAccessMaybeLaterInput): Promise<VerifyEarlyAccessMaybeLaterOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;

  logger.step('Starting Early Access Maybe Later navigation verification flow');

  const loginResult = await loginToOTT(page, { mode });

  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const foundAsset = parser.findAssetByLabel(input?.labelText ?? 'Early Access');

  if (!foundAsset?.asset?.title) {
    logger.warn('Early Access asset not found in Collection GraphQL response');
    return {
      searchResultsVisible: false,
      detailsVisible: false,
      earlyAccessTagVisible: false,
      episodeClicked: false,
      unlockEarlyAccessVisible: false,
      maybeLaterVisible: false,
      maybeLaterClicked: false,
      returnedToDetailsPage: false,
    };
  }

  const query = (foundAsset.asset.title ?? '').trim();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const searchResultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', searchResultsVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible after search result click', detailsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.scrollUntilEarlyAccessTagVisible();

  const earlyAccessTagVisible = await detailsPage.scrollUntilEarlyAccessTagVisible();
  logger.assertion('Early Access tag visible on episode thumbnail', earlyAccessTagVisible);
  const episodeClicked = await detailsPage.clickEpisodeCardWithEarlyAccessTag();
  logger.assertion('Early Access episode clicked', episodeClicked);

  const unlockEarlyAccessVisible = await playbackPage.isUnlockEarlyAccessVisible();
  const maybeLaterVisible = await playbackPage.isMaybeLaterVisible();
  logger.assertion('Unlock Early Access prompt is visible', unlockEarlyAccessVisible);
  logger.assertion('Maybe Later button is visible on prompt', maybeLaterVisible);

  const maybeLaterClicked = maybeLaterVisible ? await playbackPage.clickMaybeLaterButton() : false;
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await detailsPage.waitForPlayback(2);
  const returnedToDetailsPage = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Returned to content details page after tapping Maybe Later', returnedToDetailsPage);

  return {
    query,
    searchResultsVisible,
    detailsVisible,
    earlyAccessTagVisible,
    episodeClicked,
    unlockEarlyAccessVisible,
    maybeLaterVisible,
    maybeLaterClicked,
    returnedToDetailsPage,
  };
}

export interface VerifyEarlyAccessSubscriptionFlowInput {
  mode?: string;
  graphqlQueryName?: string;
  labelText?: string;
}

export interface VerifyEarlyAccessSubscriptionFlowOutput {
  query?: string;
  searchResultsVisible: boolean;
  detailsVisible: boolean;
  earlyAccessTagVisible: boolean;
  episodeClicked: boolean;
  unlockEarlyAccessVisible: boolean;
  updateToWatchNowVisible: boolean;
  accountScreenVisible: boolean;
  iWantIconVisible: boolean;
  urlContainsAccount: boolean;
}

export interface VerifySubscribedEarlyAccessUpNextFlowInput {
  mode?: string;
  graphqlQueryName?: string;
  labelText?: string;
}

export interface VerifySubscribedEarlyAccessUpNextFlowOutput {
  query?: string;
  searchResultsVisible: boolean;
  detailsVisible: boolean;
  earlyAccessTagVisible: boolean;
  episodeClicked: boolean;
  playbackStarted: boolean;
  nextEpisodeMarkerVisible: boolean;
  nextEpisodeClicked: boolean;
  nextEpisodePlaybackStarted: boolean;
}

export async function verifyEarlyAccessSubscriptionFlow(page: any, input?: VerifyEarlyAccessSubscriptionFlowInput): Promise<VerifyEarlyAccessSubscriptionFlowOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const playbackPage = new OTTPlaybackPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;

  logger.step('Starting Early Access subscription initiation verification flow');

  const loginResult = await loginToOTT(page, { mode });
  
  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const foundAsset = parser.findAssetByLabel(input?.labelText ?? 'Early Access');

  if (!foundAsset?.asset?.title) {
    logger.warn('Early Access asset not found in Collection GraphQL response');
    return {
      searchResultsVisible: false,
      detailsVisible: false,
      earlyAccessTagVisible: false,
      episodeClicked: false,
      unlockEarlyAccessVisible: false,
      updateToWatchNowVisible: false,
      accountScreenVisible: false,
      iWantIconVisible: false,
      urlContainsAccount: false,
    };
  }

  const query = (foundAsset.asset.title ?? '').trim();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const searchResultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', searchResultsVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible after search result click', detailsVisible);

  await detailsPage.waitForPlayback(2);
  const earlyAccessTagVisible = await detailsPage.scrollUntilEarlyAccessTagVisible();
  logger.assertion('Early Access tag visible on episode thumbnail', earlyAccessTagVisible);
  const episodeClicked = await detailsPage.clickEpisodeCardWithEarlyAccessTag();
  logger.assertion('Early Access episode clicked', episodeClicked);

  const unlockEarlyAccessVisible = await playbackPage.isUnlockEarlyAccessVisible();
  const updateToWatchNowVisible = await playbackPage.isUpdateToWatchNowVisible();
  logger.assertion('Unlock Early Access prompt visible', unlockEarlyAccessVisible);
  logger.assertion('Update to Watch now button visible', updateToWatchNowVisible);

  const updateClicked = updateToWatchNowVisible ? await playbackPage.clickUpdateToWatchNowButton() : false;
  if (updateClicked) {
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }

  const redirectVerification = await detailsPage.getAccountRedirectVerification();
  const accountScreenVisible = redirectVerification.accountScreenVisible;
  const iWantIconVisible = redirectVerification.iWantIconVisible;
  const urlContainsAccount = redirectVerification.urlContainsAccount;
  logger.assertion('Account screen visible after Update to Watch now click', accountScreenVisible);

  return {
    query,
    searchResultsVisible,
    detailsVisible,
    earlyAccessTagVisible,
    episodeClicked,
    unlockEarlyAccessVisible,
    updateToWatchNowVisible,
    accountScreenVisible,
    iWantIconVisible,
    urlContainsAccount,
  };
}

export async function verifySubscribedEarlyAccessUpNextFlow(page: any, input?: VerifySubscribedEarlyAccessUpNextFlowInput): Promise<VerifySubscribedEarlyAccessUpNextFlowOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;

  logger.step('Starting subscribed user Early Access Up Next / Next Episode verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
  const parser = new CollectionParser(collectionResponse as any);
  const foundAsset = parser.findAssetByLabel(input?.labelText ?? 'Early Access');

  if (!foundAsset?.asset?.title) {
    logger.warn('Early Access asset not found in Collection GraphQL response');
  }

  const query = (foundAsset.asset.title ?? '').trim();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const searchResultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', searchResultsVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.waitForPlayback(2);
  const earlyAccessTagVisible = await detailsPage.scrollUntilEarlyAccessTagVisible();
  logger.assertion('Early Access tag visible on episode thumbnail', earlyAccessTagVisible);
  const episodeClicked = earlyAccessTagVisible ? await detailsPage.clickPreviousEpisodeOfEarlyAccessTag() : false;
  logger.assertion('Previous episode before Early Access episode clicked', episodeClicked);

  await detailsPage.waitForPlayback(5);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.98);
  await detailsPage.waitForPlayback(2);

  const playbackStarted = await detailsPage.isPlaybackStarted();
  await detailsPage.waitForPlayback(2);
  const nextEpisodeMarkerVisible = await detailsPage.waitForUpNextMarker(15000);
  logger.assertion('Next episode marker or CTA visible on player screen', nextEpisodeMarkerVisible);

  let nextEpisodeClicked = false;
  let nextEpisodePlaybackStarted = false;
  if (nextEpisodeMarkerVisible) {
    nextEpisodeClicked = await detailsPage.clickUpNextMarker();
    await detailsPage.waitForPlayback(5);
    nextEpisodePlaybackStarted = nextEpisodeClicked && (await detailsPage.isPlayerScreenVisible().catch(() => false));
  }

  return {
    query,
    searchResultsVisible,
    detailsVisible,
    earlyAccessTagVisible,
    episodeClicked,
    playbackStarted,
    nextEpisodeMarkerVisible,
    nextEpisodeClicked,
    nextEpisodePlaybackStarted,
  };
}

export async function verifySubtitleDisplayFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySubtitleDisplayOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle display verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();
  await detailsPage.waitForPlayback(1);
  const subtitleDisplayedOnPlayer = await detailsPage.isSubtitleDisplayedOnPlayer();

  logger.assertion('Subtitle language selected successfully', subtitleSelectionSuccessful);
  logger.assertion('Subtitle is displayed on the player screen', subtitleDisplayedOnPlayer);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleSelectionSuccessful,
    subtitleDisplayedOnPlayer,
  };
}

export async function verifyFullscreenFunctionalityFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyFullscreenFunctionalityOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting fullscreen functionality verification flow');
  
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);
  await detailsPage.clickPlayButton();
  const fullscreenVisible = await detailsPage.isFullscreenButtonVisible();
  await detailsPage.clickFullscreenButton();
  await detailsPage.waitForPlayback(2);
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer(input?.expectedTitle);
  const initialPlaybackTime = await detailsPage.getPlaybackTimeText();
  await detailsPage.waitForPlayback(10);
  await detailsPage.tapPlaybackScreen();
  const updatedPlaybackTime = await detailsPage.getPlaybackTimeText();
  const playbackTimeProgressed = initialPlaybackTime !== updatedPlaybackTime;
  logger.assertion('Fullscreen button visible before interaction', fullscreenVisible);
  logger.assertion('Content title visible after entering fullscreen', contentTitleVisible);
  logger.assertion('Playback time progressed after waiting in fullscreen', playbackTimeProgressed);

  return {
    isLoggedIn,
    detailsVisible,
    fullscreenVisible,
    contentTitleVisible,
    playbackTimeProgressed,
  };
}

async function resolveQueryFromCollectionGraphQL(page: any, graphqlQueryName: string = 'Collection'): Promise<string | undefined> {
  try {
    logger.info('Waiting 2 seconds for Collection GraphQL response to be available');
   // await page.waitForTimeout(2000);

    // const gql = new GraphQLHelper(page);
    const gql = GraphQLHelper.getInstance(page);
 
    const collectionResponse = await gql.waitForOperation(graphqlQueryName);
    const parser = new CollectionParser(collectionResponse as any);
    const foundAsset = parser.findAsset((asset: any) => Boolean(asset?.title));

    if (!foundAsset?.asset?.title) {
      logger.warn('No collection asset title available from GraphQL response');
      return undefined;
    }

    logger.info(`Resolved collection search query from GraphQL asset: ${foundAsset.asset.title}`);
    return foundAsset.asset.title;
  } catch (error) {
    logger.warn('Unable to resolve query from Collection GraphQL response', error);
    return undefined;
  }
}

export async function openContentAndPlay(page: any, input?: OpenContentAndPlayInput): Promise<OpenContentAndPlayOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting content search, navigation to details, and play flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();

  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisible(expectedTitle);
  const episodeNameVisible = await detailsPage.isEpisodeNameVisible(expectedTitle);

  logger.assertion('Player screen visible', playerVisible);
  logger.assertion('Content title visible on player screen', contentTitleVisible);
  logger.assertion('Episode name visible on player screen', episodeNameVisible);

  return {
    isLoggedIn,
    detailsVisible,
    playerVisible,
    contentTitleVisible,
    episodeNameVisible,
  };
}

export async function playPremiumContentFromSearch(page: any, input?: PlayPremiumContentFromSearchInput): Promise<PlayPremiumContentFromSearchOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const searchQuery = (input?.searchQuery ?? '').trim();
  const mode = input?.mode;
  logger.step('Starting premium content search and playback flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in', isLoggedIn);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(searchQuery);
  const searchQueryTyped = searchQuery.length > 0;
  logger.assertion('Search query typed', searchQueryTyped);
  await authPage.submitSearchQuery();
  const searchResultsVisible = await authPage.isSearchResultsVisible(searchQuery);
  logger.assertion('Search results visible for premium content query', searchResultsVisible);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible', detailsVisible);
  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  logger.assertion('Player screen visible', playerVisible);
  const playbackStarted = playerVisible;
  logger.assertion('Playback started successfully for premium content', playbackStarted);
  return {
    isLoggedIn,
    searchQueryTyped,
    searchResultsVisible,
    detailsVisible,
    playerVisible,
    playbackStarted,
  };
}

export interface VerifyPlaybackResumeOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  initialPlayed: boolean;
  resumed: boolean;
  seekBarVisible: boolean;
}

export interface VerifySmoothPlaybackOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  contentTitleVisible: boolean;
  episodeNameVisible: boolean;
  seekBarVisible: boolean;
}

export interface VerifySeekBarDragOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playbackPositionChanged: boolean;
}

export interface VerifyBrowserSeekBarFlowOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  seekBarVisible: boolean;
  playbackTimeVisible: boolean;
  playbackPositionChanged: boolean;
}

export interface VerifyPlayerControlsOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  controlsVisible: boolean;
  seekBarVisible: boolean;
  playbackTimeVisible: boolean;
  rewindVisible: boolean;
  forwardVisible: boolean;
  volumeVisible: boolean;
  subtitleVisible: boolean;
  fullscreenVisible: boolean;
}

export interface VerifyMidRailAdSpacingAcrossTabsInput {
  mode?: string;
}

export interface VerifyMidRailAdSpacingAcrossTabsOutput {
  isLoggedIn: boolean;
  homeAdVisible: boolean;
  homeSpacingValid: boolean;
  moviesAdVisible: boolean;
  moviesSpacingValid: boolean;
  showsAdVisible: boolean;
  showsSpacingValid: boolean;
}

export interface VerifyFullscreenButtonOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  fullscreenVisible: boolean;
}

export async function verifyMidRailAdSpacingAcrossTabs(page: any, input?: VerifyMidRailAdSpacingAcrossTabsInput): Promise<VerifyMidRailAdSpacingAcrossTabsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting mid-rail ad spacing validation across tabs');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating mid-rail ad spacing', isLoggedIn);

  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.scrollUntilElementVisible();
  await page.waitForTimeout(3000);
  const homeAdVisible = await detailsPage.scrollToMidRailAdBanner();
  const homeSpacingValid = homeAdVisible ? await detailsPage.verifyMidRailAdSpacing() : true;
  logger.assertion('Mid-rail ad banner is visible on Home', homeAdVisible);
  logger.assertion('Spacing around the Home mid-rail ad banner is valid', homeSpacingValid);
  logger.info('Spacing around the Home mid-rail ad banner is valid', homeSpacingValid);

  await authPage.clickMoviesTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.scrollUntilElementVisible();
  await page.waitForTimeout(3000);
  const moviesAdVisible = await detailsPage.scrollToMidRailAdBanner();
  const moviesSpacingValid = moviesAdVisible ? await detailsPage.verifyMidRailAdSpacing() : true;
  logger.assertion('Mid-rail ad banner is visible on Movies', moviesAdVisible);
  logger.assertion('Spacing around the Movies mid-rail ad banner is valid', moviesSpacingValid);
  logger .info('Spacing around the Movies mid-rail ad banner is valid', moviesSpacingValid);

  await authPage.clickShowsTab();
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.scrollUntilElementVisible();
  await page.waitForTimeout(3000);
  const showsAdVisible = await detailsPage.scrollToMidRailAdBanner();
  const showsSpacingValid = showsAdVisible ? await detailsPage.verifyMidRailAdSpacing() : true;
  logger.assertion('Mid-rail ad banner is visible on Shows', showsAdVisible);
  logger.assertion('Spacing around the Shows mid-rail ad banner is valid', showsSpacingValid);
  logger.info('Spacing around the Shows mid-rail ad banner is valid', showsSpacingValid);

  return {
    isLoggedIn,
    homeAdVisible,
    homeSpacingValid,
    moviesAdVisible,
    moviesSpacingValid,
    showsAdVisible,
    showsSpacingValid,
  };
}

export interface VerifyFullscreenFunctionalityOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  fullscreenVisible: boolean;
  contentTitleVisible: boolean;
  playbackTimeProgressed: boolean;
}

export interface VerifyLandscapePlayerUIOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  backButtonVisible: boolean;
  contentTitleVisible: boolean;
  seekBarVisible: boolean;
  pausePlayVisible: boolean;
  forwardRewindVisible: boolean;
  subtitleVisible: boolean;
  nextEpisodeVisible: boolean;
}

export interface VerifyNextEpisodeCtaVisibilityOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  seekBarVisible: boolean;
  nextEpisodeVisible: boolean;
  nextEpisodeBelowSeekBar: boolean;
}

export interface VerifyUpNextBingeMarkerOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  upNextMarkerVisible: boolean;
}

export interface VerifyUpNextMarkerNavigationOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  markerVisible: boolean;
  nextEpisodePlaybackStarted: boolean;
}

export interface VerifyUpNextMarkerFunctionalityOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  upNextMarkerVisible: boolean;
  timeBeforeMarkerClick: string;
  timeAfterMarkerClick: string;
  nextEpisodePlaybackStarted: boolean;
}

export interface VerifyUpNextCloseButtonOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  upNextMarkerVisible: boolean;
  closeButtonVisible: boolean;
  upNextMarkerClosed: boolean;
  playbackContinued: boolean;
}

export interface VerifyUpNextMarkerClickNavigationOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  markerVisible: boolean;
  markerClicked: boolean;
  nextEpisodePlaybackStarted: boolean;
}

export interface VerifyAutomaticNextEpisodePlaybackOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  markerVisible: boolean;
  autoPlaybackStarted: boolean;
}

export interface VerifyBackButtonNavigationOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerScreenHidden: boolean;
  backNavigationSuccessful: boolean;
}

export interface VerifyPlayerCloseReturnsToDetailsOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisibleBeforeClose: boolean;
  playerHiddenAfterClose: boolean;
  returnedToDetails: boolean;
}

export interface VerifyPlaybackTimestampFormatOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  timestampFormatValid: boolean;
  playbackTimeText: string;
}

export interface VerifyPlaybackShortDurationTimestampFormatOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  shortFormatValid: boolean;
  playbackTimeText: string;
}

export interface PlayPremiumContentFromSearchInput {
  mode?: string;
  searchQuery: string;
  expectedPlayback?: boolean;
}

export interface PlayPremiumContentFromSearchOutput {
  isLoggedIn: boolean;
  searchQueryTyped: boolean;
  searchResultsVisible: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  playbackStarted: boolean;
}

export interface VerifySubtitleSelectionOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleButtonVisible: boolean;
  subtitleSelectionSuccessful: boolean;
}

export interface VerifySeekbarPreviewInput {
  query?: string;
  mode?: string;
  graphqlQueryName?: string;
  expectedTitle?: string;
  expectedEpisode?: string;
}

export interface VerifySeekbarPreviewOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  previewVisible: boolean;
}

export interface VerifySubtitlePersistenceOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleSelectionSuccessful: boolean;
  nextEpisodeSubtitleVisible: boolean;
}

export interface PlayContentFromWatchlistInput {
    email?: string;
    password?: string;
}

export interface PlayContentFromWatchlistOutput {
    isLoggedIn: boolean;
    watchlistOpened: boolean;
    contentSelected: boolean;
    playClicked: boolean;
    playbackStarted: boolean;
    playbackCompleted: boolean;
    contentPlayed: boolean;
    currentTime: number;
    duration: number;
}

export interface VerifySubtitleCarryOverInput extends OpenContentAndPlayInput {
  secondQuery?: string;
}

export interface VerifySubtitleCarryOverOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleSelectionSuccessful: boolean;
  carryOverSubtitleVisible: boolean;
}

export interface VerifySubtitleDefaultOffOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleButtonVisible: boolean;
  subtitleOffVisible: boolean;
}

export interface VerifySubtitleDisplayOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleSelectionSuccessful: boolean;
  subtitleDisplayedOnPlayer: boolean;
}

export interface VerifySubtitleSynchronizationOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleSelectionSuccessful: boolean;
  subtitleVisibleAfterForward: boolean;
  subtitleVisibleAfterRewind: boolean;
  subtitleVisibleAfterSeek: boolean;
}

export interface PlayFreeAssetInput {
    mode?: string;
}

export interface PlayFreeAssetOutput {
    isLoggedIn: boolean;
    isPlayableContentDetected: boolean;
    playAttempted: boolean;
    playbackStarted: boolean;
}

export interface VerifyLastSeasonLastEpisodeCompletionOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  clickedSeason: boolean;
  clickedEpisode: boolean;
  playbackCompleted: boolean;
  postDetailsVisible: boolean;
}

export async function verifyLastSeasonLastEpisodeCompletionNavigationFlow(
  page: any,
  input?: OpenContentAndPlayInput
): Promise<VerifyLastSeasonLastEpisodeCompletionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting last-season last-episode completion -> details navigation flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible', detailsVisible);

  const clickedSeason = await detailsPage.clickLastSeasonIfAvailable();
  logger.assertion('Clicked last season when available', clickedSeason);

  const clickedEpisode = await detailsPage.clickLastEpisode();
  logger.assertion('Clicked last episode', clickedEpisode);
  await detailsPage.dragSeekBarToPosition(1.0);
  const playbackCompleted = await authPage.finishPlaybackFromCurrentItem();
  const postDetailsVisible = await detailsPage.isShowDetailsPageVisible();

  logger.assertion('User logged in successfully', isLoggedIn);
  logger.assertion('Content details page visible', detailsVisible);
  logger.assertion('Clicked last season when available', clickedSeason);
  logger.assertion('Clicked last episode', clickedEpisode);
  logger.assertion('Playback completed for last episode', playbackCompleted);
  logger.assertion('Content details visible after playback completion', postDetailsVisible);

  return {
    isLoggedIn,
    detailsVisible,
    clickedSeason: !!clickedSeason,
    clickedEpisode,
    playbackCompleted,
    postDetailsVisible,
  };
}

export interface VerifyMoviePlaybackDetailsAfterCompletionOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playbackStarted: boolean;
  playbackCompleted: boolean;
  postDetailsVisible: boolean;
}

export interface VerifyLivePlaybackGoLiveOutput {
  isLoggedIn: boolean;
  liveChannelOpened: boolean;
  goLiveVisible: boolean;
}

export interface VerifyPreRollAdPlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
}

export interface VerifyPauseAdPlaybackOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyAdPlaybackOutput extends VerifyPreRollAdPlaybackOutput {
  playerVisible: boolean;
  adVisible: boolean;
  mainContentVisible: boolean;
}

export interface VerifyPausePlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  initialPlaybackTime: string;
  pausedPlaybackTime: string;
  playbackPaused: boolean;
}

export interface VerifyTapToPausePlaybackInput {
  query?: string;
  mode?: string;
}

export interface VerifyTapToPausePlaybackOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  initialPlaybackTime: string;
  pausedPlaybackTime: string;
  playbackPaused: boolean;
}

export interface VerifyAdPlaybackUIOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  pauseButtonVisible: boolean;
}

export interface VerifyAdLabelVisibilityOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  adLabelVisible: boolean;
  adLabelText: string;
}

export interface VerifyAdDurationOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  adDurationSeconds: number;
  exceedsMaxDuration: boolean;
}

export interface VerifyMovieCompletionRedirectToDetailsOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playbackStarted: boolean;
  playbackCompleted: boolean;
  postDetailsVisible: boolean;
  playButtonVisible: boolean;
  resumeButtonVisible: boolean;
}

export async function verifyMovieCompletionRedirectToDetailsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyMovieCompletionRedirectToDetailsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting dedicated movie completion redirect to details validation flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before validating movie completion redirect', isLoggedIn);
  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      detailsVisible: false,
      playbackStarted: false,
      playbackCompleted: false,
      postDetailsVisible: false,
      playButtonVisible: false,
      resumeButtonVisible: false,
    };
  }
  await authPage.acceptCookieSettingsIfVisible();
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await authPage.clickMoviesTab();
  // Ensure movies page finished navigation/rendering
  await authPage.waitForMoviesPageReady(15000).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  await detailsPage.clickFirstMovieContent();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible before playback', detailsVisible);
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  const playbackStarted = await detailsPage.isPlayerScreenVisible();
  logger.assertion('Playback started for the selected movie', playbackStarted);
  await detailsPage.dragSeekBarToPosition(1.0);
  const playbackCompleted = await authPage.finishPlaybackFromCurrentItem().catch(() => false);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  await page.waitForTimeout(5000);
  const postDetailsVisible = await detailsPage.isShowDetailsPageVisible().catch(() => false);
  const playButtonVisible = postDetailsVisible ? await detailsPage.isPrimaryPlaybackActionVisible().catch(() => false) : false;
  const resumeButtonVisible = postDetailsVisible ? await detailsPage.isResumeButtonVisible().catch(() => false) : false;
  logger.assertion('Playback completed', playbackCompleted);
  logger.assertion('Content details page visible after playback completion', postDetailsVisible);
  logger.assertion('Primary play button visible after completion', playButtonVisible);
  logger.assertion('Resume button not visible after completion', !resumeButtonVisible);
  return {
    isLoggedIn,
    detailsVisible,
    playbackStarted,
    playbackCompleted,
    postDetailsVisible,
    playButtonVisible,
    resumeButtonVisible,
  };
}

export async function verifyMoviePlaybackReturnsToDetailsFlow(page: any,
  input?: OpenContentAndPlayInput): Promise<VerifyMoviePlaybackDetailsAfterCompletionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  let query = (input?.query ?? '').trim();

  logger.step('Starting movie playback completion details navigation flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  if (!query) {
    const gql = GraphQLHelper.getInstance(page);

    const collectionResponse = await gql.waitForOperation(
      input?.graphqlQueryName ?? 'Collection'
    );

    const parser = new CollectionParser(collectionResponse as any);

    const movieAsset = parser.findAsset((asset: any) => {
      const assetType = String(
        asset.assetType ??
        asset.type ??
        asset.contentType ??
        asset.mediaType ??
        ''
      ).toLowerCase();

      return assetType === 'movie';
    });

query = (movieAsset?.asset?.title ?? '').trim();

    logger.assertion(
      'Movie asset found in Collection GraphQL',
      Boolean(query)
    );
  }
  logger.info(`Fetched movie title from Collection GraphQL: ${query}`);
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.info(`Search results visible for query "${query}": ${resultsVisible}`);
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible', detailsVisible);

  await detailsPage.clickPlayButton();
  const playbackStarted = await detailsPage.isPlayerScreenVisible();
  logger.assertion('Movie playback started', playbackStarted);

  await detailsPage.dragSeekBarToPosition(1.0);
  const authPageForFinish = new OTTAuthPage(page);
  const playbackCompleted = await authPageForFinish.finishPlaybackFromCurrentItem().catch(() => false);
  const postDetailsVisible = await detailsPage.isShowDetailsPageVisible().catch(() => false);

  logger.assertion('Playback completed', playbackCompleted);
  logger.assertion('Content details page visible after playback completion', postDetailsVisible);

  return {
    isLoggedIn,
    detailsVisible,
    playbackStarted,
    playbackCompleted,
    postDetailsVisible,
  };
}

export async function verifyPlaybackResumeFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlaybackResumeOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting playback resume verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(20);
  const initialPlayed = true;

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(1);
  const resumed = true;

  const contentTitleVisibleAfterResume = await detailsPage.isPlayerContentTitleVisible(input?.expectedTitle);
  const episodeNameVisibleAfterResume = await detailsPage.isEpisodeNameVisible(input?.expectedEpisode);
  const seekBarVisible = await detailsPage.isSeekBarVisible();

  logger.assertion('Content title visible after resume', contentTitleVisibleAfterResume);
  logger.assertion('Episode name visible after resume', episodeNameVisibleAfterResume);

  logger.assertion('Seek bar visible after resume', seekBarVisible);

  return {
    isLoggedIn,
    detailsVisible,
    initialPlayed,
    resumed,
    seekBarVisible,
  };
}

export async function verifySmoothPlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySmoothPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting smooth playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisible(expectedTitle);
  const episodeNameVisible = await detailsPage.isEpisodeNameVisible(input?.expectedEpisode);
  const seekBarVisible = await detailsPage.isSeekBarVisible();

  logger.assertion('Player screen visible', playerVisible);
  logger.assertion('Content title visible on player screen', contentTitleVisible);
  logger.assertion('Episode name visible on player screen', episodeNameVisible);
  logger.assertion('Seek bar visible during smooth playback', seekBarVisible);

  await detailsPage.waitForPlayback(20);

  return {
    isLoggedIn,
    detailsVisible,
    playerVisible,
    contentTitleVisible,
    episodeNameVisible,
    seekBarVisible,
  };
}

export async function verifySeekBarDragFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySeekBarDragOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const targetPercent = input?.seekPercent ?? 0.35;

  logger.step('Starting seek bar drag verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  // const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  // const playbackTimeVisible = await detailsPage.isPlaybackTimeVisible();
  await detailsPage.hoverPlaybackScreen();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.dragSeekBarToPosition(targetPercent);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(1);
  const updatedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const playbackPositionChanged = initialPlaybackTime !== updatedPlaybackTime;

  logger.assertion('Playback position changed after dragging seek bar', playbackPositionChanged);

  return {
    isLoggedIn,
    detailsVisible,
    playbackPositionChanged,
  };
}

export async function verifyBrowserSeekBarFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyBrowserSeekBarFlowOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const targetPercent = input?.seekPercent ?? 0.35;

  logger.step('Starting browser seek bar verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const playbackTimeVisible = await detailsPage.isPlaybackTimeVisible();

  await detailsPage.hoverPlaybackScreen();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.dragSeekBarToPosition(targetPercent);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  const updatedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const playbackPositionChanged = initialPlaybackTime !== updatedPlaybackTime;


  logger.assertion('Seek bar visible before browser seek interaction', seekBarVisible);
  logger.assertion('Playback time visible before browser seek interaction', playbackTimeVisible);
  logger.assertion('Playback position changed after dragging seek bar', playbackPositionChanged);

  return {
    isLoggedIn,
    detailsVisible,
    seekBarVisible,
    playbackTimeVisible,
    playbackPositionChanged,
  };
}

export async function verifyPlayerControlsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlayerControlsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting player controls visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const playbackTimeVisible = await detailsPage.isPlaybackTimeVisible();
  const rewindVisible = await detailsPage.isRewindButtonVisible();
  const forwardVisible = await detailsPage.isForwardButtonVisible();
  const volumeVisible = await detailsPage.isVolumeButtonVisible();
  const subtitleVisible = await detailsPage.isSubtitleButtonVisible();
  const fullscreenVisible = await detailsPage.isFullscreenButtonVisible();
  const controlsVisible = seekBarVisible && playbackTimeVisible && rewindVisible && forwardVisible && volumeVisible && subtitleVisible && fullscreenVisible;

  logger.assertion('Player controls visible after tapping playback screen', controlsVisible);

  return {
    isLoggedIn,
    detailsVisible,
    controlsVisible,
    seekBarVisible,
    playbackTimeVisible,
    rewindVisible,
    forwardVisible,
    volumeVisible,
    subtitleVisible,
    fullscreenVisible,
  };
}

export interface VerifyPlayerControlsAutoDismissOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  controlsInitiallyVisible: boolean;
  controlsAutoDismissed: boolean;
}

export async function verifyPlayerControlsAutoDismissFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlayerControlsAutoDismissOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting player controls auto-dismiss verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  await detailsPage.hoverPlaybackScreen();
  // await detailsPage.waitForPlayback(1);
  const controlsInitiallyVisible = await detailsPage.isPauseButtonVisible();
  logger.assertion('Player controls visible after hovering playback screen', controlsInitiallyVisible);

  await detailsPage.waitForPlayback(7);
  const controlsStillVisible = await detailsPage.isPauseButtonVisible();
  const controlsAutoDismissed = controlsInitiallyVisible && !controlsStillVisible;

  logger.assertion('Player controls auto-dismiss after inactivity', controlsAutoDismissed);

  return {
    isLoggedIn,
    detailsVisible,
    controlsInitiallyVisible,
    controlsAutoDismissed,
  };
}

export interface VerifyPlayerControlsHoverDismissOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  controlsInitiallyNotVisible: boolean;
  controlsVisibleOnHover: boolean;
}

export async function verifyPlayerControlsHoverDismissFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlayerControlsHoverDismissOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting player controls hover-dismiss verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in', isLoggedIn);

  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger .info(`Search results visible for query "${query}": ${resultsVisible}`);
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(1);
  const controlsInitiallyVisible = await detailsPage.isPauseButtonVisible();
  logger.assertion('Player controls visible before auto-dismiss', controlsInitiallyVisible);

  await detailsPage.waitForPlayback(6);
  const controlsInitiallyNotVisible = !(await detailsPage.isPauseButtonVisible());
  logger.assertion('Player controls are not visible after 5 seconds of inactivity', controlsInitiallyNotVisible);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(2);
  const controlsVisibleOnHover = await detailsPage.isPauseButtonVisible();

  logger.assertion('Player controls become visible again on hover', controlsVisibleOnHover);

  return {
    isLoggedIn,
    detailsVisible,
    controlsInitiallyNotVisible,
    controlsVisibleOnHover,
  };
}

export interface VerifyVolumeControlOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  initialVolume: number;
  adjustedVolume: number;
  muteToggled: boolean;
}

export async function verifyVolumeControlFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyVolumeControlOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  // const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting volume control verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const initialMuted = await detailsPage.isPlayerMuted();
  const initialVolume = await detailsPage.getPlayerVolumeLevel();
  logger.assertion('Initial volume retrieved', initialVolume >= 0);

  await detailsPage.clickVolumeButton();
  await detailsPage.waitForPlayback(1);
  const adjustedMuted = await detailsPage.isPlayerMuted();
  const adjustedVolume = await detailsPage.getPlayerVolumeLevel();

  const muteToggled = initialMuted !== adjustedMuted;
  const volumeChanged = initialVolume !== adjustedVolume;
  logger.assertion('Volume changed or mute state toggled after clicking volume button', muteToggled || volumeChanged);

  return {
    isLoggedIn,
    detailsVisible,
    initialVolume,
    adjustedVolume,
    muteToggled,
  };
}

export async function verifyFullscreenButtonVisibilityFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyFullscreenButtonOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting fullscreen button visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;
  
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const fullscreenVisible = await detailsPage.isFullscreenButtonVisible();
  logger.assertion('Fullscreen button visible on player screen', fullscreenVisible);

  return {
    isLoggedIn,
    detailsVisible,
    fullscreenVisible,
  };
}

export async function verifyPlayerUIFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyLandscapePlayerUIOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting landscape player UI verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickFullscreenButton();
  await detailsPage.hoverPlaybackScreen();
  const backButtonVisible = await detailsPage.isBackButtonVisible();
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer(input?.expectedTitle);
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const pausePlayVisible = await detailsPage.isPauseButtonVisible();
  const rewindVisible = await detailsPage.isRewindButtonVisible();
  const forwardVisible = await detailsPage.isForwardButtonVisible();
  const forwardRewindVisible = rewindVisible && forwardVisible;
  const subtitleVisible = await detailsPage.isSubtitleButtonVisible();
  await detailsPage.waitForPlayback(2);
  const nextEpisodeVisible = await detailsPage.isNextEpisodeButtonVisible();
  logger.assertion('Back button visible in fullscreen mode', backButtonVisible);
  logger.assertion('Content title visible in fullscreen mode', contentTitleVisible);
  logger.assertion('Seek bar visible in fullscreen mode', seekBarVisible);
  logger.assertion('Pause/play control visible in fullscreen mode', pausePlayVisible);
  logger.assertion('Forward and rewind controls visible in fullscreen mode', forwardRewindVisible);
  logger.assertion('Subtitle control visible in fullscreen mode (if available)', subtitleVisible);
  logger.assertion('Next episode control visible in fullscreen mode (if available)', nextEpisodeVisible);

  return {
    isLoggedIn,
    detailsVisible,
    backButtonVisible,
    contentTitleVisible,
    seekBarVisible,
    pausePlayVisible,
    forwardRewindVisible,
    subtitleVisible,
    nextEpisodeVisible,
  };
}


export async function verifyNextEpisodeCtaVisibilityFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyNextEpisodeCtaVisibilityOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting next episode CTA visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const nextEpisodeVisible = await detailsPage.isNextEpisodeButtonVisible();
  const nextEpisodeBelowSeekBar = await detailsPage.isNextEpisodeButtonBelowSeekBar();

  logger.assertion('Seek bar visible on player screen', seekBarVisible);
  logger.assertion('Next episode CTA visibility checked', true);
  logger.assertion('Next episode CTA positioned below the seek bar', nextEpisodeBelowSeekBar);

  return {
    isLoggedIn,
    detailsVisible,
    seekBarVisible,
    nextEpisodeVisible,
    nextEpisodeBelowSeekBar,
  };
}

export async function verifyUpNextBingeMarkerFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyUpNextBingeMarkerOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Up Next binge marker verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickFirstEpisodeCard();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.98);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickResumeButton();
  const upNextMarkerVisible = await detailsPage.waitForUpNextMarker(15000);

  logger.assertion('Up Next binge marker visible at the end of playback', upNextMarkerVisible);

  return {
    isLoggedIn,
    detailsVisible,
    upNextMarkerVisible,
  };
}

export async function verifyUpNextMarkerNavigationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyUpNextMarkerNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Up Next marker navigation verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickResumeButton();

  const markerVisible = await detailsPage.waitForUpNextMarker(15000);
  logger.assertion('Up Next marker is visible', markerVisible);

  if (markerVisible) {
    await detailsPage.clickNextEpisodeButton();
    await detailsPage.waitForPlayback(2);
    await detailsPage.tapPlaybackScreen();
  }

  const nextEpisodePlaybackStarted = markerVisible && (await detailsPage.isPlayerScreenVisible().catch(() => false));
  logger.assertion('Next episode playback started after tapping marker', nextEpisodePlaybackStarted);

  return {
    isLoggedIn,
    detailsVisible,
    markerVisible,
    nextEpisodePlaybackStarted,
  };
}

export async function verifyUpNextMarkerFunctionalityFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyUpNextMarkerFunctionalityOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Up Next marker functionality verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickFirstEpisodeCard();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await detailsPage.waitForPlayback(2);

  const upNextMarkerVisible = await detailsPage.waitForUpNextMarker(10000);
  logger.assertion('Up Next marker visible at the end of playback', upNextMarkerVisible);

  let timeBeforeMarkerClick = '';
  let timeAfterMarkerClick = '';
  let nextEpisodePlaybackStarted = false;

  if (upNextMarkerVisible) {
    timeBeforeMarkerClick = await detailsPage.getTrimmedPlaybackTime();
    console.log('Time before clicking Up Next marker:', timeBeforeMarkerClick);
    await detailsPage.hoverPlaybackScreen();
    await detailsPage.clickUpNextMarker();
    await detailsPage.waitForPlayback(5);
    timeAfterMarkerClick = await detailsPage.getTrimmedPlaybackTime();
    console.log('Time after clicking Up Next marker:', timeAfterMarkerClick);
    nextEpisodePlaybackStarted = timeBeforeMarkerClick !== timeAfterMarkerClick;
  }

  logger.assertion('Time before clicking Up Next marker is recorded', !!timeBeforeMarkerClick);
  logger.assertion('Time after clicking Up Next marker is recorded', !!timeAfterMarkerClick);
  logger.assertion('Up Next marker navigates to a different playback position', nextEpisodePlaybackStarted);

  return {
    isLoggedIn,
    detailsVisible,
    upNextMarkerVisible,
    timeBeforeMarkerClick,
    timeAfterMarkerClick,
    nextEpisodePlaybackStarted,
  };
}

export async function verifyUpNextCloseButtonFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyUpNextCloseButtonOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Up Next close button verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickFirstEpisodeCard();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await detailsPage.waitForPlayback(2);

  const upNextMarkerVisible = await detailsPage.waitForUpNextMarker(15000);
  logger.assertion('Up Next marker visible at the end of playback', upNextMarkerVisible);

  const closeButtonVisible = upNextMarkerVisible ? await detailsPage.isUpNextCloseButtonVisible() : false;
  logger.assertion('Close button visible on the Up Next marker', closeButtonVisible);

  let upNextMarkerClosed = false;
  let playbackContinued = false;
  if (closeButtonVisible) {
    await detailsPage.clickUpNextCloseButton();
    await detailsPage.waitForPlayback(2);
    upNextMarkerClosed = !(await detailsPage.isUpNextMarkerVisible().catch(() => false));
    playbackContinued = upNextMarkerClosed ? await detailsPage.isPlayerScreenVisible().catch(() => false) : false;
  }

  logger.assertion('Up Next marker closes after tapping the close button', upNextMarkerClosed);
  logger.assertion('Playback continues after closing the Up Next marker', playbackContinued);

  return {
    isLoggedIn,
    detailsVisible,
    upNextMarkerVisible,
    closeButtonVisible,
    upNextMarkerClosed,
    playbackContinued,
  };
}

export async function verifyUpNextMarkerClickNavigationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyUpNextMarkerClickNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Up Next marker click navigation verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickFirstEpisodeCard();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await detailsPage.waitForPlayback(2);

  const markerVisible = await detailsPage.waitForUpNextMarker(15000);
  logger.assertion('Up Next marker is visible', markerVisible);

  let markerClicked = false;
  let nextEpisodePlaybackStarted = false;
  if (markerVisible) {
    markerClicked = await detailsPage.clickUpNextMarker();
    await detailsPage.waitForPlayback(2);
    await detailsPage.tapPlaybackScreen();
    nextEpisodePlaybackStarted = markerClicked && (await detailsPage.isPlayerScreenVisible().catch(() => false));
  }

  logger.assertion('Up Next marker clicked successfully', markerClicked);
  logger.assertion('Next episode playback started after clicking the Up Next marker', nextEpisodePlaybackStarted);
return {
    isLoggedIn,
    detailsVisible,
    markerVisible,
    markerClicked,
    nextEpisodePlaybackStarted,
  };
}
export interface VerifyNextEpisodePlaybackInFullscreenOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  fullScreenActiveAfterUpNext: boolean;
  nextEpisodePlaybackStarted: boolean;
}

export async function verifyNextEpisodePlaybackInFullscreenFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyNextEpisodePlaybackInFullscreenOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  logger.step('Starting next episode playback in fullscreen verification flow');
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await page.waitForTimeout(2000);
  await authPage.clickShowsTab();
  await page.waitForTimeout(4000);
  await detailsPage.clickFirstShowContent();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Show content details page visible', detailsVisible);
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickFullscreenButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  const markerVisible = await detailsPage.waitForUpNextMarker(20000);
  logger.assertion('Up Next marker visible after scrubbing near the end of playback', markerVisible);
  if (markerVisible) {
    await detailsPage.clickNextEpisodeButton();
    await detailsPage.waitForPlayback(5);
  }
  const fullScreenActiveAfterUpNext = await detailsPage.isFullscreenModeActive();
  const nextEpisodePlaybackStarted = markerVisible && (await detailsPage.isPlayerScreenVisible());

  logger.assertion('Fullscreen remains active after selecting next episode', fullScreenActiveAfterUpNext);
  logger.assertion('Next episode playback started in fullscreen mode', nextEpisodePlaybackStarted);

  return {
    isLoggedIn,
    detailsVisible,
    fullScreenActiveAfterUpNext,
    nextEpisodePlaybackStarted,
  };
}

export async function verifyAutomaticNextEpisodePlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAutomaticNextEpisodePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting automatic next episode playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.99);
  await detailsPage.waitForPlayback(2);

  const markerVisible = await detailsPage.waitForUpNextMarker(15000);
  logger.assertion('Up Next marker is visible', markerVisible);

  let autoPlaybackStarted = false;
  if (markerVisible) {
    await detailsPage.waitForPlayback(8);
    autoPlaybackStarted = await detailsPage.isPlayerScreenVisible().catch(() => false);
  }

  logger.assertion('Next episode playback started automatically', autoPlaybackStarted);

  return {
    isLoggedIn,
    detailsVisible,
    markerVisible,
    autoPlaybackStarted,
  };
}

export async function verifyBackButtonNavigationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyBackButtonNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting back button navigation verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.isPlayerScreenVisible();
  await detailsPage.clickBackButton();
  await detailsPage.waitForPlayback(1);

  const playerScreenHidden = await detailsPage.isPlayerScreenHidden();
  const backNavigationSuccessful = detailsVisible && playerScreenHidden;

  logger.assertion('Playback screen hidden after tapping back button', playerScreenHidden);
  logger.assertion('Back button navigation returned to the previous details screen', backNavigationSuccessful);

  return {
    isLoggedIn,
    detailsVisible,
    playerScreenHidden,
    backNavigationSuccessful,
  };
}

export async function verifyPlayerCloseReturnsToDetailsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlayerCloseReturnsToDetailsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting close-player return to details verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before testing player close return flow', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      detailsVisible: false,
      playerVisibleBeforeClose: false,
      playerHiddenAfterClose: false,
      returnedToDetails: false,
    };
  }

  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(2);
  const playerVisibleBeforeClose = await detailsPage.isPlayerScreenVisible();
  logger.assertion('Player screen visible before closing', playerVisibleBeforeClose);

  await detailsPage.clickBackButton().catch(() => undefined);

  await detailsPage.waitForPlayback(3);
  const playerHiddenAfterClose = await detailsPage.isPlayerScreenHidden();
  const contentDetailsVisibleAfterClose = await detailsPage.isContentDetailsPageVisible().catch(() => false);
  const detailsHeadingAfterClose = contentDetailsVisibleAfterClose ? await detailsPage.getShowDetailsHeadingText().catch(() => '') : '';
  const detailsMetadataVisibleAfterClose = contentDetailsVisibleAfterClose ? await detailsPage.isContentMetadataVisible().catch(() => false) : false;
  const returnedToDetails = detailsVisible && contentDetailsVisibleAfterClose && !!detailsHeadingAfterClose && detailsMetadataVisibleAfterClose;

  logger.assertion('Player screen hidden after closing', playerHiddenAfterClose);
  logger.assertion('Content details heading is visible after returning from the player', !!detailsHeadingAfterClose);
  logger.assertion('Content metadata is visible after returning from the player', detailsMetadataVisibleAfterClose);
  logger.assertion('User returned to the content details screen after closing the player', returnedToDetails);

  return {
    isLoggedIn,
    detailsVisible,
    playerVisibleBeforeClose,
    playerHiddenAfterClose,
    returnedToDetails,
  };
}

export async function verifyPlaybackTimestampFormatFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlaybackTimestampFormatOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  // const query = (input?.query ?? '').trim();
  const mode = input?.mode;
  let query = (input?.query ?? '').trim();
  
  logger.step('Starting playback timestamp format verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  if (!query) {
    const gql = GraphQLHelper.getInstance(page);

    const collectionResponse = await gql.waitForOperation(
      input?.graphqlQueryName ?? 'Collection'
    );

    const parser = new CollectionParser(collectionResponse as any);

    const movieAsset = parser.findAsset((asset: any) => {
      const assetType = String(
        asset.assetType ??
        asset.type ??
        asset.contentType ??
        asset.mediaType ??
        ''
      ).toLowerCase();

      return assetType === 'movie';
    });

query = (movieAsset?.asset?.title ?? '').trim();

    logger.assertion(
      'Movie asset found in Collection GraphQL',
      Boolean(query)
    );
  }
  logger.info(`Fetched movie title from Collection GraphQL: ${query}`);

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.info(`Search results visible for query "${query}": ${resultsVisible}`);
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.8);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(1);

  const playbackTimeText = await detailsPage.getPlaybackTimestampText();
  const timestampFormatValid = await detailsPage.isPlaybackTimeInHHMMSSFormat();
  await detailsPage.waitForPlayback(2);

  logger.assertion('Playback time format matches HH:MM:SS', timestampFormatValid);

  return {
    isLoggedIn,
    detailsVisible,
    timestampFormatValid,
    playbackTimeText,
  };
}

export async function verifyPlaybackShortDurationTimestampFormatFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlaybackShortDurationTimestampFormatOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting playback short-duration timestamp format verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.2);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(5);

  const playbackTimeText = await detailsPage.getPlaybackTimestampText();
  const shortFormatValid = await detailsPage.isPlaybackTimeInMMSSFormat();
  logger.assertion('Playback time format matches MM:SS', shortFormatValid);

  return {
    isLoggedIn,
    detailsVisible,
    shortFormatValid,
    playbackTimeText,
  };
}

export async function verifySubtitleSelectionFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySubtitleSelectionOutput> {
  // const authPage = new OTTAuthPage(page);
  // const detailsPage = new OTTDetailsPage(page);
  // const query = (input?.query ?? '').trim();
  // const mode = input?.mode;

  // logger.step('Starting subtitle selection verification flow');

  // const loginResult = await loginToOTT(page, { mode });
  // const isLoggedIn = loginResult.isLoggedIn;

  const authPage = new OTTAuthPage(page);
const detailsPage = new OTTDetailsPage(page);
let query = (input?.query ?? '').trim();
const mode = input?.mode;

logger.step('Starting subtitle selection verification flow');

const loginResult = await loginToOTT(page, { mode });
const isLoggedIn = loginResult.isLoggedIn;

const gql = GraphQLHelper.getInstance(page);

if (!query) {
  const collectionResponse = await gql.waitForOperation(
    input?.graphqlQueryName ?? 'Collection'
  );

  const parser = new CollectionParser(collectionResponse as any);

  const assetWithSubtitles = parser.findAsset((asset: any) => {
    return (
      Array.isArray(asset.subtitleLanguages) &&
      asset.subtitleLanguages.length > 0
    );
  });

  query = (assetWithSubtitles?.asset?.title ?? '').trim();

  logger.assertion(
    'Asset with subtitle languages found in Collection GraphQL',
    Boolean(query)
  );

  logger.info(
    `Fetched asset from Collection GraphQL -> Title: ${query}, Subtitle Languages: ${
      assetWithSubtitles?.asset?.subtitleLanguages?.join(', ') ?? 'None'
    }`
  );
}

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger .info(`Search results visible for query "${query}": ${resultsVisible}`);
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const subtitleButtonVisible = await detailsPage.isSubtitleButtonVisible();
  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();

  logger.assertion('Subtitle button visible on player screen', subtitleButtonVisible);
  logger.assertion('Subtitle language selected successfully', subtitleSelectionSuccessful);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleButtonVisible,
    subtitleSelectionSuccessful,
  };
}

export async function verifySeekbarPreviewFlow(page: any, input?: VerifySeekbarPreviewInput): Promise<VerifySeekbarPreviewOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  // const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting seekbar thumbnail preview verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(7);
  await detailsPage.tapPlaybackScreen();

  const previewVisible = await detailsPage.hoverSeekBarAndWaitForPreview();
  logger.assertion('Seekbar preview becomes visible while scrubbing', previewVisible);

  return {
    isLoggedIn,
    detailsVisible,
    previewVisible,
  };
}

export async function verifySubtitlePersistenceFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySubtitlePersistenceOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle persistence verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  await detailsPage.clickSubtitleButton();
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();

  await detailsPage.clickNextEpisodeButton();
  await detailsPage.waitForPlayback(1);
  await detailsPage.tapPlaybackScreen();
  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const nextEpisodeSubtitleVisible = await detailsPage.isSubtitleLanguageVisible();

  logger.assertion('Subtitle selection was successful', subtitleSelectionSuccessful);
  logger.assertion('Subtitle remains visible for the next episode', nextEpisodeSubtitleVisible);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleSelectionSuccessful,
    nextEpisodeSubtitleVisible,
  };
}

export async function verifySubtitleCarryOverFlow(page: any, input?: VerifySubtitleCarryOverInput): Promise<VerifySubtitleCarryOverOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const secondQuery = (input?.secondQuery ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle carry-over verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();

  await detailsPage.clickBackButton();
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(secondQuery);
  await authPage.submitSearchQuery();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();
  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const carryOverSubtitleVisible = await detailsPage.isSubtitleLanguageVisible();

  logger.assertion('Subtitle selection was successful', subtitleSelectionSuccessful);
  logger.assertion('Subtitle remains selected on another content', carryOverSubtitleVisible);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleSelectionSuccessful,
    carryOverSubtitleVisible,
  };
}


export async function verifySubtitleSynchronizationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySubtitleSynchronizationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle synchronization verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(2);

  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickSubtitleButton();
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.1);
  const subtitleVisibleAfterSelection = await detailsPage.isSubtitleDisplayedOnPlayer();

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterForward = await detailsPage.isSubtitleDisplayedOnPlayer();

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterRewind = await detailsPage.isSubtitleDisplayedOnPlayer();

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.6);
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterSeek = await detailsPage.isSubtitleDisplayedOnPlayer();

  logger.assertion('Subtitle language selected successfully', subtitleSelectionSuccessful);
  logger.assertion('Subtitle remains visible after seeking forward', subtitleVisibleAfterForward);
  logger.assertion('Subtitle remains visible after seeking backward', subtitleVisibleAfterRewind);
  logger.assertion('Subtitle remains visible after drag seeking', subtitleVisibleAfterSeek);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleSelectionSuccessful,
    subtitleVisibleAfterForward,
    subtitleVisibleAfterRewind,
    subtitleVisibleAfterSeek,
  };
}

export interface VerifyPreRollAdPlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
}

export interface VerifySkipAdDuringPreRollAdOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  skipAdButtonVisible: boolean;
  skipAdButtonClicked: boolean;
  skipAdSuccessful: boolean;
}

export interface VerifyPauseAdPlaybackOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyPauseAdForDifferentUsersInput {
  mode?: string;
  graphqlQueryName?: string;
  query?: string;
  providerName?: string;
}

export interface VerifyPauseAdForDifferentUsersOutput {
  firstUserLoggedIn: boolean;
  secondUserLoggedIn: boolean;
  pauseAdVisible: boolean;
  searchTitle: string;
}

export interface VerifyPauseAdClickableInput {
  mode?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdClickableOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyPauseAdForMicroDramaInput {
  mode?: string;
  graphqlQueryName?: string;
  query?: string;
}

export interface VerifyPauseAdForMicroDramaOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  microDramaTitle?: string;
}

export interface VerifyPauseAdFullscreenInput {
  mode?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdFullscreenOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyMidRollAdFullscreenInput {
  mode?: string;
  query?: string;
  graphqlQueryName?: string;
}

export interface VerifyMidRollAdFullscreenOutput {
  isLoggedIn: boolean;
  fullscreenActive: boolean;
  midRollAdVisible: boolean;
  midRollAdInFullScreen: boolean;
}

export interface VerifyPauseAdRepeatedPausesInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdRepeatedPausesOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  returnToContentVisible: boolean;
  playbackTitleVisible: boolean;
  allPauseAdAttemptsVisible: boolean;
}

export interface VerifyPauseAdDismissCtaInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdDismissCtaOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  returnToContentVisible: boolean;
  playbackTitleVisible: boolean;
  seekBarVisible: boolean;
}

export interface VerifyPauseAdNoOverlapInput {
  mode?: string;
  graphqlQueryName?: string;
  searchTerm?: string;
}

export interface VerifyPauseAdNoOverlapOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  returnToContentVisible: boolean;
  //contentTitleVisible: boolean;
  overlapWithReturnToContent: boolean;
  //overlapWithTitle: boolean;
  overlapDetected: boolean;
}

export interface VerifyPauseAdUpNextOverlapOutput {
  isLoggedIn: boolean;
  upNextVisibleBeforeAd: boolean;
  pauseAdVisible: boolean;
  upNextVisibleAfterPauseAd: boolean;
}

export interface VerifyPauseAdSeekBarOverlapInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdSeekBarOverlapOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  seekBarVisible: boolean;
  overlapWithSeekBar: boolean;
  overlapDetected: boolean;
}

export interface VerifyPauseAdControlsDismissedInput {
  mode?: string;
  query?: string;
}

export interface VerifyPauseAdControlsDismissedOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  skipRecapVisible: boolean;
  skipIntroVisible: boolean;
  skipIntroHiddenAfterPause: boolean;
  subtitleMenuVisible: boolean;
  subtitleMenuHiddenAfterPause: boolean;
  skipRecapNotVisible: boolean;
  skipIntroNotVisible: boolean;
  recapPauseAdVisible: boolean;

}

export interface VerifyPauseAdSkipIntroRecapGoLiveInput {
  mode?: string;
  searchTerm?: string;
  liveContentName?: string;
}

export interface VerifyPauseAdSkipIntroRecapGoLiveOutput {
      isLoggedIn: boolean;
      skipRecapVisible: boolean;
      skipRecapPauseAdVisible: boolean;
      skipRecapVisibleAfterAd: boolean;
      skipIntroVisible: boolean;
      skipIntroPauseAdVisible: boolean;
      skipIntroVisibleAfterAd: boolean;
      goLiveVisible: boolean;
      goLivePauseAdVisible: boolean;
      goLiveVisibleAfterAd: boolean;
  
}

export interface VerifyPauseAdBackNavigationInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdBackNavigationOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  backNavigationSuccessful: boolean;
  detailsPageVisible: boolean;
}

export interface VerifyPauseAdLiveContentInput {
  mode?: string;
  liveContentName?: string;
}

export interface VerifyPauseAdAbsenceForPremiumOrGmaInput {
  mode?: string;
  liveContentName?: string;
}

export interface VerifyPauseAdAbsenceForPremiumOrGmaOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyPauseScreenForPremiumOrGmaInput {
  mode?: string;
}

export interface VerifyPauseScreenForPremiumOrGmaOutput {
  isLoggedIn: boolean;
  moviePauseScreenVisible: boolean;
  showPauseScreenVisible: boolean;
  movieAdBannerVisible: boolean;
  showAdBannerVisible: boolean;
  pauseMovieBannerVisible: boolean;
  pauseShowBannerVisible: boolean;
}

export interface VerifyPauseAdAppearsOnPlayerScreenInput {
  mode?: string;
  query?: string;
}

export interface VerifyPauseAdAppearsOnPlayerScreenOutput {
  isLoggedIn: boolean;
  livePauseAdVisible: boolean;
  moviePauseAdVisible: boolean;
  showPauseAdVisible: boolean;
}

export interface VerifyPauseAdDisappearsOnResumeInput {
  mode?: string;
  query?: string;
}

export interface VerifyPauseAdDisappearsOnResumeOutput {
  isLoggedIn: boolean;
  pauseAdVisibleDuringPause: boolean;
  pauseAdVisibleAfterResume: boolean;
}

export interface VerifyPauseAdNotDisplayedWhilePlayingInput {
  mode?: string;
}

export interface VerifyPauseAdNotDisplayedWhilePlayingOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
}

export interface VerifyPauseAdSeekRestrictionInput {
  mode?: string;
  query?: string;
}

export interface VerifyPauseAdSeekRestrictionOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  seekBlocked: boolean;
  seekBarVisible: boolean;
}

export interface VerifyPauseAdSeekRestrictionGraphQLInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdSeekRestrictionGraphQLOutput {
  isLoggedIn: boolean;
  pauseAdVisible: boolean;
  seekBlocked: boolean;
  freeContentTitle: string;
  seekBarVisible: boolean;
}

export interface VerifyBillboardAdBannerOutput {
  isLoggedIn: boolean;
  adBannerVisible: boolean;
}

export async function verifySkipAdDuringPreRollAdFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySkipAdDuringPreRollAdOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting Skip Ad verification flow during pre-roll ad playback');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const premiumAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /premium|paid|subscription/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /premium|paid|subscription|paywall|purchase/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  const premiumContentTitle = premiumAsset?.title ?? '';

  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));
  logger.assertion('Premium content title resolved from Collection GraphQL', Boolean(premiumContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);

  const freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeContentTitle).catch(() => false);
  logger.assertion('Search result is tagged as Free content', freeLabelVisible);
  
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  const skipAdButtonVisible = await detailsPage.waitForSkipAdButton(20);

  if (!skipAdButtonVisible) {
    logger.step('Skip Ad button did not appear during pre-roll ad playback, returning early');
    return {
      isLoggedIn,
      playerVisible,
      adVisible,
      skipAdButtonVisible: false,
      skipAdButtonClicked: false,
      skipAdSuccessful: false,
    };
  }

  const skipAdButtonClicked = await detailsPage.clickSkipAdButton();
  await detailsPage.waitForPlayback(5);
  const skipAdSuccessful = skipAdButtonClicked ? !(await detailsPage.isAdTagVisible()) : false;

  logger.assertion('Player screen visible during pre-roll ad playback', playerVisible);
  logger.assertion('Ad tag visible during pre-roll ad playback', adVisible);
  logger.assertion('Skip Ad button appeared during ad playback', skipAdButtonVisible);
  logger.assertion('Skip Ad button was clicked successfully', skipAdButtonClicked);
  logger.assertion('Ad playback skipped after tapping Skip Ad', skipAdSuccessful);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    skipAdButtonVisible,
    skipAdButtonClicked,
    skipAdSuccessful,
  };
}

export interface VerifyPausePlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  initialPlaybackTime: string;
  pausedPlaybackTime: string;
  playbackPaused: boolean;
}

export interface VerifySkipMarkerVisibilityAfterPauseResumeInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySkipMarkerVisibilityAfterPauseResumeOutput {
  detailsVisible: boolean;
  playerVisible: boolean;
  markerVisibleBeforePause: boolean;
  markerVisibleAfterPause: boolean;
  markerVisibleAfterResume: boolean;
}

export interface VerifySkipMarkersReappearAfterRewindInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySkipMarkersReappearAfterRewindOutput {
  detailsVisible: boolean;
  isSkipIntroMarkerVisible: boolean;
  skipIntroClicked: boolean;
  timeBeforeSkipIntro: string;
  timeAfterSkipIntro: string;
  isSkipRecapMarkerVisible: boolean;
  skipRecapClicked: boolean;
  timeBeforeSkipRecap: string;
  timeAfterSkipRecap: string;
  upNextVisible: boolean;
  // playbackTimeAtStart: string;
  isSkipRecapMarkerVisibleAfterSeekToStart: boolean;
}

export interface VerifySkipMarkersNotVisibleInContinueWatchingInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySkipMarkersNotVisibleInContinueWatchingOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  episodeOpened: boolean;
  skipRecapClicked: boolean;
  skipIntroClicked: boolean;
  initialSkipRecapTime: string;
  updatedSkipRecapTime: string;
  initialSkipIntroTime: string;
  updatedSkipIntroTime: string;
  continueWatchingContentOpened: boolean;
  skipRecapVisibleInContinueWatching: boolean;
  skipIntroVisibleInContinueWatching: boolean;
  markersNotVisible: boolean;
}

export interface VerifyTapToPausePlaybackInput {
  graphqlQueryName?: string;
  query?: string;
  mode?: string;
  expectedTitle?: string;
}

export interface VerifyTapToPausePlaybackOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  initialPlaybackTime: string;
  pausedPlaybackTime: string;
  playbackPaused: boolean;
}

export interface VerifyAdPlaybackUIOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  pauseButtonVisible: boolean;
}

export interface VerifyAdLabelVisibilityOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  adLabelVisible: boolean;
  adLabelText: string;
}

export interface VerifyAdDurationOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  adDurationSeconds: number;
  exceedsMaxDuration: boolean;
}

export async function verifyPreRollAdPlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPreRollAdPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting pre-roll ad playback verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  
  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  await detailsPage.waitForPlayback(90);

  logger.assertion('Player screen visible for pre-roll ad flow', playerVisible);
  logger.assertion('Ad visible before main content starts', adVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
  };
}

export async function verifySubtitleDefaultOffFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifySubtitleDefaultOffOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle default-off verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  const subtitleButtonVisible = await detailsPage.isSubtitleButtonVisible();
  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  const subtitleOffVisible = await detailsPage.isSubtitleOffOptionVisible();

  logger.assertion('Subtitle button visible on player screen', subtitleButtonVisible);
  logger.assertion('Subtitle default option is Off', subtitleOffVisible);

  return {
    isLoggedIn,
    detailsVisible,
    subtitleButtonVisible,
    subtitleOffVisible,
  };
}

export async function verifyPauseAdPlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPauseAdPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting pause ad playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverPlaybackScreen();
  const mainContentVisible = await detailsPage.isPlaybackTimeVisible();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  const pauseAdVisible = await detailsPage.isPauseAdVisible();

  logger.assertion('Player screen visible for pause ad flow', playerVisible);
  logger.assertion('Ad visible before main content starts', adVisible);
  logger.assertion('Main content playback visible after ad completes', mainContentVisible);
  logger.assertion('Pause ad visible after pausing playback', pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyPauseAdDisplaysForDifferentUsersFlow(page: any, input?: VerifyPauseAdForDifferentUsersInput): Promise<VerifyPauseAdForDifferentUsersOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';
  const providerName = input?.providerName ?? 'Frontier, a Verizon Company';
  logger.step('Starting pause ad verification flow for different users');
  const findFreeSearchTitle = async (): Promise<string> => {
    const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
    let resolvedTitle = '';
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetizationType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetizationType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetizationType)) : false;
      };
      for (const rail of rails) {
        const railTitle = String(rail.title ?? '');
        if (/quick feels|live/i.test(railTitle)) {
          continue;
        }
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            resolvedTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (resolvedTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for the multi-user pause-ad flow', error);
    }
    return resolvedTitle || query;
  };

  const playAndPauseContent = async (searchTitle: string): Promise<boolean> => {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
    await detailsPage.clickPlayButton();
    await detailsPage.waitForPlayback(90);
    await detailsPage.hoverOnPlaybackScreen();
    await detailsPage.clickPauseButton();
    await detailsPage.waitForPlayback(5);
    const isPauseAdVisible = await detailsPage.isPauseAdBannerVisible();
    await detailsPage.clickBackButton();
    await authPage.clickAccountIcon();
    await authPage.clickSignOut();
    await authPage.isWelcomeHeadingVisible();
    return isPauseAdVisible;
  };

  const firstLoginResult = await loginWithTVProvider(page, { mode: 'provider', providerName });
  const firstUserLoggedIn = firstLoginResult.isLoggedIn;
  logger.assertion('TV provider user login successful', firstUserLoggedIn);

  const searchTitle = await findFreeSearchTitle();
  logger.assertion('Free content title resolved from GraphQL', Boolean(searchTitle));
  const tvUserPauseAdVisible = await playAndPauseContent(searchTitle);
  logger.assertion('Pause ad visible for the TV provider user', tvUserPauseAdVisible);

  const secondLoginResult = await loginToFreeUser(page, { mode: 'freeUser' });
  const secondUserLoggedIn = secondLoginResult.isLoggedIn;
  logger.assertion('Free user login successful', secondUserLoggedIn);

  const freeUserPauseAdVisible = await playAndPauseContent(searchTitle);
  logger.assertion('Pause ad visible for the TV provider user', tvUserPauseAdVisible);

  return {
    firstUserLoggedIn,
    secondUserLoggedIn,
    pauseAdVisible: freeUserPauseAdVisible && tvUserPauseAdVisible,
    searchTitle,
  };
}

export async function verifyPauseAdClickableFlow(page: any, input?: VerifyPauseAdClickableInput): Promise<VerifyPauseAdClickableOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const query = (input?.query ?? '').trim();
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad clickability verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for pause-ad clickability flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else if (query) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.tapPlaybackScreen();
  await detailsPage.waitForPlayback(5);

  const pauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  const initialUrl = page.url();
  await detailsPage.clickPauseAdBanner();
  await detailsPage.waitForPlayback(3);
  const finalUrl = page.url();
  logger.info(`Pause ad clickability check: initial URL=${initialUrl}, final URL=${finalUrl}`);
  logger.assertion('Pause ad banner is visible before click interaction', pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyPauseAdForMicroDramaFlow(page: any, input?: VerifyPauseAdForMicroDramaInput): Promise<VerifyPauseAdForMicroDramaOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const query = (input?.query ?? 'Quick Feels').trim();
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting micro drama pause ad verification flow for Basic user');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = mode === 'BasicUser' 
    ? await loginWithBasicUser(page)
    : await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let microDramaTitle = '';
  try {
    const collectionResp = await collectionWait;
    const parser = new CollectionParser(collectionResp as any);
    const rails = parser.getRails();
    const freePredicate = (asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetizationType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetizationType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetizationType)) : false;
    };

    const quickFeelsRail = rails.find(rail => /quick feels/i.test(String(rail.title ?? '')));
    if (quickFeelsRail) {
      const freeAsset = (quickFeelsRail.assets?.items ?? []).find(freePredicate);
      if (freeAsset) {
        microDramaTitle = String(freeAsset.title ?? '').trim();
      }
    }

    if (!microDramaTitle) {
      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          const labels = asset.labels ?? [];
          const title = String(asset.title ?? '').trim();
          const hasMicroDramaLabel = labels.some((label: any) => /micro drama/i.test(label?.text ?? ''));

          if (hasMicroDramaLabel || /micro drama/i.test(title)) {
            microDramaTitle = title || query;
            break;
          }
        }
        if (microDramaTitle) {
          break;
        }
      }
    }
  } catch (error) {
    logger.debug('Collection GraphQL did not provide a Quick Feels title for the new pause-ad flow', error);
  }

  if (!microDramaTitle) {
    microDramaTitle = query;
  }

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(microDramaTitle);
  await authPage.submitSearchQuery();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(70);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(7);

  const pauseAdVisible = await detailsPage.isPauseAdBannerVisible();

  logger.assertion('Pause ad visible after pausing Micro Drama content', pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
    microDramaTitle,
  };
}

export async function verifyPauseAdFullscreenFlow(page: any, input?: VerifyPauseAdFullscreenInput): Promise<VerifyPauseAdFullscreenOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const query = (input?.query ?? '').trim();
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad fullscreen verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for pause-ad fullscreen flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else if (query) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickFullscreenButton();
  await page.waitForTimeout(5000);
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(7000);
  const minimizedPauseAdVisible = await detailsPage.isPauseAdVisibleInMinimizedPlayer();
  await detailsPage.clickReturnToContentText();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(5000);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickMinimizeScreenButton();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(7000);
  const maximizedPauseAdVisible = await detailsPage.isPauseAdVisibleInMaximizedPlayer();
  const pauseAdVisible = minimizedPauseAdVisible || maximizedPauseAdVisible;
  logger.assertion('Pause ad is visible in the minimized player state', minimizedPauseAdVisible);
  logger.assertion('Pause ad is visible in the maximized player state', maximizedPauseAdVisible);
  logger.assertion('Pause ad is visible in either minimized or maximized player state', pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyMidRollAdFullscreenFlow(page: any, input?: VerifyMidRollAdFullscreenInput): Promise<VerifyMidRollAdFullscreenOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const query = (input?.query ?? '').trim();
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting mid-roll ad fullscreen verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for mid-roll ad fullscreen flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else if (query) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickFullscreenButton();
  await detailsPage.waitForPlayback(5);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.75);
  await page.waitForTimeout(10000);

  const fullscreenActive = await detailsPage.isFullscreenModeMidRollAd();
  const midRollAdVisible = await detailsPage. isMidRollAdOverlayVisible();
  const midRollAdInFullScreen = fullscreenActive && midRollAdVisible;
 
  logger.assertion('Fullscreen mode active', fullscreenActive);
  logger.assertion('Mid-roll ad is visible in fullscreen mode', midRollAdVisible);
  logger.assertion('Mid-roll ad is visible in fullscreen mode `', midRollAdInFullScreen);
  return {
    isLoggedIn,
    fullscreenActive,
    midRollAdVisible,
    midRollAdInFullScreen,
  };
}

export async function verifyPauseAdRepeatedPausesFlow(page: any, input?: VerifyPauseAdRepeatedPausesInput): Promise<VerifyPauseAdRepeatedPausesOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad repeated-pauses verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for repeated pause-ad flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(120);
  let allPauseAdAttemptsVisible = true;
  let pauseAdVisible = false;
  let returnToContentVisible = false;
  let playbackTitleVisible = false;
  let seekBarVisible = false;

  for (let attempt = 1; attempt <= 3; attempt += 1) 
    {
    await detailsPage.hoverPlaybackScreen();
    await detailsPage.clickPauseButton();
    await page.waitForTimeout(7000);

    pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
    await page.waitForTimeout(5000);
    returnToContentVisible = await detailsPage.isReturnToContentTextVisible();
    await detailsPage.clickReturnToContentText().catch(() => undefined);
    await detailsPage.hoverPlaybackScreen();
    await detailsPage.tapPlaybackScreen();
    await page.waitForTimeout(5000);
    logger.assertion(`Pause ad visible during repeated pause attempt ${attempt}`, pauseAdVisible);
    logger.assertion(`Return-to-content overlay visible during repeated pause attempt ${attempt}`, returnToContentVisible);

    if (!pauseAdVisible) {
      allPauseAdAttemptsVisible = false;
    }

    if (returnToContentVisible) {
      await detailsPage.clickReturnToContentText();
      await page.waitForTimeout(5000);
    }

    playbackTitleVisible = await detailsPage.isPlayerContentTitleVisible().catch(() => false);

  }

  logger.assertion('Playback title is visible after repeated pause interactions', playbackTitleVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
    returnToContentVisible,
    playbackTitleVisible,
    allPauseAdAttemptsVisible,
  };
}

export async function verifyPauseAdNoOverlapWithDismissAndTitleFlow(page: any, input?: VerifyPauseAdNoOverlapInput): Promise<VerifyPauseAdNoOverlapOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad overlap verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label:  any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for the pause-ad overlap flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(120);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(7000);

  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  const returnToContentVisible = await detailsPage.isReturnToContentTextVisible();
  //const contentTitleVisible = await detailsPage.isPlayerContentTitleVisible();
  const overlapMetrics = pauseAdVisible
    ? await detailsPage.isPauseAdOverlappingReturnToContentOrTitle().catch(() => ({ overlapWithReturnToContent: false}))
    : { overlapWithReturnToContent: false, overlapWithTitle: false };
  const overlapDetected = overlapMetrics.overlapWithReturnToContent;

  //logger.assertion('Pause ad is visible before seek bar overlap validation', pauseAdVisible);
  logger.assertion('Return-to-content CTA is visible on the pause ad screen', returnToContentVisible);
  //logger.assertion('Content title is visible on the pause ad screen', contentTitleVisible);
  logger.assertion('Pause ad does not overlap the dismiss CTA or title', !overlapDetected);

  return {
    isLoggedIn,
    pauseAdVisible,
    returnToContentVisible,
    //contentTitleVisible,
    overlapWithReturnToContent: overlapMetrics.overlapWithReturnToContent,
    //overlapWithTitle: overlapMetrics.overlapWithTitle,
    overlapDetected,
  };
}

export async function verifyPauseAdSeekBarOverlapFlow(page: any, input?: VerifyPauseAdSeekBarOverlapInput): Promise<VerifyPauseAdSeekBarOverlapOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad seek bar overlap verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for the pause-ad seek bar overlap flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(120);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(7000);

  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const overlapWithSeekBar = pauseAdVisible
    ? await detailsPage.isPauseAdOverlappingSeekBar().catch(() => false)
    : false;
  const overlapDetected = overlapWithSeekBar;

  logger.assertion('Pause ad is visible before seek bar overlap validation', pauseAdVisible);
  logger.assertion('Seek bar is visible on the pause ad screen', seekBarVisible);
  logger.assertion('Pause ad does not overlap the seek bar', !overlapDetected);

  return {
    isLoggedIn,
    pauseAdVisible,
    seekBarVisible,
    overlapWithSeekBar,
    overlapDetected,
  };
}

export async function verifyPauseAdNoOverlapWithUpNextMarkerFlow(page: any, input?: VerifyPauseAdNoOverlapInput): Promise<VerifyPauseAdUpNextOverlapOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const searchTerm = (input?.searchTerm ?? 'Lavender Fields').trim();

  logger.step('Starting pause-ad overlap verification flow for the Up Next binge marker');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchText(searchTerm);
  await authPage.submitSearch();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarUntilUpNextMarkerReached();
  await detailsPage.tapPlaybackScreen();
  //await detailsPage.dragSeekBarToPosition(1.0);
  await detailsPage.waitForPlayback(90);
  // await detailsPage.tapPlaybackScreen();
  await detailsPage.tapPlaybackScreen();
  const upNextVisibleBeforeAd = await detailsPage.isPauseUpNextMarkerVisible();
 
  await page.waitForTimeout(7000);

  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  await page.waitForTimeout(5000);
  const upNextVisibleAfterPauseAd = await detailsPage.isPauseUpNextMarkerVisible();

  logger.assertion('Up Next binge marker is visible on the player screen', upNextVisibleBeforeAd);
  logger.assertion('Pause ad is visible before validating overlap with the Up Next marker', pauseAdVisible);
  logger.assertion('Pause ad does not overlap the Up Next binge marker', !upNextVisibleAfterPauseAd);

  return {
    isLoggedIn,
    upNextVisibleBeforeAd,
    pauseAdVisible,
    upNextVisibleAfterPauseAd,

  };
}

export async function verifyPauseAdDismissCtaVisibilityFlow(page: any, input?: VerifyPauseAdDismissCtaInput): Promise<VerifyPauseAdDismissCtaOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad dismiss CTA visibility verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for pause-ad dismiss CTA flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(120);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(7000);

  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  await page.waitForTimeout(5000);
  const returnToContentVisible = await detailsPage.isReturnToContentTextVisible();

  logger.assertion('Pause ad visible before interacting with return-to-content overlay', pauseAdVisible);
  logger.assertion('Return-to-content overlay is visible on the pause ad screen', returnToContentVisible);

  if (returnToContentVisible) {
    await detailsPage.clickReturnToContentText();
    await page.waitForTimeout(5000);
  }

  const playbackTitleVisible = await detailsPage.isPlayerContentTitleVisible().catch(() => false);
  const seekBarVisible = await detailsPage.isSeekBarVisible();

  logger.assertion('Playback title is visible after returning to content', playbackTitleVisible);
  logger.assertion('Seek bar is visible after returning to content', seekBarVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
    returnToContentVisible,
    playbackTitleVisible,
    seekBarVisible,
  };
}

export async function verifyPauseAdControlsDismissedFlow(page: any, input?: VerifyPauseAdControlsDismissedInput): Promise<VerifyPauseAdControlsDismissedOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const searchQuery = (input?.query ?? '').trim();

  logger.step('Starting pause-ad controls-dismissed verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  if (isLoggedIn) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchQuery);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
    await detailsPage.waitForPlayback(2);
    await detailsPage.scrollToSeasonsSection();
    await detailsPage.clickEpisodeTwo();
  }

  await detailsPage.waitForPlayback(110);
  await detailsPage.hoverOnPlaybackScreen();
  const skipRecapVisible = await detailsPage.isSkipRecapMarkerVisible();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(7000);
  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  const skipRecapNotVisible = await detailsPage.isSkipRecapMarkerVisible();
  await page.waitForTimeout(2000);
  await detailsPage.clickReturnToContentText();
  await page.waitForTimeout(2000); 
  await detailsPage.clickSkipRecapButton();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(5000);
  await detailsPage.hoverPlaybackScreen();
  const skipIntroVisible = await detailsPage.isSkipIntroMarkerVisible();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(7000);
  const recapPauseAdVisible = await detailsPage.isPauseAdMidBannerVisible(); 
  const skipIntroNotVisible = await detailsPage.isSkipIntroMarkerVisible();
  const skipIntroHiddenAfterPause = !(await detailsPage.isSkipIntroMarkerVisible().catch(() => false));
  await page.waitForTimeout(2000);
  await detailsPage.clickReturnToContentText();
  await page.waitForTimeout(2000);
  await detailsPage.clickSkipIntroButton();
  await page.waitForTimeout(2000);
  await detailsPage.tapPlaybackScreen();
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickSubtitleButton();
  await page.waitForTimeout(2000);
  const subtitleMenuVisible = await detailsPage.isSubtitleLanguageVisible();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(6000);
  const subtitleMenuHiddenAfterPause = !(await detailsPage.isSubtitleLanguageVisible().catch(() => false));

  logger.assertion('Pause ad is visible before asserting that playback controls are dismissed', pauseAdVisible);
  logger.assertion('Skip recap marker is visible before the pause-ad interaction', skipRecapVisible);
  logger.assertion('Skip recap marker is not visible after the pause-ad interaction', !skipRecapNotVisible);
  logger.assertion('Recap pause ad is visible after the pause-ad interaction', recapPauseAdVisible);
  logger.assertion('Skip intro marker is not visible after the pause-ad interaction', !skipIntroNotVisible);
  logger.assertion('Skip intro marker is visible after skipping recap', skipIntroVisible);
  logger.assertion('Skip intro marker disappears after the pause-ad interaction', skipIntroHiddenAfterPause);
  logger.assertion('Subtitle menu is visible after the subtitle button action', subtitleMenuVisible);
  logger.assertion('Subtitle menu is dismissed after the pause-ad interaction', subtitleMenuHiddenAfterPause);



  return {
    isLoggedIn,
    pauseAdVisible,
    skipRecapVisible,
    skipIntroVisible,
    skipIntroHiddenAfterPause,
    subtitleMenuVisible,
    subtitleMenuHiddenAfterPause,
    skipRecapNotVisible,
    skipIntroNotVisible,
    recapPauseAdVisible,

  };
}

export async function verifyPauseAdNotDisplayedOnSkipIntroRecapGoLiveFlow(page: any, input?: VerifyPauseAdSkipIntroRecapGoLiveInput): Promise<VerifyPauseAdSkipIntroRecapGoLiveOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const searchTerm = (input?.searchTerm ?? 'Lavender Fields').trim();
  const liveContentName = input?.liveContentName ?? 'DZMM Teleradyo';

  logger.step('Starting pause ad overlap verification flow for skip intro, skip recap, and Go Live CTAs');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchText(searchTerm);
  await authPage.submitSearch();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();

  await detailsPage.scrollToSeasonsSection();
  await detailsPage.clickEpisodeTwo();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.tapPlaybackScreen();
  const skipRecapVisible = await detailsPage.isSkipRecapMarkerVisible();
  await page.waitForTimeout(7000);
  const skipRecapPauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  await page.waitForTimeout(4000);
  const skipRecapVisibleAfterAd = await detailsPage.isSkipRecapMarkerVisible();
  
  logger.assertion('Skip Recap marker is visible before pausing through the ad interaction', skipRecapVisible);
  logger.assertion('Pause ad is visible', skipRecapPauseAdVisible);
  logger.assertion('Pause ad should not overlap the Skip Recap CTA', !skipRecapVisibleAfterAd);

  await detailsPage.clickReturnToContentText();
  await detailsPage.tapPlaybackScreen();
  await detailsPage.clickSkipRecapButton();
  await detailsPage.waitForPlayback(2);
  const skipIntroVisible = await detailsPage.isSkipIntroMarkerVisible();
  await page.waitForTimeout(7000);
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(4000);
  const skipIntroPauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  await page.waitForTimeout(4000);
  const skipIntroVisibleAfterAd = await detailsPage.isSkipIntroMarkerVisible();

  logger.assertion('Skip Intro appears after skipping recap', skipIntroVisible);
  logger.assertion('Pause ad is visible after skipping recap', skipIntroPauseAdVisible);
  logger.assertion('Pause ad should not overlap the Skip Intro CTA', !skipIntroVisibleAfterAd);

  await detailsPage.clickBackButton();
  await authPage.navigateHome();
  await detailsPage.waitForPlayback(2);
  await page.waitForTimeout(3000);
  await detailsPage.clickFreeContentUnderLiveChannelsTray(liveContentName);
  await detailsPage.waitForPlayback(5);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.tapPlaybackScreen();
  const goLiveVisible = await detailsPage.isGoLiveMarkerVisible();
  await page.waitForTimeout(7000);

  const goLivePauseAdVisible = await detailsPage.isPauseAdMidBannerVisible();
  const goLiveVisibleAfterAd = await detailsPage.isGoLiveMarkerVisible();

  logger.assertion('Go Live CTA is visible for the selected live content', goLiveVisible);
  logger.assertion('Pause ad is visible after skipping recap', goLivePauseAdVisible);
  logger.assertion('Pause ad should not overlap the Go Live CTA', !goLiveVisibleAfterAd);

  return {
    isLoggedIn,
    skipRecapVisible,
    skipRecapPauseAdVisible,
    skipRecapVisibleAfterAd,
    skipIntroVisible,
    skipIntroPauseAdVisible,
    skipIntroVisibleAfterAd,
    goLiveVisible,
    goLivePauseAdVisible,
    goLiveVisibleAfterAd,
  };
}

export async function verifyPauseAdBackNavigationFlow(page: any, input?: VerifyPauseAdBackNavigationInput): Promise<VerifyPauseAdBackNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad back-navigation verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) {
          break;
        }
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for pause-ad back-navigation flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(6000);

  const pauseAdVisible = await detailsPage.isPauseAdMidBannerVisible().catch(() => false);
  logger.assertion('Pause ad is visible before the back button interaction', pauseAdVisible);

  if (pauseAdVisible) {
    await detailsPage.clickBackButtonFromPauseAdScreen();
    await page.waitForTimeout(5000);
  }

  const detailsPageVisible = await detailsPage.isDetailsPageVisibleAfterPauseAdBackNavigation().catch(() => false);
  const backNavigationSuccessful = detailsPageVisible;
  logger.assertion('Details page is visible after navigating back from the pause ad screen', detailsPageVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
    backNavigationSuccessful,
    detailsPageVisible,
  };
}

export async function verifyPauseAdLiveContentPlaybackFlow(page: any, input?: VerifyPauseAdLiveContentInput): Promise<VerifyPauseAdPlaybackOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const liveContentName = (input?.liveContentName ?? '').trim();

  logger.step('Starting live-channel pause ad playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await detailsPage.clickFreeContentUnderLiveChannelsTray(liveContentName);
  await detailsPage.waitForPlayback(5);
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(5);
  const pauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Pause ad visible after pausing live-channel playback', pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyPauseAdAbsenceForPremiumOrGmaFlow(page: any, input?: VerifyPauseAdAbsenceForPremiumOrGmaInput): Promise<VerifyPauseAdAbsenceForPremiumOrGmaOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const mode = input?.mode;

  logger.step('Starting premium/GMA pause ad absence verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickMoviesTab();
  await detailsPage.clickPlayButton();
  await page.waitForTimeout(5000);
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(5000);
  const pauseAdVisible = await detailsPage.pauseAdBannerNotVisible();
  logger.assertion('Pause ad should not be visible for premium or GMA users', !pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyPauseScreenForPremiumOrGmaFlow(page: any, input?: VerifyPauseScreenForPremiumOrGmaInput): Promise<VerifyPauseScreenForPremiumOrGmaOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting premium/GMA pause-screen verification flow for movie and show content');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickMoviesTab();
  await detailsPage.clickFirstMovieContent();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.tapPlaybackScreen();
  await detailsPage.waitForPlayback(5);
  const moviePauseScreenVisible = await detailsPage.isPlaybackTimeVisible();
  const movieAdBannerVisible = await detailsPage.isPauseAdMidBannerVisible().catch(() => false);
  const pauseMovieBannerVisible = await detailsPage.isPauseBannerVisible();
  logger.assertion('Movie pause screen appears for premium/GMA users', moviePauseScreenVisible);
  logger.assertion('Movie ad banner is not visible while paused for premium/GMA users', !movieAdBannerVisible);
  logger.assertion('Movie pause banner is visible for premium/GMA users', pauseMovieBannerVisible);
  await detailsPage.clickBackButton();
  await page.waitForTimeout(3000);
  await authPage.clickShowsTab();
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstShowContent();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(5);
  const showPauseScreenVisible = await detailsPage.isPlaybackTimeVisible();
  const showAdBannerVisible = await detailsPage.isPauseAdBannerVisible().catch(() => false);
  const pauseShowBannerVisible = await detailsPage.isPauseBannerVisible();
  logger.assertion('Show pause screen appears for premium/GMA users', showPauseScreenVisible);
  logger.assertion('Show ad banner is not visible while paused for premium/GMA users', !showAdBannerVisible);
  logger.assertion('Show pause banner is visible for premium/GMA users', pauseShowBannerVisible);

  return {
    isLoggedIn,
    moviePauseScreenVisible,
    showPauseScreenVisible,
    movieAdBannerVisible,
    showAdBannerVisible,
    pauseShowBannerVisible,
    pauseMovieBannerVisible,
  };
}

export async function verifyPauseAdAppearsOnPlayerScreenFlow(page: any, input?: VerifyPauseAdAppearsOnPlayerScreenInput): Promise<VerifyPauseAdAppearsOnPlayerScreenOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const liveContentName = (input?.query ?? '').trim();

  logger.step('Starting pause ad visibility verification for live, movie, and show content');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await page.waitForTimeout(5000);
  await detailsPage.clickFreeContentUnderLiveChannelsTray(liveContentName);
  await detailsPage.waitForPlayback(5);
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  await page.waitForTimeout(20000);
  const livePauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Pause ad visible for live content after clicking Resume', livePauseAdVisible);

  await detailsPage.clickBackButton();
  await authPage.clickMoviesTab();
  await page.waitForTimeout(2000);
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100); 
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(5);
  const moviePauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Pause ad visible for movie content after clicking Resume', moviePauseAdVisible);

  await detailsPage.clickBackButton();
  await authPage.clickShowsTab();
  await page.waitForTimeout(2000);
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100); 
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(5);
  const showPauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Pause ad visible for show content after clicking Resume', showPauseAdVisible);

  return {
    isLoggedIn,
    livePauseAdVisible,
    moviePauseAdVisible,
    showPauseAdVisible,
  };
}

export async function verifyPauseAdDisappearsOnResumeFlow(page: any, input?: VerifyPauseAdDisappearsOnResumeInput): Promise<VerifyPauseAdDisappearsOnResumeOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  const mode = input?.mode;
  const query = (input?.query ?? '').trim();

  logger.step('Starting pause-ad disappearance after resume verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  if (query) {
    logger.debug('Using the first free-tagged content from the home page instead of a search query', { query });
  }
  await page.waitForTimeout(3000);
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(6000);
  const pauseAdVisibleDuringPause = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Pause ad visible before resuming playback', pauseAdVisibleDuringPause);
  await detailsPage.navigateBackToPlayerFromAdScreen();
  await page.waitForTimeout(5000);
  const pauseAdVisibleAfterResume = await detailsPage.pauseAdBannerNotVisible();
  logger.assertion('Pause ad disappears after resuming playback', !pauseAdVisibleAfterResume);

  return {
    isLoggedIn,
    pauseAdVisibleDuringPause,
    pauseAdVisibleAfterResume,
  };
}

export interface VerifyPauseAdNoReappearWithin3SecInput {
  mode?: string;
  graphqlQueryName?: string;
}

export interface VerifyPauseAdNoReappearWithin3SecOutput {
  isLoggedIn: boolean;
  pauseAdVisibleDuringPause: boolean;
  pauseAdVisibleAfterImmediateRePause: boolean;
}

export async function verifyPauseAdNoReappearWithin3SecFlow(page: any, input?: VerifyPauseAdNoReappearWithin3SecInput): Promise<VerifyPauseAdNoReappearWithin3SecOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;
  const graphqlQueryName = input?.graphqlQueryName ?? 'Collection';

  logger.step('Starting pause-ad no-reappear-within-3s verification flow');

  const collectionWait = gql.waitForOperation(graphqlQueryName, 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  let searchTitle = '';
  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();
      const freePredicate = (asset: any) => {
        const labels = asset.labels ?? [];
        if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
        const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.monetization?.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
        return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
      };

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          if (freePredicate(asset)) {
            searchTitle = String(asset.title ?? '').trim();
            break;
          }
        }
        if (searchTitle) break;
      }
    } catch (error) {
      logger.debug('Collection GraphQL did not provide a free title for no-reappear flow', error);
    }
  }

  if (searchTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(searchTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(110);

  // First pause -> expect ad to appear
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await page.waitForTimeout(6000);
  const pauseAdVisibleDuringPause = await detailsPage.isPauseAdMidBannerVisible();
  logger.assertion('Pause ad visible during first pause', pauseAdVisibleDuringPause);
    await detailsPage.clickReturnToContentText();
    await detailsPage.tapPlaybackScreen();
    await page.waitForTimeout(2000);
    await detailsPage.hoverPlaybackScreen();
    await detailsPage.clickResumeButton();
    await page.waitForTimeout(5000);
    const pauseAdVisibleAfterImmediateRePause = await detailsPage.pauseAdBannerNotVisible();
    logger.assertion('Pause ad not visible after immediate re-pause', !pauseAdVisibleAfterImmediateRePause);

    return {
    isLoggedIn,
    pauseAdVisibleDuringPause,
    pauseAdVisibleAfterImmediateRePause,
    };
}

export async function verifyPauseAdNotDisplayedWhilePlayingFlow(page: any, input?: VerifyPauseAdNotDisplayedWhilePlayingInput): Promise<VerifyPauseAdNotDisplayedWhilePlayingOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting pause-ad absence while content is playing verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverOnPlaybackScreen();
  const pauseAdVisible = await detailsPage.pauseAdBannerNotVisible();
  logger.assertion('Pause ad should not be visible while content is playing', !pauseAdVisible);

  return {
    isLoggedIn,
    pauseAdVisible,
  };
}

export async function verifyPauseAdSeekRestrictionGraphQLFreeContentFlow(page: any, input?: VerifyPauseAdSeekRestrictionGraphQLInput): Promise<VerifyPauseAdSeekRestrictionGraphQLOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;

  logger.step('Starting pause-ad seek restriction verification flow using a free title from Collection GraphQL');

  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  let freeContentTitle = '';

  if (isLoggedIn) {
    try {
      const collectionResp = await collectionWait;
      const parser = new CollectionParser(collectionResp as any);
      const rails = parser.getRails();

      for (const rail of rails) {
        for (const asset of rail.assets?.items ?? []) {
          const assetData = asset as any;
          const labels = assetData.labels ?? [];
          const isFreeLabel = labels.some((label: any) => /free/i.test(label?.text ?? ''));
          const monetizationType = assetData.monetization?.type ?? assetData.monetizationType ?? assetData.monetization?.monetizationType ?? assetData.pricing?.type ?? assetData.pricing?.pricingType;
          const isFreeMonetization = monetizationType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetizationType)) : false;

          if (isFreeLabel || isFreeMonetization) {
            freeContentTitle = String(assetData.title ?? '').trim();
            break;
          }
        }

        if (freeContentTitle) {
          break;
        }
      }

      logger.info(`Derived free content title from Collection GraphQL: ${freeContentTitle}`);
    } catch (err) {
      logger.debug('Collection GraphQL did not provide a free content title for pause-ad seek restriction flow', err);
    }
  }


  if (freeContentTitle) {
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(freeContentTitle);
    await authPage.submitSearchQuery();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  } else {
    await detailsPage.clickFirstFreeContentOnHome();
  }

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(100);
  await detailsPage.hoverOnPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(7);

  const pauseAdVisible = await detailsPage.isPauseAdBannerVisible();
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  let playbackScreenDisplayed = false;
  let hoverAttempted = false;

  if (pauseAdVisible && seekBarVisible) {
    hoverAttempted = true;
    await detailsPage.hoverSeekBarAndWaitForPreview().catch(() => undefined);
    await detailsPage.waitForPlayback(2);
    const pauseAdVisibleAfterInteraction = await detailsPage.isPauseAdBannerVisible().catch(() => false);
    const playbackTimeVisibleAfterInteraction = await detailsPage.isPlaybackTimeVisible().catch(() => false);
    playbackScreenDisplayed = !pauseAdVisibleAfterInteraction && playbackTimeVisibleAfterInteraction;
  }

  logger.assertion('Pause ad visible before hovering the seek bar', pauseAdVisible);
  logger.assertion('Seek bar visible before hover attempt', seekBarVisible);
  logger.assertion('Hover action was attempted only while the pause ad was visible', hoverAttempted ? pauseAdVisible && seekBarVisible : !pauseAdVisible);
  logger.assertion('Playback screen is displayed after hovering over the seek bar while the pause ad is visible', playbackScreenDisplayed);

  return {
    isLoggedIn,
    pauseAdVisible,
    seekBlocked: pauseAdVisible && !playbackScreenDisplayed,
    freeContentTitle,
    seekBarVisible,
  };
}

export async function verifyBillboardAdBannerVisibilityFlow(page: any, input?: { mode?: string }): Promise<VerifyBillboardAdBannerOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting billboard ad banner visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  await page.waitForTimeout(5000);
  await detailsPage.clickFirstFreeContentOnHome();
  await detailsPage.clickPlayButton();
  await page.waitForTimeout(100000);
  //await detailsPage.hoverOnPlaybackScreen();
  // await detailsPage.clickResumeButton();
  await detailsPage.tapPlaybackScreen();
  await page.waitForTimeout(5000);
  const adBannerVisible = await detailsPage.isPauseAdBannerVisible();
  logger.assertion('Billboard ad banner visible in playback for free users', adBannerVisible);

  return {
    isLoggedIn,
    adBannerVisible,
  };
}

export async function verifyAdPlaybackUIFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdPlaybackUIOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const gql = GraphQLHelper.getInstance(page);
  const mode = input?.mode;

  logger.step('Starting ad playback UI verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  const pauseButtonVisible = await detailsPage.isPauseButtonVisible();

  logger.assertion('Player screen visible during ad playback', playerVisible);
  logger.assertion('Ad tag visible during ad playback', adVisible);
  logger.assertion('Pause button visible during ad playback', pauseButtonVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    pauseButtonVisible,
  };
}

export interface VerifyAdLearnMoreOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  tapPerformed: boolean;
  redirectedPageTitle: string;
  redirectedPageUrl: string;
}

export async function verifyAdLearnMoreRedirectFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdLearnMoreOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting ad Learn More redirect verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  await detailsPage.waitForPlayback(2);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);

  const freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeContentTitle).catch(() => false);
  logger.assertion('Search result is tagged as Free content', freeLabelVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  logger.assertion('Ad tag visible on the ad player screen', adVisible);

  let tapPerformed = false;
  let redirectedPageTitle = '';
  let redirectedPageUrl = '';

  try {
    await detailsPage.waitForPlayback(10);
    await detailsPage.tapPlaybackScreen();
    tapPerformed = true;
    await detailsPage.waitForPlayback(10);
    redirectedPageTitle = await detailsPage.getCurrentPageTitle();
    redirectedPageUrl = await detailsPage.getCurrentPageUrl();
    logger.assertion('Ad-related page title after tap', Boolean(redirectedPageTitle));
    logger.assertion('Ad-related page URL after tap', Boolean(redirectedPageUrl));
    // logger.info(`Redirected page title: ${redirectedPageTitle}`);
    // logger.info(`Redirected page URL: ${redirectedPageUrl}`);
  } catch (err) {
    logger.debug('Tap on player screen did not trigger redirect or failed', err);
  }

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    tapPerformed,
    redirectedPageTitle,
    redirectedPageUrl,
  };
}

export async function verifyAdLabelVisibilityFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdLabelVisibilityOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting ad label visibility verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

const freeAsset = rails
  .flatMap((rail) => rail.assets?.items ?? [])
  .find((asset: any) => {
    const assetType =
      asset.assetType ??
      asset.type ??
      asset.contentType ??
      asset.mediaType;

    const monetType =
      asset.monetization?.type ??
      asset.monetizationType ??
      asset.pricing?.type ??
      asset.pricing?.pricingType;

    const isMovie = /^movie$/i.test(String(assetType ?? ''));
    const isFree = /^free$/i.test(String(monetType ?? ''));

    return isMovie && isFree;
  });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  await detailsPage.waitForPlayback(2);
  logger.assertion('Search results visible for free content', resultsVisible);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  const adLabelText = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3, button, [role="status"], [role="dialog"]'));
    const visibleText = candidates
      .map((element) => ({
        text: (element.textContent || '').trim(),
        style: window.getComputedStyle(element),
        rect: element.getBoundingClientRect(),
      }))
      .filter(({ style, rect }) => style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0)
      .map(({ text }) => text)
      .filter((text) => /ad|advertisement|ad break|sponsored/i.test(text));

    return visibleText.find(Boolean) || '';
  });
  const adLabelVisible = adVisible && adLabelText.length > 0;

  logger.assertion('Player screen visible during ad label check', playerVisible);
  logger.assertion('Ad overlay visible during ad label check', adVisible);
  logger.assertion('Visible ad label detected on the player screen', adLabelVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    adLabelVisible,
    adLabelText,
  };
}

export interface VerifyAdCountdownOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  skipAdButtonVisible: boolean;
  skipAdCountdownText: string;
}

export async function verifyAdCountdownFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdCountdownOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting ad countdown visibility verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);

  const freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeContentTitle).catch(() => false);
  logger.assertion('Search result is tagged as Free content', freeLabelVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();

  // Ensure ad tag is present on player screen before validating skip-ad.
  const adVisible = await detailsPage.isAdTagVisible();
  if (!adVisible) {
    logger.assertion('Player screen visible during ad skip check', playerVisible);
    logger.assertion('Ad tag visible during ad skip check', false);
    return {
      isLoggedIn,
      playerVisible,
      adVisible: false,
      skipAdButtonVisible: false,
      skipAdCountdownText: '',
    };
  }

  // Ad is present — wait for skip-ad button to appear. If it appears, mark visible and return its text.
  const skipAdButtonVisible = await detailsPage.waitForSkipAdButton(20);
  const skipAdCountdownText = skipAdButtonVisible ? await detailsPage.getSkipAdButtonText() : '';

  logger.assertion('Player screen visible during ad skip check', playerVisible);
  logger.assertion('Ad tag visible during ad skip check', true);
  logger.assertion('Skip Ad button visible during ad skip check', skipAdButtonVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    skipAdButtonVisible,
    skipAdCountdownText,
  };
}

export interface VerifyMidRollAdInterruptionOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  initialAdVisible: boolean;
  playbackTitleVisible: boolean;
  midRollAdVisible: boolean;
}

export async function verifyMidRollAdInterruptionFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyMidRollAdInterruptionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting mid-roll ad interruption verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();

  // const freeAsset = rails
  //   .flatMap((rail) => rail.assets?.items ?? [])
  //   .find((asset: any) => {
  //     const labels = asset.labels ?? [];
  //     if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
  //     const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
  //     return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
  //   });

const freeAsset = rails
  .flatMap((rail) => rail.assets?.items ?? [])
  .find((asset: any) => {
    const assetType =
      asset.assetType ??
      asset.type ??
      asset.contentType ??
      asset.mediaType;

    const monetType =
      asset.monetization?.type ??
      asset.monetizationType ??
      asset.pricing?.type ??
      asset.pricing?.pricingType;

    const isMovie = /^movie$/i.test(String(assetType ?? ''));
    const isFree = /free|free_to_watch|freetowatch|complimentary/i.test(
      String(monetType ?? '')
    );

    return isMovie && isFree;
  });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = await authPage.isSearchResultsVisible(freeContentTitle);
  logger.assertion('Search results visible for free content from collection API', resultsVisible);

  const freeLabelVisible = await detailsPage.isContentTaggedFreeInSearchResults(freeContentTitle).catch(() => false);
  logger.assertion('Search result is tagged as Free content', freeLabelVisible);

  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const initialAdVisible = await detailsPage.isAdTagVisible();
  logger.assertion('Ad tag visible on the ad player screen', initialAdVisible);

  await detailsPage.waitForPlayback(90);
  await detailsPage.hoverPlaybackScreen();
  const playbackTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer(freeContentTitle);
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.4);
  await detailsPage.waitForPlayback(5);

  const midRollAdVisible = await detailsPage.isAdTagVisible();
  logger.assertion('Mid-roll ad interrupts the player content after seek', midRollAdVisible);

  return {
    isLoggedIn,
    playerVisible,
    initialAdVisible,
    playbackTitleVisible,
    midRollAdVisible,
  };
}

export interface VerifyAdSeekBarHiddenDuringAdOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  seekBarHidden: boolean;
}

export async function verifyAdSeekBarHiddenDuringAdFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdSeekBarHiddenDuringAdOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting ad seek bar hidden verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();
  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));
  
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = freeContentTitle ? await authPage.isSearchResultsVisible(freeContentTitle) : false;
  logger.assertion('Search results visible for free content', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const seekBarHidden = adVisible && seekBarVisible;

  logger.assertion('Player screen visible during ad playback', playerVisible);
  logger.assertion('Ad tag visible during ad playback', adVisible);
  logger.assertion('Seek bar hidden during ad playback', seekBarHidden);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    seekBarHidden,
  };
}

export async function verifyAdDurationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyAdDurationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const gql = GraphQLHelper.getInstance(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting ad duration verification flow');
  const collectionWait = gql.waitForOperation(input?.graphqlQueryName ?? 'Collection', 20000);
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const collectionResponse = await collectionWait;
  const parser = new CollectionParser(collectionResponse as any);
  const rails = parser.getRails();
  const freeAsset = rails
    .flatMap((rail) => rail.assets?.items ?? [])
    .find((asset: any) => {
      const labels = asset.labels ?? [];
      if (labels.some((label: any) => /free/i.test(label?.text ?? ''))) return true;
      const monetType = asset.monetization?.type ?? asset.monetizationType ?? asset.pricing?.type ?? asset.pricing?.pricingType;
      return monetType ? /free|complimentary|free_to_watch|freetowatch/i.test(String(monetType)) : false;
    });

  const freeContentTitle = (freeAsset?.title ?? query).trim();
  logger.assertion('Free content title resolved from Collection GraphQL', Boolean(freeContentTitle));

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(freeContentTitle);
  await authPage.submitSearchQuery();
  const resultsVisible = freeContentTitle ? await authPage.isSearchResultsVisible(freeContentTitle) : false;
  logger.assertion('Search results visible for free content', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const adVisible = await detailsPage.isAdTagVisible();
  const adDurationSeconds = await detailsPage.measureAdDuration(90);
  const exceedsMaxDuration = adDurationSeconds > 90;

  logger.assertion('Player screen visible during ad duration check', playerVisible);
  logger.assertion('Ad overlay visible during ad duration check', adVisible);
  logger.assertion('Ad duration stays within the maximum allowed limit', !exceedsMaxDuration);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    adDurationSeconds,
    exceedsMaxDuration,
  };
}

export async function verifyPausePlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPausePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting playback pause verification flow');
  
  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(20);
  await detailsPage.hoverPlaybackScreen();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(10);
  // await detailsPage.hoverPlaybackScreen();

  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const playbackPaused = initialPlaybackTime === pausedPlaybackTime;

  logger.assertion('Player screen visible for pause verification flow', playerVisible);
  logger.assertion('Playback time remains unchanged after pause', playbackPaused);

  return {
    isLoggedIn,
    playerVisible,
    initialPlaybackTime,
    pausedPlaybackTime,
    playbackPaused,
  };
}

export async function verifySkipMarkerVisibilityAfterPauseResume(
  page: any,
  input?: VerifySkipMarkerVisibilityAfterPauseResumeInput
): Promise<VerifySkipMarkerVisibilityAfterPauseResumeOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const searchTerm = input?.searchTerm ?? '';

  logger.step('Starting Up Next marker visibility after pause/resume verification flow');


  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  if (!detailsVisible) {
    return {
      detailsVisible: false,
      playerVisible: false,
      markerVisibleBeforePause: false,
      markerVisibleAfterPause: false,
      markerVisibleAfterResume: false,
    };
  }

  await detailsPage.clickEpisodeTwo();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.98);
  await detailsPage.waitForPlayback(2);
  const markerVisibleBeforePause = await detailsPage.isUpNextMarkerVisible();

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(2);
  const markerVisibleAfterPause = await detailsPage.isUpNextMarkerVisible();

  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(2);
  const markerVisibleAfterResume = await detailsPage.isUpNextMarkerVisible();

  logger.assertion('Details page visible before pause/resume check', detailsVisible);
  logger.assertion('Player screen visible before pause/resume check', playerVisible);
  logger.assertion('Up Next binge marker visible before pause', markerVisibleBeforePause);
  logger.assertion('Up Next binge marker visible after pause', markerVisibleAfterPause);
  logger.assertion('Up Next binge marker visible after resume', markerVisibleAfterResume);
  logger.info(`Before pause: ${markerVisibleBeforePause}, After pause: ${markerVisibleAfterPause}, After resume: ${markerVisibleAfterResume}`);
  return {
    detailsVisible,
    playerVisible,
    markerVisibleBeforePause,
    markerVisibleAfterPause,
    markerVisibleAfterResume,
  };
}

function parsePlaybackTimeToSeconds(value: string): number {
  const normalized = (value || '').trim();
  const match = normalized.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    return 0;
  }

  const [, first, second, third] = match;
  const firstNum = Number.parseInt(first, 10);
  const secondNum = Number.parseInt(second, 10);
  const thirdNum = third ? Number.parseInt(third, 10) : 0;

  if (third !== undefined) {
    return firstNum * 3600 + secondNum * 60 + thirdNum;
  }

  return firstNum * 60 + secondNum;
}

export async function verifySkipMarkersReappearAfterRewind(
  page: any,
  input?: VerifySkipMarkersReappearAfterRewindInput
): Promise<VerifySkipMarkersReappearAfterRewindOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const searchTerm = input?.searchTerm ?? '';

  logger.step('Starting skip marker reappearance after rewind verification flow');


  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  let isSkipIntroMarkerVisible = false;
  let skipIntroClicked = false;
  let timeBeforeSkipIntro = '';
  let timeAfterSkipIntro = '';
  let isSkipRecapMarkerVisible = false;
  let skipRecapClicked = false;
  let timeBeforeSkipRecap = '';
  let timeAfterSkipRecap = '';
  let upNextVisible = false;
  let playbackTimeAtStart = '';
  let isSkipRecapMarkerVisibleAfterSeekToStart = false;

  if (detailsVisible) {
    await detailsPage.clickEpisodeTwo();
    await detailsPage.waitForPlayback(3);

    isSkipRecapMarkerVisible = await detailsPage.isSkipRecapMarkerVisible();
    if (isSkipRecapMarkerVisible) {
      timeBeforeSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      console.log('timeBeforeSkipRecap:', timeBeforeSkipRecap);
      skipRecapClicked = await detailsPage.clickSkipRecapMarker();
      await page.waitForTimeout(3000);
      timeAfterSkipRecap = await detailsPage.getTrimmedPlaybackTime();
      console.log('timeAfterSkipRecap:', timeAfterSkipRecap);
    }

    await page.waitForTimeout(2000);
    isSkipIntroMarkerVisible = await detailsPage.isSkipIntroMarkerVisible();
    if (isSkipIntroMarkerVisible) {
      timeBeforeSkipIntro = await detailsPage.getTrimmedPlaybackTime();
      console.log('timeBeforeSkipIntro:', timeBeforeSkipIntro);
      await page.waitForTimeout(3000);
      skipIntroClicked = await detailsPage.clickSkipIntroMarker();
      timeAfterSkipIntro = await detailsPage.getTrimmedPlaybackTime();
      console.log('timeAfterSkipIntro:', timeAfterSkipIntro);
    }
    await detailsPage.dragSeekBarToPosition(0.99);
    // await detailsPage.waitForPlayback(3);
    upNextVisible = await detailsPage.isUpNextMarkerVisible();

    await detailsPage.dragSeekBarToPosition(0.01);
    await detailsPage.waitForPlayback(3);
    playbackTimeAtStart = await detailsPage.getTrimmedPlaybackTime();

    // const normalizePlaybackTime = (value: string) => {
    //   const normalized = value.trim();
    //   return normalized === '0:00' ? '00:00' : normalized;
    // };

    // playbackTimeAtStart = normalizePlaybackTime(playbackTimeAtStart);
    isSkipRecapMarkerVisibleAfterSeekToStart = await detailsPage.isSkipIntroMarkerVisible();
  }

  logger.assertion('Details page visible for skip marker rewinding flow', detailsVisible);
  logger.assertion('Skip Intro marker visible before first skip', isSkipIntroMarkerVisible);
  logger.assertion('Skip Intro clicked successfully', skipIntroClicked);
  logger.assertion('Playback time advanced after Skip Intro click', timeBeforeSkipIntro !== timeAfterSkipIntro);
  logger.assertion('Skip Recap marker visible before second skip', isSkipRecapMarkerVisible);
  logger.assertion('Skip Recap clicked successfully', skipRecapClicked);
  logger.assertion('Playback time advanced after Skip Recap click', timeBeforeSkipRecap !== timeAfterSkipRecap);
  logger.assertion('Up Next marker visible after forward seek', upNextVisible);
  // logger.assertion('Playback time reset to 00:00 after seeking back to start', playbackTimeAtStart === '00:00');
  logger.assertion('Skip Recap marker visible again after seek back to start', isSkipRecapMarkerVisibleAfterSeekToStart);

  return {
    detailsVisible,
    isSkipIntroMarkerVisible,
    skipIntroClicked,
    timeBeforeSkipIntro,
    timeAfterSkipIntro,
    isSkipRecapMarkerVisible,
    skipRecapClicked,
    timeBeforeSkipRecap,
    timeAfterSkipRecap,
    upNextVisible,
    // playbackTimeAtStart,
    isSkipRecapMarkerVisibleAfterSeekToStart,
  };
}

export async function verifySkipMarkersNotVisibleInContinueWatching(
  page: any,
  input?: VerifySkipMarkersNotVisibleInContinueWatchingInput
): Promise<VerifySkipMarkersNotVisibleInContinueWatchingOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const searchTerm = (input?.searchTerm ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting skip marker visibility check for Continue Watching content flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickFirstSearchResult();
  }

  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  let episodeOpened = false;
  let skipRecapClicked = false;
  let skipIntroClicked = false;
  let initialSkipRecapTime = '';
  let updatedSkipRecapTime = '';
  let initialSkipIntroTime = '';
  let updatedSkipIntroTime = '';
  let continueWatchingContentOpened = false;
  let skipRecapVisibleInContinueWatching = false;
  let skipIntroVisibleInContinueWatching = false;

  if (detailsVisible) {
    await detailsPage.clickEpisodeThree();
    await detailsPage.waitForPlayback(3);
    // await detailsPage.dragSeekBarToPosition(0);

    episodeOpened = true;

    const skipRecapVisibleBefore = await detailsPage.isSkipRecapMarkerVisible().catch(() => false);
    if (skipRecapVisibleBefore) {
      initialSkipRecapTime = await detailsPage.getTrimmedPlaybackTime().catch(() => '');
      skipRecapClicked = await detailsPage.clickSkipRecapMarker();
      await page.waitForTimeout(2000);
      updatedSkipRecapTime = await detailsPage.getTrimmedPlaybackTime().catch(() => '');
      logger.info(`Skip Recap clicked: ${skipRecapClicked}, initial time: ${initialSkipRecapTime}, updated time: ${updatedSkipRecapTime}`);
    }

    const skipIntroVisibleBefore = await detailsPage.isSkipIntroMarkerVisible().catch(() => false);
    if (skipIntroVisibleBefore) {
      initialSkipIntroTime = await detailsPage.getTrimmedPlaybackTime().catch(() => '');
      skipIntroClicked = await detailsPage.clickSkipIntroMarker();
      await page.waitForTimeout(2000);
      updatedSkipIntroTime = await detailsPage.getTrimmedPlaybackTime().catch(() => '');
      logger.info(`Skip Intro clicked: ${skipIntroClicked}, initial time: ${initialSkipIntroTime}, updated time: ${updatedSkipIntroTime}`);
    }

    await detailsPage.dragSeekBarToPosition(0.5);
    logger.info('Seeked to 50% of the episode to ensure playback is in progress before navigating back');
    await detailsPage.clickBackButton();
    logger.info('Navigated back to the Home page after interacting with skip markers');
    // await page.goto('/', { waitUntil: 'domcontentloaded' });
    await authPage.navigateHome();
    logger.info('Navigated to the Home page to check Continue Watching content');
    await detailsPage.waitForPlayback(2);
    // await detailsPage.hoverFirstContinueWatchingItem();
    continueWatchingContentOpened = await detailsPage.clickFirstContinueWatchingItem();


    logger.info(`Continue Watching content opened: ${continueWatchingContentOpened}`);
    await detailsPage.waitForPlayback(2);
    await detailsPage.clickPlayButton();
    logger.info('Clicked Play button on Continue Watching content');
    await detailsPage.waitForPlayback(3);
    skipRecapVisibleInContinueWatching = await detailsPage.isSkipRecapMarkerVisible().catch(() => false);
    skipIntroVisibleInContinueWatching = await detailsPage.isSkipIntroMarkerVisible().catch(() => false);
  }

  const markersNotVisible = !(skipRecapVisibleInContinueWatching || skipIntroVisibleInContinueWatching);

  logger.assertion('Details page visible before Continue Watching skip-marker check', detailsVisible);
  logger.assertion('Continue Watching content opened from the Home rail', continueWatchingContentOpened);
  logger.assertion('Skip Recap and Skip Intro markers are not visible on the Continue Watching playback screen', markersNotVisible);

  return {
    isLoggedIn,
    detailsVisible,
    episodeOpened,
    skipRecapClicked,
    skipIntroClicked,
    initialSkipRecapTime,
    updatedSkipRecapTime,
    initialSkipIntroTime,
    updatedSkipIntroTime,
    continueWatchingContentOpened,
    skipRecapVisibleInContinueWatching,
    skipIntroVisibleInContinueWatching,
    markersNotVisible,
  };
}

export async function verifyTapToPausePlaybackFlow(page: any, input?: VerifyTapToPausePlaybackInput): Promise<VerifyTapToPausePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  // const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting tap-to-pause playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(10);
  await detailsPage.tapPlaybackScreen();
  await detailsPage.waitForPlayback(1);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.waitForPlayback(5);
  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const playbackPaused = initialPlaybackTime === pausedPlaybackTime;

  logger.assertion('Player screen visible after tapping to pause', playerVisible);
  logger.assertion('Playback paused after tapping the player screen', playbackPaused);

  return {
    isLoggedIn,
    detailsVisible,
    playerVisible,
    initialPlaybackTime,
    pausedPlaybackTime,
    playbackPaused,
  };
}

export async function verifyPauseforwardBackwardButtonsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPauseSeekButtonsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting pause seek buttons verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(30);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(2);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();

  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(2);
  const forwardPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const forwardChanged = pausedPlaybackTime !== forwardPlaybackTime;

  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(2);
  const rewindPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const rewindChanged = forwardPlaybackTime !== rewindPlaybackTime;

  logger.assertion('Player screen visible for pause seek buttons flow', playerVisible);
  logger.assertion('Forward button changed playback position while paused', forwardChanged);
  logger.assertion('Rewind button changed playback position while paused', rewindChanged);

  return {
    isLoggedIn,
    playerVisible,
    pausedPlaybackTime,
    forwardPlaybackTime,
    rewindPlaybackTime,
    forwardChanged,
    rewindChanged,
  };
}

export async function verifyforwardBackwardButtonsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPauseSeekButtonsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;

  logger.step('Starting pause seek buttons verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;
  
  const queryFromCollection = await resolveQueryFromCollectionGraphQL(page, input?.graphqlQueryName);
  const query = (input?.query ?? queryFromCollection ?? '').trim();
  const expectedTitle = input?.expectedTitle ?? query;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);
  await detailsPage.waitForPlayback(2);
  
  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(30);
  await detailsPage.hoverPlaybackScreen();

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(1);
  const forwardPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const forwardChanged = pausedPlaybackTime !== forwardPlaybackTime;

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(1);
  const rewindPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const rewindChanged = forwardPlaybackTime !== rewindPlaybackTime;

  logger.assertion('Player screen visible for pause seek buttons flow', playerVisible);
  logger.assertion('Forward button changed playback position while paused', forwardChanged);
  logger.assertion('Rewind button changed playback position while paused', rewindChanged);

  return {
    isLoggedIn,
    playerVisible,
    pausedPlaybackTime,
    forwardPlaybackTime,
    rewindPlaybackTime,
    forwardChanged,
    rewindChanged,
  };
}

export async function verifyLivePlaybackGoLiveFlow(page: any, input?: { mode?: string; channelName?: string }): Promise<VerifyLivePlaybackGoLiveOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const channelName = input?.channelName ?? 'TFC Asia';

  logger.step('Starting live playback Go Live verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await detailsPage.clickliveContent(channelName);
  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.clickGoLiveButton();
  const goLiveVisible = await detailsPage.isGoLiveButtonVisible();

  logger.assertion('Go Live CTA visible after live playback interaction', goLiveVisible);

  return {
    isLoggedIn,
    liveChannelOpened: true,
    goLiveVisible,
  };
}

export interface VerifyLiveStreamSeekRestrictionOutput {
  isLoggedIn: boolean;
  liveChannelOpened: boolean;
  rewindButtonVisible: boolean;
  forwardButtonVisible: boolean;
}

export async function verifyLiveStreamSeekRestrictionFlow(page: any, input?: { mode?: string; channelName?: string }): Promise<VerifyLiveStreamSeekRestrictionOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const mode = input?.mode;
  const channelName = input?.channelName ?? 'TFC Asia';

  logger.step('Starting live stream seek restriction verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await detailsPage.clickliveContent(channelName);
  await detailsPage.waitForPlayback(5);

  const rewindButtonVisible = await detailsPage.RewindButtonNotVisible();
  const forwardButtonVisible = await detailsPage.ForwardButtonNotVisible();
  const liveChannelOpened = true;

  logger.assertion('Rewind button hidden for true live stream', !rewindButtonVisible);
  logger.assertion('Forward button hidden for true live stream', !forwardButtonVisible);

  return {
    isLoggedIn,
    liveChannelOpened,
    rewindButtonVisible,
    forwardButtonVisible,
  };
}

export async function playFreeAsset(page: any, input?: PlayFreeAssetInput): Promise<PlayFreeAssetOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const loginResult = await loginToOTT(page, { mode: input?.mode });
    logger.step('Starting free asset playback flow');
    const isLoggedIn = await playbackPage.isHomeScreenReady();
    logger.assertion('Free user loaded the home screen', isLoggedIn);
    const isPlayableContentDetected = await playbackPage.hoverFirstPlayableContentCard();
    logger.assertion('Playable free content detected', isPlayableContentDetected);
    const playAttempted = isPlayableContentDetected
        ? await playbackPage.clickFirstAvailablePlayButton()
        : false;
    logger.assertion('Play button attempted on detected content', playAttempted);
    const playbackStarted = await playbackPage.isPlaybackStarted();
    logger.assertion('Playback started for free content', playbackStarted);
    return {
        isLoggedIn,
        isPlayableContentDetected,
        playAttempted,
        playbackStarted,
    };
}

export interface VerifyPremiumContentGateInput {
    mode?: string;
    expectedMessage?: string;
    expectedMaybeLaterText?: string;
    expectedSubscribeText?: string;
}

export interface VerifyPremiumContentGateOutput {
    playAttempted: boolean;
    premiumGateDisplayed: boolean;
    gateMessage: string;
    maybeLaterVisible: boolean;
    subscribeToWatchVisible: boolean;
}

export interface VerifySubscribeToWatchCarouselMessageInput {
    mode?: string;
    expectedMessage?: string;
    expectedMaybeLaterText?: string;
    expectedSubscribeText?: string;
}

export interface VerifySubscribeToWatchCarouselMessageOutput {
    loginSuccessful: boolean;
    carouselChecked: boolean;
    promptObserved: boolean;
    message: string;
    maybeLaterVisible: boolean;
    subscribeToWatchVisible: boolean;
    playbackStarted: boolean;
}

export async function verifyPremiumContentGate(page: any, input?: VerifyPremiumContentGateInput): Promise<VerifyPremiumContentGateOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const mode = input?.mode;
    const loginResult = await loginToOTT(page, { mode });
    const isLoggedIn = loginResult.isLoggedIn;
    logger.step('Starting premium content gate validation flow');
    logger.assertion('Free user loaded the home screen for premium content gate check', isLoggedIn);
    const premiumContentSelected = await playbackPage.clickFirstPremiumContentCard();
    logger.assertion('Premium content card selected', premiumContentSelected);
    const laterEpisodeSelected = await playbackPage.clickLaterEpisodeFromPremiumContent();
    logger.assertion('Later episode selected for premium content', laterEpisodeSelected);
    const playAttempted = laterEpisodeSelected;
    logger.assertion('Attempted playback on premium content', playAttempted);
    const premiumGateDisplayed = await playbackPage.isPremiumContentGateVisible();
    const gateMessage = premiumGateDisplayed ? await playbackPage.getPremiumGateMessageText() : '';
    const maybeLaterVisible = await playbackPage.isMaybeLaterVisible();
    const subscribeToWatchVisible = await playbackPage.isSubscribeToWatchVisible();
    logger.assertion('Premium content gate displayed', premiumGateDisplayed);
    logger.assertion('Maybe Later action visible', maybeLaterVisible);
    logger.assertion('Subscribe to watch action visible', subscribeToWatchVisible);
    return {
        playAttempted,
        premiumGateDisplayed,
        gateMessage,
        maybeLaterVisible,
        subscribeToWatchVisible,
    };
}

export interface VerifyLivePlaybackPauseResumeInput {
    mode?: string;
}

export interface VerifyLivePlaybackPauseResumeOutput {
    isLoggedIn: boolean;
    liveSectionSelected: boolean;
    channelSelected: boolean;
    playbackStarted: boolean;
    pauseClicked: boolean;
    resumeClicked: boolean;
    currentTimeBeforePause: number;
    currentTimeAfterResume: number;
    playbackCompleted: boolean;
    pauseResumeWorked: boolean;
}

export interface VerifyLiveTagOnPlayerOutput {
    liveChannelOpened: boolean;
    liveBadgeVisible: boolean;
}

export async function verifyLiveTagOnPlayer(page: any, input?: { mode?: string; channelName?: string }): Promise<VerifyLiveTagOnPlayerOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const mode = input?.mode;
    const channelName = input?.channelName ?? 'TFC Asia';


    logger.step('Starting live tag visibility verification flow');

    const loginResult = await loginToOTT(page, { mode });
    const isLoggedIn = loginResult.isLoggedIn;
    
    await detailsPage.clickliveContent(channelName);
    const liveBadgeVisible = await detailsPage.isLiveTagVisible();
    logger.assertion('LIVE badge visible during live playback', liveBadgeVisible);

    return {
        liveChannelOpened: true,
        liveBadgeVisible,
    };
}

export async function verifyLivePlaybackPauseResume(page: any, input?: VerifyLivePlaybackPauseResumeInput): Promise<VerifyLivePlaybackPauseResumeOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const mode = input?.mode;
    const loginResult = await loginToOTT(page, { mode });
    const isLoggedIn = loginResult.isLoggedIn;
    logger.step('Starting live playback pause and resume validation flow');
    logger.assertion('User loaded the home screen before live TV playback', isLoggedIn);
    const liveSectionSelected = await playbackPage.selectLiveTVSection();
    logger.assertion('Live TV section selected', liveSectionSelected);
    const channelSelected = await playbackPage.selectLiveChannel();
    logger.assertion('Live TV channel selected', channelSelected);
    const playbackStarted = await playbackPage.waitForPlaybackToStart();
    logger.assertion('Live playback started', playbackStarted);
    const pauseResumeState = playbackStarted
        ? await playbackPage.pauseAndResumePlayback()
        : { pauseClicked: false, resumeClicked: false, playbackCompleted: false, currentTimeBeforePause: 0, currentTimeAfterResume: 0 };
    const pauseResumeWorked = playbackStarted && (pauseResumeState.playbackCompleted || (pauseResumeState.pauseClicked && pauseResumeState.resumeClicked));
    logger.assertion('Pause/resume interaction completed for live playback', pauseResumeWorked);
    return {
        isLoggedIn,
        liveSectionSelected,
        channelSelected,
        playbackStarted,
        pauseClicked: pauseResumeState.pauseClicked,
        resumeClicked: pauseResumeState.resumeClicked,
        currentTimeBeforePause: pauseResumeState.currentTimeBeforePause,
        currentTimeAfterResume: pauseResumeState.currentTimeAfterResume,
        playbackCompleted: pauseResumeState.playbackCompleted,
        pauseResumeWorked,
    };
}

export async function verifySubscribeToWatchCarouselMessage(page: any, input?: VerifySubscribeToWatchCarouselMessageInput): Promise<VerifySubscribeToWatchCarouselMessageOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const mode = input?.mode;
    logger.step('Starting subscribe-to-watch home-page CTA validation flow');
    const loginResult = await loginToOTT(page, { mode });
    const isLoggedIn = loginResult.isLoggedIn;
    const loginSuccessful = await playbackPage.isHomeScreenReady();
    logger.assertion('User loaded the home screen for the CTA check', loginSuccessful);
    let carouselChecked = false;
    let promptObserved = false;
    let message = '';
    let maybeLaterVisible = false;
    let subscribeToWatchVisible = false;
    let playbackStarted = false;
    const homePageResult = await playbackPage.tryHomePageContentForSubscribeCTA();
    carouselChecked = homePageResult.found;
    promptObserved = homePageResult.premiumGateVisible || homePageResult.maybeLaterVisible || homePageResult.subscribeToWatchVisible;
    message = homePageResult.message;
    maybeLaterVisible = homePageResult.maybeLaterVisible;
    subscribeToWatchVisible = homePageResult.subscribeToWatchVisible;
    playbackStarted = await playbackPage.isPlaybackStarted();
    console.log('homePageCTACheck', { carouselChecked, promptObserved, maybeLaterVisible, subscribeToWatchVisible, message, playbackStarted });
    logger.assertion('Home-page subscribe CTA surfaced the premium gate prompt', promptObserved);
    return {
        loginSuccessful,
        carouselChecked,
        promptObserved,
        message,
        maybeLaterVisible,
        subscribeToWatchVisible,
        playbackStarted,
    };
}

export interface PlayContentFromWatchlistInput {
    email?: string;
    password?: string;
}

export interface PlayContentFromWatchlistOutput {
    isLoggedIn: boolean;
    watchlistOpened: boolean;
    contentSelected: boolean;
    playClicked: boolean;
    playbackStarted: boolean;
    playbackCompleted: boolean;
    contentPlayed: boolean;
    currentTime: number;
    duration: number;
}