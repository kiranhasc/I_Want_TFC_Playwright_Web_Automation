import { OTTDetailsPage } from '../pom/OTTDetailsPage.ts';
import { OTTAuthPage } from '../pom/OTTAuthPage.ts';
import { loginToOTT } from './ott-auth-bfs.ts';
import { logger } from '../utils/logger.ts';

export interface NavigateToShowDetailsInput {
  expectedHeading?: string;
  expectedYear?: string;
  expectedGenre?: string;
}

export interface NavigateToShowDetailsOutput {
  isDetailsPageVisible: boolean;
  showDetailsHeading: string;
  isContentMetadataVisible: boolean;
  contentDescriptionText: string;
  metadataText: string;
  yearVisible: boolean;
  genreVisible: boolean;
}

export interface VerifyVPNPlaybackRestrictionInput {
  mode?: string;
  searchQuery: string;
  expectedVPNErrorMessage: string;
}

export interface VerifyVPNPlaybackRestrictionOutput {
  isLoggedIn: boolean;
  vpnErrorVisible: boolean;
  errorMessage: string;
  playbackStarted: boolean;
}

export async function verifyVPNPlaybackRestriction(
  page: any,
  input: VerifyVPNPlaybackRestrictionInput
): Promise<VerifyVPNPlaybackRestrictionOutput> {
  const authPage = new OTTAuthPage(page);
  const detailsPage = new OTTDetailsPage(page);
  logger.step('Starting VPN playback restriction validation');

  const loginResult = await loginToOTT(page, { mode: input.mode });
  const isLoggedIn = loginResult.isLoggedIn;
  logger.assertion('User is logged in before VPN playback check', isLoggedIn);

  if (!isLoggedIn) {
    return {
      isLoggedIn: false,
      vpnErrorVisible: false,
      errorMessage: '',
      playbackStarted: false,
    };
  }

  await authPage.clickSearchBar();
  await authPage.searchAndGetResults(input.searchQuery);
  await page.locator(`img[alt="${input.searchQuery}"]`).click({ timeout: 10000 }).catch(() => { });
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });

  await detailsPage.clickPlayButton();
  await page.waitForTimeout(5000);

  const vpnErrorVisible = await detailsPage.isVPNErrorMessageVisible(input.expectedVPNErrorMessage);
  const playbackStarted = await detailsPage.isPlaybackStarted();
  const errorMessage = vpnErrorVisible ? input.expectedVPNErrorMessage : '';

  logger.assertion('VPN-specific error displayed', vpnErrorVisible);
  logger.assertion('Playback did not start when VPN error is displayed', !playbackStarted);

  return {
    isLoggedIn,
    vpnErrorVisible,
    errorMessage,
    playbackStarted,
  };
}

export async function navigateToShowDetailsFromShowsPage(
  page: any,
  input?: NavigateToShowDetailsInput
): Promise<NavigateToShowDetailsOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting navigation to show details from Shows page');
  await authPage.acceptCookieSettingsIfVisible();
  await detailsPage.clickShowsSection();
  await detailsPage.clickFirstShowContent();
  const isDetailsPageVisible = await detailsPage.isShowDetailsPageVisible();
  const showDetailsHeading = isDetailsPageVisible
    ? await detailsPage.getShowDetailsHeadingText()
    : '';
  const isContentMetadataVisible = await detailsPage.isContentMetadataVisible();
  const contentDescriptionText = isContentMetadataVisible
    ? await detailsPage.getContentDescriptionText()
    : '';
  const metadataText = isContentMetadataVisible
    ? await detailsPage.getContentMetadataText()
    : '';
  const yearVisible = input?.expectedYear
    ? metadataText.toLowerCase().includes(input.expectedYear.toLowerCase())
    : false;
  const genreVisible = input?.expectedGenre
    ? metadataText.toLowerCase().includes(input.expectedGenre.toLowerCase())
    : false;
  logger.assertion('Show details page visible', isDetailsPageVisible);
  logger.assertion('Content metadata visible', isContentMetadataVisible);
  logger.assertion('Details page year visible', yearVisible);
  logger.assertion('Details page genre visible', genreVisible);

  return {
    isDetailsPageVisible,
    showDetailsHeading,
    isContentMetadataVisible,
    contentDescriptionText,
    metadataText,
    yearVisible,
    genreVisible,
  };
}
