import { test, expect } from '@playwright/test';
import { verifyPremiumContentGate } from '../../src/businessFunction/ott-playback-bfs';
import { verifySubscribeToWatchCarouselMessage } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Playback - Premium content gate', () => {
    test('High IW3-T2025: Verify the message displayed when user tries to play premium content', async ({ page }) => {
        test.setTimeout(180000);
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

    test('High IW3-T2032: Verify that "Subscribe to watch" CTA is displayed for premium carousel contents for free user', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-sub-002-premium-carousel-subscribe-cta'];

        const result = await verifySubscribeToWatchCarouselMessage(page, {
            email: process.env.FREE_USER_LOGIN_EMAIL,
            password: process.env.FREE_USER_LOGIN_PASSWORD,
            expectedMessage: data?.expectedMessage,
            expectedMaybeLaterText: data?.expectedMaybeLaterText,
            expectedSubscribeText: data?.expectedSubscribeText,
        });

        expect(result.loginSuccessful).toBeTruthy();
        expect(result.carouselChecked).toBeTruthy();
        expect(result.promptObserved).toBeTruthy();
        expect(result.maybeLaterVisible || result.subscribeToWatchVisible).toBeTruthy();
        expect(result.message.toLowerCase()).toContain((data?.expectedSubscribeText || 'subscribe to watch').toLowerCase());
    });

        test('@High IW3-T2035: Verify the message displayed on "Subscribe to watch" CTA from Home/Shows/Movies/GMA tabs from "Carousel"', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-sub-001-carousel-subscribe-cta'];

        const result = await verifySubscribeToWatchCarouselMessage(page, {
            email: process.env.FREE_USER_LOGIN_EMAIL,
            password: process.env.FREE_USER_LOGIN_PASSWORD,
            expectedMessage: data.expectedMessage,
            expectedMaybeLaterText: data.expectedMaybeLaterText,
            expectedSubscribeText: data.expectedSubscribeText,
        });

        expect(result.loginSuccessful).toBeTruthy();
        expect(result.promptObserved || result.subscribeToWatchVisible || result.message.length > 0).toBeTruthy();
        expect(result.message.toLowerCase()).toContain(data.expectedSubscribeText.toLowerCase().split(' ')[0]);
        expect(result.maybeLaterVisible || result.subscribeToWatchVisible).toBeTruthy();
    });
});
