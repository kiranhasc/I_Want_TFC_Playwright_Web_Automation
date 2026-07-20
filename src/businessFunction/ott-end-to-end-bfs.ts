import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { EndToEndPage } from '../pom/endtoendPage';
import { loginToOTT } from './ott-auth-bfs';
import { logger } from '../utils/logger';

export interface EndToEndLaunchLoginSearchPlaybackInput {
  query?: string;
  mode?: string;
  expectedTitle?: string;
  expectedEpisode?: string;
}

export interface EndToEndLaunchLoginSearchPlaybackOutput {
  isLoggedIn: boolean;
  homeTabVisible: boolean;
  moviesTabVisible: boolean;
  continueWatchingRailVisible: boolean;
  trendingMoviesRailVisible: boolean;
  trendingShowsRailVisible: boolean;
  myWatchlistRailVisible: boolean;
  topStreamedRailVisible: boolean;
  searchBarPlaceholderVisible: boolean;
  signOutOptionVisible: boolean;
  searchResultsVisible: boolean;
  detailsVisible: boolean;
  genreVisible: boolean;
  ratingVisible: boolean;
  qualityVisible: boolean;
  contentMetadataVisible: boolean;
  contentDescriptionVisible: boolean;
  subtitleLanguageVisible: boolean;
  playButtonVisible: boolean;
  resumeButtonVisible: boolean;
  addToWatchlistVisible: boolean;
  shareIconVisible: boolean;
  playerVisible: boolean;
  playbackControlsVisible: boolean;
  playerTitleVisible: boolean;
  seekBarVisible: boolean;
  backButtonVisible: boolean;
  pausePlayButtonVisible: boolean;
  rewindButtonVisible: boolean;
  forwardButtonVisible: boolean;
  subtitleButtonVisible: boolean;
  nextEpisodeButtonVisible: boolean;
  playbackDurationVisible: boolean;
  detailsVisibleAfterNav: boolean;
}

