import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { logger } from '../utils/logger';

export class OTTEarlyAccessPage {
    private page: Page;
    private pageUtils: PageUtils;
    private readonly railTitleSelector: PageElement;
    private readonly assetTitleSelector: PageElement;
    private readonly defaultLabelText: string;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.railTitleSelector = { selector: 'h2, h3, .rail-title' };
        this.assetTitleSelector = { selector: '[data-testid="content-card"], [data-testid="show-card"], .thumbnail, img.title-image' };
        this.defaultLabelText = 'Early Access';
    }

    async scrollToRail(railTitle: string): Promise<void> {
        logger.step(`Processing rail: ${railTitle}`);
        if (railTitle === 'iWant Picks ROW with Ad Unit') {
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
            const tagLocator = assetLocator.locator(`xpath=parent::div/following-sibling::div/img[@alt="${label}"]`);
            await tagLocator.waitFor({ state: 'visible', timeout: 8000 });
            return true;
        } catch {
            try {
                const nearby = assetLocator.locator(`xpath=following-sibling::*[1]//*[contains(normalize-space(string()), "${label}")]`);
                await nearby.waitFor({ state: 'visible', timeout: 3000 });
                return true;
            } catch {
                return false;
            }
        }
    }
}
