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
        this.upgradeIconSelector = { selector: '//img[@alt="early_access" or @alt="early-access"]' };
        this.upgradeTitleSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/A valid subscription is required to view this content/i' }
          : { selector: 'text=/Unlock Early Access/i' };
        this.upgradeDescriptionSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/EPS-401-24/i' }
          : { selector: 'text=/Upgrade to Premium for exclusive early viewing and be the first to watch new content\./i' };
        this.maybeLaterSelector = { selector: '//p[text()="Maybe Later"]' };
        this.upgradeCtaSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/Login/i' }
          : { selector: 'text=/Upgrade to Watch Now/i' };
        this.earlyAccessLabelSelector = { selector: `(//img[@alt="{assetTitle}"]/parent::div/following-sibling::div//img[@alt="early_access"])[1]` };
    }

    async scrollToRail(railTitle: string): Promise<void> {
        logger.step(`Processing rail: ${railTitle}`);
      if (!railTitle.trim()) {
        return;
      }
        if (railTitle.includes('Hero Banner - ROW')) {
            logger.info(`Skipping scroll for rail: ${railTitle}`);
            return;
        }
        const rail = this.page.locator(`text=${railTitle}`).first();
        await rail.scrollIntoViewIfNeeded();
    }

      async findAssetByBadge(badgeAlt: string): Promise<{ assetTitle: string; railTitle: string } | null> {
        const badge = this.page.locator(`img[alt="${badgeAlt}"]`).first();
        if (!await badge.count()) {
          return null;
        }
        await badge.scrollIntoViewIfNeeded().catch(() => undefined);
        const card = badge.locator(
          'xpath=ancestor::*[self::a or self::button or @role="button" or contains(@class, "cursor-pointer")][1]'
        ).first();
        const scope = await card.count() ? card : badge.locator('xpath=..');
        const titleImage = scope.locator('img[alt]').first();
        const assetTitle = (await titleImage.getAttribute('alt').catch(() => ''))?.trim() ?? '';
        return assetTitle ? { assetTitle, railTitle: '' } : null;
      }

    async findAssetLocatorByTitle(
        assetTitle: string,
        labelText: string = this.defaultLabelText,
        additionalLabelText?: string
    ) {
      const assets = this.page.locator(`img[alt="${assetTitle}"]`);
      await assets.first().waitFor({ state: 'visible', timeout: 10000 });

      const count = await assets.count();
      for (let index = 0; index < count; index += 1) {
        const asset = assets.nth(index);
        await asset.scrollIntoViewIfNeeded().catch(() => undefined);
        const badgeContainer = asset.locator(
          `xpath=../following-sibling::div//img[@alt="${labelText}"]`
        );
        const hasEarlyAccessBadge = await badgeContainer.count().catch(() => 0);
        const hasAdditionalBadge = additionalLabelText
            ? await asset.locator(
                `xpath=../following-sibling::div//img[@alt="${additionalLabelText}"]`
              ).count().catch(() => 0)
            : 1;
        if (hasEarlyAccessBadge > 0 && hasAdditionalBadge > 0) {
            return asset;
        }
      }

      return assets.first();
    }

    async isLabelVisibleForAsset(assetLocator: any, labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
        if (process.env.BROWSER === 'mchrome') {
          await assetLocator.scrollIntoViewIfNeeded();
          return await assetLocator.isVisible();
        }
            const tagLocator = assetLocator.locator(`xpath=../following-sibling::div//img[@alt="${label}"]`).first();
        await this.scrollToEarlyAccessThumbnail(tagLocator);
            await tagLocator.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        }
        catch {
            return false;
        }
    }

    async scrollToEarlyAccessThumbnail(tagLocator: any): Promise<void> {
      await tagLocator.waitFor({ state: 'attached', timeout: 15000 });
      await tagLocator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(750);
    }

    async openAssetDetails(assetTitle: string, labelText: string = this.defaultLabelText): Promise<void> {
      const asset = await this.findAssetLocatorByTitle(assetTitle, labelText);
        const clickableCard = asset.locator(
            'xpath=ancestor::*[self::a or self::button or @role="button" or contains(@class, "cursor-pointer")][1]'
        ).first();
        if (await clickableCard.count()) {
          await clickableCard.dblclick({ force: true });
            return;
        }
        await asset.dblclick({ force: true });
    }

    async isEpisodeLabelVisible(labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
        const episodeList = this.page.locator('[class*="episodes-list"]').first();
        await episodeList.waitFor({ state: 'visible', timeout: 15000 });
        await episodeList.scrollIntoViewIfNeeded();

        let episodeLabel = episodeList.locator(`img[alt="${label}"]`).last();
        for (let attempt = 0; attempt < 12 && !await episodeLabel.count(); attempt += 1) {
          const episodeCards = episodeList.locator('div').filter({ has: episodeList.locator('img[alt]') });
          const cardCount = await episodeCards.count().catch(() => 0);
          if (cardCount > 0) {
            await episodeCards.last().scrollIntoViewIfNeeded().catch(() => undefined);
          }
          await episodeList.evaluate((element: HTMLElement) => {
            element.scrollTop = element.scrollHeight;
          }).catch(() => undefined);
          await this.page.mouse.wheel(0, 700).catch(() => undefined);
          await this.page.waitForTimeout(500);
          episodeLabel = episodeList.locator(`img[alt="${label}"]`).last();
        }

        if (!await episodeLabel.count()) {
          return false;
        }

        await this.scrollToEarlyAccessThumbnail(episodeLabel);
        return await episodeLabel.isVisible();
        } catch {
            return false;
        }
    }

    async openLatestEarlyAccessEpisode(labelText: string): Promise<boolean> {
      if (process.env.BROWSER !== 'mchrome') {
      const episodeList = this.page.locator('[class*="episodes-list"]').first();
      await episodeList.waitFor({ state: 'visible', timeout: 10000 });
      await episodeList.scrollIntoViewIfNeeded();

      let badge = episodeList.locator(`img[alt="${labelText}"]`).last();
      for (let attempt = 0; attempt < 12 && !await badge.count(); attempt += 1) {
        const episodeCards = episodeList.locator('div').filter({ has: episodeList.locator('img[alt]') });
        const cardCount = await episodeCards.count().catch(() => 0);
        if (cardCount > 0) {
          await episodeCards.last().scrollIntoViewIfNeeded().catch(() => undefined);
        }
        await episodeList.evaluate((element: HTMLElement) => {
          element.scrollTop = element.scrollHeight;
        }).catch(() => undefined);
        await this.page.mouse.wheel(0, 700).catch(() => undefined);
        await this.page.waitForTimeout(500);
        badge = episodeList.locator(`img[alt="${labelText}"]`).last();
      }

      if (!await badge.count()) {
        logger.warn(`No episode found with the '${labelText}' badge`);
            return false;
        }

      await badge.scrollIntoViewIfNeeded();
      const episodeCard = badge.locator(
        'xpath=ancestor::div[contains(@class, "cursor-pointer")][1]'
      ).first();
      const target = await episodeCard.count() ? episodeCard : badge;
      const episodeName = (await target.textContent().catch(() => ''))?.trim() ?? '';
      logger.info(`Clicking Early Access episode: ${episodeName}`);
      await target.click({ force: true });
      await this.page.waitForTimeout(1500);
        return true;
      }

      const episodeList = this.page.locator(
        '.episodes-list, .season-episodes, .episode-list, [data-testid*="episode-list"], [class*="season-episodes"]'
      ).first();
      await episodeList.waitFor({ state: 'visible', timeout: 15000 });
      await episodeList.scrollIntoViewIfNeeded();

      const badgeSelector = [
        `img[alt="${labelText}"]`,
        'img[alt="Early Access"]',
        '[aria-label="Early Access"]',
        '[data-testid*="early-access" i]'
      ].join(', ');
      const textBadge = this.page.getByText('Early Access', { exact: true }).last();
      let badge = episodeList.locator(badgeSelector).last();
      for (let attempt = 0; attempt < 12 && !await badge.count() && !await textBadge.count(); attempt += 1) {
        const episodeCards = episodeList.locator(
          '.episode-info, .episode-card, .episode-item, [data-testid*="episode"]'
        ).last();
        if (await episodeCards.count().catch(() => 0)) {
          await episodeCards.scrollIntoViewIfNeeded().catch(() => undefined);
        }
        await episodeList.evaluate((element: HTMLElement) => {
          element.scrollTop = element.scrollHeight;
        }).catch(() => undefined);
        await this.page.mouse.wheel(0, 700).catch(() => undefined);
        await this.page.waitForTimeout(500);
        badge = episodeList.locator(badgeSelector).last();
      }

      if (!await badge.count() && !await textBadge.count()) {
        logger.warn(`No episode found with the '${labelText}' badge`);
        return false;
      }

      const targetBadge = await badge.count() ? badge : textBadge;
      await targetBadge.scrollIntoViewIfNeeded().catch(() => undefined);
      const episodeCard = targetBadge.locator(
        'xpath=ancestor::*[contains(@class, "cursor-pointer") or contains(@class, "episode-info") or contains(@class, "episode-card")][1]'
      ).first();
      const target = await episodeCard.count() ? episodeCard : targetBadge;
      const episodeName = (await target.textContent().catch(() => ''))?.trim() ?? '';
      logger.info(`Clicking Early Access episode: ${episodeName}`);
      await target.click({ force: true });
      await this.page.waitForTimeout(1500);
      return true;
    }

    async verifyUpgradePromptMessage() {
        const upgradeIconVisible = await this.pageUtils.isVisible(this.upgradeIconSelector)
        const titleVisible = await this.pageUtils.isVisible(this.upgradeTitleSelector);
      const titleText = titleVisible
        ? await this.pageUtils.getTextContent(this.upgradeTitleSelector).catch(() => '')
        : '';
        const descriptionVisible = await this.pageUtils.isVisible(this.upgradeDescriptionSelector);
        const maybeLaterVisible = await this.pageUtils.isVisible(this.maybeLaterSelector);
        const upgradeCtaVisible = await this.pageUtils.isVisible(this.upgradeCtaSelector);
        return {
            upgradeIconVisible,
            titleVisible,
            titleText,
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