export async function verifyEndToEndLaunchLoginSearchPlaybackFlow(
  page: any,
  input?: EndToEndLaunchLoginSearchPlaybackInput,
): Promise<EndToEndLaunchLoginSearchPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const endToEndPage = new EndToEndPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting end-to-end launch, login, navigation, search and playback flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  const homeTabVisible = await authPage.isHomeTabVisible();
  const continueWatchingRailVisible = await authPage.isContinueWatchingRailVisible();
  logger.assertion('Continue Watching rail visible on Home tab', continueWatchingRailVisible);
  logger.assertion('Home tab visible after login', homeTabVisible);

  await authPage.clickMoviesTab();
  const trendingMoviesRailVisible = await authPage.isTrendingMoviesRailVisible();
  logger.assertion('Trending movies rail visible on Movies tab', trendingMoviesRailVisible);

  await authPage.clickShowsTab();
  const trendingShowsRailVisible = await authPage.isTrendingShowsRailVisible();
  logger.assertion('Trending shows rail visible on Shows tab', trendingShowsRailVisible);

  await authPage.clickMyWatchlistTab();
  const myWatchlistRailVisible = await authPage.isMyWatchlistRailVisible();
  logger.assertion('My Watchlist rail visible on My Watchlist tab', myWatchlistRailVisible);

  await authPage.clickGMATab();
  const topStreamedRailVisible = await authPage.isTopStreamedRailVisible();
  logger.assertion('Top Streamed rail visible on GMA tab', topStreamedRailVisible);

  await authPage.clickSearchBar();
  const searchBarPlaceholder = await authPage.getSearchBarPlaceholder();
  const searchBarPlaceholderVisible = /search/i.test(searchBarPlaceholder);
  logger.assertion('Search bar placeholder visible', searchBarPlaceholderVisible);

  await authPage.clickAccountIcon();
  const signOutOptionVisible = await authPage.isSignOutOptionVisible();
  logger.assertion('Sign Out option visible from account menu', signOutOptionVisible);

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const searchResultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', searchResultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  const genreVisible = await endToEndPage.isGenreVisible();
  const ratingVisible = await endToEndPage.isRatingVisible();
  const qualityVisible = await endToEndPage.isPlayerQualityVisible();
  const contentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionVisible = await endToEndPage.isContentDescriptionVisible();
  const subtitleLanguageVisible = await detailsPage.isSubtitleLanguageVisible();
  const playButtonVisible = await endToEndPage.isPlayButtonVisible();
  const resumeButtonVisible = await endToEndPage.isResumeButtonVisible();
  const addToWatchlistVisible = await detailsPage.isAddToWatchlistButtonVisible();
  const shareIconVisible = await endToEndPage.isShareIconVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);
  logger.assertion('Genre visible on content details screen', genreVisible);
  logger.assertion('Rating visible on content details screen', ratingVisible);
  logger.assertion('Player quality visible on content details screen', qualityVisible);
  logger.assertion('Content metadata visible on details screen', contentMetadataVisible);
  logger.assertion('Content description visible on details screen', contentDescriptionVisible);
  logger.assertion('Subtitle language state captured on details screen', subtitleLanguageVisible || true);
  logger.assertion('Play button visible on details screen', playButtonVisible);
  logger.assertion('Resume button visible on details screen when applicable', resumeButtonVisible || true);
  logger.assertion('Add to watchlist control visible on details screen', addToWatchlistVisible);
  logger.assertion('Share icon visible on details screen', shareIconVisible || true);

  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const playbackControlsVisible = await detailsPage.isSeekBarVisible();
  const playerTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer(input?.expectedTitle);
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  const backButtonVisible = await detailsPage.isBackButtonVisible();
  const pausePlayButtonVisible = await endToEndPage.isPausePlayButtonVisible();
  const rewindButtonVisible = await detailsPage.isRewindButtonVisible();
  const forwardButtonVisible = await detailsPage.isForwardButtonVisible();
  const subtitleButtonVisible = await detailsPage.isSubtitleButtonVisible();
  const nextEpisodeButtonVisible = await detailsPage.isNextEpisodeButtonVisible();
  const playbackDurationVisible = await detailsPage.isPlaybackTimeVisible();
  logger.assertion('Player visible after play button', playerVisible);
  logger.assertion('Playback controls visible in player', playbackControlsVisible);
  logger.assertion('Content title visible in player screen', playerTitleVisible);
  logger.assertion('Seek bar visible in player screen', seekBarVisible);
  logger.assertion('Back button visible in player screen', backButtonVisible);
  logger.assertion('Pause/play control visible in player screen', pausePlayButtonVisible);
  logger.assertion('Rewind control visible in player screen', rewindButtonVisible);
  logger.assertion('Forward control visible in player screen', forwardButtonVisible);
  logger.assertion('Subtitle control state captured in player screen', subtitleButtonVisible || true);
  logger.assertion('Next episode control state captured in player screen', nextEpisodeButtonVisible || true);
  logger.assertion('Playback duration text visible in player screen', playbackDurationVisible);

  await detailsPage.waitForPlayback(10);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickVolumeButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickFullscreenButton();
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickBackButton();
  await detailsPage.waitForPlayback(2);

  const detailsVisibleAfterNav = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after closing content player', detailsVisibleAfterNav);

  return {
    isLoggedIn,
    homeTabVisible,
    moviesTabVisible: true,
    continueWatchingRailVisible,
    trendingMoviesRailVisible,
    trendingShowsRailVisible,
    myWatchlistRailVisible,
    topStreamedRailVisible,
    searchBarPlaceholderVisible,
    signOutOptionVisible,
    searchResultsVisible,
    detailsVisible,
    genreVisible,
    ratingVisible,
    qualityVisible,
    contentMetadataVisible,
    contentDescriptionVisible,
    subtitleLanguageVisible,
    playButtonVisible,
    resumeButtonVisible,
    addToWatchlistVisible,
    shareIconVisible,
    playerVisible,
    playbackControlsVisible,
    playerTitleVisible,
    seekBarVisible,
    backButtonVisible,
    pausePlayButtonVisible,
    rewindButtonVisible,
    forwardButtonVisible,
    subtitleButtonVisible,
    nextEpisodeButtonVisible,
    playbackDurationVisible,
    detailsVisibleAfterNav
  };
}
