import { Page } from '@playwright/test';
import { PageElement } from '../types/index';

export class EndToEndPage {
  private readonly page: Page;
  private readonly genreText: PageElement;
  private readonly ratingText: PageElement;
  private readonly playerQualityText: PageElement;
  private readonly contentDescriptionText: PageElement;
  private readonly playButton: PageElement;
  private readonly resumeButton: PageElement;
  private readonly shareIcon: PageElement;
  private readonly pausePlayButton: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.genreText = { selector: '//div[contains(@class,"genre")]//p' };
    this.ratingText = { selector: '//div[contains(@class,"age-rating")]//p' };
    this.playerQualityText = { selector: '//div[contains(@class,"video-quality")]//p' };
    this.contentDescriptionText = { selector: '//div[contains(@class,"desc")]' };
    this.playButton = { selector: '#play, #play div, button' };
    this.resumeButton = { selector: 'button:has-text("Resume"), a:has-text("Resume")' };
    this.shareIcon = { selector: 'button[aria-label*=share], button:has-text("Share"), [data-testid*=share]' };
    this.pausePlayButton = { selector: 'button[aria-label*=pause], button[aria-label*=play], [data-testid*=pause], [data-testid*=play]' };
  }

  async isGenreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.genreText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isRatingVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.ratingText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isPlayerQualityVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playerQualityText.selector).getByText(/\b(?:4k|1080p|720p|480p|hd|uhd)\b/i).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isContentDescriptionVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDescriptionText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isPlayButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playButton.selector).filter({ hasText: /play/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isResumeButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.resumeButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isShareIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.shareIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isPausePlayButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.pausePlayButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }
}
