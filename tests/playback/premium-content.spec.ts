import { test, expect } from '@playwright/test';
import { verifyPremiumContentGate } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Playback - Premium content gate', () => {
    test('IW3-T2025: Verify the message displayed when user tries to play premium content', async ({ page }) => {
        const data = testCaseData['tc-play-002-premium-content-gate'];

        const result = await verifyPremiumContentGate(page, {
            email: process.env.FREE_USER_LOGIN_EMAIL,
            password: process.env.FREE_USER_LOGIN_PASSWORD,
            expectedMessage: data.expectedMessage,
            expectedMaybeLaterText: data.expectedMaybeLaterText,
            expectedSubscribeText: data.expectedSubscribeText,
        });

        expect(result.playAttempted).toBeTruthy();
        expect(result.premiumGateDisplayed).toBeTruthy();
        expect(result.gateMessage).toContain(data.expectedMessage);
        expect(result.maybeLaterVisible).toBeTruthy();
        expect(result.subscribeToWatchVisible).toBeTruthy();
    });
});
