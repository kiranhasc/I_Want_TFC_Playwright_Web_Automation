import { test, expect } from '@playwright/test';
import { verifyLivePlaybackPauseResume } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Live TV Pause / Resume Playback', () => {
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
});
