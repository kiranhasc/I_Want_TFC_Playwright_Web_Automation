import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { logger } from '../utils/logger';
import { OTTAuthPage } from './OTTAuthPage';

export class OTTEarlyAccessPage {
    private page: Page;
    private pageUtils: PageUtils;
    private readonly defaultLabelText: string;
    private readonly upgradeIconSelector: PageElement;
    private readonly upgradeTitleSelector: PageElement;
    private readonly upgradeDescriptionSelector: PageElement;
    private readonly maybeLaterSelector: PageElement;
    private readonly upgradeCtaSelector: PageElement;
    private readonly earlyAccessLabelSelector: PageElement;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.defaultLabelText = 'Early Access';
        this.upgradeIconSelector = { selector: '//img[@alt="early-access"]' };
        this.upgradeTitleSelector = { selector: 'text=/Unlock Early Access/i' };
        this.upgradeDescriptionSelector = { selector: 'text=/Upgrade to Premium for exclusive early viewing/i' };
        this.maybeLaterSelector = { selector: 'text=/Maybe later/i' };
        this.upgradeCtaSelector = { selector: 'text=/Upgrade to watch now/i' };
        this.earlyAccessLabelSelector = { selector: `(//img[@alt="{assetTitle}"]/parent::div/following-sibling::div//img[@alt="early_access"])[1]` };
    }

    async scrollToRail(railTitle: string): Promise<void> {
        logger.step(`Processing rail: ${railTitle}`);
        if (railTitle.includes('Hero Banner - ROW')) {
            logger.info(`Skipping scroll for rail: ${railTitle}`);
            return;
        }
        const rail = this.page.locator(`text=${railTitle}`).first();
        await rail.scrollIntoViewIfNeeded();
    }

    async findAssetLocatorByTitle(assetTitle: string) {
        const locator = this.page.locator(`[alt="${assetTitle}"]`).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return locator;
    }

    async isLabelVisibleForAsset(assetLocator: any, labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
            const tagLocator = assetLocator.locator(`xpath=../following-sibling::div//img[@alt="${label}"]`).first();
            await tagLocator.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        }
        catch {
            return false;
        }
    }

    async openAssetDetails(assetTitle: string): Promise<void> {
        const selector = await this.pageUtils.parameterizeSelector(this.earlyAccessLabelSelector, { assetTitle });
        await selector.click()
    }

    async isEpisodeLabelVisible(labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
            const episodeLabel = this.page.locator(`//div[@class="episodes-list"]//img[@alt="${label}"]`).first();
            await episodeLabel.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        } catch {
            return false;
        }
    }

    async openLatestEarlyAccessEpisode(labelText: string): Promise<boolean> {
        const episodes = this.page.locator(`//div[@class="episodes-list"]/div/div/div/following-sibling::div/div/p[@class="font-semibold"]`);
        let previousCount = 0;
        while (true) {
            const currentCount = await episodes.count();
            if (currentCount === previousCount) {
                break;
            }
            previousCount = currentCount;
            await episodes.nth(currentCount - 1).scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(1500);
        }
        const totalEpisodes = await episodes.count();
        if (totalEpisodes === 0) {
            return false;
        }
        const latestEpisode = episodes.nth(totalEpisodes - 1);
        const latestEpisodeName = (await latestEpisode.textContent())?.trim() ?? "";
        logger.info(`Latest Episode name is : ${latestEpisodeName}`);
        try {
            const badge = this.page.locator(`//div[@class="episodes-list"]//p[normalize-space()='${latestEpisodeName}']/parent::div/parent::div/preceding-sibling::div//img`).last();
            const altValue = await badge.getAttribute("alt");
            logger.info(`Badge Alt Value: ${altValue} found for episode ${latestEpisodeName}`);
            if (altValue === labelText) {
                await latestEpisode.scrollIntoViewIfNeeded();
                await latestEpisode.click();
                logger.info(`Clicked latest Early Access episode: ${latestEpisodeName}`);
                return true;
            }
            logger.assertion(`Latest episode does not have '${labelText}' badge.`, false);
            return false;
        } catch (error) {
            logger.error("Early Access badge not found.", error);
            return false;
        }
    }

    async verifyUpgradePromptMessage() {
        const upgradeIconVisible = await this.pageUtils.isVisible(this.upgradeIconSelector)
        const titleVisible = await this.pageUtils.isVisible(this.upgradeTitleSelector);
        const descriptionVisible = await this.pageUtils.isVisible(this.upgradeDescriptionSelector);
        const maybeLaterVisible = await this.pageUtils.isVisible(this.maybeLaterSelector);
        const upgradeCtaVisible = await this.pageUtils.isVisible(this.upgradeCtaSelector);
        return {
            upgradeIconVisible,
            titleVisible,
            descriptionVisible,
            maybeLaterVisible,
            upgradeCtaVisible
        };
    }

    async scrollUntilEarlyAccessTagVisible(): Promise<boolean> {
        try {
            const tagCandidates = this.page.locator('//img[@alt="early_access"]');
            const count = await tagCandidates.count().catch(() => 0);
            if (!count) {
                return false;
            }

            for (let index = 0; index < Math.min(count, 8); index += 1) {
                const candidate = tagCandidates.nth(index);
                const visible = await candidate.isVisible().catch(() => false);
                if (!visible) {
                    continue;
                }
                await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
                await this.page.waitForTimeout(750);
                return true;
            }

            await this.page.mouse.wheel(0, 400);
            await this.page.waitForTimeout(1000);
            return await tagCandidates.first().isVisible().catch(() => false);
        } catch (error) {
            logger.debug('Early Access tag visibility check failed', error);
            return false;
        }
    }

    async clickEpisodeCardWithEarlyAccessTag(): Promise<boolean> {
        logger.elementInteraction('click', 'episode card with Early Access tag');
        try {
            const earlyAccessTag = this.page.locator('//img[@alt="early_access"]').first();
            await earlyAccessTag.waitFor({ state: 'visible', timeout: 15000 });
            const clickableAncestor = earlyAccessTag.locator('xpath=ancestor::a[1] | ancestor::button[1] | ancestor::*[contains(@role, "button")][1]').first();
            if (await clickableAncestor.count()) {
                await clickableAncestor.scrollIntoViewIfNeeded().catch(() => undefined);
                await clickableAncestor.click({ timeout: 20000, force: true });
                return true;
            }

            await earlyAccessTag.click({ timeout: 20000, force: true });
            return true;
        } catch (error) {
            logger.debug('Clicking episode card with Early Access tag failed', error);
            return false;
        }

  }}
