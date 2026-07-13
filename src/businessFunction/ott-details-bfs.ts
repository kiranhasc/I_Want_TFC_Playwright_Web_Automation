import { OTTDetailsPage } from '../pom/OTTDetailsPage.ts';
import { OTTAuthPage } from '../pom/OTTAuthPage.ts';
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
