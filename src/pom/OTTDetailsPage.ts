import { expect, Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';
import { TIMEOUT } from 'node:dns';

export class OTTDetailsPage {
  private readonly page: Page;
  private readonly pageUtils: PageUtils;
  private storedContentTitle: string = '';
  private storedContentMetadata: string = '';
  private storedContentDescription: string = '';
  private hasStoredDetails: boolean = false;
  private readonly showsSectionLink: PageElement;
  private readonly firstShowContentCard: PageElement;
  private readonly playButton: PageElement;
  private readonly videoElement: PageElement;
  private readonly vpnErrorMessage: PageElement;
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
  private readonly resumeButton: PageElement;
  private readonly parentalPinPlaybackPrompt: PageElement;
  private readonly parentalPinEntryInputs: PageElement;
  private readonly parentalPinValidateButton: PageElement;
  private readonly parentalPinInvalidErrorMessage: PageElement;
  private readonly cookieConfirmButton: PageElement;
  private readonly premiumTagIcon: PageElement;
  private readonly subscribeToWatchCta: PageElement;
  private readonly upgradePlanButton: PageElement;
  private readonly plansPageHeading: PageElement;
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
  private readonly loginCta: PageElement;
  private readonly firstSearchResult: PageElement;
  private readonly playerScreen: PageElement;
  private readonly seekBar: PageElement;
  private readonly playbackTime: PageElement;
  private readonly playerTimeDisplay: PageElement;
  private readonly playbackTimeValue: PageElement;
  private readonly pauseButton: PageElement;
  private readonly liveChannelTile: PageElement;
  private readonly rewindButton: PageElement;
  private readonly forwardButton: PageElement;
  private readonly volumeButton: PageElement;
  private readonly subtitleButton: PageElement;
  private readonly subtitleLanguageOption: PageElement;
  private readonly subtitleOffOption: PageElement;
  private readonly subtitleDisplayIndicator: PageElement;
  private readonly nextEpisodeButton: PageElement;
  private readonly upNextMarker: PageElement;
  private readonly backButton: PageElement;
  private readonly fullscreenButton: PageElement;
  private readonly goLiveButton: PageElement;
  private readonly adTag: PageElement;
  private readonly pauseAdBanner: PageElement;
  private readonly firstTitleImageCard: PageElement;
  private readonly titleImageWithAlt: PageElement;
  private readonly contentMetadataDiv: PageElement;
  private readonly contentDescDiv: PageElement;
  private readonly contentCardContainer: PageElement;
  private readonly continueWatchingDetailsAndMore: PageElement;
  private readonly contentDetailsHeading: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows' };
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image' };
    this.playButton = { selector: '#play' };
    this.videoElement = { selector: 'video' };
    this.vpnErrorMessage = { selector: 'h2:has-text("We detected that you’re using a VPN or proxy")'};
    this.showDetailsHeading = { selector: 'main h1' };
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
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
    this.resumeButton = { selector: 'p:has-text("Resume")' };
    this.parentalPinPlaybackPrompt = { selector: 'text=/Enter the PIN to Access/i' };
    this.parentalPinEntryInputs = { selector: 'input[id^="parental-pin-input-"]' };
    this.parentalPinValidateButton = { selector: 'button:has-text("Submit"), button:has-text("Continue")' };
    this.parentalPinInvalidErrorMessage = { selector: 'text=/Invalid Pin/i' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")'};
    this.premiumTagIcon = { selector: 'img[alt="tag"], [aria-label="tag"], [data-testid*="tag"], img[title="tag"]' };
    this.subscribeToWatchCta = { selector: '#play div' };
    this.upgradePlanButton = { role: 'button', text: 'Upgrade Plan', selector: 'button:has-text("Upgrade Plan"), a:has-text("Upgrade Plan")' };
    this.plansPageHeading = { selector: 'h1', text: 'Plans & Payment' };
    this.playButton = { selector: '#play div' };
    this.addToWatchlistButton = { selector: '#watchlist div' };
    this.removeFromWatchlistButton = { selector: '#watchlist div' };
    this.watchlistToast = { selector: "div:has-text('Added to watchlist'), div:has-text('Removed from watchlist')" };
    this.cinemaOnePhSection = {selector: 'img[alt="Cinema One PH"]'};
    this.liveChannelsTray = { text: 'Live Channels', selector: 'text=Live Channels' };
    this.dzmmTeleradyoItem = { text: 'DZMM Teleradyo', selector: 'text=DZMM Teleradyo' };
    this.watchlistContentCard = { selector: 'img[alt="My Illegal Wife"]' };
    this.freeTagBadge = { selector: 'img[alt="free"]' };
    this.loginCta = { selector: '#login div' };
    this.skipIntroMarker = { selector: 'button:has-text("Skip Intro"), [data-testid*="skip-intro"], [aria-label*="Skip Intro"]' };
    this.skipRecapMarker = { selector: 'button:has-text("Skip Recap"), [data-testid*="skip-recap"], [aria-label*="Skip Recap"]' };
    this.firstSearchResult = { selector: 'main img, main a img, main section img, main article img, main figure img, section[role="list"] img, div[role="list"] img, .search-results img, .results-list img, section[role="list"] .thumbnail, div[role="list"] .thumbnail, .search-results .thumbnail, .results-list .thumbnail' };
    this.playButton = { selector: '#play div' };
    this.playerScreen = { selector: '[data-testid="player"], .player-screen, video' };
    this.seekBar = { selector: '.player-progress-indicator' };
    this.playbackTime = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playerTimeDisplay = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playbackTimeValue = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.pauseButton = { selector: 'button:has-text("pause"), [data-testid="pause-button"], .pause-button' };
    this.liveChannelTile = { selector: 'a, button, [role="button"], [data-testid*="content"], [data-testid*="card"]' };
    this.rewindButton = { selector: 'xpath=//*[@id="player-container-main-rewindButton"]/img' };
    this.forwardButton = { selector: 'xpath=//*[@id="player-container-main-forwardButton"]/img' };
    this.volumeButton = { selector: 'button[aria-label*="volume"], button[title*="volume"], [data-testid*="volume"]' };
    this.subtitleButton = { selector: 'xpath=//*[@id="player-container-main-subtitleButton"]/img' };
    this.subtitleLanguageOption = { selector: 'text=/English\\(Philippines\\)/i' };
    this.subtitleOffOption = { selector: 'text=/\\bOff\\b/i' };
    this.subtitleDisplayIndicator = { selector: 'xpath=//*[@id="player-container-main"]/div[6]/div' };
    this.nextEpisodeButton = { selector: 'button[aria-label*="next"], button:has-text("Next"), [data-testid*="next-episode"]' };
    this.upNextMarker = { selector: 'button:has-text("Up Next"), button:has-text("Up next"), [data-testid*="up-next"], [aria-label*="Up Next"], [aria-label*="up next"], text=/up next/i' };
    this.backButton = { selector: 'button[aria-label*="back"], button:has-text("Back"), [data-testid*="back"]' };
    this.fullscreenButton = { selector: 'button[aria-label*="fullscreen"], button[title*="fullscreen"], [data-testid*="fullscreen"]' };
    this.goLiveButton = { selector: 'button:has-text("Go Live"), [data-testid*="go-live"], [aria-label*="Go Live"]' };
    this.adTag = { selector: '//*[@id="ad-ui-overlay"]' };
    this.pauseAdBanner = { selector: '[data-testid*="pause-ad"], [data-testid*="ad-overlay"], [class*="pause-ad"], [class*="pause-overlay"], [class*="banner"], [role="dialog"]' };
    this.firstTitleImageCard = { selector: 'img.title-image' };
    this.titleImageWithAlt = { selector: '//img[contains(@class,"title") and @alt]' };
    this.contentMetadataDiv = { selector: 'div.metadata, [class*="metadata"]' };
    this.contentDescDiv = { selector: 'div.desc, [class*="desc"]' };
    this.contentCardContainer = { selector: 'xpath=ancestor::*[self::div or self::a or self::li][1]' };
    this.continueWatchingDetailsAndMore = { selector: 'text=/Details and More|View More|Details/i' };
    this.contentDetailsHeading = { selector: 'main h1, [data-testid*="content-title"], [data-testid*="details-title"], [class*="content-title"]' };

  }

  async navigate(): Promise<void> {
    const baseUrl = config.getBaseURL();
    logger.pageNavigation(baseUrl);
    await this.page.goto(baseUrl);
    await this.pageUtils.waitForPageLoad();
    await this.page.waitForTimeout(7000);
  }

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

  async clickFirstFreeContentOnHome(): Promise<void> {
    logger.elementInteraction('click', 'first free-tagged content on home');

    try {
      const freeBadge = this.page.locator("//img[@alt='free' and contains(@src,'free.png')]").first();
      await freeBadge.waitFor({ state: 'visible', timeout: 15000 });

      const contentCard = freeBadge.locator('xpath=ancestor::*[self::div or self::a or self::li][1]').first();
      const contentTarget = contentCard.locator('a, button, [role="button"], img.title-image, img').first();

      if (await contentTarget.count()) {
        await contentTarget.waitFor({ state: 'visible', timeout: 15000 });
        await contentTarget.click({ timeout: 15000 });
      } else {
        await freeBadge.click({ timeout: 15000 });
      }

      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
    } catch (err) {
      logger.debug('clickFirstFreeContentOnHome failed', err);
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
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
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

  async verifyWatchlistHeading(expectFn: typeof expect, contentTitle: string): Promise<void> {
    logger.elementInteraction('verify', `watchlist heading ${contentTitle}`);
    const heading = this.page.getByRole('heading', { name: contentTitle }).first();
    await heading.waitFor({ state: 'visible', timeout: 15000 });
    await heading.click({ timeout: 15000 });
    await expectFn(heading).toBeVisible();
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
      const locator = this.page.locator('//p[normalize-space()="Live Channels"]').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async openLiveChannelsTray(): Promise<void> {
    logger.elementInteraction('click', 'Live Channels tray');
    try {
      const locator = this.page.locator('//p[normalize-space()="Live Channels"]').first();
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
      const episodeTwoLocator = this.page.getByText('S1 E2').first();
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

  async isContinueWatchingDetailsAndMoreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickContinueWatchingDetailsAndMore(): Promise<void> {
    logger.elementInteraction('click', 'Continue Watching details and more action');
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      await locator.click({ timeout: 20000 });
    } catch (error) {
      logger.debug('Continue Watching details and more action click failed', error);
    }
  }

  async isContentDetailsPageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDetailsHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
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
      }
      const text = (await episodeCard.textContent()) || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      logger.debug('getFirstEpisodeCardTitleText failed', err);
      return '';
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

  async isPremiumTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Premium tag in watchlist');

    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img').first();

      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });

      // Look for a premium tag/icon within the card's ancestor container
      const ancestor = cardLocator.locator('xpath=ancestor::*[1]');
      const tagLocator = ancestor.locator('img[alt="tag"], img[aria-label="tag"], img[title="tag"]').first();
      if (await tagLocator.count()) {
        await tagLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        return await tagLocator.isVisible().catch(() => false);
      }

      // Fallback: global premium tag presence near the image
      const globalTag = this.page.locator('img[alt="tag"], img[aria-label="tag"], img[title="tag"]').first();
      await globalTag.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      return await globalTag.isVisible().catch(() => false);
    } catch (error) {
      logger.debug('Premium tag visibility check failed', error);
      return false;
    }
  }

  async isContentAbsentInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content absence in watchlist ${contentTitle}`);
    try {
      const locator = this.page.getByRole('img', { name: contentTitle }).first();
      const count = await locator.count();
      if (count === 0) {
        return true;
      }
      await expect(locator).toBeHidden({ timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug(`Content absence validation failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentThumbnailVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content thumbnail visible in watchlist for ${contentTitle}`);
    try {
      const thumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      return await thumbnail.isVisible();
    } catch (error) {
      logger.debug(`Thumbnail visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentMetadataVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content metadata visible in watchlist for ${contentTitle}`);
    try {
      const metadataLocator = this.page.getByText(contentTitle, { exact: true }).first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 15000 });
      return await metadataLocator.isVisible();
    } catch (error) {
      logger.debug(`Metadata visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentCardValidInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content card validity in watchlist for ${contentTitle}`);
    try {
      const thumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      const metadata = this.page.getByText(contentTitle, { exact: true }).first();

      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await metadata.waitFor({ state: 'visible', timeout: 15000 });

      const cardContainer = thumbnail.locator(this.contentCardContainer.selector);
      const isCardVisible = await cardContainer.isVisible().catch(() => true);
      const thumbnailVisible = await thumbnail.isVisible();
      const metadataVisible = await metadata.isVisible();

      return isCardVisible && thumbnailVisible && metadataVisible;
    } catch (error) {
      logger.debug(`Content card validity check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async getFirstContentTitle(): Promise<string> {
    logger.elementInteraction('get', 'first content title from current page');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      const title = await firstTitleImage.getAttribute('alt');
      if (title) {
        logger.debug(`Retrieved first content title: ${title}`);
        return title;
      }

      const cardContainer = firstTitleImage.locator(this.contentCardContainer.selector).first();
      const heading = cardContainer.locator('h2, h3, h4, [role="heading"]').first();
      const headingText = await heading.textContent();
      if (headingText) {
        logger.debug(`Retrieved first content title from heading: ${headingText}`);
        return headingText.trim();
      }
      throw new Error('Could not extract title from first content card');
    } catch (error) {
      logger.error(`Failed to get first content title: ${error}`);
      throw error;
    }
  }

  async hoverOverFirstContent(): Promise<void> {
    logger.elementInteraction('hover', 'over first content card');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      await firstTitleImage.hover();
      logger.debug('Hovered over first content card');
      await this.page.waitForTimeout(500);
    } catch (error) {
      logger.error(`Failed to hover over first content: ${error}`);
      throw error;
    }
  }

  async clickFirstContentInWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'first content in watchlist');
    try {
      const firstContent = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstContent.waitFor({ state: 'visible', timeout: 10000 });
      await firstContent.click();
      logger.debug('Clicked on first content in watchlist');
    } catch (error) {
      logger.error(`Failed to click first content in watchlist: ${error}`);
      throw error;
    }
  }

  async assertContentTitle(): Promise<void> {
    logger.elementInteraction('assert', 'content title details');
    try {
      await this.page.waitForTimeout(2000); 

      const titleImage = this.page.locator(this.titleImageWithAlt.selector).first();
      const imageTitle = await titleImage.getAttribute('alt').catch(() => null);

      const metadata = this.page.locator(this.contentMetadataDiv.selector).first();
      const metadataText = await metadata.textContent().catch(() => null);

      const description = this.page.locator(this.contentDescDiv.selector).first();
      const descText = await description.textContent().catch(() => null);

      expect(imageTitle || metadataText || descText).toBeTruthy();

      if (!this.hasStoredDetails) {
        this.storedContentTitle = imageTitle || '';
        this.storedContentMetadata = metadataText || '';
        this.storedContentDescription = descText || '';
        this.hasStoredDetails = true;
        logger.debug(`Stored first content details - Title: ${this.storedContentTitle}, Metadata: ${this.storedContentMetadata?.substring(0, 50)}, Description: ${this.storedContentDescription?.substring(0, 50)}`);
      }

      logger.info(`✓ Content Title (from image): ${imageTitle || 'N/A'}`);
      logger.info(`✓ Content Metadata: ${metadataText?.trim().substring(0, 100) || 'N/A'}...`);
      logger.info(`✓ Content Description: ${descText?.trim().substring(0, 100) || 'N/A'}...`);

      logger.debug(`Content title assertion passed - Title: ${imageTitle}, Metadata: ${!!metadataText}, Description: ${!!descText}`);
    } catch (error) {
      logger.error(`Failed to assert content title: ${error}`);
      throw error;
    }
  }

  async assertBothContentsMatch(): Promise<void> {
    logger.elementInteraction('assert', 'both contents match');
    try {
      // Get current content details
      const titleImage = this.page.locator('//img[contains(@class,"title") and @alt]').first();
      const currentTitle = await titleImage.getAttribute('alt').catch(() => null);
      
      const metadata = this.page.locator('//div[contains(@class,"metadata")]').first();
      const currentMetadata = await metadata.textContent().catch(() => null);
      
      const description = this.page.locator('//div[contains(@class,"desc")]').first();
      const currentDescription = await description.textContent().catch(() => null);
      
      const titleMatches = this.storedContentTitle === (currentTitle || '');
      const metadataMatches = this.storedContentMetadata === (currentMetadata || '');
      const descriptionMatches = this.storedContentDescription === (currentDescription || '');
      
      const allMatch = titleMatches && metadataMatches && descriptionMatches;
      
      expect(allMatch).toBe(true);
      
      logger.info(` Content Title Match: ${titleMatches}`);
      logger.info(` Stored Title: ${this.storedContentTitle || 'N/A'}`);
      logger.info(` Current Title: ${currentTitle || 'N/A'}`);
      logger.info(` Content Metadata Match: ${metadataMatches}`);
      logger.info(` Content Description Match: ${descriptionMatches}`);
      logger.info(` Both Contents Are Same: ${allMatch}`);
      
      logger.debug(`Content match comparison - Title: ${titleMatches}, Metadata: ${metadataMatches}, Description: ${descriptionMatches}, All Match: ${allMatch}`);
    } catch (error) {
      logger.error(`Failed to assert content match: ${error}`);
      throw error;
    }
  }

  async assertAndLogFirstContentDetails(): Promise<void> {
    logger.elementInteraction('assert', 'first content thumbnail, metadata and title');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });

      const title = await firstTitleImage.getAttribute('alt');
      const isThumbnailVisible = await firstTitleImage.isVisible();

      const cardContainer = firstTitleImage.locator(this.contentCardContainer.selector).first();
      const metadata = await cardContainer.textContent();

      expect(isThumbnailVisible).toBe(true);
      expect(title).toBeTruthy();
      expect(metadata).toBeTruthy();

      logger.info(`✓ Thumbnail visible: ${isThumbnailVisible}`);
      logger.info(`✓ Content Title: ${title}`);
      logger.info(`✓ Content Metadata: ${metadata?.trim().substring(0, 100)}...`);

      logger.debug(`Content details verified - Title: ${title}, Metadata visible: ${!!metadata}`);
    } catch (error) {
      logger.error(`Failed to assert and log first content details: ${error}`);
      throw error;
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

  async clickFirstSearchResult(): Promise<void> {
    logger.elementInteraction('click', 'first content from first rail');
    const firstResult = this.page.locator(this.firstSearchResult.selector).first();
    await firstResult.waitFor({ state: 'visible', timeout: 15000 });
    await firstResult.click({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
     logger.debug('Search result navigation did not reach networkidle');
  });
  }

  async verifyPlayerTitle(expectedTitle: string): Promise<boolean> {
    logger.assertion('Verify player title', true);
    await expect(this.page.getByText(expectedTitle)).toBeVisible();
    return true;
  }

  async isPlayerContentTitleVisibleInPlayer(expectedTitle?: string): Promise<boolean> {
    if (!expectedTitle) {
      const title = this.page.locator('text=/.*\\w.*/').first();
      await title.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    }

    const playerTitle = this.page.getByTestId('video-player').getByText(expectedTitle, { exact: false }).first();
    await playerTitle.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await playerTitle.isVisible().catch(() => false);
  }

  async isPlayerScreenVisible(): Promise<boolean> {
    const player = this.page.locator(this.playerScreen.selector).first();
    await player.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async isPlayerScreenHidden(): Promise<boolean> {
    try {
      const player = this.page.locator(this.playerScreen.selector).first();
      return !(await player.isVisible().catch(() => false));
    } catch {
      return true;
    }
  }

  async isPlayerContentTitleVisible(expectedTitle?: string): Promise<boolean> {
    if (expectedTitle) {
      return this.verifyPlayerTitle(expectedTitle);
    }

    const title = this.page.locator('text=/.*\\w.*/').first();
    await title.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async hoverPlaybackScreen(): Promise<void> {
    logger.elementInteraction('hover', 'Playback screen');
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator('.player-loader, .player-mid-spacer').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const box = await playerScreen.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.hover();
    }
  }

  async clickResumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Resume button');
    const resume = this.page.locator(this.resumeButton.selector).first();
    await resume.waitFor({ state: 'visible', timeout: 15000 });
    await resume.click({ timeout: 10000 });
  }

  async clickPauseButton(): Promise<void> {
    logger.elementInteraction('click', 'Pause button');
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 });
    await pauseButton.click({ timeout: 10000 });
  }

  async clickRewindButton(): Promise<void> {
    logger.elementInteraction('click', 'Rewind button');
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    await rewindButton.click({ timeout: 10000 });
  }

  async clickForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'Forward button');
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    await forwardButton.click({ timeout: 10000 });
  }

  async isPauseAdVisible(): Promise<boolean> {
    const pauseAd = this.page.locator(this.pauseAdBanner.selector).first();
    await pauseAd.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseAd.isVisible().catch(() => false);
  }

  async isPauseButtonVisible(): Promise<boolean> {
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseButton.isVisible().catch(() => false);
  }

  async isSeekBarVisible(): Promise<boolean> {
    const seek = this.page.locator(this.seekBar.selector).first();
    await seek.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await seek.isVisible().catch(() => false);
  }

  async isPlaybackTimeVisible(): Promise<boolean> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await timeDisplay.isVisible().catch(() => false);
  }

  // async isPlayerDurationTimeVisible(): Promise<boolean> {
  //   const durationDisplay = this.page.locator(this.playerTimeDuration.selector).first();
  //   await durationDisplay.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
  //   return await durationDisplay.isVisible().catch(() => false);
  // }

  async tapPlaybackScreen(): Promise<void> {
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 15000 });
    const box = await playerScreen.boundingBox();

    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.click();
    }
  }

  async isRewindButtonVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isForwardButtonVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isVolumeButtonVisible(): Promise<boolean> {
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickVolumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Volume button');
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    await volumeButton.click({ timeout: 10000 });
  }

  async isPlayerMuted(): Promise<boolean> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.muted).catch(() => false);
  }

  async getPlayerVolumeLevel(): Promise<number> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.volume).catch(() => 0);
  }

  async isBackButtonVisible(): Promise<boolean> {
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await backButton.isVisible().catch(() => false);
  }

  async isSubtitleButtonVisible(): Promise<boolean> {
    // const subtitleButton = this.page.getByRole('button', { name: 'subtitle' }).first();
    const subtitleButton = this.page.locator(this.subtitleButton.selector).first();
    await subtitleButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await subtitleButton.isVisible().catch(() => false);
  }

  async clickSubtitleButton(): Promise<void> {
    logger.elementInteraction('click', 'Subtitle button');
    // const locator = this.page.getByRole('button', { name: 'subtitle' }).first();
    const locator = this.page.locator(this.subtitleButton.selector).first();
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click({ timeout: 10000 });
  }

  async selectSubtitleLanguage(): Promise<boolean> {
    logger.elementInteraction('click', 'Subtitle language option');
    await this.page.getByText('English (Philippines)').click();
    return true;
  }

  async clickNextEpisodeButton(): Promise<void> {
    logger.elementInteraction('click', 'Next episode button');
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    await nextEpisodeButton.waitFor({ state: 'visible', timeout: 10000 });
    await nextEpisodeButton.click({ timeout: 10000 });
  }

  async isNextEpisodeButtonVisible(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    await nextEpisodeButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await nextEpisodeButton.isVisible().catch(() => true);
  }

  async isUpNextMarkerVisible(): Promise<boolean> {
    const marker = this.page.locator(this.upNextMarker.selector).first();
    await marker.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await marker.isVisible().catch(() => false);
  }

  async waitForUpNextMarker(timeout: number = 20000): Promise<boolean> {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      if (await this.isUpNextMarkerVisible()) {
        return true;
      }
      await this.page.waitForTimeout(1000);
    }

    return false;
  }

  async isNextEpisodeButtonBelowSeekBar(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    const seekBar = this.page.locator(this.seekBar.selector).first();

    const nextVisible = await nextEpisodeButton.isVisible().catch(() => false);
    const seekVisible = await seekBar.isVisible().catch(() => false);

    if (!nextVisible || !seekVisible) {
      return false;
    }

    const [nextBox, seekBox] = await Promise.all([
      nextEpisodeButton.boundingBox().catch(() => null),
      seekBar.boundingBox().catch(() => null),
    ]);

    if (!nextBox || !seekBox) {
      return false;
    }

    return nextBox.y >= seekBox.y + seekBox.height - 2;
  }

  async clickBackButton(): Promise<void> {
    logger.elementInteraction('click', 'Back button');
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 });
    await backButton.click({ timeout: 10000 });
  }

  async isSubtitleLanguageVisible(): Promise<boolean> {
    try {
      const option = this.page.getByText('English (Philippines)');
      await option.waitFor({ state: 'visible', timeout: 10000 });
      await option.click().catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  }

  async isSubtitleOffOptionVisible(): Promise<boolean> {
    const subtitleOffOption = this.page.locator(this.subtitleOffOption.selector).first();
    await subtitleOffOption.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isSubtitleDisplayedOnPlayer(): Promise<boolean> {
    const subtitleDisplayIndicator = this.page.locator('//*[@id="player-container-main"]/div[6]/div').first();
    await subtitleDisplayIndicator.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isFullscreenButtonVisible(): Promise<boolean> {
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickFullscreenButton(): Promise<void> {
    logger.elementInteraction('click', 'Fullscreen button');
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 10000 });
    await fullscreenButton.click({ timeout: 10000 });
  }

  async isAdTagVisible(): Promise<boolean> {
    const adTag = this.page.locator(this.adTag.selector).first();
    await adTag.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickGoLiveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Go Live' }).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByRole('button', { name: 'Go Live' }).click({ timeout: 10000 });
  }

  async isGoLiveButtonVisible(): Promise<boolean> {
    await this.page.getByText('Live', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async getPlaybackTimeText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent() || '').replace(/\s+/g, ' ').trim();
  }

  async getPlaybackTimestampText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playbackTimeValue.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent() || '').replace(/\s+/g, ' ').trim();
  }

  async isPlaybackTimeInHHMMSSFormat(): Promise<boolean> {
    const playbackText = await this.getPlaybackTimestampText();
    return /^\d{1,2}:\d{2}:\d{2}$/.test(playbackText.trim());
  }

  async isPlaybackTimeInMMSSFormat(): Promise<boolean> {
    const playbackText = await this.getPlaybackTimestampText();
    return /^\d{1,2}:\d{2}$/.test(playbackText.trim());
  }

  async getTrimmedPlaybackTime(): Promise<string> {
    const playbackText = await this.getPlaybackTimeText();
    const match = playbackText.match(/(\d{1,2}:\d{2})/);
    return match?.[1] ?? playbackText;
  }

  async dragSeekBarToPosition(targetPercent: number): Promise<void> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 15000 });
    const box = await seekBar.boundingBox();

    if (!box) {
      return;
    }

    const startX = box.x + box.width * 0.2;
    const startY = box.y + box.height / 2;
    const endX = box.x + box.width * Math.min(Math.max(targetPercent, 0.05), 0.95);
    const endY = startY;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 8 });
    await this.page.mouse.up();
  }

  async clickliveContent(contentName: string = 'TFC Asia'): Promise<void> {
    logger.elementInteraction('click', `content tile ${contentName}`);

    const liveSection = this.page.getByText('Live Channels', { exact: true }).first();
    const tileSelector = `img[alt="${contentName}"], img[title="${contentName}"], [aria-label="${contentName}"]`;
    const tile = this.page.locator(tileSelector).first();
    const maxAttempts = 12;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const count = await tile.count().catch(() => 0);
      if (count > 0) {
        await tile.scrollIntoViewIfNeeded().catch(() => undefined);
        const isVisible = await tile.isVisible().catch(() => false);
        if (isVisible) {
          await tile.click({ timeout: 20000 });
          return;
        }
      }

      await liveSection.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.75, left: 0, behavior: 'smooth' }));
      await this.page.waitForTimeout(1000);
    }

    await tile.scrollIntoViewIfNeeded().catch(() => undefined);
    await tile.waitFor({ state: 'visible', timeout: 20000 });
    await tile.click({ timeout: 20000 });
  }

  async RewindButtonNotVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    return await rewindButton.isVisible().catch(() => false);
  }

  async ForwardButtonNotVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    return await forwardButton.isVisible().catch(() => false);
  }

  async waitForPlayback(seconds: number): Promise<void> {
    await this.page.waitForTimeout(seconds * 1000);
  }

    async verifyEpisodeName(expectedEpisodeName: string): Promise<boolean> {
    logger.assertion('Verify episode name', true);
    await expect(this.page.getByText(expectedEpisodeName)).toBeVisible();
    return true;
  }

  async isEpisodeNameVisible(expectedEpisodeName?: string): Promise<boolean> {
    if (expectedEpisodeName) {
      return this.verifyEpisodeName(expectedEpisodeName);
    }

    const anyEpisode = this.page.locator('text=/.*\\w.*/').first();
    await anyEpisode.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async isVPNErrorMessageVisible(expectedMessage?: string): Promise<boolean> {
    try {
      const locator = expectedMessage
        ? this.page.getByText(expectedMessage, { exact: true })
        : this.page.locator(this.vpnErrorMessage.selector);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getVPNErrorMessageText(): Promise<string> {
    try {
      const locator = this.page.locator(this.vpnErrorMessage.selector);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return (await locator.textContent())?.trim() || '';
    } catch {
      return '';
    }
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

  async clickSubscribeCTA(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe to Watch CTA');
    const subscribeButton = this.page.locator('button:has-text("Subscribe to Watch"), button:has-text("Subscribe")').first();
    await subscribeButton.waitFor({ state: 'visible', timeout: 10000 });
    await subscribeButton.click({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async clickSubscribeConfirm(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe confirmation CTA');
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Subscribe to Watch")').first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async isParentalPinPlaybackPromptVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinPlaybackPrompt, 10000);
  }

  async getParentalPinPlaybackPromptText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinPlaybackPrompt, 10000);
  }

  async enterParentalPlaybackPin(pin: string): Promise<void> {
    logger.elementInteraction('type', 'Parental playback PIN input');
    const inputs = this.page.locator(this.parentalPinEntryInputs.selector);
    const digits = (pin || '').split('');

    for (let index = 0; index < digits.length; index++) {
      const input = inputs.nth(index);
      await input.waitFor({ state: 'visible', timeout: 10000 });
      await input.fill(digits[index]);
    }
  }
  async isParentalPinInvalidErrorVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinInvalidErrorMessage, 10000);
  }

  async getParentalPinInvalidErrorText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinInvalidErrorMessage, 10000);
  }
}