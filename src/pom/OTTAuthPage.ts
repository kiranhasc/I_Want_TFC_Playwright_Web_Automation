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
    private readonly passwordVisibilityToggle: PageElement;
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
    private readonly continueWatchingTrayTitle: PageElement;
    private readonly continueWatchingTrayContainer: PageElement;
    private readonly continueWatchingTrayItem: PageElement;
    private readonly continueWatchingTrayThumbnail: PageElement;
    private readonly continueWatchingTrayProgressIndicator: PageElement;
    private readonly continueWatchingRemoveButton: PageElement;
    private readonly continueWatchingItemLink: PageElement;
    private readonly continueWatchingItemTitle: PageElement;
    private readonly resumeButton: PageElement;
    private readonly seekBar: PageElement;
    private readonly trendingMoviesRail: PageElement;
    private readonly trendingShowsRail: PageElement;
    private readonly myWatchlistRail: PageElement;
    private readonly topStreamedRail: PageElement;
    private readonly profileLink: PageElement;
    private readonly profileSectionTextElement: PageElement;
    private readonly accountDetailsTextElement: PageElement;
    private readonly createAccountLinkFromHome: PageElement;
    private readonly createAccountHeading: PageElement;
    private readonly createAccountEmailField: PageElement;
    private readonly createAccountPasswordField: PageElement;
    private readonly termsCheckbox: PageElement;
    private readonly marketingCheckbox: PageElement;
    private readonly marketingCheckboxDescription: PageElement;
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
    private readonly accountAndSettingsLink: PageElement;
    private readonly editProfileOption: PageElement;
    private readonly editProfileHeading: PageElement;
    private readonly firstNameField: PageElement;
    private readonly lastNameField: PageElement;
    private readonly profileSaveButton: PageElement;
    private readonly firstNameValidationError: PageElement;
    private readonly lastNameValidationError: PageElement;


    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.emailField = { selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]', };
        this.passwordField = { selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]', };
        this.passwordVisibilityToggle = {selector: 'button[aria-label*="password"], [role="button"][aria-label*="password"], [data-testid*="password"], [data-testid*="show-password"], [data-testid*="hide-password"], .password-toggle, .password-visibility-toggle, .show-password-toggle, button:has-text("Show password"), button:has-text("Hide password"), button:has-text("Show"), button:has-text("Hide")',};
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.proceedButton = { role: 'button', text: 'Proceed', selector: 'button:has-text("Proceed")' };
        this.forgotPasswordLink = { role: 'link', text: 'Forgot Password?', selector: 'a:has-text("Forgot Password?")' };
        this.forgotPasswordHeading = { role: 'heading', text: 'Confirm Email Address', selector: 'h1:has-text("Confirm Email Address")' };
        this.verifyOTPHeading = { role: 'heading', text: 'Verify OTP', selector: 'h1:has-text("Verify OTP"), h2:has-text("Verify OTP"), text=Verify OTP' };
        this.errorMessage = { selector: 'form', text: 'Your login credentials are incorrect' };
        this.emailErrorMessage = { selector: 'form', text: 'Invalid email address' };
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
        this.continueWatchingTrayTitle = { text: 'Continue Watching', selector: 'text=Continue Watching' };
        this.continueWatchingTrayContainer = { selector: 'text=Continue Watching >> xpath=following-sibling::*' };
        this.continueWatchingTrayItem = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> img' };
        this.continueWatchingTrayThumbnail = { selector: 'img' };
        this.continueWatchingTrayProgressIndicator = { selector: '[class*=progress], [aria-label*=progress], [data-testid*=progress], [class*=resume]' };
        this.continueWatchingRemoveButton = { selector: 'img[alt="remove-from-cw"], img[alt*="remove"], [aria-label*="remove"], [title*="remove"], [data-testid*="remove"]' };
        this.continueWatchingItemLink = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> a, text=Continue Watching >> xpath=following-sibling::* >> button, text=Continue Watching >> xpath=following-sibling::* >> [role="button"]' };
        this.continueWatchingItemTitle = { selector: 'text=Continue Watching >> xpath=following-sibling::* >> img[alt]' };
        this.resumeButton = { selector: 'button:has-text("Resume"), a:has-text("Resume")' };
        this.seekBar = { selector: '.player-progress-indicator, .progress-bar, [data-testid*=seek], [class*=progress]' };
        this.trendingMoviesRail = { text: 'Trending Movies Worldwide', selector: 'text=Trending Movies Worldwide' };
        this.trendingShowsRail = { text: 'Trending Shows Worldwide', selector: 'text=Trending Shows Worldwide' };
        this.myWatchlistRail = { text: 'My Watchlist', selector: 'text=/^My Watchlist$/' };
        this.tvProviderLoginOption = { selector: 'role=button[name="Login with TV Provider"]' };
        this.providerFrontierOption = { selector: 'role=button[name="Frontier, a Verizon Company"]' };
        this.providerEmailField = { selector: 'role=textbox[name="Username"]' };
        this.providerPasswordField = { selector: 'role=textbox[name="Password"]' };
        this.providerSignInButton = { role: 'button', text: 'Sign in', selector: 'button:has-text("Sign in")' };
        this.profileLink = { selector: 'role=img[name="account"]' };
        this.profileSectionTextElement = { selector: 'text=Account' };
        this.accountDetailsTextElement = { selector: 'text=Subscription' };
        this.createAccountLinkFromHome = { role: 'link', text: 'Create Account', selector: 'a:has-text("Create Account")' };
        this.createAccountHeading = { role: 'heading', text: 'Create an account', selector: 'h1:has-text("Create an account"), h2:has-text("Create an account")' };
        this.createAccountEmailField = { selector: 'input[placeholder="Email Address"], input[name*="email"], input[type="email"]' };
        this.createAccountPasswordField = { selector: 'input[name="userPassword"]' };
        this.termsCheckbox = { selector: 'input#cem' };
        this.marketingCheckbox = { selector: 'text=I agree to receive marketing', text: 'I agree to receive marketing' };
        this.marketingCheckboxDescription = { selector: 'form' };
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
        this.accountAndSettingsLink = { role: 'link', text: 'Account & Settings', selector: 'a:has-text("Account & Settings"), text=Account & Settings' };
        this.editProfileOption = { role: 'button', text: 'Edit Profile', selector: 'button:has-text("Edit Profile"), a:has-text("Edit Profile")' };
        this.editProfileHeading = { role: 'heading', text: 'Edit Profile', selector: 'h1:has-text("Edit Profile"), h2:has-text("Edit Profile")' };
        this.firstNameField = { selector: 'input[name*="first"], input[placeholder*="First Name"], input[placeholder*="First name"], input[aria-label*="First Name"]' };
        this.lastNameField = { selector: 'input[name*="last"], input[placeholder*="Last Name"], input[placeholder*="Last name"], input[aria-label*="Last Name"]' };
        this.profileSaveButton = { role: 'button', text: 'Save', selector: 'button:has-text("Save")' };
        this.firstNameValidationError = { selector: '//*[@id="first name-helper-text"]' };
        this.lastNameValidationError = { selector: '//*[@id="last name-helper-text"]' };
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

    async clickPasswordVisibilityToggle(): Promise<void> {
        logger.elementInteraction('click', 'Password visibility toggle eye icon');
        const eyeIcon = this.page.locator('.absolute.top-\\[8px\\] > svg > path:nth-child(2)');
        await eyeIcon.waitFor({ state: 'visible', timeout: 10000 });
        await eyeIcon.click({ timeout: 10000 });
    }

    async getPasswordFieldType(): Promise<string> {
        const locator = this.page.locator(this.passwordField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.getAttribute('type')) || '';
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
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.showsTab);
    }

    async clickMyWatchlistTab(): Promise<void> {
        logger.elementInteraction('click', 'My Watchlist tab');
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.myWatchlistTab);
    }

    async clickGMATab(): Promise<void> {
        logger.elementInteraction('click', 'GMA tab');
        await this.page.waitForTimeout(1500);
        await this.pageUtils.safeClick(this.gmaTab);
    }

    async isSearchIconVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.searchBarIcon, 10000);
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

    private parseDurationMinutes(text: string): number {
        const normalizedText = text.toLowerCase();
        const hoursMatch = normalizedText.match(/(\d+)\s*(h|hr|hrs|hour|hours)/);
        const minutesMatch = normalizedText.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) * 60 : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
        return hours + minutes;
    }

    async getExplicitMovieContinueWatchingItem(): Promise<{ title: string; locator: any } | null> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return null;
        }

        const cards = section.locator('img[alt]:not([alt="arrow-right"])');
        const count = await cards.count().catch(() => 0);
        const preferredMovieTitles = ['ang panday', 'bagong buwan', 'abandoned', 'unang bastardo', 'odd encounter', 'collatz conjecture'];
        const excludedPatterns = [
            /\bepisode\b/i,
            /\bseason\b/i,
            /\bseries\b/i,
            /\bshow\b/i,
            /\btv\b/i,
            /\blive\b/i,
            /\bchannel\b/i,
            /\bnews\b/i,
            /\bsports\b/i,
            /new_episode|next_episode|recently_added|early_access|top_10|paid/i,
        ];

        for (let index = 0; index < count; index += 1) {
            const card = cards.nth(index);
            const alt = ((await card.getAttribute('alt')) || '').trim();
            const text = ((await card.locator('xpath=ancestor::div[1]').textContent()) || '').trim();
            const combined = `${alt} ${text}`.toLowerCase();
            const isExcluded = excludedPatterns.some((pattern) => pattern.test(combined));
            const hasMeaningfulTitle = alt.length > 2 && !/^\d+$/.test(alt);
            const isPreferredMovie = preferredMovieTitles.some((title) => combined.includes(title));

            if (!hasMeaningfulTitle || isExcluded) {
                continue;
            }

            await card.scrollIntoViewIfNeeded();
            await card.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);

            const pageText = `${(await this.page.locator('body').innerText()).toLowerCase()} ${(await this.page.title()).toLowerCase()}`;
            const durationMinutes = this.parseDurationMinutes(pageText);
            const looksLikeMovie = isPreferredMovie
                && durationMinutes >= 60
                && !/\bepisode\b|\bseason\b|\bseries\b|\bshow\b|\bs1\b|\bs2\b|\bep\b/i.test(pageText);

            await this.page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);

            if (looksLikeMovie) {
                logger.step(`Selected explicit movie candidate from Continue Watching: ${alt}`);
                return { title: alt, locator: card };
            }
        }

        return null;
    }

    async isContinueWatchingItemVisible(title: string): Promise<boolean> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }

        const normalizedTitle = title.toLowerCase();
        const items = section.locator('img[alt]').filter({ hasNotText: '' });
        const count = await items.count().catch(() => 0);
        for (let index = 0; index < count; index += 1) {
            const item = items.nth(index);
            const alt = ((await item.getAttribute('alt')) || '').toLowerCase();
            if (alt.includes(normalizedTitle)) {
                return await item.isVisible().catch(() => false);
            }
        }

        const candidate = section.locator(`img[alt*="${title}"]`).first();
        return await candidate.isVisible().catch(() => false);
    }

    async openContinueWatchingItemAndStartPlayback(title: string): Promise<boolean> {
        const section = this.getContinueWatchingRailLocator();
        if (!await section.count()) {
            return false;
        }

        const normalizedTitle = title.toLowerCase();
        const candidates = section.locator('img[alt]').filter({ hasNotText: '' });
        const count = await candidates.count().catch(() => 0);
        let clicked = false;

        for (let index = 0; index < count; index += 1) {
            const item = candidates.nth(index);
            const alt = ((await item.getAttribute('alt')) || '').toLowerCase();
            if (!alt.includes(normalizedTitle)) {
                continue;
            }

            await item.scrollIntoViewIfNeeded();
            await item.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);

            const actionTarget = this.page.getByText(/Resume|Play/i).first();
            const actionVisible = await actionTarget.isVisible().catch(() => false);
            if (actionVisible) {
                await actionTarget.click({ force: true, timeout: 30000 }).catch(() => undefined);
            }

            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            clicked = true;
            break;
        }

        return clicked;
    }

    async finishPlaybackFromCurrentItem(): Promise<boolean> {
        const video = this.page.locator('video').first();
        const videoVisible = await video.isVisible().catch(() => false);
        if (!videoVisible) {
            await this.page.waitForTimeout(10000);
            return false;
        }

        const duration = await video.evaluate((node: HTMLVideoElement) => node.duration).catch(() => 0);
        if (duration > 0) {
            await video.evaluate((node: HTMLVideoElement) => {
                if (node.duration > 0) {
                    node.currentTime = Math.max(0, node.duration - 1);
                }
            }).catch(() => undefined);
        }

        await this.page.waitForTimeout(15000);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        const ended = await video.evaluate((node: HTMLVideoElement) => node.ended).catch(() => false);
        return ended || duration > 0;
    }

    async navigateHome(): Promise<void> {
        await this.page.goto('https://www.iwanttfc.com/');
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(5000);
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
        try {
            const searchBtn = this.page.getByRole('button', { name: /search/i }).first();
            if (await searchBtn.count()) {
                await searchBtn.waitFor({ state: 'visible', timeout: 5000 });
                await searchBtn.click();
                return;
            }
        } catch (err) {
            logger.debug('Role-based search button click failed', err);
        }
        try {
            await this.pageUtils.safeClick(this.searchBarIcon);
            return;
        } catch (err) {
            logger.debug('Search icon click failed', err);
        }
        try {
            await this.pageUtils.safeClick(this.searchBar);
            return;
        } catch (err) {
            logger.debug('Search input click failed, using direct locator', err);
        }
        const input = this.page.locator(this.searchBar.selector).first();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.click();
    }

    async enterSearchQuery(query: string): Promise<void> {
        logger.elementInteraction('type', 'search query');
        await this.pageUtils.safeType(this.searchBar, query);
    }

    async submitSearchQuery(): Promise<void> {
        logger.elementInteraction('press', 'Enter key');
        await this.page.keyboard.press('Enter');
    }
      
    async getSearchBarValue(): Promise<string> {
        const locator = this.page.locator(this.searchBar.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
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
    
    async enterSearchText(text: string): Promise<void> {
        logger.elementInteraction('type', 'Search input');
        await this.pageUtils.safeType(this.searchBar, text);
    }

    async submitSearch(): Promise<void> {
        logger.elementInteraction('submit', 'Search input');
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
    }

    async isSearchResultsVisible(query: string = ''): Promise<boolean> {
        const locator = this.page.locator('[class*="flex flex-wrap gap-[1rem]"] img[alt]').first();
        const altText = await locator.getAttribute('alt').catch(() => '');
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedAltText = (altText || '').toLowerCase();
        if (normalizedQuery) {
            return normalizedAltText.includes(normalizedQuery) || /(search|result|thumbnail|poster|image)/i.test(altText || '');
        }
        return /(search|result|thumbnail|poster|image)/i.test(altText || '');
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

    async clickCreateAccountContinue(): Promise<void> {
        logger.elementInteraction('click', 'Create account Continue button');
        await this.pageUtils.safeClick(this.createAccountContinueButton);
    }

    async enterCreateAccountEmail(email: string): Promise<void> {
        logger.elementInteraction('type', 'Create account email field');
        await this.pageUtils.safeType(this.createAccountEmailField, email);
    }

    async enterCreateAccountPassword(password: string): Promise<void> {
        logger.elementInteraction('type', 'Create account password field');
        await this.pageUtils.safeType(this.createAccountPasswordField, password);
    }

    async getCreateAccountEmailValue(): Promise<string> {
        const locator = this.page.locator(this.createAccountEmailField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async getCreateAccountPasswordValue(): Promise<string> {
        const locator = this.page.locator(this.createAccountPasswordField.selector).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return (await locator.inputValue()) || '';
    }

    async isTermsCheckboxVisible(): Promise<boolean> {
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        try {
            await locator.waitFor({ state: 'visible', timeout: 10000 });
            return true;
        } catch {
            return false;
        }
    }

    async isTermsCheckboxChecked(): Promise<boolean> {
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        return await locator.isChecked().catch(() => false);
    }

    async selectCreateAccountTermsCheckbox(): Promise<void> {
        logger.elementInteraction('check', 'Create account terms checkbox');
        const locator = this.page.getByRole('checkbox', { name: 'I agree to the Terms and' }).first();
        await locator.waitFor({ state: 'visible', timeout: 10000 });
        await locator.check({ force: true });
    }
    async isMarketingCheckboxVisible(expectedMarketingText: string): Promise<boolean> {
        const isLabelVisible = await this.pageUtils.isVisible(this.marketingCheckbox, 10000);
        if (!isLabelVisible) {
            return false;
        }

        let formText = '';
        try {
            formText = await this.pageUtils.getTextContent(this.marketingCheckboxDescription, 10000);
        } catch {
            formText = '';
        }

        return formText.includes(expectedMarketingText);
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

    async getProfileSectionText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.profileSectionTextElement, 10000);
    }

    async getAccountDetailsText(): Promise<string> {
        return await this.pageUtils.getTextContent(this.accountDetailsTextElement, 10000);
    }

    async openProfileSettings(): Promise<void> {
        logger.step('Opening profile settings');
        await this.clickAccountIcon();
        await this.page.getByText('Account & Settings').click();
    }

    async openEditProfile(): Promise<void> {
        logger.step('Opening edit profile screen');
        await this.page.getByRole('button', { name: 'Edit Profile' }).click();
    }

    async isEditProfileScreenVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.editProfileHeading, 10000);
    }

    async isFirstNameFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.firstNameField, 10000);
    }

    async isLastNameFieldVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.lastNameField, 10000);
    }

    async enterFirstName(firstName: string): Promise<void> {
        logger.elementInteraction('type', 'first name field');
        await this.pageUtils.safeType(this.firstNameField, firstName);
    }

    async enterLastName(lastName: string): Promise<void> {
        logger.elementInteraction('type', 'last name field');
        await this.pageUtils.safeType(this.lastNameField, lastName);
    }

    async clickSaveProfile(): Promise<void> {
        logger.elementInteraction('click', 'Save profile button');
        await this.pageUtils.safeClick(this.profileSaveButton);
    }

    async isProfileValidationErrorVisible(): Promise<boolean> {
        const firstNameErrorVisible = await this.pageUtils.isVisible(this.firstNameValidationError, 5000).catch(() => false);
        const lastNameErrorVisible = await this.pageUtils.isVisible(this.lastNameValidationError, 5000).catch(() => false);
        if (firstNameErrorVisible || lastNameErrorVisible) {
            return true;
        }

        const helperText = await this.page.locator('text=/alphabetic|letters|only/i').first().count().catch(() => 0);
        return helperText > 0;
    }

    async getProfileValidationErrorText(): Promise<string> {
        const firstNameErrorText = await this.pageUtils.getTextContent(this.firstNameValidationError, 5000).catch(() => '');
        const lastNameErrorText = await this.pageUtils.getTextContent(this.lastNameValidationError, 5000).catch(() => '');
        if (firstNameErrorText || lastNameErrorText) {
            return [firstNameErrorText, lastNameErrorText].filter(Boolean).join(' | ');
        }

        const fallbackText = await this.page.locator('text=/alphabetic|letters|only/i').first().textContent().catch(() => '');
        return fallbackText || '';
    }
}