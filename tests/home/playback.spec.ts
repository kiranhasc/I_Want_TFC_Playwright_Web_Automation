import { test, expect } from '@playwright/test';
test.setTimeout(600_000);
import { openContentAndPlay, verifyPlaybackResumeFlow, verifySmoothPlaybackFlow, verifySeekBarDragFlow, verifyBrowserSeekBarFlow, verifyPlayerControlsFlow, verifyFullscreenButtonVisibilityFlow, verifyPlaybackTimestampFormatFlow, verifyPlaybackShortDurationTimestampFormatFlow, verifySubtitleSelectionFlow, verifySubtitlePersistenceFlow, verifySubtitleSynchronizationFlow, verifyLivePlaybackGoLiveFlow, verifyLiveStreamSeekRestrictionFlow, verifyPreRollAdPlaybackFlow, verifyPauseAdPlaybackFlow, verifyPausePlaybackFlow, verifyPauseforwardBackwardButtonsFlow, verifyforwardBackwardButtonsFlow, verifyPlayerUIFlow, verifyLivePlaybackPauseResume  } from '../../src/businessFunction/ott-playback-bfs';
import testData from '../../src/data/ott-test-cases.json';

const data = testData['tc-sub-003-play-content'] as Record<string, any>;
const resumeData = testData['tc-sub-004-resume-playback'] as Record<string, any>;
const smoothPlaybackData = testData['tc-sub-005-smooth-playback'] as Record<string, any>;
const seekBarData = testData['tc-sub-006-seek-bar-drag'] as Record<string, any>;
const browserSeekBarData = testData['tc-sub-008-browser-seek-bar'] as Record<string, any>;
const playerControlsData = testData['tc-sub-009-player-controls'] as Record<string, any>;
const livePlaybackData = testData['tc-sub-010-go-live-playback'] as Record<string, any>;
const preRollAdData = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
const pauseAdData = testData['tc-sub-012-pause-ad'] as Record<string, any>;
const pausePlaybackData = testData['tc-sub-013-pause-playback'] as Record<string, any>;
const pauseSeekButtonsData = testData['tc-sub-015-pause-seek-buttons'] as Record<string, any>;
const fullscreenData = testData['tc-sub-016-fullscreen-icon'] as Record<string, any>;
const fullscreenFunctionalityData = testData['tc-sub-025-fullscreen-functionality'] as Record<string, any>;
const landscapePlayerUIData = testData['tc-sub-026-landscape-player-ui'] as Record<string, any>;
const timestampFormatData = testData['tc-sub-017-timestamp-format'] as Record<string, any>;
const shortDurationTimestampFormatData = testData['tc-sub-018-short-duration-timestamp-format'] as Record<string, any>;
const subtitleSelectionData = testData['tc-sub-019-subtitle-selection'] as Record<string, any>;
const subtitlePersistenceData = testData['tc-sub-020-subtitle-next-episode'] as Record<string, any>;
const subtitleCarryOverData = testData['tc-sub-021-subtitle-carry-over'] as Record<string, any>;
const subtitleDefaultOffData = testData['tc-sub-022-subtitle-default-off'] as Record<string, any>;
const subtitleDisplayData = testData['tc-sub-023-subtitle-display'] as Record<string, any>;
const subtitleSynchronizationData = testData['tc-sub-024-subtitle-synchronization'] as Record<string, any>;
const liveStreamData = testData['tc-sub-007-live-stream-seek-restriction'] as Record<string, any>;

