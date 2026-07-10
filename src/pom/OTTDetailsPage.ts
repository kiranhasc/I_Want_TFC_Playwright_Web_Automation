import { expect, Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';
import { TIMEOUT } from 'node:dns';

export class OTTDetailsPage {
  private readonly page: Page;
  private readonly pageUtils: PageUtils;
  private readonly showsSectionLink: PageElement;
  private readonly firstShowContentCard: PageElement;
  private readonly firstEpisodeCard: PageElement;
  private readonly videoPlayer: PageElement;
  private readonly episodeTitle: PageElement;
  private readonly playbackContentTitle: PageElement;
  private readonly playbackEpisodeTitle: PageElement;
  private readonly playerForwardButton: PageElement;
  private readonly playerBackArrowButton: PageElement;
  private readonly continueWatchingTray: PageElement;
  private readonly continueWatchingThumbnail: PageElement;
  private readonly continueWatchingRemoveButton: PageElement;
  private readonly showDetailsHeading: PageElement;
  private readonly contentMetadata: PageElement;
  private readonly cookieConfirmButton: PageElement;
  private readonly premiumTagIcon: PageElement;
  private readonly subscribeToWatchCta: PageElement;
  private readonly upgradePlanButton: PageElement;
  private readonly plansPageHeading: PageElement;
  private readonly playButton: PageElement;
  private readonly skipIntroMarker: PageElement;
  private readonly skipRecapMarker: PageElement;
  private readonly addToWatchlistButton: PageElement;
  private readonly removeFromWatchlistButton: PageElement;
  private readonly watchlistToast: PageElement;
  private readonly cinemaOnePhSection: PageElement;
  private readonly liveChannelsTray: PageElement;
  private readonly dzmmTeleradyoItem: PageElement;
  private readonly watchlistContentCard: PageElement;
  private readonly freeTagBadge: PageElement;
  //private readonly tryAgainCta: PageElement;
  private readonly loginCta: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows'};
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image'};
    this.firstEpisodeCard = { selector: '[data-testid="episode-card"], .episode-card, .season-episodes .episode-item, .episode-list .episode-item'};
    this.videoPlayer = { selector: 'video, [data-testid="video-player"], .video-player video, .player video'};
    this.episodeTitle = { selector: '[data-testid="episode-title"], .episode-title, h2:has-text("Episode")'};
    this.playbackContentTitle = { selector: '[data-testid="player-title"], .player-title, .video-title, .content-title, .player-header h1, h1' };
    this.playbackEpisodeTitle = { selector: '[data-testid="episode-title"], .episode-title, .player-episode, h2:has-text("Episode"), text=/Episode\\s+\\d+/i' };
    this.playerForwardButton = { selector: 'button[aria-label*="Forward"], button[aria-label*="forward"], [data-testid*="forward"], button:has-text("Forward"), button:has-text(">>"), button:has-text(">")' };
    this.playerBackArrowButton = { selector: 'button[aria-label*="Back"], button[aria-label*="back"], [data-testid*="back"], button:has-text("Back"), button:has-text("←"), button:has-text("<")' };
    this.continueWatchingTray = { selector: 'text=Continue Watching, [data-testid*="continue-watching"], .continue-watching, .cw-tray' };
    this.continueWatchingThumbnail = { selector: '[data-testid="continue-watching-item"], .continue-watching-item, .cw-item, .continue-watching__item, .continue-watching-thumbnail' };
    this.continueWatchingRemoveButton = { selector: 'button[aria-label*="Remove"], button:has-text("Remove"), button:has-text("X"), [data-testid*="remove"], .remove-continue-watching' };
    this.showDetailsHeading = { selector: 'main h1'};
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]'};
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")'};
    this.premiumTagIcon = { selector: 'img[alt="tag"], [aria-label="tag"], [data-testid*="tag"], img[title="tag"]' };
    this.subscribeToWatchCta = { selector: '#play div' };
    this.upgradePlanButton = { role: 'button', text: 'Upgrade Plan', selector: 'button:has-text("Upgrade Plan"), a:has-text("Upgrade Plan")' };
    this.plansPageHeading = { selector: 'h1', text: 'Plans & Payment' };
    this.playButton = { selector: '#play div' };
    this.addToWatchlistButton = { selector: '#watchlist div' };
    this.removeFromWatchlistButton = { selector: '#watchlist div' };
    this.watchlistToast = { selector: "div:has-text('Added to watchlist'), div:has-text('Removed from watchlist')" };
    //this.cinemaOnePhSection = { selector: 'text=Cinema One PH' };
    this.cinemaOnePhSection = {selector: 'img[alt="Cinema One PH"]'};
    this.liveChannelsTray = { text: 'Live Channels', selector: 'text=Live Channels' };
    this.dzmmTeleradyoItem = { text: 'DZMM Teleradyo', selector: 'text=DZMM Teleradyo' };
    this.watchlistContentCard = { selector: 'img[alt="My Illegal Wife"]' };
    this.freeTagBadge = { selector: 'img[alt="free"]' };
    //this.tryAgainCta = { selector: '#retry div' };
    this.loginCta = { selector: '#login div' };
    //this.clickEpisodeTwo={selector: 'text= Arrival' }
    this.skipIntroMarker = { selector: 'button:has-text("Skip Intro"), [data-testid*="skip-intro"], [aria-label*="Skip Intro"]' };
    this.skipRecapMarker = { selector: 'button:has-text("Skip Recap"), [data-testid*="skip-recap"], [aria-label*="Skip Recap"]' };
    //    this.plansPageHeading = { selector: '[role="heading"][aria-label="Page title"]',text: 'Plans & Payment'};
    //this.plansPageHeading = { role: 'Page title', text: 'Plans & Payment', selector: 'h1:has-text("Plans & Payment"), h2:has-text("Plans & Payment"), text=Plans & Payment' };
    //this.plansPageHeading = { selector: 'Page title' , text: 'Plans & Payment' };
    //await expect(page.getByLabel('Page title')).toContainText('Plans & Payment');

  }

  async navigate(): Promise<void> {
    const baseUrl = config.getBaseURL();
    logger.pageNavigation(baseUrl);
    await this.page.goto(baseUrl);
    await this.pageUtils.waitForPageLoad();
    // Give the home page a brief moment to stabilise before interacting
    await this.page.waitForTimeout(7000);
  }

  // async acceptCookieSettingsIfVisible(): Promise<void> {
  //   try {
  //     const isVisible = await this.pageUtils.isVisible(this.cookieConfirmButton, 2000);
  //     if (isVisible) {
  //       logger.step('Accepting cookie settings popup');
  //       await this.pageUtils.safeClick(this.cookieConfirmButton);
  //     }
  //   } catch (error) {
  //     logger.debug('Cookie confirmation button not visible', error);
  //   }
  // }

  async clickShowsSection(): Promise<void> {
    logger.elementInteraction('click', 'Shows section link');
    await this.pageUtils.safeClick(this.showsSectionLink);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async clickFirstShowContent(): Promise<void> {
    logger.elementInteraction('click', 'first rail content thumbnail');

    const candidateSelectors = [
      '.scrollable-list:first-of-type .thumbnail',
      '.thumbnail',
      'img.title-image',
      '[data-testid="content-card"]',
      '[data-testid="show-card"]',
      'a[href*="/content"]',
      'a[href*="/show"]',
    ];

    for (const selector of candidateSelectors) {
      const candidate = this.page.locator(selector).first();
      try {
        if (!(await candidate.count())) continue;
        await candidate.waitFor({ state: 'visible', timeout: 10000 });
        await candidate.click({ timeout: 15000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
        await this.page.waitForTimeout(2000);
        return;
      } catch (err) {
        logger.debug(`Content candidate click failed for selector ${selector}`, err);
      }
    }

    try {
      const fallback = this.page.locator('img').first();
      if (await fallback.count()) {
        await fallback.waitFor({ state: 'visible', timeout: 10000 });
        await fallback.click({ timeout: 15000 });
      }
    } catch (err) {
      logger.debug('Fallback content click failed', err);
    }
  }

  async clickFirstEpisodeCard(): Promise<void> {
    logger.elementInteraction('click', 'first episode card');

    const episodeCard = this.page.locator(this.firstEpisodeCard.selector).first();
    try {
      if (this.page.isClosed()) return;
      if (await episodeCard.count()) {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
        await episodeCard.click({ timeout: 15000 });
      }
    } catch (err) {
      logger.debug('clickFirstEpisodeCard failed', err);
      return;
    }
    // proceed with non-fatal waits only if page remains open
    try {
      if (this.page.isClosed()) return;
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (err) {
      logger.debug('Post-click waits failed or page closed', err);
    }
  }

  async clickWatchlistIcon(): Promise<void> {
    logger.elementInteraction('click', 'watchlist icon');
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Watchlist icon click failed', error);
    }
  }

  async hoverContentThumbnailAndClickWatchlistIcon(contentTitle: string): Promise<void> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);

    try {
      const contentThumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(7000);
      const watchlistIcon = this.page.locator('#watchlist div').first();
      await watchlistIcon.waitFor({ state: 'visible', timeout: 10000 });
      await watchlistIcon.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug(`Hover content thumbnail and click watchlist icon failed for ${contentTitle}`, error);
    }
  }

  async hoverFirstContentThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('My Illegal Wife');
  }

  async hoverIAmYourDaughterThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('I Am Your Daughter');
  }

  async hoverAMomentInTimeThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('A Moment in Time');
  }
  
  async hoverContentThumbnailAndClickRemoveWatchlistIcon(contentTitle: string): Promise<void> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);

    try {
      const contentThumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(5000);
      const watchlistIcon = this.page.locator('#watchlist div').first();
      await watchlistIcon.waitFor({ state: 'visible', timeout: 10000 });
      await watchlistIcon.click({ timeout: 15000 });
      //await this.page.waitForTimeout(5000);
    } catch (error) {
      logger.debug(`Hover content thumbnail and click remove watchlist icon failed for ${contentTitle}`, error);
    }
  }

  async hoverFirstContentThumbnailAndClickRemoveWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickRemoveWatchlistIcon('My Illegal Wife');
  }

  async hoverIAmYourDaughterThumbnailAndClickRemoveWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickRemoveWatchlistIcon('I Am Your Daughter');
  }

  async hoverAMomentInTimeThumbnailAndClickRemoveWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickRemoveWatchlistIcon('A Moment in Time');
  }

