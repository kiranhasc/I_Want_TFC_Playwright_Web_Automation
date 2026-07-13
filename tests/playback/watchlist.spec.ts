import { test, expect } from '@playwright/test';
import { playContentFromWatchlist } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Playback - Watchlist', () => {
    test('@High IW3-T2030: Verify that a selected item from My Watchlist can be played', async ({ page }) => {
        test.setTimeout(180000);
        const result = await playContentFromWatchlist(page, {
            email: process.env.VALID_LOGIN_EMAIL,
            password: process.env.VALID_LOGIN_PASSWORD,
        });

        expect(result.isLoggedIn).toBeTruthy();
        expect(result.watchlistOpened).toBeTruthy();
        expect(result.contentSelected).toBeTruthy();
        expect(result.playClicked).toBeTruthy();
        expect(result.contentPlayed).toBeTruthy();
        expect(result.playbackStarted).toBeTruthy();
    });
});
