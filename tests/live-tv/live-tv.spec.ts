import { test, expect } from '@playwright/test';
import { verifyLivePlaybackPauseResume } from '../../src/businessFunction/ott-playback-bfs';

const email = process.env.VALID_LOGIN_EMAIL || 'abhilash584@gmail.com';
const password = process.env.VALID_LOGIN_PASSWORD || 'Test1234';

test.describe('Live TV Pause / Resume Playback', () => {
    test('IW3-T2010: Verify that the pause and resume buttons function correctly during live playback', async ({ page }) => {
        const result = await verifyLivePlaybackPauseResume(page, {
            email,
            password,
        });

        expect(result.isLoggedIn).toBeTruthy();
        expect(result.liveSectionSelected).toBeTruthy();
        expect(result.channelSelected).toBeTruthy();
        expect(result.playbackStarted).toBeTruthy();
        expect(result.pauseResumeWorked).toBeTruthy();
        expect(result.currentTimeBeforePause).toBeGreaterThanOrEqual(0);
        expect(result.currentTimeAfterResume).toBeGreaterThanOrEqual(result.currentTimeBeforePause);
    });
});