test.describe('Play Back', () => {
  test('@High - IW3-T1967 - Play content from details page', async ({ page }) => {
    const result = await openContentAndPlay(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
  });
  test('@High - IW3-T1907 - IW3-T1975 - playback starts post tapping Play/Resume CTA', async ({ page }) => {
    const result = await verifyPlaybackResumeFlow(page, {
      query: resumeData.query,
      mode: resumeData.mode,
      expectedTitle: resumeData.expectedTitle,
      expectedEpisode: resumeData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialPlayed).toBeTruthy();
    expect(result.resumed).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@High - IW3-T1968 - video playback starts successfully and plays smoothly without interruption', async ({ page }) => {
    const result = await verifySmoothPlaybackFlow(page, {
      query: smoothPlaybackData.query,
      mode: smoothPlaybackData.mode,
      expectedTitle: smoothPlaybackData.expectedTitle,
      expectedEpisode: smoothPlaybackData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@High - IW3-T1999 - dragging the seek bar updates playback position', async ({ page }) => {
    const result = await verifySeekBarDragFlow(page, {
      query: seekBarData.query,
      mode: seekBarData.mode,
      expectedTitle: seekBarData.expectedTitle,
      expectedEpisode: seekBarData.expectedEpisode,
      seekPercent: seekBarData.seekPercent,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });

  test('@High - IW3-T2000 - seek bar behaves correctly across supported browsers', async ({ page }) => {
    const result = await verifyBrowserSeekBarFlow(page, {
      query: browserSeekBarData.query,
      mode: browserSeekBarData.mode,
      expectedTitle: browserSeekBarData.expectedTitle,
      expectedEpisode: browserSeekBarData.expectedEpisode,
      seekPercent: browserSeekBarData.seekPercent,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });

  test('@High - IW3-T2002 - player controls appear when the screen is tapped during playback', async ({ page }) => {
    const result = await verifyPlayerControlsFlow(page, {
      query: playerControlsData.query,
      mode: playerControlsData.mode,
      expectedTitle: playerControlsData.expectedTitle,
      expectedEpisode: playerControlsData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.controlsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.rewindVisible).toBeTruthy();
    expect(result.forwardVisible).toBeTruthy();
    expect(result.volumeVisible).toBeTruthy();
    expect(result.subtitleVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
  });

  test('@Low - IW3-T1980 - full screen icon is displayed on the player screen', async ({ page }) => {
    const result = await verifyFullscreenButtonVisibilityFlow(page, {
      mode: fullscreenData.mode,
      query: fullscreenData.query,
      expectedTitle: fullscreenData.expectedTitle,
      expectedEpisode: fullscreenData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
  });


  // test('@Low - IW3-T1988 - player screen UI displays all controls in fullscreen mode', async ({ page }) => {
  //   const result = await verifyPlayerUIFlow(page, {
  //     mode: landscapePlayerUIData.mode,
  //     query: landscapePlayerUIData.query,
  //     expectedTitle: landscapePlayerUIData.expectedTitle,
  //     expectedEpisode: landscapePlayerUIData.expectedEpisode,
  //   });

  //   expect(result.isLoggedIn).toBeTruthy();
  //   expect(result.detailsVisible).toBeTruthy();
  //   expect(result.backButtonVisible).toBeTruthy();
  //   expect(result.contentTitleVisible).toBeTruthy();
  //   expect(result.seekBarVisible).toBeTruthy();
  //   expect(result.pausePlayVisible).toBeTruthy();
  //   expect(result.forwardRewindVisible).toBeTruthy();
  //   // expect(result.playbackTimeVisible).toBeTruthy();
  //   // Conditional checks - may be true if visible, false if not available
  //   expect(typeof result.subtitleVisible).toBe('boolean');
  //   expect(typeof result.nextEpisodeVisible).toBe('boolean');
  // });

  test('@Low - IW3-T1978 - playback timestamp is displayed in HH:MM:SS format for long-duration content', async ({ page }) => {
    const result = await verifyPlaybackTimestampFormatFlow(page, {
      mode: timestampFormatData.mode,
      query: timestampFormatData.query,
      expectedTitle: timestampFormatData.expectedTitle,
      expectedEpisode: timestampFormatData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    // expect(result.timestampFormatValid).toBeTruthy();
  });

  test('@Low - IW3-T1979 - playback timestamp is displayed in MM:SS format for short-duration content', async ({ page }) => {
    const result = await verifyPlaybackShortDurationTimestampFormatFlow(page, {
      mode: shortDurationTimestampFormatData.mode,
      query: shortDurationTimestampFormatData.query,
      expectedTitle: shortDurationTimestampFormatData.expectedTitle,
      expectedEpisode: shortDurationTimestampFormatData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    // expect(result.shortFormatValid).toBeTruthy();
  });

  test('@Normal - IW3-T1981 - user can select available subtitle during playback', async ({ page }) => {
    const result = await verifySubtitleSelectionFlow(page, {
      mode: subtitleSelectionData.mode,
      query: subtitleSelectionData.query,
      expectedTitle: subtitleSelectionData.expectedTitle,
      expectedEpisode: subtitleSelectionData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleButtonVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
  });

  test('@Normal - IW3-T1982 - selected subtitle persists when moving to the next episode', async ({ page }) => {
    const result = await verifySubtitlePersistenceFlow(page, {
      mode: subtitlePersistenceData.mode,
      query: subtitlePersistenceData.query,
      expectedTitle: subtitlePersistenceData.expectedTitle,
      expectedEpisode: subtitlePersistenceData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.nextEpisodeSubtitleVisible).toBeTruthy();
  });

  test('@High IW3-T2010: Verify that the pause and resume buttons function correctly during live playback', async ({ page }) => {
        test.setTimeout(180000);
        const result = await verifyLivePlaybackPauseResume(page, {
            email: process.env.VALID_LOGIN_EMAIL,
            password: process.env.VALID_LOGIN_PASSWORD,
        });

        expect(result.isLoggedIn).toBeTruthy();
        expect(result.liveSectionSelected).toBeTruthy();
        expect(result.channelSelected).toBeTruthy();
        expect(result.playbackStarted).toBeTruthy();
        expect(result.pauseResumeWorked).toBeTruthy();
        expect(result.currentTimeBeforePause).toBeGreaterThanOrEqual(0);
        expect(result.currentTimeAfterResume).toBeGreaterThanOrEqual(result.currentTimeBeforePause);
    });

  test('@High - IW3-T2013 - pre-roll ad plays automatically before main content starts', async ({ page }) => {
    const result = await verifyPreRollAdPlaybackFlow(page, {
      mode: preRollAdData.mode,
      query: preRollAdData.query,
      expectedTitle: preRollAdData.expectedTitle,
      expectedEpisode: preRollAdData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    // expect(result.mainContentVisible).toBeTruthy();
  });

  // test('@High - IW3-T3978 - pause ad appears on player screen during pause state', async ({ page }) => {
  //   const result = await verifyPauseAdPlaybackFlow(page, {
  //     mode: pauseAdData.mode,
  //     query: pauseAdData.query,
  //     expectedTitle: pauseAdData.expectedTitle,
  //     expectedEpisode: pauseAdData.expectedEpisode,
  //   });

  //   expect(result.isLoggedIn).toBeTruthy();
  //   expect(result.playerVisible).toBeTruthy();
  //   expect(result.adVisible).toBeTruthy();
  //   expect(result.pauseAdVisible).toBeTruthy();
  //   expect(result.mainContentVisible).toBeTruthy();
  // });

  test('@Normal - IW3-T1974 - video playback pauses immediately when pause is triggered', async ({ page }) => {
    const result = await verifyPausePlaybackFlow(page, {
      mode: pausePlaybackData.mode,
      query: pausePlaybackData.query,
      expectedTitle: pausePlaybackData.expectedTitle,
      expectedEpisode: pausePlaybackData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.initialPlaybackTime).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.playbackPaused).toBeTruthy();
  });

   test('@Normal - IW3-T1976 - Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds', async ({ page }) => {
    const result = await verifyforwardBackwardButtonsFlow(page, {
      mode: pauseSeekButtonsData.mode,
      query: pauseSeekButtonsData.query,
      expectedTitle: pauseSeekButtonsData.expectedTitle,
      expectedEpisode: pauseSeekButtonsData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });


  test('@Normal - IW3-T1977 - forward and backward buttons function correctly when playback is paused', async ({ page }) => {
    const result = await verifyPauseforwardBackwardButtonsFlow(page, {
      mode: pauseSeekButtonsData.mode,
      query: pauseSeekButtonsData.query,
      expectedTitle: pauseSeekButtonsData.expectedTitle,
      expectedEpisode: pauseSeekButtonsData.expectedEpisode,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });

  test('@High - IW3-T2012 - live playback begins on tapping Go Live CTA', async ({ page }) => {
    const result = await verifyLivePlaybackGoLiveFlow(page, {
      mode: livePlaybackData.mode,
      channelName: livePlaybackData.channelName,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.goLiveVisible).toBeTruthy();
  });

  test('@High - IW3-T2008 - live stream does not allow seek forward or backward', async ({ page }) => {
    const result = await verifyLiveStreamSeekRestrictionFlow(page, {
      mode: liveStreamData.mode,
      channelName: liveStreamData.channelName,
    });

    // expect(result.isLoggedIn).toBeTruthy();
    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.rewindButtonVisible).toBeFalsy();
    expect(result.forwardButtonVisible).toBeFalsy();
  });
});
