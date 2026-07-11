import { Page, Locator, expect } from '@playwright/test';
import { PageElement } from '../../src/types/index.ts';
import { logger } from './logger.ts';

/**
 * Enhanced page utilities for common UI interactions
 */
export class PageUtils {
  // eslint-disable-next-line no-unused-vars
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Safe click with automatic waiting
   */
  async safeClick(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.waitFor({ state: 'attached', timeout });
    await locator.click({ timeout });
    logger.info(`Clicked on element : ${element.selector || element.text || element.testId}`);
  }

  /**
   * Safe type with automatic clearing
   */
  async safeType(element: PageElement, text: string, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.clear();
    await locator.fill(text);
    logger.info(`Typed ${text} into element : ${element.selector || element.text || element.testId}`);
  }

  /**
   * Get text content with waiting
   */
  async getTextContent(element: PageElement, timeout: number = 10000): Promise<string> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(element: PageElement, timeout: number = 5000): Promise<boolean> {
    try {
      const locator = this.getLocator(element);
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(element: PageElement): Promise<void> {
    const locator = this.getLocator(element);
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(element: PageElement, path: string): Promise<void> {
    const locator = this.getLocator(element);
    await locator.screenshot({ path });
  }

  /**
   * Get locator from PageElement definition
   */
  private getLocator(element: PageElement): Locator {
    if (element.testId) {
      return this.page.getByTestId(element.testId);
    }
    if (element.role && element.text) {
      return this.page.getByRole(element.role as 'button' | 'link' | 'textbox', { name: element.text });
    }
    if (element.text) {
      return this.page.getByText(element.text);
    }
    return this.page.locator(element.selector);
  }

  /**
   * Hover over element
   */
  async hover(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.hover();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(element: PageElement, value: string | string[], timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.selectOption(value);
  }

  /**
   * Upload file to input element
   */
  async uploadFile(element: PageElement, filePath: string | string[], timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.setInputFiles(filePath);
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(source: PageElement, target: PageElement): Promise<void> {
    const sourceLocator = this.getLocator(source);
    const targetLocator = this.getLocator(target);
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Get element count
   */
  async getElementCount(element: PageElement): Promise<number> {
    const locator = this.getLocator(element);
    return await locator.count();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(element: PageElement, text: string, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toContainText(text, { timeout });
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Assert element is hidden
   */
  async assertElementHidden(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toBeHidden({ timeout });
  }
}