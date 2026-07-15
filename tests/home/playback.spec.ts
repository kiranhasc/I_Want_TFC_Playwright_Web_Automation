import { test, expect } from '../../src/fixtures/test-hooks';
test.setTimeout(600_000);
import { openContentAndPlay, verifyLivePlaybackPauseResume, verifyPlaybackResumeFlow, verifySmoothPlaybackFlow, verifyFullscreenFunctionalityFlow, verifySubtitleDisplayFlow, verifySubtitleDefaultOffFlow, verifySubtitleCarryOverFlow, verifySeekBarDragFlow, verifyBrowserSeekBarFlow, verifyPlayerControlsFlow, verifyPlayerControlsAutoDismissFlow, verifyPlayerControlsHoverDismissFlow, verifyVolumeControlFlow, verifyFullscreenButtonVisibilityFlow, verifyPlaybackTimestampFormatFlow, verifyPlaybackShortDurationTimestampFormatFlow, verifySubtitleSelectionFlow, verifySubtitlePersistenceFlow, verifySubtitleSynchronizationFlow, verifyLivePlaybackGoLiveFlow, verifyLiveStreamSeekRestrictionFlow, verifyPreRollAdPlaybackFlow, verifyPauseAdPlaybackFlow, verifyPausePlaybackFlow, verifyPauseforwardBackwardButtonsFlow, verifyforwardBackwardButtonsFlow, verifyPlayerUIFlow, verifyNextEpisodeCtaVisibilityFlow, verifyUpNextBingeMarkerFlow, verifyBackButtonNavigationFlow  } from '../../src/businessFunction/ott-playback-bfs';
import testData from '../../src/data/ott-test-cases.json';

