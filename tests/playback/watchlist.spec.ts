import { test, expect } from '@playwright/test';
import { playContentFromWatchlist } from '../../src/businessFunction/ott-playback-bfs';

const email = process.env.VALID_LOGIN_EMAIL || 'abhilash584@gmail.com';
const password = process.env.VALID_LOGIN_PASSWORD || 'Test1234';

test.describe('Playback - Watchlist', () => {
    test('IW3-T2030: Verify that a selected item from My Watchlist can be played', async ({ page }) => {
        const result = await playContentFromWatchlist(page, {
            email,
            password,
        });

        expect(result.isLoggedIn).toBeTruthy();
        expect(result.watchlistOpened).toBeTruthy();
        expect(result.contentSelected).toBeTruthy();
        expect(result.playClicked).toBeTruthy();
        expect(result.contentPlayed).toBeTruthy();
        expect(result.playbackStarted).toBeTruthy();
    });
});