//addedd
async removeFromWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
    }
  }


  async clickCinemaOnePhSection(): Promise<void> {
    logger.elementInteraction('click', 'Cinema One PH section');
    try {
      const locator = this.page.locator(this.cinemaOnePhSection.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Cinema One PH section click failed', error);
    }
  }

  async isLiveChannelsTrayVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator('//main//div[1]/div[3]/div[1]/p').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async openLiveChannelsTray(): Promise<void> {
    logger.elementInteraction('click', 'Live Channels tray');
    try {
      const locator = this.page.locator('//main//div[1]/div[3]/div[1]/p').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after opening live channels tray failed or timed out');
      });
    } catch (error) {
      logger.debug('Live Channels tray click failed', error);
    }
  }

  async clickLiveContentByName(contentName: string): Promise<void> {
    logger.elementInteraction('click', `live content card ${contentName}`);
    try {
      const locator = this.page.getByRole('img', { name: contentName }).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after live content click failed or timed out');
      });
    } catch (error) {
      logger.debug(`Live content card click failed for ${contentName}`, error);
    }
  }

  async isLiveIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.getByText('Live', { exact: true }).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isAddToWatchlistButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // async clickTryAgainCta(): Promise<void> {
  //   logger.elementInteraction('click', 'Try Again CTA');
  //   try {
  //     const locator = this.page.locator(this.tryAgainCta.selector).first();
  //     await locator.waitFor({ state: 'visible', timeout: 10000 });
  //     await locator.click({ timeout: 10000 });
  //   } catch (error) {
  //     logger.debug('Try Again CTA click failed', error);
  //   }
  // }

  async clickLoginCta(): Promise<void> {
    logger.elementInteraction('click', 'Login CTA');
    try {
      const locator = this.page.locator(this.loginCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.click({ timeout: 10000 });
    } catch (error) {
      logger.debug('Login CTA click failed', error);
    }
  }

  async clickPlayButton(): Promise<void> {
    logger.elementInteraction('click', 'play button');
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Play button click failed', error);
      try {
        const fallbackLocator = this.page.locator('button').filter({ hasText: /play/i }).first();
        if (await fallbackLocator.count()) {
          await fallbackLocator.click({ timeout: 15000 });
        }
      } catch (fallbackError) {
        logger.debug('Play button fallback click failed', fallbackError);
      }
    }
  }

  async scrollToEpisodeList(): Promise<void> {
    logger.elementInteraction('scroll', 'episode list');
    try {
      const episodeListLocator = this.page.locator(this.firstEpisodeCard.selector).first();
      if (await episodeListLocator.count()) {
        await episodeListLocator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.debug('Episode list scroll failed', error);
    }
  }

  async clickEpisodeTwo(): Promise<void> {
    logger.elementInteraction('click', 'episode two');
    try {
      await this.scrollToEpisodeList();
      const episodeTwoLocator = this.page.getByText('ArrivalS1 E226m 56sGreg, the').first();
      await episodeTwoLocator.waitFor({ state: 'visible', timeout: 15000 });
      await episodeTwoLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      logger.debug('Episode two click failed', error);
    }
  }

  async isSkipIntroMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipIntroMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSkipRecapMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipRecapMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickPlayerForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'player forward button');
    try {
      await this.pageUtils.safeClick(this.playerForwardButton, 15000);
    } catch (error) {
      logger.debug('Player forward button not found or click failed', error);
    }
  }

  async clickPlayerBackArrow(): Promise<void> {
    logger.elementInteraction('click', 'player back arrow');
    try {
      await this.pageUtils.safeClick(this.playerBackArrowButton, 15000);
    } catch (error) {
      logger.debug('Player back arrow not found or click failed', error);
    }
  }

  async clickPremiumTagIcon(): Promise<void> {
    logger.elementInteraction('click', 'premium tag icon');
    try {
      const locator = this.page.locator(this.premiumTagIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Premium tag icon click failed', error);
    }
  }

  async isSubscribeToWatchCtaVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.subscribeToWatchCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickSubscribeToWatchCta(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator('#play div').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async clickSubscribeToWatchCtaBlocker(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator('#subscribe_to_watch div').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async isUpgradePlanButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickUpgradePlanButton(): Promise<void> {
    logger.elementInteraction('click', 'Upgrade Plan button');
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Upgrade Plan button click failed', error);
    }
  }

  async isPlansPageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.plansPageHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContinueWatchingTrayVisible(): Promise<boolean> {
    try {
      const heading = this.page.locator(
        'p[class*="text-[2.4rem]"][class*="font-medium"][class*="leading-[3.5rem]"]:has-text("Continue Watching")'
      ).first();
      await heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hoverFirstContinueWatchingItem(): Promise<void> {
    try {
      const locator = this.page.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.hover();
    } catch (error) {
      logger.debug('Hovering over continue watching item failed', error);
    }
  }

  async clickFirstContinueWatchingRemoveIcon(): Promise<void> {
    logger.elementInteraction('click', 'remove continue watching item icon');
    try {
      const locator = this.page.locator(this.continueWatchingRemoveButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Continue Watching remove icon click failed', error);
    }
  }

  async isContinueWatchingItemVisible(contentTitle?: string): Promise<boolean> {
    try {
      const container = this.page.locator(this.continueWatchingTray.selector).first();
      if (!(await container.count())) {
        return false;
      }
      const locator = contentTitle
        ? container.locator(`text=${contentTitle}`).first()
        : container.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getFirstEpisodeCardTitleText(): Promise<string> {
    try {
      if (this.page.isClosed()) return '';
      const episodeCard = this.page.locator(this.firstEpisodeCard.selector).first();
      if (!(await episodeCard.count())) return '';
      try {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
      } catch {
        // ignore wait failures and attempt to read text if possible
      }
      const text = (await episodeCard.textContent()) || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      logger.debug('getFirstEpisodeCardTitleText failed', err);
      return '';
    }
  }

  async clickFirstSearchResult(): Promise<void> {
    logger.elementInteraction('click', 'first search result');

    try {
      const xpathLocator = this.page.locator(`xpath=//html/body/div/main/div/div[2]/div[1]/div/div/img`);
      await xpathLocator.waitFor({ state: 'visible', timeout: 15000 });
      await xpathLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      await this.page.waitForTimeout(2000);
      return;
    } catch (error) {
      logger.debug('XPath-based first search result click failed', error);
    }

    const selectors = [
      '[data-testid="search-result"]',
      '.search-results .thumbnail',
      '.result-item',
      '.content-search-list .thumbnail',
      'img.title-image',
      '.thumbnail',
      'a[href*="/content"]',
      'a[href*="/show"]',
    ];

    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      try {
        if (!(await locator.count())) continue;
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.click({ timeout: 15000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
        await this.page.waitForTimeout(2000);
        return;
      } catch (err) {
        logger.debug(`Search result selector failed: ${selector}`, err);
      }
    }

    try {
      await this.pageUtils.waitForPageLoad(15000);
      await this.page.waitForTimeout(2000);
      await this.clickFirstShowContent();
    } catch (error) {
      logger.debug('Fallback search result navigation failed', error);
    }
  }



async validateAddedToWatchlistPopup(): Promise<string> {
  logger.elementInteraction('verify', 'Added to Watchlist popup');

  const toastCandidates = [
    this.page.getByText(/added to watchlist/i).first(),
    this.page.locator('div, span, p').filter({ hasText: /added/i }).first(),
  ];

  for (const toast of toastCandidates) {
    try {
      await toast.waitFor({ state: 'visible', timeout: 15000 });
      const text = (await toast.textContent()) || '';
      if (text.toLowerCase().includes('added')) {
        return text.trim();
      }
    } catch {
      // continue to the next candidate
    }
  }

  return '';
}

async validateRemovedFromWatchlistPopup(): Promise<string> {
  logger.elementInteraction('verify', 'Removed from Watchlist popup');

  try {
    const toast = this.page.getByText('Removed from watchlist').first();
    await toast.waitFor({ state: 'visible', timeout: 15000 });
    return (await toast.textContent()) || '';
  } catch {
    return '';
  }
}

async addToWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Add to Watchlist');
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Add to Watchlist button click failed', error);
    }

    try {
      const toast = this.page.locator('div').filter({ hasText: 'Added to watchlist' }).nth(1);
      await toast.waitFor({ state: 'visible', timeout: 10000 });
      return (await toast.textContent()) || '';
    } catch {
      return '';
    }
  }

  async removeFromWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
    }

    try {
      const toast = this.page.locator('div').filter({ hasText: 'Removed from watchlist' }).nth(1);
      await toast.waitFor({ state: 'visible', timeout: 10000 });
      return (await toast.textContent()) || '';
    } catch {
      return '';
    }
  }

  async isFreeTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Free tag in watchlist');

    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img', { name: 'free' }).first();

      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });
      const freeTagLocator = this.page.getByRole('img', { name: 'free' }).first();
      return await freeTagLocator.count() > 0;
    } catch (error) {
      logger.debug('Free tag visibility check failed', error);
      return false;
    }
  }

  

  async getPlaybackEpisodeTitleText(): Promise<string> {
  const locator = await this.page.getByText('backThe Blood SistersS1 E1 · Episode').first();

  await expect(locator).toBeVisible({ timeout: 10000 });
  return (await locator.textContent() || '').trim();
}

  async isEpisodeListVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.firstEpisodeCard, 10000);
  }

  async isVideoPlayerVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.videoPlayer, 15000);
  }

  async isPlaybackStarted(): Promise<boolean> {
    const locator = this.page.locator(this.videoPlayer.selector).first();
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    const playbackState = await locator.evaluate((video: HTMLVideoElement) => ({
      currentTime: video.currentTime,
      paused: video.paused,
      readyState: video.readyState,
    }));
    return playbackState.readyState >= 3 && (playbackState.currentTime > 0 || playbackState.paused === false);
  }

  async isShowDetailsPageVisible(): Promise<boolean> {
    try {
      const mainElement = this.page.locator('main');
      await mainElement.waitFor({ state: 'visible', timeout: 10000 });

      const headingLocator = mainElement.locator('h1').first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getShowDetailsHeadingText(): Promise<string> {
    try {
      const headingLocator = this.page.locator('main h1').first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await headingLocator.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting show details heading', error);
      try {
        const fallbackLocator = this.page.getByText(/./).first();
        const text = await fallbackLocator.textContent() || '';
        return text.replace(/\s+/g, ' ').trim();
      } catch {
        return '';
      }
    }
  }

  async isContentMetadataVisible(): Promise<boolean> {
    try {
      // Use chain locators for metadata
      const mainElement = this.page.locator('main');
      const metadataLocator = mainElement.locator('[class*="metadata relative flex items"]').first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getContentDescriptionText(): Promise<string> {
    try {
      // Use chain locators for metadata description
      const mainElement = this.page.locator('main');
      const metadataLocator = mainElement.locator('[class*="metadata relative flex items"]').first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await metadataLocator.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting content description', error);
      return '';
    }
  }

  async getContentMetadataText(): Promise<string> {
    try {
      const mainElement = this.page.locator('main');
      const metadataLocator = mainElement.locator('[class*="metadata relative flex items"]').first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await metadataLocator.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting content metadata text', error);
      return '';
    }
  }
}
