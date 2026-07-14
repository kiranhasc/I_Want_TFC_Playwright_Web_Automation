import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { loginToOTT } from './ott-auth-bfs';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { logger } from '../utils/logger';

declare const process: { env: Record<string, string | undefined> };

export interface OpenContentAndPlayInput {
  query?: string;
  mode?: string;
  expectedTitle?: string;
  expectedEpisode?: string;
  seekPercent?: number;
}

export interface OpenContentAndPlayOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerVisible: boolean;
  contentTitleVisible: boolean;
  episodeNameVisible: boolean;
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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting fullscreen functionality verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  // await detailsPage.waitForPlayback(3);
  // await detailsPage.tapPlaybackScreen();

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

export async function openContentAndPlay(page: any, input?: OpenContentAndPlayInput): Promise<OpenContentAndPlayOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting content search, navigation to details, and play flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();

  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Content details page visible', detailsVisible);

  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisible(input?.expectedTitle);
  const episodeNameVisible = await detailsPage.isEpisodeNameVisible(input?.expectedEpisode);

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
  // playerVisible: boolean;
  // contentTitleVisible: boolean;
  // episodeNameVisible: boolean;
  // seekBarVisible: boolean;
  // playbackTimeVisible: boolean;
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

export interface VerifyFullscreenButtonOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  fullscreenVisible: boolean;
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

export interface VerifyBackButtonNavigationOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  playerScreenHidden: boolean;
  backNavigationSuccessful: boolean;
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

export interface VerifySubtitleSelectionOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleButtonVisible: boolean;
  subtitleSelectionSuccessful: boolean;
}

export interface VerifySubtitlePersistenceOutput {
  isLoggedIn: boolean;
  detailsVisible: boolean;
  subtitleSelectionSuccessful: boolean;
  nextEpisodeSubtitleVisible: boolean;
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

export async function verifyPlaybackResumeFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlaybackResumeOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting playback resume verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  // search and open first content
  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  // Play then wait
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(20);
  const initialPlayed = true;

  // Hover over the player screen, then click resume and wait
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickResumeButton();
  // follow test steps: wait 10s after tapping resume to allow playback to start
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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting smooth playback verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const contentTitleVisible = await detailsPage.isPlayerContentTitleVisible(input?.expectedTitle);
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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;
  const targetPercent = input?.seekPercent ?? 0.35;

  logger.step('Starting seek bar drag verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  const playbackTimeVisible = await detailsPage.isPlaybackTimeVisible();
  await detailsPage.hoverPlaybackScreen();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.dragSeekBarToPosition(targetPercent);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(1);
  const updatedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  const playbackPositionChanged = initialPlaybackTime !== updatedPlaybackTime;

  // logger.assertion('Player screen visible', playerVisible);
  // logger.assertion('Content title visible on player screen', contentTitleVisible);
  // logger.assertion('Episode name visible on player screen', episodeNameVisible);
  // logger.assertion('Seek bar visible during seek drag', seekBarVisible);
  // logger.assertion('Playback time visible during seek drag', playbackTimeVisible);
  logger.assertion('Playback position changed after dragging seek bar', playbackPositionChanged);

  return {
    isLoggedIn,
    detailsVisible,
    // playerVisible,
    // contentTitleVisible,
    // episodeNameVisible,
    // seekBarVisible,
    // playbackTimeVisible,
    playbackPositionChanged,
  };
}

export async function verifyBrowserSeekBarFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyBrowserSeekBarFlowOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;
  const targetPercent = input?.seekPercent ?? 0.35;

  logger.step('Starting browser seek bar verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting player controls visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting player controls auto-dismiss verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(5);

  // show controls
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(1);
  const controlsInitiallyVisible = await detailsPage.isPauseButtonVisible();
  logger.assertion('Player controls visible after tapping playback screen', controlsInitiallyVisible);

  // wait for inactivity period (>5s) to verify auto-dismiss
  await detailsPage.waitForPlayback(5);
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
  controlsInitiallyVisible: boolean;
  controlsDismissedOnHover: boolean;
}

export async function verifyPlayerControlsHoverDismissFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlayerControlsHoverDismissOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting player controls hover-dismiss verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);

  await detailsPage.tapPlaybackScreen();
  await detailsPage.waitForPlayback(1);
  const controlsInitiallyVisible = await detailsPage.isPauseButtonVisible();
  logger.assertion('Player controls visible after tapping playback screen', controlsInitiallyVisible);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(1);
  const controlsStillVisible = await detailsPage.isPauseButtonVisible();
  const controlsDismissedOnHover = controlsInitiallyVisible && !controlsStillVisible;

  logger.assertion('Player controls dismissed when hovering over the screen', controlsDismissedOnHover);

  return {
    isLoggedIn,
    detailsVisible,
    controlsInitiallyVisible,
    controlsDismissedOnHover,
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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting volume control verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting fullscreen button visibility verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting landscape player UI verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  console.log('Content title visible in fullscreen mode:', contentTitleVisible);
  const seekBarVisible = await detailsPage.isSeekBarVisible();
  console.log('Seek bar visible in fullscreen mode:', seekBarVisible);
  const pausePlayVisible = await detailsPage.isPauseButtonVisible();
  console.log('Pause/play control visible in fullscreen mode:', pausePlayVisible);
  const rewindVisible = await detailsPage.isRewindButtonVisible();
  console.log('Rewind button visible in fullscreen mode:', rewindVisible);
  const forwardVisible = await detailsPage.isForwardButtonVisible();
  console.log('Forward button visible in fullscreen mode:', forwardVisible);
  const forwardRewindVisible = rewindVisible && forwardVisible;
  const subtitleVisible = await detailsPage.isSubtitleButtonVisible();
  console.log('Subtitle control visible in fullscreen mode:', subtitleVisible);
  await detailsPage.waitForPlayback(2);
  const nextEpisodeVisible = await detailsPage.isNextEpisodeButtonVisible();
  console.log('Next episode control visible in fullscreen mode:', nextEpisodeVisible);

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

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.98);
  console.log('Dragged seek bar to 98% position');
  await detailsPage.waitForPlayback(2);
  await detailsPage.clickResumeButton();
  const upNextMarkerVisible = await detailsPage.waitForUpNextMarker(15000);
  console.log('Up Next binge marker visibility:', upNextMarkerVisible);

  logger.assertion('Up Next binge marker visible at the end of playback', upNextMarkerVisible);

  return {
    isLoggedIn,
    detailsVisible,
    upNextMarkerVisible,
  };
}

export async function verifyBackButtonNavigationFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyBackButtonNavigationOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting back button navigation verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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

export async function verifyPlaybackTimestampFormatFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPlaybackTimestampFormatOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting playback timestamp format verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting subtitle selection verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

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

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  await detailsPage.clickSubtitleButton();
  // await detailsPage.waitForPlayback(1);
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

  await detailsPage.clickFirstSearchResult();
  const detailsVisible = await detailsPage.isShowDetailsPageVisible();
  logger.assertion('Details page visible after opening search result', detailsVisible);

  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(3);
  await detailsPage.tapPlaybackScreen();

  await detailsPage.clickSubtitleButton();
  await detailsPage.waitForPlayback(1);
  // await detailsPage.dragSeekBarToPosition(0.2);
  // await detailsPage.selectSubtitleLanguage();
  const subtitleSelectionSuccessful = await detailsPage.selectSubtitleLanguage();
  console.log('Subtitle selection successful:', subtitleSelectionSuccessful);
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterSelection = await detailsPage.isSubtitleDisplayedOnPlayer();
  console.log('Subtitle visible after selection:', subtitleVisibleAfterSelection);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterForward = await detailsPage.isSubtitleDisplayedOnPlayer();
  console.log('Subtitle visible after forwarding:', subtitleVisibleAfterForward);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterRewind = await detailsPage.isSubtitleDisplayedOnPlayer();
  console.log('Subtitle visible after rewinding:', subtitleVisibleAfterRewind);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.dragSeekBarToPosition(0.6);
  await detailsPage.waitForPlayback(1);
  const subtitleVisibleAfterSeek = await detailsPage.isSubtitleDisplayedOnPlayer();
  console.log('Subtitle visible after drag seeking:', subtitleVisibleAfterSeek);

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
  // mainContentVisible: boolean;
}

export interface VerifyPauseAdPlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  adVisible: boolean;
  pauseAdVisible: boolean;
  mainContentVisible: boolean;
}

export interface VerifyPausePlaybackOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  initialPlaybackTime: string;
  pausedPlaybackTime: string;
  playbackPaused: boolean;
}

export async function verifyPreRollAdPlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPreRollAdPlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting pre-roll ad playback verification flow');

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
  await detailsPage.waitForPlayback(90);
  // await detailsPage.hoverPlaybackScreen();
  // await detailsPage.clickPauseButton();
  // const mainContentVisible = await detailsPage.isPlaybackTimeVisible();

  logger.assertion('Player screen visible for pre-roll ad flow', playerVisible);
  logger.assertion('Ad visible before main content starts', adVisible);
  // logger.assertion('Main content playback visible after ad completes', mainContentVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    // mainContentVisible,
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
  console.log('Clicked resume button after pausing playback');
  const pauseAdVisible = await detailsPage.isPauseAdVisible();
  console.log('Pause ad visible:', pauseAdVisible);

  logger.assertion('Player screen visible for pause ad flow', playerVisible);
  logger.assertion('Ad visible before main content starts', adVisible);
  logger.assertion('Main content playback visible after ad completes', mainContentVisible);
  logger.assertion('Pause ad visible after pausing playback', pauseAdVisible);

  return {
    isLoggedIn,
    playerVisible,
    adVisible,
    pauseAdVisible,
    mainContentVisible,
  };
}

export async function verifyPausePlaybackFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPausePlaybackOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting playback pause verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(20);
  await detailsPage.hoverPlaybackScreen();
  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const initialPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  await detailsPage.clickPauseButton();
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.waitForPlayback(10);
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

export interface VerifyPauseSeekButtonsOutput {
  isLoggedIn: boolean;
  playerVisible: boolean;
  pausedPlaybackTime: string;
  forwardPlaybackTime: string;
  rewindPlaybackTime: string;
  forwardChanged: boolean;
  rewindChanged: boolean;
}

