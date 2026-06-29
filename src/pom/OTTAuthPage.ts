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
    private readonly forgotPasswordLink: PageElement;
    private readonly forgotPasswordHeading: PageElement;
    private readonly verifyOTPHeading: PageElement;
    private readonly errorMessage: PageElement;
    private readonly cookieConfirmButton: PageElement;
    private readonly emailErrorMessage: PageElement; 

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.emailField = {
            selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]',
        };
        this.passwordField = {
            selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]',
        };
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.proceedButton = { role: 'button', text: 'Proceed', selector: 'button:has-text("Proceed")' };
        this.forgotPasswordLink = { role: 'link', text: 'Forgot Password?', selector: 'a:has-text("Forgot Password?")' };
        this.forgotPasswordHeading = { role: 'heading', text: 'Confirm Email Address', selector: 'h1:has-text("Confirm Email Address")' };
        this.verifyOTPHeading = { role: 'heading', text: 'Verify OTP', selector: 'h1:has-text("Verify OTP"), h2:has-text("Verify OTP"), text=Verify OTP' };
        this.errorMessage = { selector: 'form', text: 'Your login credentials are incorrect' };
        this.emailErrorMessage = { selector: 'form', text:'Please enter a valid email to continue.'};
        this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
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

    async isErrorMessageVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.emailErrorMessage, 10000);
    }
}
