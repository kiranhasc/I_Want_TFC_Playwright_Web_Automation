import { Page } from '@playwright/test';
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

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows'};
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image'};
    this.showDetailsHeading = { selector: 'main h1'};
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]'};
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")'};
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
}