test.describe('Play Back', () => {
  test('@High IW3-T1967 - Play content from details page', async ({ page }) => {
    const data = testData['tc-sub-003-play-content'] as Record<string, any>;
    const result = await openContentAndPlay(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
  });

  test('@High IW3-T1907 - IW3-T1975 - playback starts post tapping Play/Resume CTA', async ({ page }) => {
    const data = testData['tc-sub-004-resume-playback'] as Record<string, any>;
    const result = await verifyPlaybackResumeFlow(page, {
      query: data.query,
      mode:data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialPlayed).toBeTruthy();
    expect(result.resumed).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@High IW3-T1968 - video playback starts successfully and plays smoothly without interruption', async ({ page }) => {
    const data = testData['tc-sub-005-smooth-playback'] as Record<string, any>;
    const result = await verifySmoothPlaybackFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@High IW3-T1999 - dragging the seek bar updates playback position', async ({ page }) => {
    const data = testData['tc-sub-006-seek-bar-drag'] as Record<string, any>;
    const result = await verifySeekBarDragFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
      seekPercent: data.seekPercent,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });

  test('@Medium IW3-T1997 - player controls auto-dismiss after 5s of inactivity', async ({ page }) => {
    const data = testData['tc-sub-030-player-controls-autodismiss'] as Record<string, any>;
    const result = await verifyPlayerControlsAutoDismissFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.controlsInitiallyVisible).toBeTruthy();
    expect(result.controlsAutoDismissed).toBeTruthy();
  });

  test('@Medium IW3-T2005 - user can adjust volume using volume button', async ({ page }) => {
    const data = testData['tc-sub-032-volume-button-control'] as Record<string, any>;
    const result = await verifyVolumeControlFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialVolume).toBeGreaterThanOrEqual(0);
    expect(result.adjustedVolume).toBeGreaterThanOrEqual(0);
  });

  test('@High IW3-T2000 - seek bar behaves correctly across supported browsers', async ({ page }) => {
    const data = testData['tc-sub-008-browser-seek-bar'] as Record<string, any>;
    const result = await verifyBrowserSeekBarFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
      seekPercent: data.seekPercent,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });

  
  test('@High IW3-T2002 - player controls appear when the screen is tapped during playback', async ({ page }) => {
    const data = testData['tc-sub-009-player-controls'] as Record<string, any>;
    const result = await verifyPlayerControlsFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.rewindVisible).toBeTruthy();
    expect(result.forwardVisible).toBeTruthy();
    expect(result.volumeVisible).toBeTruthy();
    expect(result.subtitleVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
    expect(result.controlsVisible).toBeTruthy();
  });

  test('@Low IW3-T1980 - full screen icon is displayed on the player screen', async ({ page }) => {
    const data = testData['tc-sub-016-fullscreen-icon'] as Record<string, any>;
    const result = await verifyFullscreenButtonVisibilityFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
  });
  
  test('@Low IW3-T1978 - playback timestamp is displayed in HH:MM:SS format for long-duration content', async ({ page }) => {
    const data = testData['tc-sub-017-timestamp-format'] as Record<string, any>;
    const result = await verifyPlaybackTimestampFormatFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
  });

  test('@Low IW3-T1979 - playback timestamp is displayed in MM:SS format for short-duration content', async ({ page }) => {
    const data = testData['tc-sub-018-short-duration-timestamp-format'] as Record<string, any>;
    const result = await verifyPlaybackShortDurationTimestampFormatFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
  });

  test('@Medium IW3-T1981 - user can select available subtitle during playback', async ({ page }) => {
    const data = testData['tc-sub-019-subtitle-selection'] as Record<string, any>;
    const result = await verifySubtitleSelectionFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleButtonVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
  });

  test('@Medium IW3-T1982 - selected subtitle persists when moving to the next episode', async ({ page }) => {
    const data = testData['tc-sub-020-subtitle-next-episode'] as Record<string, any>;
    const result = await verifySubtitlePersistenceFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

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

  test('@High IW3-T2013 - pre-roll ad plays automatically before main content starts', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyPreRollAdPlaybackFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
  });

  test('@Medium IW3-T1974 - video playback pauses immediately when pause is triggered', async ({ page }) => {
    const data = testData['tc-sub-013-pause-playback'] as Record<string, any>;
    const result = await verifyPausePlaybackFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.initialPlaybackTime).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.playbackPaused).toBeTruthy();
  });

  test('@Medium IW3-T1976 - Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds', async ({ page }) => {
    const data = testData['tc-sub-015-pause-seek-buttons'] as Record<string, any>;
    const result = await verifyforwardBackwardButtonsFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });

  test('@Medium IW3-T1983 - selected subtitle carries to another content when available', async ({ page }) => {
    const data = testData['tc-sub-021-subtitle-carry-over'] as Record<string, any>;
      const result = await verifySubtitleCarryOverFlow(page, {
      mode: data.mode,
      query: data.query,
      secondQuery: data.secondQuery,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });
      expect(result.isLoggedIn).toBeTruthy();
      expect(result.detailsVisible).toBeTruthy();
      expect(result.subtitleSelectionSuccessful).toBeTruthy();
      expect(result.carryOverSubtitleVisible).toBeTruthy();
  });

  test('@Medium IW3-T1984 - subtitles are set to Off by default', async ({ page }) => {
   const data = testData['tc-sub-022-subtitle-default-off'] as Record<string, any>;  
   const result = await verifySubtitleDefaultOffFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleButtonVisible).toBeTruthy();
    expect(result.subtitleOffVisible).toBeTruthy();
  });

  test('@Low IW3-T1985 - selected subtitles are displayed on the player screen', async ({ page }) => {
    const data = testData['tc-sub-023-subtitle-display'] as Record<string, any>;
    const result = await verifySubtitleDisplayFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.subtitleDisplayedOnPlayer).toBeTruthy();
  });

 test('@Medium IW3-T1987 - tapping the full screen icon activates fullscreen and continues playback', async ({ page }) => {
   const data = testData['tc-sub-025-fullscreen-functionality'] as Record<string, any>;  
   const result = await verifyFullscreenFunctionalityFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.playbackTimeProgressed).toBeTruthy();
  });

  test('@Low IW3-T1988 - player screen UI displays all controls in fullscreen mode', async ({ page }) => {
    const data = testData['tc-sub-026-landscape-player-ui'] as Record<string, any>;
    const result = await verifyPlayerUIFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.isLoggedIn).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.backButtonVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.pausePlayVisible).toBeTruthy();
    expect(result.forwardRewindVisible).toBeTruthy();
    expect(typeof result.subtitleVisible).toBe('boolean');
    expect(typeof result.nextEpisodeVisible).toBe('boolean');
  });

  test('@Medium IW3-T1989 - next episode CTA appears below the seek bar when available', async ({ page }) => {
    const data = testData['tc-sub-027-next-episode-cta'] as Record<string, any>;
    const result = await verifyNextEpisodeCtaVisibilityFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(typeof result.nextEpisodeVisible).toBe('boolean');
    expect(typeof result.nextEpisodeBelowSeekBar).toBe('boolean');
  });

  test('@Medium IW3-T1992 - tapping the playback back button returns to the previous details screen', async ({ page }) => {
    const data = testData['tc-sub-029-back-button-navigation'] as Record<string, any>;
    const result = await verifyBackButtonNavigationFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.backNavigationSuccessful).toBeTruthy();
  });

  test('@Medium IW3-T1977 - forward and backward buttons function correctly when playback is paused', async ({ page }) => {
    const data = testData['tc-sub-015-pause-seek-buttons'] as Record<string, any>;
    const result = await verifyPauseforwardBackwardButtonsFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });

  test('@High IW3-T2012 - live playback begins on tapping Go Live CTA', async ({ page }) => {
    const data = testData['tc-sub-010-go-live-playback'] as Record<string, any>;
    const result = await verifyLivePlaybackGoLiveFlow(page, {
      mode: data.mode,
      channelName: data.channelName,
    });

    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.goLiveVisible).toBeTruthy();
  });

  test('@High IW3-T2008 - live stream does not allow seek forward or backward', async ({ page }) => {
    const data = testData['tc-sub-007-live-stream-seek-restriction'] as Record<string, any>;
    const result = await verifyLiveStreamSeekRestrictionFlow(page, {
      mode: data.mode,
      channelName: data.channelName,
    });

    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.rewindButtonVisible).toBeFalsy();
    expect(result.forwardButtonVisible).toBeFalsy();
  });
});
