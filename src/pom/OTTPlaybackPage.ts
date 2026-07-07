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