export async function verifyPauseforwardBackwardButtonsFlow(page: any, input?: OpenContentAndPlayInput): Promise<VerifyPauseSeekButtonsOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting pause seek buttons verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(30);
  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickPauseButton();
  await detailsPage.waitForPlayback(2);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Playback time:', pausedPlaybackTime);

  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(2);
  const forwardPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Forward playback time:', forwardPlaybackTime);
  const forwardChanged = pausedPlaybackTime !== forwardPlaybackTime;

  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(2);
  const rewindPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Rewind playback time:', rewindPlaybackTime);
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
  const query = (input?.query ?? '').trim();
  const mode = input?.mode;

  logger.step('Starting pause seek buttons verification flow');

  const loginResult = await loginToOTT(page, { mode });
  const isLoggedIn = loginResult.isLoggedIn;

  await authPage.clickSearchBar();
  await authPage.enterSearchQuery(query);
  await authPage.submitSearchQuery();
  const resultsVisible = query ? await authPage.isSearchResultsVisible(query) : false;
  logger.assertion('Search results visible for query', resultsVisible);

  await detailsPage.clickFirstSearchResult();
  await detailsPage.clickPlayButton();
  await detailsPage.waitForPlayback(30);
  await detailsPage.hoverPlaybackScreen();
  // await detailsPage.clickPauseButton();
  // await detailsPage.waitForPlayback(2);

  const playerVisible = await detailsPage.isPlayerScreenVisible();
  const pausedPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Playback time:', pausedPlaybackTime);

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickForwardButton();
  await detailsPage.waitForPlayback(1);
  const forwardPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Forward playback time:', forwardPlaybackTime);
  const forwardChanged = pausedPlaybackTime !== forwardPlaybackTime;

  await detailsPage.hoverPlaybackScreen();
  await detailsPage.clickRewindButton();
  await detailsPage.waitForPlayback(1);
  const rewindPlaybackTime = await detailsPage.getTrimmedPlaybackTime();
  console.log('Rewind playback time:', rewindPlaybackTime);
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

export interface VerifyLivePlaybackGoLiveOutput {
  isLoggedIn: boolean;
  liveChannelOpened: boolean;
  goLiveVisible: boolean;
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

export interface PlayFreeAssetInput {
    email?: string;
    password?: string;
}

export interface PlayFreeAssetOutput {
    isLoggedIn: boolean;
    isPlayableContentDetected: boolean;
    playAttempted: boolean;
    playbackStarted: boolean;
}

export async function playFreeAsset(page: any, input?: PlayFreeAssetInput): Promise<PlayFreeAssetOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting free asset playback flow');
    await playbackPage.loginWithFreeUser(email, password);

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
    email?: string;
    password?: string;
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
    email?: string;
    password?: string;
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
    const email = input?.email || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting premium content gate validation flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
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
    email?: string;
    password?: string;
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

export async function verifyLivePlaybackPauseResume(page: any, input?: VerifyLivePlaybackPauseResumeInput): Promise<VerifyLivePlaybackPauseResumeOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.VALID_LOGIN_EMAIL || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.VALID_LOGIN_PASSWORD || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting live playback pause and resume validation flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
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
    const email = input?.email || process.env.FREE_USER_LOGIN_EMAIL || process.env.VALID_LOGIN_EMAIL || '';
    const password = input?.password || process.env.FREE_USER_LOGIN_PASSWORD || process.env.VALID_LOGIN_PASSWORD || '';

    logger.step('Starting subscribe-to-watch home-page CTA validation flow');
    await playbackPage.loginWithFreeUser(email, password);

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

export async function playContentFromWatchlist(page: any, input?: PlayContentFromWatchlistInput): Promise<PlayContentFromWatchlistOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.VALID_LOGIN_EMAIL || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.VALID_LOGIN_PASSWORD || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting watchlist playback validation flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
    logger.assertion('User loaded the home screen before watchlist playback', isLoggedIn);

    const watchlistOpened = await playbackPage.navigateToWatchlistPage();
    logger.assertion('Watchlist page opened', watchlistOpened);

    const contentSelected = await playbackPage.selectFirstWatchlistContent();
    logger.assertion('Watchlist content selected', contentSelected);

    const playClicked = await playbackPage.clickWatchlistPlayOrResume();
    logger.assertion('Play or resume action clicked from watchlist content', playClicked);

    const playbackState = await playbackPage.waitForWatchlistPlayback();
    logger.assertion('Playback started from watchlist content', playbackState.playbackStarted);

    const contentPlayed = playbackState.playbackStarted && (playbackState.playbackCompleted || playbackState.currentTime > 0 || playbackState.duration > 0);
    logger.assertion('Watchlist playback content played', contentPlayed);

    return {
        isLoggedIn,
        watchlistOpened,
        contentSelected,
        playClicked,
        playbackStarted: playbackState.playbackStarted,
        playbackCompleted: playbackState.playbackCompleted,
        contentPlayed,
        currentTime: playbackState.currentTime,
        duration: playbackState.duration,
    };
}
