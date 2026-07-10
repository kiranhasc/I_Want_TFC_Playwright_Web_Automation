import { test, expect } from '@playwright/test';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { removeFromContinueWatching } from '../../src/businessFunction/ott-continue-watching-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Continue Watching tray', () => {
  test('@inprogress IW3-T1936: Verify the functionality of Remove From Continue Watching CTA displayed on the CW tray bottom bar popup from Home screen', async ({ page }) => {
    const data = testCaseData['tc-disc-003-remove-continue-watching'];

    const loginResult = await loginToOTT(page, {
      mode: data.mode,
    });
    expect(loginResult.isLoggedIn).toBe(true);

    const result = await removeFromContinueWatching(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      contentTitle: data.contentTitle,
    });

    //expect(result.isContinueWatchingTrayVisible).toBe(true);
    expect(result.wasItemPresentBeforeRemoval).toBe(true);
    expect(result.isItemPresentAfterRemoval).toBe(false);
  });
});
