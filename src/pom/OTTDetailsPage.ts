import { expect, Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';

export class OTTDetailsPage {
  private readonly page: Page;
  private readonly pageUtils: PageUtils;
  private readonly showsSectionLink: PageElement;
  private readonly firstShowContentCard: PageElement;
  private readonly showDetailsHeading: PageElement;
  private readonly contentMetadata: PageElement;
  private readonly cookieConfirmButton: PageElement;
  private readonly firstSearchResult: PageElement;
  private readonly playButton: PageElement;
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
  private readonly backButton: PageElement;
  private readonly fullscreenButton: PageElement;
  private readonly goLiveButton: PageElement;
  private readonly adTag: PageElement;
  private readonly pauseAdBanner: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows'};
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image'};
    this.showDetailsHeading = { selector: 'main h1'};
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]'};
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")'};
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
    this.subtitleButton = { selector: 'button[aria-label*="subtitle"], button[title*="subtitle"], [data-testid*="subtitle"]' };
    this.subtitleLanguageOption = { selector: 'text=/English\\(Philippines\\)/i' };
    this.subtitleOffOption = { selector: 'text=/\\bOff\\b/i' };
    this.subtitleDisplayIndicator = { selector: 'xpath=//*[@id="player-container-main"]/div[6]/div' };
    this.nextEpisodeButton = { selector: 'button[aria-label*="next"], button:has-text("Next"), [data-testid*="next-episode"]' };
    this.backButton = { selector: 'button[aria-label*="back"], button:has-text("Back"), [data-testid*="back"]' };
    this.fullscreenButton = { selector: 'button[aria-label*="fullscreen"], button[title*="fullscreen"], [data-testid*="fullscreen"]' };
    this.goLiveButton = { selector: 'button:has-text("Go Live"), [data-testid*="go-live"], [aria-label*="Go Live"]' };
    this.adTag = { selector: '//*[@id="ad-ui-overlay"]' };
    this.pauseAdBanner = { selector: '[data-testid*="pause-ad"], [data-testid*="ad-overlay"], [class*="pause-ad"], [class*="pause-overlay"], [class*="banner"], [role="dialog"]' };

  }


  async navigate(): Promise<void> {
    const baseUrl = config.getBaseURL();
    logger.pageNavigation(baseUrl);
    await this.page.goto(baseUrl);
    await this.pageUtils.waitForPageLoad();
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

    const firstShowCard = this.page.locator('.scrollable-list:first-of-type .thumbnail').first();
    await firstShowCard.waitFor({ state: 'visible', timeout: 15000 });
    await firstShowCard.click({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
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


  async clickPlayButton(): Promise<void> {
    logger.elementInteraction('click', 'Play button');
    const playButton = this.page.locator(this.playButton.selector).first();
    await playButton.waitFor({ state: 'visible', timeout: 15000 });
    await playButton.click({ timeout: 15000 });
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
    logger.elementInteraction('click', 'Pause button');
    const resume = this.page.locator(this.pauseButton.selector).first();
    await resume.waitFor({ state: 'visible', timeout: 10000 });
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
    await seek.waitFor({ state: 'visible', timeout: 10000 });
    return true;
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

  async isBackButtonVisible(): Promise<boolean> {
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await backButton.isVisible().catch(() => false);
  }

  async isSubtitleButtonVisible(): Promise<boolean> {
    const subtitleButton = this.page.locator(this.subtitleButton.selector).first();
    await subtitleButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await subtitleButton.isVisible().catch(() => false);
  }

  async clickSubtitleButton(): Promise<void> {
    logger.elementInteraction('click', 'Subtitle button');
    const subtitleButton = this.page.locator(this.subtitleButton.selector).first();
    await subtitleButton.waitFor({ state: 'visible', timeout: 10000 });
    await subtitleButton.click({ timeout: 10000 });
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
    return await nextEpisodeButton.isVisible().catch(() => false);
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
      const mainElement = this.page.locator('main');
      const headingLocator = mainElement.locator('h1').first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await headingLocator.textContent() || '';
      return text.trim();
    } catch (error) {
      logger.debug('Error getting show details heading', error);
      return '';
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
}
