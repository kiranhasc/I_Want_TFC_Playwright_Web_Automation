import { test, expect } from '@playwright/test';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { playEpisodeFromDetailsPage } from '../../src/businessFunction/ott-details-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Episode playback from detail page', () => {
  test('@inprogress IW3-T1921: Verify that respective episode playback starts post tapping on episode cards in detail page', async ({ page }) => {
    const data = testCaseData['tc-disc-002-episode-playback'];

    const loginResult = await loginToOTT(page, {
      mode: data.mode,
    });
    expect(loginResult.isLoggedIn).toBe(true);

    const playbackResult = await playEpisodeFromDetailsPage(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });

    // Click the player area using the provided long text locator
   await expect(page.getByText('backThe Blood SistersS1 E1 · Episode')).toBeVisible({ timeout: 30000 });

    // Use the same long-text locator to assert the playback title is visible
    // const playerTextLocator = page.getByText('backThe Blood SistersS1 E1 · Episode 1Skip IntroSkip RecapGo LiveLive00:09 / 37');
    // await playerTextLocator.waitFor({ state: 'visible', timeout: 30000 });
    // await expect(playerTextLocator).toContainText(/The Blood Sisters/i);
    // await expect(playerTextLocator).toContainText(/Episode\s*1/i);

    



  });
});
