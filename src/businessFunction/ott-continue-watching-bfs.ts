import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { logger } from '../utils/logger';

export interface RemoveFromContinueWatchingInput {
  mode?: string;
  searchTerm?: string;
  contentTitle?: string;
}

export interface RemoveFromContinueWatchingOutput {
  isContinueWatchingTrayVisible: boolean;
  wasItemPresentBeforeRemoval: boolean;
  isItemPresentAfterRemoval: boolean;
}

export async function removeFromContinueWatching(
  page: any,
  input?: RemoveFromContinueWatchingInput
): Promise<RemoveFromContinueWatchingOutput> {
  const detailsPage = new OTTDetailsPage(page);
  const authPage = new OTTAuthPage(page);
  logger.step('Starting Remove From Continue Watching flow');

  const searchTerm = input?.searchTerm ?? '';
  const contentTitle = input?.contentTitle ?? '';

  await authPage.acceptCookieSettingsIfVisible();

  if (searchTerm) {
    await authPage.clickSearchBar();
    await authPage.enterSearchText(searchTerm);
    await authPage.submitSearch();
    await detailsPage.clickFirstSearchResult();
  }

  // Ensure the player is launched and user can navigate back to Home
  await detailsPage.clickFirstEpisodeCard();
  await detailsPage.clickPlayerForwardButton();
  await detailsPage.clickPlayerBackArrow();

  //await authPage.clickHomeTab();

  const isContinueWatchingTrayVisible = await detailsPage.isContinueWatchingTrayVisible();
  const wasItemPresentBeforeRemoval = await detailsPage.isContinueWatchingItemVisible(contentTitle);
  

  if (wasItemPresentBeforeRemoval) {
    await detailsPage.hoverFirstContinueWatchingItem();
    await detailsPage.clickFirstContinueWatchingRemoveIcon();
  }

  const isItemPresentAfterRemoval = await detailsPage.isContinueWatchingItemVisible(contentTitle);

  logger.assertion('Continue Watching tray visible', isContinueWatchingTrayVisible);
  logger.assertion('Continue Watching item present before removal', wasItemPresentBeforeRemoval);
  logger.assertion('Continue Watching item removed successfully', wasItemPresentBeforeRemoval && !isItemPresentAfterRemoval);

  return {
    isContinueWatchingTrayVisible,
    wasItemPresentBeforeRemoval,
    isItemPresentAfterRemoval,
  };
}
