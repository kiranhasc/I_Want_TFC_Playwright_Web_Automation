import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';

export class OTTAuthPage {
    private readonly page: Page;
    private readonly pageUtils: PageUtils;
    private readonly emailField: PageElement;
    private readonly passwordField: PageElement;
    private readonly continueButton: PageElement;
    private readonly proceedButton: PageElement;
    private readonly tvProviderLoginOption: PageElement;
    private readonly providerFrontierOption: PageElement;
    private readonly providerEmailField: PageElement;
    private readonly providerPasswordField: PageElement;
    private readonly providerSignInButton: PageElement;
    private readonly forgotPasswordLink: PageElement;
    private readonly forgotPasswordHeading: PageElement;
    private readonly verifyOTPHeading: PageElement;
    private readonly errorMessage: PageElement;
    private readonly emailErrorMessage: PageElement;
    private readonly welcomeHeading: PageElement;
    private readonly welcomeSubheading: PageElement;
    private readonly loginWithFacebookButton: PageElement;
    private readonly loginWithTVProviderButton: PageElement;
    private readonly newHereLink: PageElement;
    private readonly createAccountLink: PageElement;
    private readonly cookieConfirmButton: PageElement;
    private readonly homeTab: PageElement;
    private readonly loadingIndicator: PageElement;
    private readonly moviesTab: PageElement;
    private readonly showsTab: PageElement;
    private readonly myWatchlistTab: PageElement;
    private readonly gmaTab: PageElement;
    private readonly searchBar: PageElement;
    private readonly searchBarIcon: PageElement;
    private readonly accountIcon: PageElement;
    private readonly signOutOption: PageElement;
    private readonly continueWatchingRail: PageElement;
    private readonly continueWatchingTrayTitle: PageElement;
    private readonly continueWatchingTrayContainer: PageElement;
    private readonly continueWatchingTrayItem: PageElement;
    private readonly continueWatchingTrayThumbnail: PageElement;
    private readonly continueWatchingTrayProgressIndicator: PageElement;
    private readonly continueWatchingRemoveButton: PageElement;
    private readonly trendingMoviesRail: PageElement;
    private readonly trendingShowsRail: PageElement;
    private readonly myWatchlistRail: PageElement;
    private readonly topStreamedRail: PageElement;
    private readonly profileLink: PageElement;
    private readonly createAccountLinkFromHome: PageElement;
    private readonly createAccountHeading: PageElement;
    private readonly createAccountEmailField: PageElement;
    private readonly createAccountPasswordField: PageElement;
    private readonly termsCheckbox: PageElement;
    private readonly marketingCheckbox: PageElement;
    private readonly createAccountContinueButton: PageElement;
    private readonly alreadyHaveAccountText: PageElement;
    private readonly createAccountLoginLink: PageElement;
    private readonly emptyCredentialsErrorMessage: PageElement;
    private readonly useMobileNumberLink: PageElement;
    private readonly countryCodeDropdown: PageElement;
    private readonly countryCodeOption: PageElement;
    private readonly mobileNumberField: PageElement;
    private readonly mobilePasswordField: PageElement;


    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.emailField = { selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]', };
        this.passwordField = { selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]', };
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.proceedButton = { role: 'button', text: 'Proceed', selector: 'button:has-text("Proceed")' };
        this.forgotPasswordLink = { role: 'link', text: 'Forgot Password?', selector: 'a:has-text("Forgot Password?")' };
        this.forgotPasswordHeading = { role: 'heading', text: 'Confirm Email Address', selector: 'h1:has-text("Confirm Email Address")' };
        this.verifyOTPHeading = { role: 'heading', text: 'Verify OTP', selector: 'h1:has-text("Verify OTP"), h2:has-text("Verify OTP"), text=Verify OTP' };
        this.errorMessage = { selector: 'form', text: 'Your login credentials are incorrect' };
        this.emailErrorMessage = { selector: 'form', text: 'Please enter a valid email to continue.' };
        this.welcomeHeading = { selector: 'h1:has-text("Welcome to iWant"), :text("Welcome to iWant")' };
        this.welcomeSubheading = { selector: 'text=/Home of Filipino/' };
        this.loginWithFacebookButton = { selector: 'button:has-text("Login with Facebook")' };
        this.loginWithTVProviderButton = { selector: 'button:has-text("Login with TV Provider")' };
        this.newHereLink = { text: 'New here?', selector: 'span:has-text("New here?")' };
        this.createAccountLink = { role: 'link', text: 'Create Account', selector: '//a[contains(normalize-space(), "Create Account")]' };
        this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
        this.homeTab = { text: 'Home', selector: 'nav >> text=Home' };
        this.loadingIndicator = { text: 'Loading..', selector: 'text=Loading..' };
        this.moviesTab = { selector: 'p:text-is("Movies")' };
        this.showsTab = { text: 'Shows', selector: 'nav >> text=Shows' };
        this.myWatchlistTab = { text: 'My Watchlist', selector: 'nav >> text=My Watchlist' };
        this.gmaTab = { selector: 'div#gma' };
        this.searchBarIcon = { selector: 'img[alt="search-icon"]' };
        this.searchBar = { selector: 'input[placeholder*="Search"], input[type="search"], [placeholder*="Search"], [aria-label*="Search"], [title*="Search"], [data-testid*="search"]' };
        this.accountIcon = { selector: 'img[alt="account"]' };
        this.signOutOption = { text: 'Sign Out', selector: 'text=Sign Out' };
        this.continueWatchingRail = { text: 'Continue Watching', selector: 'text=Continue Watching' };
        this.continueWatchingTrayTitle = { text: 'Continue Watching', selector: 'text=Continue Watching' };
        this.continueWatchingTrayContainer = { selector: 'text=Continue Watching >> xpath=following-sibling::*' };
        this.continueWatchingTrayItem = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> img' };
        this.continueWatchingTrayThumbnail = { selector: 'img' };
        this.continueWatchingTrayProgressIndicator = { selector: '[class*=progress], [aria-label*=progress], [data-testid*=progress], [class*=resume]' };
        this.continueWatchingRemoveButton = { selector: 'img[alt="remove-from-cw"], img[alt*="remove"], [aria-label*="remove"], [title*="remove"], [data-testid*="remove"]' };
        this.trendingMoviesRail = { text: 'Trending Movies Worldwide', selector: 'text=Trending Movies Worldwide' };
        this.trendingShowsRail = { text: 'Trending Shows Worldwide', selector: 'text=Trending Shows Worldwide' };
        this.myWatchlistRail = { text: 'My Watchlist', selector: 'text=/^My Watchlist$/' };
        this.tvProviderLoginOption = { selector: 'role=button[name="Login with TV Provider"]' };
        this.providerFrontierOption = { selector: 'role=button[name="Frontier, a Verizon Company"]' };
        this.providerEmailField = { selector: 'role=textbox[name="Username"]' };
        this.providerPasswordField = { selector: 'role=textbox[name="Password"]' };
        this.providerSignInButton = { role: 'button', text: 'Sign in', selector: 'button:has-text("Sign in")' };
        this.profileLink = { selector: 'role=img[name="account"]' };
        this.createAccountLinkFromHome = { role: 'link', text: 'Create Account', selector: 'a:has-text("Create Account")' };
        this.createAccountHeading = { role: 'heading', text: 'Create an account', selector: 'h1:has-text("Create an account"), h2:has-text("Create an account")' };
        this.createAccountEmailField = { selector: 'input[placeholder="Email Address"], input[name*="email"], input[type="email"]' };
        this.createAccountPasswordField = { selector: 'input[name="userPassword"]' };
        this.termsCheckbox = { selector: 'label:has-text("I agree to the Terms and")' };
        this.marketingCheckbox = { selector: 'label:has-text("I agree to receive marketing")' };
        this.createAccountContinueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.alreadyHaveAccountText = { selector: 'text=Already Have an Account?' };
        this.createAccountLoginLink = { role: 'link', text: 'Login', selector: 'a:has-text("Login")' };
        this.emptyCredentialsErrorMessage = { selector: 'text=/Email is required/i' };
        this.topStreamedRail = { text: 'Top Streamed', selector: 'text=Top Streamed' };
        this.useMobileNumberLink = { selector: '//p[contains(normalize-space(), "Click here to use Mobile Number")]'};
        this.countryCodeDropdown = { selector: 'select, [role="combobox"]' };
        this.countryCodeOption = { selector: 'text=63' };
        this.mobileNumberField = { selector: '#userMobile, input[type="tel"], input[name*="phone"], input[name*="mobile"]' };
        this.mobilePasswordField = { selector: 'input[placeholder*="Password"], input[type="password"], input[name*="password"]' };
    }

    async navigate(): Promise<void> {
        const baseUrl = config.getBaseURL();
        logger.pageNavigation(baseUrl);
        await this.page.goto(baseUrl);
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

    async clickEmailField(): Promise<void> {
        logger.elementInteraction('click', 'email field');
        await this.page.locator(this.emailField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeClick(this.emailField);
    }

    async enterEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'email field');
        await this.page.locator(this.emailField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeType(this.emailField, email);
    }

    async clickPasswordField(): Promise<void> {
        logger.elementInteraction('click', 'password field');
        await this.page.locator(this.passwordField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeClick(this.passwordField);
    }

    async enterPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'password field');
        await this.page.locator(this.passwordField.selector).first().waitFor({ state: 'visible', timeout: 30000 });
        await this.pageUtils.safeType(this.passwordField, password);
    }

    async clickContinue(): Promise<void> {
        logger.elementInteraction('click', 'Continue button');
        await this.pageUtils.safeClick(this.continueButton);
    }

    async clickUseMobileNumberLink(): Promise<void> {
        logger.elementInteraction('click', 'Use mobile number link');
        await this.pageUtils.safeClick(this.useMobileNumberLink);
    }

    async selectCountryCode(countryCode: string): Promise<void> {
        logger.elementInteraction('select', `country code ${countryCode}`);
        const countrySelector = this.page.locator(this.countryCodeDropdown.selector).first();
        if (await countrySelector.count()) {
            await countrySelector.selectOption({ label: countryCode }).catch(() => countrySelector.selectOption({ value: countryCode }));
        }
    }

    async enterMobileNumber(mobileNumber: string): Promise<void> {
        logger.elementInteraction('type', 'mobile number field');
        await this.pageUtils.safeType(this.mobileNumberField, mobileNumber);
    }

    async enterMobilePassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'mobile password field');
        await this.pageUtils.safeType(this.mobilePasswordField, password);
    }

    async clickForgotPassword(): Promise<void> {
        logger.elementInteraction('click', 'Forgot Password? link');
        await this.pageUtils.safeClick(this.forgotPasswordLink);
    }

    async clickProceed(): Promise<void> {
        logger.elementInteraction('click', 'Proceed button');
        await this.pageUtils.safeClick(this.proceedButton);
    }

    async isForgotPasswordPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.forgotPasswordHeading, 10000);
    }

    async getForgotPasswordHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.forgotPasswordHeading, 10000);
    }

    async isVerifyOTPPageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.verifyOTPHeading, 10000);
    }

    async getVerifyOTPHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.verifyOTPHeading, 10000);
    }

    async getInvalidCredentialsErrorMessage(): Promise<string> {
        return await this.pageUtils.getTextContent(this.errorMessage, 10000);
    }

    async getErrorMessage(): Promise<string> {
        return await this.pageUtils.getTextContent(this.emailErrorMessage, 10000);
    }

    async getEmptyCredentialsErrorMessage(): Promise<string> {
        return await this.pageUtils.getTextContent(this.emptyCredentialsErrorMessage, 10000);
    }

    async isWelcomeHeadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.welcomeHeading, 10000);
    }

    async getWelcomeHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.welcomeHeading, 10000);
    }

    async isEmailFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailField, 10000);
    }

    async isPasswordFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.passwordField, 10000);
    }

    async isContinueButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.continueButton, 10000);
    }

    async isWelcomeSubheadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.welcomeSubheading, 10000);
    }

    async getWelcomeSubheadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.welcomeSubheading, 10000);
    }

    async isLoginWithFacebookVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.loginWithFacebookButton, 10000);
    }

    async isLoginWithTVProviderVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.loginWithTVProviderButton, 10000);
    }

    async isNewHereLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.newHereLink, 10000);
    }

    async openCreateAccountFlow(): Promise<void> {
        logger.step('Opening create account flow');
        await this.pageUtils.safeClick(this.createAccountLinkFromHome);
    }

    async isCreateAccountHeadingVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountHeading, 10000);
    }

    async isCreateAccountLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountLink, 10000);
    }

    async scrollToBottomLinks(): Promise<void> {
        await this.page.locator(this.createAccountLink.selector).scrollIntoViewIfNeeded();
    }

    async isHomeTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.homeTab, 10000);
    }

    async waitForLoadingToDisappear(timeout: number = 15000): Promise<void> {
        try {
            await this.pageUtils.waitForElementToDisappear(this.loadingIndicator, timeout);
        } catch {
            // ignore if not present
        }
    }

    async isErrorMessageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailErrorMessage, 10000);
    }

    async clickMoviesTab(): Promise<void> {
        logger.elementInteraction('click', 'Movies tab');
        await this.pageUtils.safeClick(this.moviesTab);
    }

    async clickShowsTab(): Promise<void> {
        logger.elementInteraction('click', 'Shows tab');
        await this.pageUtils.safeClick(this.showsTab);
    }

    async clickMyWatchlistTab(): Promise<void> {
        logger.elementInteraction('click', 'My Watchlist tab');
        await this.pageUtils.safeClick(this.myWatchlistTab);
    }

    async clickGMATab(): Promise<void> {
        logger.elementInteraction('click', 'GMA tab');
        await this.pageUtils.safeClick(this.gmaTab);
    }

    async isContinueWatchingRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.continueWatchingRail, 10000);
    }

    private getContinueWatchingTitleLocator() {
        return this.page.locator('text=Continue Watching').first();
    }

    private getContinueWatchingRailLocator() {
        return this.getContinueWatchingTitleLocator().locator('xpath=ancestor::div[contains(@class, "rail")][1]').first();
    }

    private getContinueWatchingArrowLocator(direction: 'left' | 'right') {
        const positionClass = direction === 'right' ? 'right-0' : 'left-0';
        const selector = `xpath=ancestor::div[contains(@class, "rail")][1]//div[contains(@class, "pointer-events-auto") and contains(@class, "absolute") and contains(@class, "bottom-[15rem]") and contains(@class, "${positionClass}") and contains(@class, "z-10")]//img[@alt="arrow-right"]`;
        return this.getContinueWatchingTitleLocator().locator(selector).first();
    }

    async ensureContinueWatchingTrayInView(timeout: number = 30000): Promise<boolean> {
        await this.pageUtils.waitForNetworkIdle(timeout);
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) {
            return false;
        }

        await title.waitFor({ state: 'visible', timeout });
        await title.scrollIntoViewIfNeeded();
        await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);

        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }

        await section.scrollIntoViewIfNeeded();
        await section.waitFor({ state: 'visible', timeout });
        return true;
    }

    async waitForContinueWatchingTrayToBeReady(timeout: number = 30000): Promise<void> {
        await this.ensureContinueWatchingTrayInView(timeout);
    }

    async scrollContinueWatchingTray(direction: 'left' | 'right', timeout: number = 30000): Promise<boolean> {
        const isInView = await this.ensureContinueWatchingTrayInView(timeout);
        if (!isInView) {
            return false;
        }

        const section = this.getContinueWatchingRailLocator();
        const boundingBox = await section.boundingBox();
        if (!boundingBox) {
            return false;
        }

        const hoverX = direction === 'right' ? boundingBox.x + boundingBox.width - 30 : boundingBox.x + 30;
        const hoverY = boundingBox.y + boundingBox.height / 2;

        await this.page.mouse.move(hoverX, hoverY);
        await this.page.waitForTimeout(500);

        const arrowLocator = this.getContinueWatchingArrowLocator(direction);
        const arrowVisible = await arrowLocator.isVisible().catch(() => false);
        if (!arrowVisible) {
            return false;
        }

        await arrowLocator.hover({ timeout: 5000 }).catch(() => undefined);
        await arrowLocator.click({ timeout: 5000 }).catch(() => undefined);
        await this.page.waitForTimeout(1000);
        await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);

        return true;
    }

    async isContinueWatchingTrayTitleVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.continueWatchingTrayTitle, 10000);
    }

    async getContinueWatchingTraySection(): Promise<any> {
        return this.getContinueWatchingRailLocator();
    }

    async removeFirstContinueWatchingItem(): Promise<{ clicked: boolean; confirmationVisible: boolean }> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return { clicked: false, confirmationVisible: false };
        }

        const card = section.locator('img[alt]:not([alt="arrow-right"])').first();
        if (!await card.count()) {
            return { clicked: false, confirmationVisible: false };
        }

        await card.hover({ timeout: 20000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);

        const removeButton = section.locator(this.continueWatchingRemoveButton.selector).first();
        await removeButton.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
        const buttonVisible = await removeButton.isVisible().catch(() => false);
        if (!buttonVisible) {
            return { clicked: false, confirmationVisible: false };
        }

        await removeButton.click({ timeout: 20000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForTimeout(3000);

        const confirmationLocator = this.page.getByText(/removed/i).first();
        const confirmationVisible = await confirmationLocator.isVisible().catch(() => false);
        return { clicked: true, confirmationVisible };
    }

    async getContinueWatchingTrayItemCount(): Promise<number> {
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) return 0;
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) return 0;
        return await section.locator('img[alt]:not([alt="arrow-right"])').count();
    }

    async getContinueWatchingTrayItemDetails(): Promise<Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }>> {
        const title = this.getContinueWatchingTitleLocator();
        if (!await title.count()) return [];
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) return [];

        const cards = section.locator('img[alt]:not([alt="arrow-right"])');
        const count = await cards.count();
        const details: Array<{ title: string; hasThumbnail: boolean; hasProgress: boolean }> = [];

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const alt = (await card.getAttribute('alt')) || '';
            const text = (await card.textContent()) || '';
            const hasThumbnail = !!alt || (await card.getAttribute('src')) !== null;
            const hasProgress = /progress|resume|%/i.test(text) || (await card.locator('[class*="progress"], [aria-label*="progress"], [data-testid*="progress"]').count()) > 0;
            details.push({ title: alt.trim() || text.trim(), hasThumbnail, hasProgress });
        }

        return details;
    }

    async getContinueWatchingItemsCount(): Promise<number> {
        const header = this.page.locator('text=Continue Watching').first();
        if (!await header.count()) return 0;
        const container = header.locator('xpath=following-sibling::*').first();
        if (!await container.count()) return 0;
        // Count likely content item elements (images as proxy)
        const images = container.locator('img');
        const count = await images.count();
        return count;
    }

    async getContinueWatchingItemsDetails(): Promise<Array<{ title: string; hasProgress: boolean }>> {
        const header = this.page.locator('text=Continue Watching').first();
        if (!await header.count()) return [];
        const container = header.locator('xpath=following-sibling::*').first();
        if (!await container.count()) return [];

        const images = container.locator('img');
        const count = await images.count();
        const details: Array<{ title: string; hasProgress: boolean }> = [];

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const alt = (await img.getAttribute('alt')) || '';

            // Determine a nearby progress indicator or recently_added marker
            const ancestor = img.locator('xpath=ancestor::div[1]');
            const progressSelectors = [
                '.progress',
                '[aria-label*="progress"]',
                '[class*="recent"]',
                '[class*="progress"]',
                'img[alt*="recently"]',
                'img[src*="recently"]'
            ];

            let hasProgress = false;
            for (const sel of progressSelectors) {
                try {
                    const found = ancestor.locator(sel);
                    if (await found.count()) { hasProgress = true; break; }
                } catch {
                    // ignore selector errors
                }
            }

            // Fallback: check for any text like 'Resume' or '%' near the image
            if (!hasProgress) {
                const nearbyText = ancestor.locator('xpath=.//*[contains(text(),"Resume") or contains(text(),"resumo") or contains(text(),"%")]');
                if (await nearbyText.count()) hasProgress = true;
            }

            details.push({ title: alt.trim(), hasProgress });
        }

        return details;
    }

    async isTrendingMoviesRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.trendingMoviesRail, 10000);
    }

    async isTrendingShowsRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.trendingShowsRail, 10000);
    }

    async isMyWatchlistRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.myWatchlistRail, 10000);
    }

    async isTopStreamedRailVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.topStreamedRail, 10000);
    }

    async clickSearchBar(): Promise<void> {
        logger.elementInteraction('click', 'Search bar');
        await this.pageUtils.safeClick(this.searchBarIcon);
    }

    async getSearchBarPlaceholder(): Promise<string> {
        const locator = this.page.locator(this.searchBar.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.getAttribute('placeholder')) || '';
    }

    async clickAccountIcon(): Promise<void> {
        logger.elementInteraction('click', 'Account icon');
        await this.pageUtils.safeClick(this.accountIcon);
    }

    async isSignOutOptionVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.signOutOption, 10000);
    }

    async clickLoginWithTVProvider(): Promise<void> {
        logger.elementInteraction('click', 'Login with TV Provider option');
        await this.pageUtils.safeClick(this.tvProviderLoginOption);
    }

    async selectTVProvider(providerName: string): Promise<void> {
        logger.elementInteraction('click', `${providerName} provider option`);
        const providerLocator = this.page.getByRole('button', { name: providerName }).first();
        await providerLocator.waitFor({ state: 'visible', timeout: 20000 });
        await providerLocator.click();
    }

    async login(email: string, password: string): Promise<void> {
        logger.step('Performing login with provided credentials');
        await this.clickEmailField();
        await this.enterEmail(email);
        await this.clickPasswordField();
        await this.enterPassword(password);
        await this.clickContinue();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
            logger.debug('Page did not reach networkidle after login');
        });
    }
    async enterProviderEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'TV Provider email field');
        await this.pageUtils.safeType(this.providerEmailField, email);
    }

    async enterProviderPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'TV Provider password field');
        await this.pageUtils.safeType(this.providerPasswordField, password);
    }

    async clickProviderSignIn(): Promise<void> {
        logger.elementInteraction('click', 'Sign in button for TV Provider');
        await this.pageUtils.safeClick(this.providerSignInButton);
    }

    async isLoginSuccessful(): Promise<boolean> {
        const profileVisible = await this.pageUtils.isVisible(this.profileLink, 5000);
        if (profileVisible) {
            return true;
        }

        const homeTabVisible = await this.pageUtils.isVisible(
            { selector: 'text="Home"' },
            5000
        );
        return homeTabVisible;
    }

    async getCreateAccountHeadingText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.createAccountHeading, 10000);
    }

    async isCreateAccountEmailFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountEmailField, 10000);
    }

    async isCreateAccountPasswordFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountPasswordField, 10000);
    }

    async isTermsCheckboxVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.termsCheckbox, 10000);
    }

    async isMarketingCheckboxVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.marketingCheckbox, 10000);
    }

    async isCreateAccountContinueButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountContinueButton, 10000);
    }

    async isAlreadyHaveAccountTextVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.alreadyHaveAccountText, 10000);
    }

    async isCreateAccountLoginLinkVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.createAccountLoginLink, 10000);
    }
}
