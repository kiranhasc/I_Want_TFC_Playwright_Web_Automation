import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { logger } from '../utils/logger';

export interface VerifySubscribeToWatchInput {
  mode?: string;
  searchTerm?: string;
}

export interface VerifySubscribeToWatchOutput {
  isDetailsPageVisible: boolean;
  isSubscribeToWatchCtaVisible: boolean;
}

export interface UpgradePlanNavigationInput {
  mode?: string;
}

export interface UpgradePlanNavigationOutput {
  isGmaTabVisible: boolean;
  isUpgradePlanVisible: boolean;
  isPlansPageVisible: boolean;
}

export interface VerifyGuestSubscribeNavigationInput {
  expectedHeading?: string;
}

export interface VerifyGuestSubscribeNavigationOutput {
  //isTryAgainVisible: boolean;
  isLoginScreenVisible: boolean;
  headingText: string;
  isEmailFieldVisible: boolean;
  isPasswordFieldVisible: boolean;
}

export async function verifySubscribeToWatchCTA(
  page: any,
  input?: VerifySubscribeToWatchInput
): Promise<VerifySubscribeToWatchOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting subscribe-to-watch CTA verification flow');

  const searchTerm = input?.searchTerm ?? '';

  await authPage.acceptCookieSettingsIfVisible();

  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }

  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  if (isDetailsPageVisible) {
    await detailsPage.clickPremiumTagIcon();
  }

  const isSubscribeToWatchCtaVisible = isDetailsPageVisible
    ? await detailsPage.isSubscribeToWatchCtaVisible()
    : false;

  logger.assertion('Details page visible', isDetailsPageVisible);
  logger.assertion('Subscribe to watch CTA visible', isSubscribeToWatchCtaVisible);

  return {
    isDetailsPageVisible,
    isSubscribeToWatchCtaVisible,
  };
}

export async function verifyGuestSubscribeNavigationFromFreeAsset(
  page: any,
  input?: Partial<VerifyGuestSubscribeNavigationInput>
): Promise<VerifyGuestSubscribeNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting guest subscribe CTA navigation validation flow');

  await authPage.navigate();
  //await authPage.acceptCookieSettingsIfVisible();
  await detailsPage.clickCinemaOnePhSection();

  // const tryAgainVisible = await page.locator('#retry div').count().then((count) => count > 0).catch(() => false);
  // if (tryAgainVisible) {
  //   await detailsPage.clickTryAgainCta();
  //   return {
  //     isTryAgainVisible: true,
  //     isLoginScreenVisible: false,
  //     headingText: '',
  //     isEmailFieldVisible: false,
  //     isPasswordFieldVisible: false,
  //   };
  // }
//console.log("  Try again visible", tryAgainVisible);
  await detailsPage.clickLoginCta();
  const isLoginScreenVisible = await authPage.isWelcomeHeadingVisible();
  const headingText = isLoginScreenVisible ? await authPage.getWelcomeHeadingText() : '';
  const isEmailFieldVisible = await authPage.isEmailFieldVisible();
  const isPasswordFieldVisible = await authPage.isPasswordFieldVisible();

  logger.assertion('Login screen visible after guest subscribe CTA click', isLoginScreenVisible);

  return {
    //isTryAgainVisible: false,
    isLoginScreenVisible,
    headingText,
    isEmailFieldVisible,
    isPasswordFieldVisible,
  };
}

export async function navigateToUpgradePlanFromSubscriptionBlocker(
  page: any,
  input?: UpgradePlanNavigationInput
): Promise<UpgradePlanNavigationOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting upgrade plan navigation flow');

  await authPage.acceptCookieSettingsIfVisible();
  await authPage.clickGMATab();

  const isGmaTabVisible = await authPage.isTopStreamedRailVisible();
  await detailsPage.clickSubscribeToWatchCta();
  await detailsPage.clickSubscribeToWatchCtaBlocker();

  const isUpgradePlanVisible = await detailsPage.isUpgradePlanButtonVisible();
  if (isUpgradePlanVisible) {
    await detailsPage.clickUpgradePlanButton();
  }

  const isPlansPageVisible = await detailsPage.isPlansPageVisible();

  logger.assertion('GMA tab rail visible', isGmaTabVisible);
  logger.assertion('Upgrade Plan CTA visible', isUpgradePlanVisible);
  logger.assertion('Plans & Payment page visible', isPlansPageVisible);

  return {
    isGmaTabVisible,
    isUpgradePlanVisible,
    isPlansPageVisible,
  };
}
