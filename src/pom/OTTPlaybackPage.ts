import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { logger } from '../utils/logger';

export class OTTPlaybackPage {
    private readonly page: Page;
    private readonly pageUtils: PageUtils;
    private readonly cookieConfirmButton: PageElement;
    private readonly emailField: PageElement;
    private readonly passwordField: PageElement;
    private readonly continueButton: PageElement;
    private readonly homeTab: PageElement;
    private readonly homeScreenContent: PageElement;
    private readonly contentCard: PageElement;
    private readonly playButton: PageElement;
    private readonly subscribeButton: PageElement;
    private readonly playerContainer: PageElement;
    private readonly videoElement: PageElement;
    private readonly premiumGateMessage: PageElement;
    private readonly maybeLaterButton: PageElement;
    private readonly subscribeToWatchButton: PageElement;
    private readonly laterEpisodeButton: PageElement;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
        this.emailField = { selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]' };
        this.passwordField = { selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]' };
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.homeTab = { text: 'Home', selector: 'nav >> text=Home' };
        this.homeScreenContent = { selector: 'main >> text=/Stream the best Filipino movies|Continue Watching/' };
        this.contentCard = { selector: 'a[href*="/player/"], [data-testid*="content"], [data-testid*="card"], .thumbnail, .poster, [class*="poster"], [class*="thumbnail"]' };
        this.playButton = { text: 'Play', selector: 'button:has-text("Play"), a:has-text("Play"), [aria-label*="Play"]' };
        this.subscribeButton = { text: 'Subscribe', selector: 'button:has-text("Subscribe"), a:has-text("Subscribe"), [aria-label*="Subscribe"]' };
        this.playerContainer = { selector: 'video, [data-testid*="player"], [class*="player"], [id*="player"]' };
        this.videoElement = { selector: 'video' };
        this.premiumGateMessage = { selector: 'h2', text: 'A valid subscription is required to view this content. Please subscribe or renew your plan.' };
        this.maybeLaterButton = { text: 'Maybe Later', selector: 'text=Maybe Later' };
        this.subscribeToWatchButton = { text: 'Subscribe to watch', selector: 'text=/Subscribe to watch/i' };
        this.laterEpisodeButton = { text: 'Play S1 E6', selector: 'text=/Play S1 E[6-9]|Play S[0-9]+ E[6-9]/i' };
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto('https://www.iwanttfc.com/');
        await this.pageUtils.waitForPageLoad();
    }

    async acceptCookieSettingsIfVisible(): Promise<void> {
        try {
            const isVisible = await this.pageUtils.isVisible(this.cookieConfirmButton, 2000);
            if (isVisible) {
                logger.step('Accepting cookie settings popup');
                await this.pageUtils.safeClick(this.cookieConfirmButton);
            }
        } catch (error) {
            logger.debug('Cookie confirmation button not visible', error);
        }
    }

    async loginWithFreeUser(email: string, password: string): Promise<void> {
        await this.navigateToHomePage();
        await this.acceptCookieSettingsIfVisible();
        try {
            await this.page.getByRole('button', { name: /confirm/i }).first().click({ force: true, timeout: 5000 });
        } catch {
            // ignore if overlay already dismissed
        }
        await this.pageUtils.safeClick(this.emailField);
        await this.pageUtils.safeType(this.emailField, email);
        await this.pageUtils.safeClick(this.passwordField);
        await this.pageUtils.safeType(this.passwordField, password);
        await this.pageUtils.safeClick(this.continueButton);
        await this.pageUtils.waitForNetworkIdle(60000);
        await this.page.waitForTimeout(5000);
    }

    async isHomeScreenReady(): Promise<boolean> {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            const mainVisible = await this.page.locator(this.homeScreenContent.selector).first().isVisible().catch(() => false);
            const tabVisible = await this.pageUtils.isVisible(this.homeTab, 15000);
            return mainVisible || tabVisible;
        } catch {
            return false;
        }
    }

    async isHomeTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.homeTab, 15000);
    }

    async hoverFirstPlayableContentCard(): Promise<boolean> {
        const playTarget = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
        const isVisible = await playTarget.isVisible().catch(() => false);
        if (!isVisible) {
            return false;
        }

        await playTarget.scrollIntoViewIfNeeded();
        await playTarget.hover();
        return true;
    }

    async clickFirstAvailablePlayButton(): Promise<boolean> {
        const playTarget = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
        const isVisible = await playTarget.isVisible().catch(() => false);
        if (!isVisible) {
            return false;
        }

        await playTarget.click({ force: true });
        await this.page.waitForURL(/\/player\//, { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(8000);
        return true;
    }

    async clickFirstPremiumContentCard(): Promise<boolean> {
        const premiumLabels = this.page.getByText(/Subscribe to watch|Subscribe to Watch/i);
        const labelCount = await premiumLabels.count().catch(() => 0);
        if (!labelCount) {
            return false;
        }

        const targetIndex = Math.min(3, Math.max(0, labelCount - 1));
        const premiumLabel = premiumLabels.nth(targetIndex);
        const isVisible = await premiumLabel.isVisible().catch(() => false);
        if (!isVisible) {
            return false;
        }

        const clicked = await premiumLabel.evaluate((node: HTMLElement) => {
            let current = node.parentElement;
            while (current) {
                const hasImage = current.querySelector('img');
                if (hasImage) {
                    current.scrollIntoView({ block: 'center' });
                    current.click();
                    return true;
                }
                current = current.parentElement;
            }
            return false;
        });

        await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(5000);
        return clicked;
    }

    async clickLaterEpisodeFromPremiumContent(): Promise<boolean> {
        // Prefer clicking the 5th episode item from the content detail episodes list
        const episodeItems = this.page.locator('.episodes-list .episode-info, .episodes-list [data-testid*="episode"], .seasons-container .episode-info');
        const itemsCount = await episodeItems.count().catch(() => 0);

        if (itemsCount > 0) {
            // targetIndex = 4 => 5th item (0-based)
            const targetIndex = Math.min(4, Math.max(0, itemsCount - 1));
            const item = episodeItems.nth(targetIndex);
            const itemVisible = await item.isVisible().catch(() => false);
            if (!itemVisible) {
                return false;
            }

            // try to click a clickable inside the item (image, button or anchor), otherwise click the item itself
            const clickable = item.locator('img, button, a, [role="button"]').first();
            const clickableVisible = await clickable.isVisible().catch(() => false);
            if (clickableVisible) {
                await clickable.scrollIntoViewIfNeeded();
                await clickable.click({ force: true });
            } else {
                await item.scrollIntoViewIfNeeded();
                await item.click({ force: true });
            }

            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        }

        // Fallback: try to find a Play Sx Ex (episode 5+) button and click it
        const episodeButton = this.page.getByText(/Play\s*S\d+\s*E([5-9]|[1-9]\d+)/i).first();
        const isVisible = await episodeButton.isVisible().catch(() => false);
        if (!isVisible) {
            const fallbackButton = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
            const fallbackVisible = await fallbackButton.isVisible().catch(() => false);
            if (!fallbackVisible) {
                return false;
            }

            await fallbackButton.click({ force: true });
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        }

        await episodeButton.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(5000);
        return true;
    }

    async isPremiumContentGateVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.premiumGateMessage, 20000);
    }

    async getPremiumGateMessageText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.premiumGateMessage, 20000);
    }

    async isMaybeLaterVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.maybeLaterButton, 10000);
    }

    async isSubscribeToWatchVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.subscribeToWatchButton, 10000);
    }

    async isPlaybackStarted(): Promise<boolean> {
        try {
            await this.page.waitForURL(/\/player\//, { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            const videoVisible = await this.page.locator(this.videoElement.selector).first().isVisible().catch(() => false);
            const playerVisible = await this.page.locator(this.playerContainer.selector).first().isVisible().catch(() => false);
            const playerUrl = this.page.url();
            return videoVisible || playerVisible || playerUrl.includes('/player/');
        } catch {
            return false;
        }
    }
}
