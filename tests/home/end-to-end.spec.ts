import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyEndToEndLaunchLoginSearchPlaybackFlow } from '../../src/businessFunction/ott-end-to-end-bfs';
import testData from '../../src/data/ott-test-cases.json';

test.describe('End To End', () => {
  test(' end-to-end launch, login, navigation, search and playback of a content', async ({ page }) => {
    test.setTimeout(120000);
    const data = testData['tc-sub-033-end-to-end-launch-login-search-playback'] as Record<string, any>;
    const result = await verifyEndToEndLaunchLoginSearchPlaybackFlow(page, {
      query: data.query,
      mode: data.mode,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
    });

    expect(result.homeTabVisible).toBeTruthy();
    expect(result.trendingMoviesRailVisible).toBeTruthy();
    expect(result.trendingShowsRailVisible).toBeTruthy();
    expect(result.myWatchlistRailVisible).toBeTruthy();
    expect(result.topStreamedRailVisible).toBeTruthy();
    expect(result.searchBarPlaceholderVisible).toBeTruthy();
    expect(result.signOutOptionVisible).toBeTruthy();
    expect(result.searchResultsVisible).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.genreVisible).toBeDefined();
    expect(result.ratingVisible).toBeDefined();
    expect(result.qualityVisible).toBeDefined();
    expect(result.contentMetadataVisible).toBeTruthy();
    expect(result.contentDescriptionVisible).toBeDefined();
    expect(result.addToWatchlistVisible).toBeDefined();
    expect(result.playerVisible).toBeTruthy();
    expect(result.playbackControlsVisible).toBeTruthy();
    expect(result.playerTitleVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.backButtonVisible).toBeTruthy();
    expect(result.pausePlayButtonVisible).toBeTruthy();
    expect(result.rewindButtonVisible).toBeTruthy();
    expect(result.forwardButtonVisible).toBeTruthy();
    expect(result.playbackDurationVisible).toBeTruthy();
    expect(result.detailsVisibleAfterNav).toBeTruthy();
  });
});
