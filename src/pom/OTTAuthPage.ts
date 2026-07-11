import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';

export class OTTAuthPage {
    private page: Page;
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
    private readonly accountAndSettingsOption: PageElement;
    private readonly editProfileButton: PageElement;
    private readonly continueWatchingRail: PageElement;
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
    private readonly helpAndSupportLink: PageElement;
    private readonly termsAndConditionsLink: PageElement;
    private readonly privacyPolicyLink: PageElement;
    private readonly cookiePolicyLink: PageElement;
    private readonly pageHeading: PageElement;


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
        this.homeTab = { text: 'Home', selector: 'div#home' };
        this.loadingIndicator = { text: 'Loading..', selector: 'text=Loading..' };
        this.moviesTab = { selector: 'div#movies' };
        this.showsTab = { text: 'Shows', selector: 'div#shows' };
        this.myWatchlistTab = { text: 'My Watchlist', selector: 'div#my_watchlist' };
        this.gmaTab = { selector: 'div#gma' };
        this.searchBarIcon = { selector: 'img[alt="search-icon"]' };
        this.searchBar = { selector: 'input[placeholder*="Search"], input[type="search"], [placeholder*="Search"], [aria-label*="Search"], [title*="Search"], [data-testid*="search"]' };
        this.accountIcon = { selector: 'img[alt="account"]' };
        this.signOutOption = { text: 'Sign Out', selector: 'text=Sign Out' };
        this.accountAndSettingsOption = { selector: 'img[alt="Account & Settings"]' };
        this.editProfileButton = { selector: 'text=Edit Profile, button:has-text("Edit Profile"), a:has-text("Edit Profile")' };
        this.continueWatchingRail = { text: 'Continue Watching', selector: 'text=Continue Watching' };
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
        this.useMobileNumberLink = { selector: '//p[contains(normalize-space(), "Click here to use Mobile Number")]' };
        this.countryCodeDropdown = { selector: 'select, [role="combobox"]' };
        this.countryCodeOption = { selector: 'text=63' };
        this.mobileNumberField = { selector: '#userMobile, input[type="tel"], input[name*="phone"], input[name*="mobile"]' };
        this.mobilePasswordField = { selector: 'input[placeholder*="Password"], input[type="password"], input[name*="password"]' };
        this.helpAndSupportLink = { role: 'link', text: 'Help and Support', selector: 'a:has-text("Help and Support")' };
        this.termsAndConditionsLink = { role: 'link', text: 'Terms and Conditions', selector: 'a:has-text("Terms and Conditions")' };
        this.privacyPolicyLink = { role: 'link', text: 'Privacy Policy', selector: 'a:has-text("Privacy Policy")' };
        this.cookiePolicyLink = { role: 'link', text: 'Cookie Policy', selector: 'a:has-text("Cookie Policy")' };
        this.pageHeading = { selector: 'h1, h2, [role="heading"]' };
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
        await this.pageUtils.safeClick(this.emailField);
    }

    async enterEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'email field');
        await this.pageUtils.safeType(this.emailField, email);
    }

    async clickPasswordField(): Promise<void> {
        logger.elementInteraction('click', 'password field');
        await this.pageUtils.safeClick(this.passwordField);
    }

    async enterPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'password field');
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

    async isLoginFormVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailField, 10000);
    }

    async isSupportLinksVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.helpAndSupportLink, 10000)
            && await this.pageUtils.isVisible(this.termsAndConditionsLink, 10000)
            && await this.pageUtils.isVisible(this.privacyPolicyLink, 10000)
            && await this.pageUtils.isVisible(this.cookiePolicyLink, 10000);
    }

    async scrollToSupportLinks(): Promise<void> {
        await this.page.locator(this.helpAndSupportLink.selector).first().scrollIntoViewIfNeeded();
    }

    async isHomeTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.homeTab, 10000);
    }

    async isMoviesTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.moviesTab, 10000);
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

    async openHelpAndSupportPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Help and Support link');
        return await this.openLinkInNewTab(this.helpAndSupportLink, expectedHeading);
    }

    async openTermsPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Terms and Conditions link');
        return await this.openLinkInNewTab(this.termsAndConditionsLink, expectedHeading, false);
    }

    async openTermsPageAndStayOpen(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Terms and Conditions link');
        return await this.openLinkInNewTab(this.termsAndConditionsLink, expectedHeading, true);
    }

    async openTermsPageAndNavigateToSection(sectionLinkText: string, submoduleName: string, expectedHeading?: string, expectedUrlPart?: string): Promise<boolean> {
        logger.step(`Opening Terms page and navigating to section: ${sectionLinkText}`);

        try {
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 8000 });
            await this.pageUtils.safeClick(this.termsAndConditionsLink);

            const popup = await popupPromise.catch(() => undefined);
            if (!popup || popup.url() === 'about:blank') {
                logger.warn('No popup detected');
                return false;
            }

            await popup.waitForLoadState('domcontentloaded').catch(() => undefined);

            // Navigate directly to the section URL
            if (expectedUrlPart) {
                const baseUrl = popup.url().split('/legal/')[0] + `/legal/${submoduleName}/`;
                const sectionUrl = baseUrl + expectedUrlPart + '/';

                await popup.goto(sectionUrl, { waitUntil: 'domcontentloaded' });

                const urlMatches = popup.url().toLowerCase().includes(expectedUrlPart.toLowerCase());
                const headingVisible = await this.isPageHeadingVisibleOnPage(popup, expectedHeading);


                this.page = popup;
                return headingVisible && urlMatches;
            }

            return false;
        } catch (error) {
            logger.warn(`Failed to navigate to Terms section: ${error}`);
            return false;
        }
    }

    async openPrivacyPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Privacy Policy link');
        return await this.openLinkInNewTab(this.privacyPolicyLink, expectedHeading);
    }

    async openCookiePolicyPage(expectedHeading?: string): Promise<boolean> {
        logger.elementInteraction('click', 'Cookie Policy link');
        return await this.openLinkInNewTab(this.cookiePolicyLink, expectedHeading);
    }

    async openTermsSectionFromLeftNavigation(sectionLinkText: string, expectedHeading?: string, expectedUrlPart?: string): Promise<boolean> {
        try {
            logger.step(`Navigating to Terms section: ${sectionLinkText}`);
            await this.page.waitForTimeout(3000);
            const sectionLink = this.page.locator(`a:has-text("${sectionLinkText}")`).first();
            const count = await sectionLink.waitFor({ state: 'attached', timeout: 10000 }).then(() => 1).catch(() => 0);
            if (!count) {
                logger.warn(`Section link not found in DOM: ${sectionLinkText}`);
                return false;
            }
            logger.step(`Found section link in DOM, waiting before click`);
            await this.page.waitForTimeout(1500);
            if (this.page.isClosed()) {
                logger.warn('Page was closed before clicking section link');
                return false;
            }
            await sectionLink.scrollIntoViewIfNeeded().catch(() => {
                logger.warn('Could not scroll link into view, proceeding anyway');
            });
            logger.step(`Clicking section link with force`);
            await sectionLink.click({ force: true, timeout: 10000 });
            logger.step(`Waiting for page load after section link click`);
            await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
            await this.page.waitForTimeout(3000);
            const currentUrl = this.page.url().toLowerCase();
            const urlMatches = !!expectedUrlPart && currentUrl.includes(expectedUrlPart.toLowerCase());
            const headingVisible = await this.isPageHeadingVisibleOnPage(this.page, expectedHeading);
            logger.step(`Section navigation result - URL matches: ${urlMatches}, Heading visible: ${headingVisible}`);
            return headingVisible || urlMatches;
        } catch (error) {
            logger.warn(`Failed to navigate to Terms section: ${error}`);
            return false;
        }
    }

    getCurrentUrl(): string {
        return this.page.url();
    }

    private async openLinkInNewTab(link: PageElement, expectedHeading?: string, keepPageOpen: boolean = false): Promise<boolean> {
        const mainPage = this.page;
        const initialUrl = mainPage.url();

        try {
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 8000 });
            await this.pageUtils.safeClick(link);
            await mainPage.waitForTimeout(1000);

            const popup = await popupPromise.catch(() => undefined);
            if (popup && popup.url() !== 'about:blank') {
                logger.step(`Popup detected: ${popup.url()}`);
                await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
                await popup.waitForURL((url) => {
                    const currentUrl = url.toString();
                    return !!currentUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('about:');
                }, { timeout: 15000 }).catch(() => undefined);
                await popup.waitForTimeout(3000);

                const headingVisible = await this.isPageHeadingVisibleOnPage(popup, expectedHeading);

                if (keepPageOpen) {
                    logger.step('Keeping popup open, switching context to new tab');
                    this.page = popup;
                    return headingVisible;
                }

                await popup.close().catch(() => undefined);
                this.page = mainPage;
                await mainPage.waitForLoadState('domcontentloaded');
                return headingVisible;
            }
            logger.step('No popup detected, checking if URL changed in main page');
            await mainPage.waitForURL((url) => {
                const currentUrl = url.toString();
                return !!currentUrl && currentUrl !== initialUrl && currentUrl !== 'about:blank' && !currentUrl.startsWith('about:');
            }, { timeout: 15000 }).catch(() => undefined);
            await mainPage.waitForLoadState('domcontentloaded').catch(() => undefined);
            await mainPage.waitForTimeout(3000).catch(() => undefined);
            return await this.isPageHeadingVisibleOnPage(mainPage, expectedHeading);
        } catch (error) {
            logger.warn(`Error in openLinkInNewTab: ${error}`);
            await mainPage.waitForLoadState('domcontentloaded').catch(() => undefined);
            await mainPage.waitForTimeout(3000).catch(() => undefined);
            return await this.isPageHeadingVisibleOnPage(mainPage, expectedHeading);
        }
    }

    async isPageHeadingVisible(expectedHeading?: string): Promise<boolean> {
        return await this.isPageHeadingVisibleOnPage(this.page, expectedHeading);
    }

    async isPageHeadingVisibleOnPage(targetPage: Page, expectedHeading?: string): Promise<boolean> {
        if (!expectedHeading) {
            return false;
        }
        const normalizedHeading = expectedHeading.toLowerCase();
        try {
            const visibleHeading = await targetPage
                .getByText(expectedHeading, { exact: true })
                .first()
                .isVisible()
                .catch(() => false);
            if (visibleHeading) {
                return true;
            }
            const bodyText = await targetPage.locator('body').textContent().catch(() => '');
            if (bodyText?.toLowerCase().includes(normalizedHeading)) {
                return true;
            }
            const pageTitle = await targetPage.title().catch(() => '');
            if (pageTitle.toLowerCase().includes(normalizedHeading)) {
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    async goBack(): Promise<void> {
        try {
            await this.page.goBack();
            await this.page.waitForLoadState('domcontentloaded');
        } catch {
            await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        }
    }

    async closeCurrentTabAndReturnToMain(): Promise<void> {
        const pages = this.page.context().pages();
        const mainPage = pages.find((candidate) => candidate !== this.page);

        if (mainPage) {
            try {
                await this.page.close();
                await mainPage.bringToFront();
                await mainPage.waitForLoadState('domcontentloaded');
                return;
            } catch {
                // fall back to the primary page
            }
        }

        await this.page.bringToFront();
        await this.page.waitForLoadState('domcontentloaded');
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

    async searchAndGetResults(query: string): Promise<boolean> {
        logger.step(`Searching for: ${query}`);
        const searchInput = this.page.locator(this.searchBar.selector).first();
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.fill(query);
        await this.page.waitForTimeout(2000);
        const searchResultsContainer = this.page.locator('[class*="search-result"], [class*="result"], [data-testid*="result"], h2, h3').count();
        const resultsCount = await searchResultsContainer.catch(() => 0);
        const pageHasContent = await this.page.locator('body').textContent();
        const hasResults = pageHasContent && pageHasContent.toLowerCase().includes(query.toLowerCase());
        logger.step(`Search completed - Results count: ${resultsCount}, Has query text: ${hasResults}`);
        return hasResults || resultsCount > 0;
    }

    async clickAccountIcon(): Promise<void> {
        logger.elementInteraction('click', 'Account icon');
        await this.pageUtils.safeClick(this.accountIcon);
    }

    async clickSignOut(): Promise<void> {
        logger.elementInteraction('click', 'Sign Out option');
        await this.pageUtils.safeClick(this.signOutOption);
    }

    async isSignOutOptionVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.signOutOption, 10000);
    }

    async isAccountAndSettingsVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.accountAndSettingsOption, 10000);
    }

    async clickAccountAndSettings(): Promise<void> {
        logger.elementInteraction('click', 'Account & Settings option');
        await this.pageUtils.safeClick(this.accountAndSettingsOption);
    }

    async isEditProfileButtonVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.editProfileButton, 10000);
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
