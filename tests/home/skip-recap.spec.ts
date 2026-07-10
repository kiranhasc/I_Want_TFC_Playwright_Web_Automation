import { test, expect } from '@playwright/test';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { verifySkipRecapMarkerDuringPlayback } from '../../src/businessFunction/ott-details-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Playback skip recap marker', () => {
  test('@high IW3-T2114: Verify presence of Skip Recap marker during initial content playback', async ({ page }) => {
    const data = testCaseData['tc-disc-005-skip-recap'];

    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);

    const playbackResult = await verifySkipRecapMarkerDuringPlayback(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });

    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisible).toBe(true);
  });
});
