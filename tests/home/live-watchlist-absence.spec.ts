import { test, expect } from '@playwright/test';
import { verifyLiveContentWatchlistAbsence } from '../../src/businessFunction/ott-watchlist-bfs';
import  testCaseData from '../../src/data/ott-test-cases.json';

test.setTimeout(120000);

test.describe('Live content watchlist validation', () => {
  test('@medium IW3-T2047: Verify Add to Watchlist option is not displayed for Live content', async ({ page }) => {
    const data = testCaseData['tc-auth-018-live-content-watchlist-absence'];
    const result = await verifyLiveContentWatchlistAbsence(page, {
      liveContentName: data.liveContentName,
      email: data.email,
      password: data.password,
    });

    expect(result.isLiveChannelsTrayVisible).toBe(true);
    expect(result.isLiveContentVisible).toBe(true);
    expect(result.isAddToWatchlistButtonVisible).toBe(false);
  });
});
