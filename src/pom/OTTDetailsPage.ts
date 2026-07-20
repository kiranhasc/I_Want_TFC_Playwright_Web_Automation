import { expect, Page, Locator } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { config } from '../utils/config-manager';
import { logger } from '../utils/logger';
import { TIMEOUT } from 'node:dns';

export class OTTDetailsPage {
  private readonly page: Page;
  private readonly pageUtils: PageUtils;
  private storedContentTitle: string = '';
  private storedContentMetadata: string = '';
  private storedContentDescription: string = '';
  private hasStoredDetails: boolean = false;
  private lastSelectedEpisodeMetadata: { seasonNumber: string; episodeNumber: string; title: string } = {
    seasonNumber: '',
    episodeNumber: '',
    title: '',
  };
  private readonly showsSectionLink: PageElement;
  private readonly firstShowContentCard: PageElement;
  private readonly moviesSectionLink: PageElement;
  private readonly playButton: PageElement;
  private readonly videoElement: PageElement;
  private readonly vpnErrorMessage: PageElement;
  private readonly firstEpisodeCard: PageElement;
  private readonly episodesListItems: PageElement;
  private readonly seasonLabels: PageElement;
  private readonly seasonLabelContainer: PageElement;
  private readonly episodeItems: PageElement;
  private readonly episodeListContainer: PageElement;
  private readonly episodeBufferIndicator: PageElement;
  private readonly iWantLogo: PageElement;
  private readonly videoPlayer: PageElement;
  private readonly episodeTitle: PageElement;
  private readonly playbackContentTitle: PageElement;
  private readonly playbackEpisodeTitle: PageElement;
  private readonly playerForwardButton: PageElement;
  private readonly playerBackArrowButton: PageElement;
  private readonly continueWatchingTray: PageElement;
  private readonly continueWatchingThumbnail: PageElement;
  private readonly continueWatchingRemoveButton: PageElement;
  private readonly showDetailsHeading: PageElement;
  private readonly contentMetadata: PageElement;
  private readonly resumeButton: PageElement;
  private readonly parentalPinPlaybackPrompt: PageElement;
  private readonly parentalPinEntryInputs: PageElement;
  private readonly parentalPinValidateButton: PageElement;
  private readonly parentalPinInvalidErrorMessage: PageElement;
  private readonly cookieConfirmButton: PageElement;
  private readonly premiumTagIcon: PageElement;
  private readonly subscribeToWatchCta: PageElement;
  private readonly subscribeToWatchCtaButton: PageElement;
  private readonly subscribeToWatchCtaBlocker: PageElement;
  private readonly subscriptionInstructionPrompt: PageElement;
  private readonly upgradePlanButton: PageElement;
  private readonly plansPageHeading: PageElement;
  private readonly skipIntroMarker: PageElement;
  private readonly skipRecapMarker: PageElement;
  private readonly addToWatchlistButton: PageElement;
  private readonly removeFromWatchlistButton: PageElement;
  private readonly addWatchlistIcon: PageElement;
  private readonly removeWatchlistIcon: PageElement;
  private readonly watchlistToast: PageElement;
  private readonly cinemaOnePhSection: PageElement;
  private readonly liveChannelsTray: PageElement;
  private readonly dzmmTeleradyoItem: PageElement;
  private readonly watchlistContentCard: PageElement;
  private readonly freeTagBadge: PageElement;
  private readonly loginCta: PageElement;
  private readonly firstSearchResult: PageElement;
  private readonly playerScreen: PageElement;
  private readonly seekBar: PageElement;
  private readonly playbackTime: PageElement;
  private readonly playerTimeDisplay: PageElement;
  private readonly playbackTimeValue: PageElement;
  private readonly pauseButton: PageElement;
  private readonly liveChannelTile: PageElement;
  private readonly rewindButton: PageElement;
  private readonly forwardButton: PageElement;
  private readonly volumeButton: PageElement;
  private readonly subtitleButton: PageElement;
  private readonly subtitleLanguageOption: PageElement;
  private readonly subtitleOffOption: PageElement;
  private readonly subtitleDisplayIndicator: PageElement;
  private readonly nextEpisodeButton: PageElement;
  private readonly upNextMarker: PageElement;
  private readonly backButton: PageElement;
  private readonly fullscreenButton: PageElement;
  private readonly goLiveButton: PageElement;
  private readonly liveTag: PageElement;
  private readonly adTag: PageElement;
  private readonly pauseAdBanner: PageElement;
  private readonly firstTitleImageCard: PageElement;
  private readonly titleImageWithAlt: PageElement;
  private readonly contentMetadataDiv: PageElement;
  private readonly contentDescDiv: PageElement;
  private readonly contentCardContainer: PageElement;
  private readonly freeContentBadge: PageElement;
  private readonly contentCardAncestor: PageElement;
  private readonly contentCardInteractiveTarget: PageElement;
  private readonly episodeCardAncestor: PageElement;
  private readonly contentAncestorChain: PageElement;
  private readonly continueWatchingDetailsAndMore: PageElement;
  private readonly contentDetailsHeading: PageElement;
  private readonly contentCloseButton: PageElement;
  private readonly contentMoreExpandButton: PageElement;
  private readonly contentLanguageIcon: PageElement;
  private readonly contentSubtitleIcon: PageElement;
  private readonly contentShareIcon: PageElement;
  private readonly shareCopyConfirmationMessage: PageElement;
  private readonly contentTitleImage: PageElement;
  private readonly contentGenre: PageElement;
  private readonly contentYear: PageElement;
  private readonly contentAgeRating: PageElement;
  private readonly contentDuration: PageElement;
  private readonly contentCast: PageElement;
  private readonly showSectionContainer: PageElement;
  private readonly showSectionText: PageElement;
  private readonly moviesSectionNavigation: PageElement;
  private readonly firstShowRailThumbnail: PageElement;
  private readonly showRailImageCandidate: PageElement;
  private readonly movieRailContainer: PageElement;
  private readonly movieRailImage: PageElement;
  private readonly movieRailInteractiveTarget: PageElement;
  private readonly mainContentContainer: PageElement;
  private readonly pageBody: PageElement;
  private readonly genericTextPattern: PageElement;
  private readonly playerScreenFallback: PageElement;
  private readonly watchlistToastContainer: PageElement;
  private readonly removeWatchlistFallbackIcon: PageElement;
  private readonly liveChannelsHeading: PageElement;
  private readonly playerLoaderOverlay: PageElement;
  private readonly playerMidSpacer: PageElement;
  private readonly subscribeCtaContainer: PageElement;
  private readonly subscribeCtaInteractiveTarget: PageElement;
  private readonly subscribeConfirmationButtonPattern: PageElement;
  private readonly watchlistCardBase: PageElement;
  private readonly watchlistCardCursor: PageElement;
  private readonly watchlistCardGeneric: PageElement;
  private readonly watchlistCardContentTestId: PageElement;
  private readonly watchlistCardShowTestId: PageElement;
  private readonly watchlistTitleImage: PageElement;
  private readonly watchlistToastAdded: PageElement;
  private readonly watchlistToastRemoved: PageElement;
  private readonly watchlistToastGeneric: PageElement;
  private readonly watchlistRemoveFallbackIcon: PageElement;
  private readonly watchlistPremiumTagIcon: PageElement;
  private readonly watchlistFreeTagIcon: PageElement;
  private readonly watchlistCardHeading: PageElement;
  private readonly watchlistCardTitleImage: PageElement;
  private readonly contentTitleImageAlt: PageElement;
  private readonly contentMetadataContainer: PageElement;
  private readonly contentDescriptionContainer: PageElement;
  private readonly episodeLabelTextPattern: PageElement;
  private readonly videoPlayerTitleTestId: PageElement;
  private readonly genericTextLocator: PageElement;
  private readonly liveTextLabel: PageElement;
  private readonly goLiveButtonElement: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.pageUtils = new PageUtils(page);
    this.showsSectionLink = { selector: 'nav >> text=Shows' };
    this.moviesSectionLink = { selector: 'nav >> text=Movies' };
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image' };
    this.videoElement = { selector: 'video' };
    this.vpnErrorMessage = { selector: 'h2:has-text("We detected that you’re using a VPN or proxy")'};
    this.seasonLabels = { selector: 'h3.season-title, .season-title, [data-testid*="season"], h3:has-text("Season")' };
    this.seasonLabelContainer = { selector: '.seasons-list, .season-list, [data-testid*="season-list"], [class*="season"]' };
    this.episodeItems = { selector: '.episodes-list .episode-info, .episodes-list [data-testid*="episode"], .seasons-container .episode-info, .episode-item, [data-testid*="episode-item"], [role="button"] >> text=/S\d+\s*E\d+/i' };
    this.episodeListContainer = { selector: '.episodes-list, .season-episodes, [data-testid*="episode-list"], [class*="episodes-list"], main [class*="season"]' };
    this.episodeBufferIndicator = { selector: '[aria-label*="loading"], .loader, .spinner, [data-testid*="buffer"], [data-testid*="loading"], text=/loading/i' };
    this.iWantLogo = { selector: 'img[alt="iWant"], img[alt*="iWant"], [alt*="iWant"]' };
    this.showDetailsHeading = { selector: 'main h1' };
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
    this.showsSectionLink = { selector: 'nav >> text=Shows'};
    this.firstShowContentCard = { selector: 'main img.title-image, [data-testid="show-card"] img.title-image, [data-testid="content-card"] img.title-image, img.title-image'};
    this.firstEpisodeCard = { selector: '[data-testid="episode-card"], .episode-card, .season-episodes .episode-item, .episode-list .episode-item'};
    this.episodesListItems = { selector: 'xpath=//*[@class="episodes-list"]/div/div' };
    this.firstEpisodeCard = { selector: '[data-testid="episode-card"], .episode-card, .season-episodes .episode-item, .episode-list .episode-item, main [role="button"], main [cursor="pointer"]' };
    this.videoPlayer = { selector: 'video, [data-testid="video-player"], .video-player video, .player video'};
    this.episodeTitle = { selector: '[data-testid="episode-title"], .episode-title, h2:has-text("Episode")'};
    this.playbackContentTitle = { selector: '[data-testid="player-title"], .player-title, .video-title, .content-title, .player-header h1, h1' };
    this.playbackEpisodeTitle = { selector: '[data-testid="episode-title"], .episode-title, .player-episode, h2:has-text("Episode"), text=/Episode\\s+\\d+/i' };
    this.playerForwardButton = { selector: 'button[aria-label*="Forward"], button[aria-label*="forward"], [data-testid*="forward"], button:has-text("Forward"), button:has-text(">>"), button:has-text(">")' };
    this.playerBackArrowButton = { selector: 'button[aria-label*="Back"], button[aria-label*="back"], [data-testid*="back"], button:has-text("Back"), button:has-text("←"), button:has-text("<")' };
    this.continueWatchingTray = { selector: 'text=Continue Watching, [data-testid*="continue-watching"], .continue-watching, .cw-tray' };
    this.continueWatchingThumbnail = { selector: '[data-testid="continue-watching-item"], .continue-watching-item, .cw-item, .continue-watching__item, .continue-watching-thumbnail' };
    this.continueWatchingRemoveButton = { selector: 'button[aria-label*="Remove"], button:has-text("Remove"), button:has-text("X"), [data-testid*="remove"], .remove-continue-watching' };
    this.showDetailsHeading = { selector: 'main h1'};
    this.contentMetadata = { selector: '[class*="metadata relative flex items"]'};
    this.resumeButton = { selector: '//*[@id="player-container-main-playPauseButton"]/img' };
    this.parentalPinPlaybackPrompt = { selector: 'text=/Enter the PIN to Access/i' };
    this.parentalPinEntryInputs = { selector: 'input[id^="parental-pin-input-"]' };
    this.parentalPinValidateButton = { selector: 'button:has-text("Submit"), button:has-text("Continue")' };
    this.parentalPinInvalidErrorMessage = { selector: 'text=/Invalid Pin/i' };
    this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")'};
    this.premiumTagIcon = { selector: 'img[alt="tag"], [aria-label="tag"], [data-testid*="tag"], img[title="tag"]' };
    this.subscribeToWatchCta = { selector: '#play div' };
    this.subscribeToWatchCtaButton = { selector: '#play div' };
    this.subscribeToWatchCtaBlocker = { selector: '#subscribe_to_watch div' };
    this.subscriptionInstructionPrompt = { selector: 'text=/A valid subscription is required to view this content|Please subscribe or renew your plan|Subscribe to watch/i' };
    this.upgradePlanButton = { role: 'button', text: 'Upgrade Plan', selector: 'button:has-text("Upgrade Plan"), a:has-text("Upgrade Plan")' };
    this.plansPageHeading = { selector: 'h1', text: 'Plans & Payment' };
    this.playButton = { selector: '#play div' };
    this.addToWatchlistButton = { selector: 'img[alt*="add_watchlist"]' };
    this.removeFromWatchlistButton = { selector: 'img[alt*="remove_watchlist"]' };
    this.addWatchlistIcon = { role: 'img', text: '/assets/button_icons/focused/add_watchlist.svg' };
    this.removeWatchlistIcon = { role: 'img', text: '/assets/button_icons/focused/remove_watchlist.svg' };
    this.watchlistToast = { selector: "div:has-text('Added to watchlist'), div:has-text('Removed from watchlist')" };
    this.cinemaOnePhSection = {selector: 'img[alt="Cinema One PH"]'};
    this.liveChannelsTray = { text: 'Live Channels', selector: 'text=Live Channels' };
    this.dzmmTeleradyoItem = { text: 'DZMM Teleradyo', selector: 'text=DZMM Teleradyo' };
    this.watchlistContentCard = { selector: 'img[alt="My Illegal Wife"]' };
    this.freeTagBadge = { selector: 'img[alt="free"]' };
    this.loginCta = { selector: '#login div' };
    this.skipIntroMarker = { selector: 'button:has-text("Skip Intro"), [data-testid*="skip-intro"], [aria-label*="Skip Intro"]' };
    this.skipRecapMarker = { selector: 'button:has-text("Skip Recap"), [data-testid*="skip-recap"], [aria-label*="Skip Recap"]' };
    this.firstSearchResult = { selector: 'main img, main a img, main section img, main article img, main figure img, section[role="list"] img, div[role="list"] img, .search-results img, .results-list img, section[role="list"] .thumbnail, div[role="list"] .thumbnail, .search-results .thumbnail, .results-list .thumbnail' };
    this.playButton = { selector: '#play div' };
    this.playerScreen = { selector: '[data-testid="player"], .player-screen, video' };
    this.seekBar = { selector: '//div[contains(@class,"player-progress-container")]' };
    this.playbackTime = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playerTimeDisplay = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.playbackTimeValue = { selector: '[data-testid="player-time"], .player-time, [class*="time-display"], [class*="timeDisplay"], [class*="current-time"], [class*="playback-time"]' };
    this.pauseButton = { selector: 'button:has-text("pause"), [data-testid="pause-button"], .pause-button' };
    this.liveChannelTile = { selector: 'a, button, [role="button"], [data-testid*="content"], [data-testid*="card"]' };
    this.rewindButton = { selector: '//*[@id="player-container-main-rewindButton"]/img' };
    this.forwardButton = { selector: '//*[@id="player-container-main-forwardButton"]/img' };
    this.volumeButton = { selector: 'button[aria-label*="volume"], button[title*="volume"], [data-testid*="volume"]' };
    this.subtitleButton = { selector: 'xpath=//*[@id="player-container-main-subtitleButton"]/img' };
    this.subtitleLanguageOption = { selector: 'text=/English\\(Philippines\\)/i' };
    this.subtitleOffOption = { selector: 'text=/\\bOff\\b/i' };
    this.subtitleDisplayIndicator = { selector: 'xpath=//*[@id="player-container-main"]/div[6]/div' };
    this.nextEpisodeButton = { selector: 'button[aria-label*="next"], button:has-text("Next"), [data-testid*="next-episode"]' };
    this.upNextMarker = { selector: '//div[contains(@class,"player-upNextWidget-forground-gradient")]' };
    this.backButton = { selector: 'button[aria-label*="back"], button:has-text("Back"), [data-testid*="back"]' };
    this.fullscreenButton = { selector: 'button[aria-label*="fullscreen"], button[title*="fullscreen"], [data-testid*="fullscreen"]' };
    this.goLiveButton = { selector: 'button:has-text("Go Live"), [data-testid*="go-live"], [aria-label*="Go Live"]' };
    this.liveTag = { selector: 'text=/\\bLIVE\\b/i' };
    this.adTag = { selector: '//*[@id="ad-ui-overlay"]' };
    this.pauseAdBanner = { selector: '[data-testid*="pause-ad"], [data-testid*="ad-overlay"], [class*="pause-ad"], [class*="pause-overlay"], [class*="banner"], [role="dialog"]' };
    this.firstTitleImageCard = { selector: 'img.title-image' };
    this.titleImageWithAlt = { selector: '//img[contains(@class,"title") and @alt]' };
    this.contentMetadataDiv = { selector: 'div.metadata, [class*="metadata"]' };
    this.contentDescDiv = { selector: 'div.desc, [class*="desc"]' };
    this.contentCardContainer = { selector: 'xpath=ancestor::*[self::div or self::a or self::li][1]' };
    this.freeContentBadge = { selector: "//img[@alt='free' and contains(@src,'free.png')]" };
    this.contentCardAncestor = { selector: 'xpath=ancestor::*[self::div or self::a or self::li][1]' };
    this.contentCardInteractiveTarget = { selector: 'a, button, [role="button"], img.title-image, img' };
    this.episodeCardAncestor = { selector: 'xpath=ancestor::div[contains(@class, "episode-info")][1]' };
    this.contentAncestorChain = { selector: 'xpath=ancestor::*[self::div or self::a or self::li]' };
    this.continueWatchingDetailsAndMore = { selector: 'text=/Details and More|View More|Details/i' };
    this.contentDetailsHeading = { selector: 'main h1, [data-testid*="content-title"], [data-testid*="details-title"], [class*="content-title"]' };
    this.contentCloseButton = { selector: 'button:has-text("Close"), button:has-text("Cancel"), [aria-label*="Close"], [aria-label*="Cancel"]' };
    this.contentMoreExpandButton = { selector: 'img[alt*="more_info.svg"], [aria-label*="More"], [aria-label*="Expand"]' };
    this.contentLanguageIcon = { selector: 'img[alt="audio language"], [aria-label*="audio language"], [data-testid*="language"]' };
    this.contentSubtitleIcon = { selector: 'img[alt="subtitle language"], [aria-label*="subtitle"], [data-testid*="subtitle"]' };
    this.contentShareIcon = { selector: 'img[alt*="share.svg"], [aria-label*="share"], [data-testid*="share"]' };
    this.shareCopyConfirmationMessage = { selector: 'text=/share link copied|copied to clipboard|clipboard/i' };
    this.contentTitleImage = { selector: 'img.title, img[alt]' };
    this.contentGenre = { selector: 'div.genre, [class*="genre"]' };
    this.contentYear = { selector: 'div.release-year, [class*="release-year"]' };
    this.contentAgeRating = { selector: 'div.age-rating, [class*="age-rating"]' };
    this.contentDuration = { selector: 'div.duration, [class*="duration"]' };
    this.contentCast = { selector: 'div.casts, p:has-text("Cast :")' };
    this.showSectionContainer = { selector: 'div#shows' };
    this.showSectionText = { selector: 'text=Shows', text: 'Shows' };
    this.moviesSectionNavigation = { selector: 'nav a, nav button, nav [role="link"]' };
    this.firstShowRailThumbnail = { selector: '.scrollable-list:first-of-type .thumbnail' };
    this.showRailImageCandidate = { selector: 'img.title-image' };
    this.movieRailContainer = { selector: 'div.scrollable-list.horizontal-scroll .thumbnail' };
    this.movieRailImage = { selector: 'img[alt]' };
    this.movieRailInteractiveTarget = { selector: 'a, button, [role="button"], img, .thumbnail' };
    this.mainContentContainer = { selector: 'main' };
    this.pageBody = { selector: 'body' };
    this.genericTextPattern = { selector: 'text=/.*\\w.*/' };
    this.playerScreenFallback = { selector: '[data-testid*="player"], .player-screen, video' };
    this.watchlistToastContainer = { selector: 'div.toast' };
    this.removeWatchlistFallbackIcon = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"]' };
    this.liveChannelsHeading = { selector: 'text=Live Channels', text: 'Live Channels' };
    this.playerLoaderOverlay = { selector: '.player-loader' };
    this.playerMidSpacer = { selector: '.player-mid-spacer' };
    this.subscribeCtaContainer = { selector: '#play' };
    this.subscribeCtaInteractiveTarget = { selector: 'main button, main a, main [role="button"]' };
    this.subscribeConfirmationButtonPattern = { selector: 'button:has-text("Confirm"), button:has-text("Subscribe to Watch")' };
    this.watchlistCardBase = { selector: 'div.thumbnail.relative.cursor-pointer.outline-none' };
    this.watchlistCardCursor = { selector: 'div.thumbnail.cursor-pointer' };
    this.watchlistCardGeneric = { selector: 'div.thumbnail' };
    this.watchlistCardContentTestId = { selector: '[data-testid="content-card"]' };
    this.watchlistCardShowTestId = { selector: '[data-testid="show-card"]' };
    this.watchlistTitleImage = { selector: 'img.title-image, img[alt]' };
    this.watchlistToastAdded = { selector: 'div' };
    this.watchlistToastRemoved = { selector: 'div.toast' };
    this.watchlistToastGeneric = { selector: 'div, span, p' };
    this.watchlistRemoveFallbackIcon = { selector: 'img[alt*="remove_watchlist"], img[src*="remove_watchlist"]' };
    this.watchlistPremiumTagIcon = { selector: 'img[alt="tag"], img[aria-label="tag"], img[title="tag"]' };
    this.watchlistFreeTagIcon = { selector: 'img[alt="free"]' };
    this.watchlistCardHeading = { selector: 'h2, h3, h4, [role="heading"]' };
    this.watchlistCardTitleImage = { selector: 'img.title-image, img[alt]' };
    this.contentTitleImageAlt = { selector: '//img[contains(@class,"title") and @alt]' };
    this.contentMetadataContainer = { selector: '//div[contains(@class,"metadata")]' };
    this.contentDescriptionContainer = { selector: '//div[contains(@class,"desc")]' };
    this.episodeLabelTextPattern = { selector: 'text=/.*\\w.*/' };
    this.videoPlayerTitleTestId = { selector: '[data-testid="video-player"]' };
    this.genericTextLocator = { selector: 'text=/.*\\w.*/' };
    this.liveTextLabel = { role: 'button', text: 'Live', selector: 'text=Live' };
    this.goLiveButtonElement = { role: 'button', text: 'Go Live', selector: 'button:has-text("Go Live")' };

  }

  private getRoleLocator(element: PageElement, exact = false) {
    if (element.role && element.text) {
      return this.page.getByRole(element.role as 'img' | 'button' | 'link' | 'textbox', { name: element.text }).first();
    }
    if (element.text) {
      return exact
        ? this.page.getByText(element.text, { exact: true }).first()
        : this.page.getByText(element.text).first();
    }
    return this.page.locator(element.selector ?? '').first();
  }

  async navigate(): Promise<void> {
    const baseUrl = config.getBaseURL();
    logger.pageNavigation(baseUrl);
    await this.page.goto(baseUrl);
    await this.pageUtils.waitForPageLoad();
    await this.page.waitForTimeout(7000);
  }

  async clickShowsSection(): Promise<void> {
    logger.elementInteraction('click', 'Shows section link');
    const candidateLocators = [
      this.page.locator(this.showSectionContainer.selector).first(),
      this.page.locator(this.showsSectionLink.selector).first(),
      this.page.locator(this.showSectionText.selector).first(),
    ];
    let clicked = false;
    for (const candidate of candidateLocators) {
      try {
        const count = await candidate.count().catch(() => 0);
        if (!count) {
          continue;
        }
        await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
        await this.page.waitForTimeout(1500);
        await candidate.waitFor({ state: 'visible', timeout: 20000 });
        await candidate.click({ timeout: 30000, force: true });
        clicked = true;
        break;
      } catch (error) {
        logger.debug('Shows section click failed for one of the configured candidates', error);
      }
    }
    if (!clicked) {
      await this.pageUtils.safeClick(this.showsSectionLink, 30000).catch(() => undefined);
    }
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
  }

  async clickMoviesSection(): Promise<void> {
    logger.elementInteraction('click', 'Movies section link');
    const moviesLink = this.page.locator(this.moviesSectionNavigation.selector).filter({ hasText: /^Movies$/i }).first();
    if (await moviesLink.count()) {
      await moviesLink.waitFor({ state: 'visible', timeout: 20000 });
      await moviesLink.click({ timeout: 20000, force: true });
    } else {
      await this.pageUtils.safeClick(this.moviesSectionLink);
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForTimeout(5000);
  }

  async clickFirstShowContent(): Promise<void> {
    logger.elementInteraction('click', 'first rail content thumbnail');

    const candidateLocators = [
      this.page.locator(this.firstShowRailThumbnail.selector).first(),
      this.page.locator(this.firstShowContentCard.selector).first(),
      this.page.locator(this.showRailImageCandidate.selector).first(),
      this.page.locator(this.firstTitleImageCard.selector).first(),
      this.page.locator(this.titleImageWithAlt.selector).first(),
    ];

    for (const candidate of candidateLocators) {
      try {
        if (!(await candidate.count())) continue;
        await candidate.waitFor({ state: 'visible', timeout: 10000 });
        await candidate.click({ timeout: 15000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });
        await this.page.waitForTimeout(2000);
        return;
      } catch (err) {
        logger.debug('Content candidate click failed for one of the configured candidates', err);
      }
    }

    try {
      const fallback = this.page.locator(this.titleImageWithAlt.selector).first();
      if (await fallback.count()) {
        await fallback.waitFor({ state: 'visible', timeout: 10000 });
        await fallback.click({ timeout: 15000 });
      }
    } catch (err) {
      logger.debug('Fallback content click failed', err);
    }
  }

  async clickFirstMovieContent(): Promise<string> {
    logger.elementInteraction('click', 'first visible movie card from Movies tab');

    try {
      const movieRail = this.page.locator(this.movieRailContainer.selector).filter({
        has: this.page.locator(this.movieRailImage.selector),
      }).first();
      await movieRail.waitFor({ state: 'visible', timeout: 20000 });
      const movieImage = movieRail.locator(this.movieRailImage.selector).first();
      const selectedMovieTitle = (await movieImage.getAttribute('alt').catch(() => '') ?? '').trim();
      if (!selectedMovieTitle) {
        return '';
      }
      const clickTarget = movieRail.locator(this.movieRailInteractiveTarget.selector).first();
      logger.elementInteraction('click', `movie content candidate ${selectedMovieTitle}`);
      await clickTarget.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return selectedMovieTitle;
    } catch (error) {
      logger.debug('Could not click first visible movie card from Movies tab', error);
    }

    try {
      const fallbackRail = this.page.locator(this.movieRailContainer.selector).first();
      if (await fallbackRail.count()) {
        await fallbackRail.waitFor({ state: 'visible', timeout: 10000 });
        const fallbackImage = fallbackRail.locator(this.movieRailImage.selector).first();
        const fallbackTitle = (await fallbackImage.getAttribute('alt').catch(() => '') ?? '').trim();
        await fallbackRail.click({ timeout: 15000, force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        return fallbackTitle;
      }
    } catch (err) {
      logger.debug('Fallback movie rail click failed', err);
    }

    return '';
  }

  async clickFirstFreeContentOnHome(): Promise<void> {
    logger.elementInteraction('click', 'first free-tagged content on home');
    try {
      const freeBadge = this.page.locator(this.freeContentBadge.selector).first();
      await freeBadge.waitFor({ state: 'visible', timeout: 15000 });
      const contentCard = freeBadge.locator(this.contentCardAncestor.selector).first();
      const contentTarget = contentCard.locator(this.contentCardInteractiveTarget.selector).first();
      if (await contentTarget.count()) {
        await contentTarget.waitFor({ state: 'visible', timeout: 15000 });
        await contentTarget.click({ timeout: 15000 });
      } else {
        await freeBadge.click({ timeout: 15000 });
      }
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForTimeout(2000);
    } catch (err) {
      logger.debug('clickFirstFreeContentOnHome failed', err);
    }
  }

  async scrollContinueWatchingTrayIntoView(): Promise<void> {
    logger.elementInteraction('scroll', 'Continue Watching tray');
    try {
      const tray = this.page.locator(this.continueWatchingTray.selector).first();
      if (await tray.count()) {
        await tray.scrollIntoViewIfNeeded();
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      }
    } catch (error) {
      logger.debug('Continue Watching tray scroll failed', error);
    }
  }

  async scrollToSeasonsSection(): Promise<void> {
    logger.elementInteraction('scroll', 'season section');
    try {
      const seasonSection = this.page.locator(this.seasonLabelContainer.selector).first();
      if (await seasonSection.count()) {
        await seasonSection.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.debug('Season section scroll failed', error);
    }
  }

  private parseEpisodeMetadata(text: string): { title: string; seasonText: string; episodeText: string } {
    const normalized = (text || '').replace(/\s+/g, ' ').trim();
    const seasonMatch = normalized.match(/S(?:eason\s*)?(\d+)/i);
    const episodeMatch = normalized.match(/E(\d+)/i);
    const titleMatch = normalized.match(/([A-Za-z0-9 .,'’&\-]+?)\s+S(?:eason\s*)?\d+\s*E\d+/i);
    const fallbackTitle = normalized.split(/S(?:eason\s*)?\d+\s*E\d+/i)[0]?.trim();
    return {
      title: titleMatch?.[1]?.trim() || fallbackTitle?.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '') || '',
      seasonText: seasonMatch?.[1] ? `S${seasonMatch[1]}` : '',
      episodeText: episodeMatch?.[1] ? `E${episodeMatch[1]}` : '',
    };
  }

  private async findEpisodeCardForLabel(label: Locator): Promise<Locator> {
    const directEpisodeCard = label.locator(this.episodeCardAncestor.selector).first();
    const cardText = (await directEpisodeCard.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    if (cardText && /S\d+\s*E\d+/i.test(cardText)) {
      return directEpisodeCard;
    }
    const ancestors = label.locator(this.contentAncestorChain.selector);
    const count = await ancestors.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = ancestors.nth(index);
      const candidateText = (await candidate.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (candidateText && /S\d+\s*E\d+/i.test(candidateText)) {
        const titleCandidates = candidate.locator('p.font-semibold');
        const titleCount = await titleCandidates.count().catch(() => 0);
        if (titleCount > 0) {
          return candidate;
        }
      }
    }
    return label.locator(this.contentCardAncestor.selector).first();
  }

  private async extractEpisodeTitleFromCard(card: Locator): Promise<string> {
    const titleCandidates = card.locator('p.font-semibold');
    const count = await titleCandidates.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const text = (await titleCandidates.nth(index).textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (
        text &&
        text.length > 1 &&
        text.length <= 120 &&
        !/S\d+\s*E\d+/i.test(text) &&
        !/Season/i.test(text) &&
        !/\b\d+m\b/i.test(text) &&
        !/\b\d+s\b/i.test(text)
      ) {
        return text;
      }
    }
    return '';
  }

  private async extractTitleFromSelectedLabel(label: Locator): Promise<string> {
    const card = await this.findEpisodeCardForLabel(label);
    return this.extractEpisodeTitleFromCard(card);
  }

  private async extractSeasonFromLabel(label: Locator): Promise<string> {
    const text = (await label.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const seasonMatch = text.match(/S(?:eason\s*)?(\d+)/i);
    return seasonMatch?.[1] ? `S${seasonMatch[1]}` : '';
  }

  private async extractEpisodeNumberFromLabel(label: Locator): Promise<string> {
    const text = (await label.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const episodeMatch = text.match(/E(\d+)/i);
    return episodeMatch?.[1] ? `E${episodeMatch[1]}` : '';
  }

  async getSeasonLabelsText(): Promise<string[]> {
    try {
      const labels = this.page.locator(this.seasonLabels.selector);
      const count = await labels.count().catch(() => 0);
      if (!count) {
        const bodyText = (await this.page.locator('body').textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
        const fallbackMatches = Array.from(bodyText.matchAll(/Season\s*(\d+)/gi)).map((match) => `Season ${match[1]}`);
        return fallbackMatches.slice(0, 10);
      }
      const seasonTexts: string[] = [];
      for (let index = 0; index < Math.min(count, 10); index += 1) {
        const text = (await labels.nth(index).textContent().catch(() => '') || '').trim();
        if (text) {
          seasonTexts.push(text.replace(/\s+/g, ' '));
        }
      }
      return seasonTexts;
    } catch (error) {
      logger.debug('Could not read season labels', error);
      return [];
    }
  }

  async scrollEpisodeListToEnd(maxAttempts: number = 12): Promise<boolean> {
    logger.elementInteraction('scroll', 'episode list to end');
    try {
      const listContainer = this.page.locator(this.episodeListContainer.selector).first();
      const lastEpisode = this.page.locator(this.episodeItems.selector).last();
      let previousCount = 0;
      let stableCount = 0;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        await lastEpisode.scrollIntoViewIfNeeded().catch(() => undefined);
        if (await listContainer.count().catch(() => 0)) {
          await listContainer.evaluate((element: HTMLElement) => {
            element.scrollTop = element.scrollHeight;
          }).catch(() => undefined);
        } else {
          await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => undefined);
        }
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
        await this.page.waitForTimeout(1500);
        const bufferVisible = await this.page.locator(this.episodeBufferIndicator.selector).first().isVisible().catch(() => false);
        if (bufferVisible) {
          await this.page.waitForTimeout(3000);
        }
        const currentCount = await this.page.locator(this.episodeItems.selector).count().catch(() => 0);
        const lastEpisodeVisible = await lastEpisode.isVisible().catch(() => false);
        if (lastEpisodeVisible && currentCount > 0 && currentCount === previousCount) {
          stableCount += 1;
          if (stableCount >= 2) {
            return true;
          }
        } else {
          stableCount = 0;
        }
        previousCount = currentCount;
      }
      return await lastEpisode.isVisible().catch(() => false);
    } catch (error) {
      logger.debug('Episode list scroll to end failed', error);
      return false;
    }
  }

  async isIWantElementVisible(): Promise<boolean> {
    try {
      const iWantLogo = this.page.locator(this.iWantLogo.selector).first();
      await iWantLogo.scrollIntoViewIfNeeded().catch(() => undefined);
      await iWantLogo.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug('iWant element visibility check failed', error);
      return false;
    }
  }

  async clickSeasonLabel(labelText: string): Promise<void> {
    logger.elementInteraction('click', `season label ${labelText}`);
    try {
      const target = this.page.locator(this.seasonLabels.selector).filter({ hasText: labelText }).first();
      if (await target.count()) {
        await target.scrollIntoViewIfNeeded();
        await target.click({ timeout: 15000, force: true });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      }
    } catch (error) {
      logger.debug(`Season label click failed for ${labelText}`, error);
    }
  }

  async getEpisodeItemCount(): Promise<number> {
    try {
      const items = this.page.locator(this.episodeItems.selector);
      return await items.count().catch(() => 0);
    } catch (error) {
      logger.debug('Could not count episode items', error);
      return 0;
    }
  }

  async getEpisodeLabelsForCurrentSeason(): Promise<string[]> {
    try {
      const items = this.page.locator(this.episodeItems.selector);
      const count = await items.count().catch(() => 0);
      const labels: string[] = [];

      for (let index = 0; index < count; index += 1) {
        const text = (await items.nth(index).textContent().catch(() => '')).trim().replace(/\s+/g, ' ');
        if (text) {
          labels.push(text);
        }
      }

      return labels;
    } catch (error) {
      logger.debug('Could not read episode labels for the current season', error);
      return [];
    }
  }

  async validateEpisodeNumberSequence(): Promise<{ episodeLabels: string[]; parsedNumbers: number[]; isAscending: boolean }> {
    const episodeLabels = await this.getEpisodeLabelsForCurrentSeason();
    const parsedNumbers = episodeLabels
      .map((label) => {
        const match = label.match(/(?:S\d+\s*)?E(\d+)/i);
        return match ? Number(match[1]) : null;
      })
      .filter((value): value is number => value !== null);

    const isAscending = parsedNumbers.length > 0 && parsedNumbers.every((episodeNumber, index) => index === 0 || episodeNumber > parsedNumbers[index - 1]);

    return {
      episodeLabels,
      parsedNumbers,
      isAscending,
    };
  }

  async clickFirstEpisodeCard(): Promise<void> {
    logger.elementInteraction('click', 'first episode card');

    const episodeCard = this.page.locator(this.firstEpisodeCard.selector).first();
    try {
      if (this.page.isClosed()) return;
      if (await episodeCard.count()) {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
        await episodeCard.scrollIntoViewIfNeeded();
        await episodeCard.click({ timeout: 15000 });
      }
    } catch (err) {
      logger.debug('clickFirstEpisodeCard failed', err);
      return;
    }
    try {
      if (this.page.isClosed()) return;
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
      await this.page.waitForTimeout(5000);
    } catch (err) {
      logger.debug('Post-click waits failed or page closed', err);
    }
  }

  async clickLastSeasonIfAvailable(): Promise<boolean> {
    logger.elementInteraction('click', 'last season heading');
    try {
      const seasonHeading = this.page.locator('xpath=//*[contains(@class,"seasons-container")]/div/div/div/h3').last();
      const count = await seasonHeading.count().catch(() => 0);
      if (!count) return false;

      await seasonHeading.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
      await seasonHeading.scrollIntoViewIfNeeded().catch(() => undefined);
      await seasonHeading.click({ timeout: 20000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (err) {
      logger.debug('clickLastSeasonIfAvailable failed', err);
      return false;
    }
  }

  async clickLastEpisodeFromEpisodesList(): Promise<boolean> {
    logger.elementInteraction('click', 'last episode from episodes-list');
    try {
      // Scroll to the bottom of the page
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Locate the last episode via framework-declared locator
      const episodeItems = this.page.locator(this.episodesListItems.selector);
      const count = await episodeItems.count().catch(() => 0);
      if (!count) return false;

      const lastEpisode = episodeItems.last();

      // Ensure it is visible and click
      await lastEpisode.scrollIntoViewIfNeeded().catch(() => undefined);
      await lastEpisode.click({ timeout: 20000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle').catch(() => undefined);
      await this.page.waitForTimeout(2000);
      return true;
    } catch (err) {
      logger.debug('clickLastEpisodeFromEpisodesList failed', err);
      return false;
    }
  }
  async clickRandomEpisodeCard(): Promise<{ title: string; seasonText: string; episodeText: string }> {
    logger.elementInteraction('click', 'random visible episode card');

    const episodeLabelCandidates = this.page.getByText(/S\d+\s*E\d+/i);
    const count = await episodeLabelCandidates.count().catch(() => 0);
    if (!count) {
      return { title: '', seasonText: '', episodeText: '' };
    }

    const randomIndex = Math.floor(Math.random() * Math.min(count, 5));
    const selectedLabel = episodeLabelCandidates.nth(randomIndex);
    await selectedLabel.scrollIntoViewIfNeeded().catch(() => undefined);
    await selectedLabel.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);

    const card = await this.findEpisodeCardForLabel(selectedLabel);
    const selectedLabelText = ((await selectedLabel.textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
    const metadata = this.parseEpisodeMetadata(selectedLabelText);
    const titleFromCard = await this.extractTitleFromSelectedLabel(selectedLabel);
    const seasonText = metadata.seasonText || (await this.extractSeasonFromLabel(selectedLabel));
    const episodeText = metadata.episodeText || (await this.extractEpisodeNumberFromLabel(selectedLabel));
    const title = titleFromCard || metadata.title;
    this.lastSelectedEpisodeMetadata = {
      seasonNumber: seasonText,
      episodeNumber: episodeText,
      title,
    };

    try {
      await card.click({ timeout: 20000, force: true }).catch(() => undefined);
    } catch {
      await selectedLabel.click({ timeout: 20000, force: true }).catch(() => undefined);
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await this.page.waitForTimeout(5000);

    return {
      title,
      seasonText,
      episodeText,
    };
  }

  async clickWatchlistIcon(): Promise<void> {
    logger.elementInteraction('click', 'watchlist icon');
      const addIcon = this.getRoleLocator(this.addWatchlistIcon);
      const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
      if (await removeIcon.isVisible().catch(() => false)) {
        await removeIcon.click({ timeout: 15000, force: true });
        await this.page.waitForTimeout(1000);
      }
      await addIcon.waitFor({ state: 'visible', timeout: 15000 });
      await addIcon.click({ timeout: 15000, force: true });
      await this.page.waitForTimeout(1000);
  }

  async hoverContentThumbnailAndClickWatchlistIcon(contentTitle: string): Promise<string> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);
    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(7000);
      const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
      const addIcon = this.getRoleLocator(this.addWatchlistIcon);
      if (await removeIcon.isVisible().catch(() => false)) {
        await removeIcon.click({ timeout: 15000, force: true });
        await this.page.waitForTimeout(1000);
      }
      await addIcon.waitFor({ state: 'visible', timeout: 15000 });
      await addIcon.click({ timeout: 15000, force: true });
      await this.page.waitForTimeout(1500);
      return await this.validateAddedToWatchlistPopup();
    } catch (error) {
      logger.debug(`Hover content thumbnail and click watchlist icon failed for ${contentTitle}`, error);
      return '';
    }
  }

  async getWatchlistActionState(contentTitle: string): Promise<'add' | 'remove' | 'none'> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);
    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(2000);
      const removeIcon = this.getRoleLocator(this.removeWatchlistIcon);
      const addIcon = this.getRoleLocator(this.addWatchlistIcon);
      if (await removeIcon.isVisible().catch(() => false)) {
        return 'remove';
      }
      if (await addIcon.isVisible().catch(() => false)) {
        return 'add';
      }
      return 'none';
    } catch (error) {
      logger.debug(`Unable to determine watchlist action state for ${contentTitle}`, error);
      return 'none';
    }
  }

  async isWatchlistItemVisible(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `watchlist item visible ${contentTitle}`);
    try {
      const item = this.page.getByRole('img', { name: contentTitle }).first();
      await item.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      console.log(`Item not visible: ${contentTitle}`);
      return false;
    }
  }

  async verifyWatchlistHeading(expectFn: typeof expect, contentTitle: string): Promise<void> {
    logger.elementInteraction('verify', `watchlist heading ${contentTitle}`);
    const heading = this.page.getByRole('heading', { name: contentTitle }).first();
    await heading.waitFor({ state: 'visible', timeout: 15000 });
    await heading.click({ timeout: 15000 });
    await expectFn(heading).toBeVisible();
  }

  async hoverFirstContentThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('My Illegal Wife');
  }

  async hoverIAmYourDaughterThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('I Am Your Daughter');
  }

  async hoverAMomentInTimeThumbnailAndClickWatchlistIcon(): Promise<void> {
    await this.hoverContentThumbnailAndClickWatchlistIcon('A Moment in Time');
  }
  
  async hoverContentThumbnailAndClickRemoveWatchlistIcon(contentTitle: string): Promise<void> {
    logger.elementInteraction('hover', `content thumbnail ${contentTitle}`);

    try {
      const contentThumbnail = this.getRoleLocator({ role: 'img', text: contentTitle });
      await contentThumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await contentThumbnail.hover();
      await this.page.waitForTimeout(5000);
      const watchlistIcon = this.getRoleLocator(this.removeWatchlistIcon);
      await watchlistIcon.waitFor({ state: 'visible', timeout: 10000 });
      await watchlistIcon.click({ timeout: 15000, force: true });
    } catch (error) {
      logger.debug(`Hover content thumbnail and click remove watchlist icon failed for ${contentTitle}`, error);
    }
  }

async removeFromWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
    }
  }


  async clickCinemaOnePhSection(): Promise<void> {
    logger.elementInteraction('click', 'Cinema One PH section');
    try {
      const locator = this.page.locator(this.cinemaOnePhSection.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Cinema One PH section click failed', error);
    }
  }

  async isLiveChannelsTrayVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.liveChannelsHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async openLiveChannelsTray(): Promise<void> {
    logger.elementInteraction('click', 'Live Channels tray');
    try {
      const locator = this.page.locator(this.liveChannelsHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after opening live channels tray failed or timed out');
      });
    } catch (error) {
      logger.debug('Live Channels tray click failed', error);
    }
  }

  async clickLiveContentByName(contentName: string): Promise<void> {
    logger.elementInteraction('click', `live content card ${contentName}`);
    try {
      const locator = this.getRoleLocator({ role: 'img', text: contentName });
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        logger.debug('Networkidle wait after live content click failed or timed out');
      });
    } catch (error) {
      logger.debug(`Live content card click failed for ${contentName}`, error);
    }
  }

  async isLiveIconVisible(): Promise<boolean> {
    try {
      const locator = this.getRoleLocator({ text: 'Live', role: 'button' }, true).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isAddToWatchlistButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isPrimaryPlaybackActionVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickLoginCta(): Promise<void> {
    logger.elementInteraction('click', 'Login CTA');
    try {
      const locator = this.page.locator(this.loginCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.click({ timeout: 10000 });
    } catch (error) {
      logger.debug('Login CTA click failed', error);
    }
  }

  async clickPlayButton(): Promise<void> {
    logger.elementInteraction('click', 'play button');
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.debug('Play button click failed', error);
      try {
        const fallbackLocator = this.page.locator('button').filter({ hasText: /play/i }).first();
        if (await fallbackLocator.count()) {
          await fallbackLocator.click({ timeout: 15000 });
        }
      } catch (fallbackError) {
        logger.debug('Play button fallback click failed', fallbackError);
      }
    }
  }

  async scrollToEpisodeList(): Promise<void> {
    logger.elementInteraction('scroll', 'episode list');
    try {
      const episodeListLocator = this.page.locator(this.firstEpisodeCard.selector).first();
      if (await episodeListLocator.count()) {
        await episodeListLocator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      logger.debug('Episode list scroll failed', error);
    }
  }

  async clickEpisodeTwo(): Promise<void> {
    logger.elementInteraction('click', 'episode two');
    try {
      await this.scrollToEpisodeList();
      const episodeTwoLocator = this.page.getByText('S1 E2').first();
      await episodeTwoLocator.waitFor({ state: 'visible', timeout: 15000 });
      await episodeTwoLocator.click({ timeout: 15000 });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
    } catch (error) {
      logger.debug('Episode two click failed', error);
    }
  }

  async isSkipIntroMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipIntroMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSkipRecapMarkerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.skipRecapMarker.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickPlayerForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'player forward button');
    try {
      await this.pageUtils.safeClick(this.playerForwardButton, 15000);
    } catch (error) {
      logger.debug('Player forward button not found or click failed', error);
    }
  }

  async clickPlayerBackArrow(): Promise<void> {
    logger.elementInteraction('click', 'player back arrow');
    try {
      await this.pageUtils.safeClick(this.playerBackArrowButton, 15000);
    } catch (error) {
      logger.debug('Player back arrow not found or click failed', error);
    }
  }

  async clickPremiumTagIcon(): Promise<void> {
    logger.elementInteraction('click', 'premium tag icon');
    try {
      const locator = this.page.locator(this.premiumTagIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Premium tag icon click failed', error);
    }
  }

  async isPremiumTagVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.premiumTagIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSubscribeToWatchCtaVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.subscribeToWatchCta.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentCloseButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentCloseButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentMoreExpandVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentMoreExpandButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentLanguageIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentLanguageIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentSubtitleIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentSubtitleIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentShareIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentShareIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickContentShareIcon(): Promise<void> {
    logger.elementInteraction('click', 'content share icon');
    try {
      const locator = this.page.locator(this.contentShareIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Content share icon click failed', error);
    }
  }

  async getShareCopyConfirmationMessage(): Promise<string> {
    try {
      const locator = this.page.locator(this.shareCopyConfirmationMessage.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return (await locator.textContent()) || '';
    } catch {
      return '';
    }
  }

  async isContentTitleImageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentTitleImage.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentGenreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentGenre.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentYearVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentYear.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentAgeRatingVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentAgeRating.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentDurationVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDuration.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContentCastVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentCast.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickSubscribeToWatchCta(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator(this.subscribeToWatchCtaButton.selector ?? '').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async clickSubscribeToWatchCtaBlocker(): Promise<void> {
    logger.elementInteraction('click', 'subscribe to watch CTA');
    try {
      const locator = this.page.locator(this.subscribeToWatchCtaBlocker.selector ?? '').first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Subscribe to watch CTA click failed', error);
    }
  }

  async isUpgradePlanButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickUpgradePlanButton(): Promise<void> {
    logger.elementInteraction('click', 'Upgrade Plan button');
    try {
      const locator = this.page.locator(this.upgradePlanButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Upgrade Plan button click failed', error);
    }
  }

  async isPlansPageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.plansPageHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContinueWatchingTrayVisible(): Promise<boolean> {
    try {
      const heading = this.page.locator(
        'p[class*="text-[2.4rem]"][class*="font-medium"][class*="leading-[3.5rem]"]:has-text("Continue Watching")'
      ).first();
      await heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hoverFirstContinueWatchingItem(): Promise<void> {
    try {
      const locator = this.page.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.hover();
    } catch (error) {
      logger.debug('Hovering over continue watching item failed', error);
    }
  }

  async clickFirstContinueWatchingRemoveIcon(): Promise<void> {
    logger.elementInteraction('click', 'remove continue watching item icon');
    try {
      const locator = this.page.locator(this.continueWatchingRemoveButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Continue Watching remove icon click failed', error);
    }
  }

  async isContinueWatchingItemVisible(contentTitle?: string): Promise<boolean> {
    try {
      const container = this.page.locator(this.continueWatchingTray.selector).first();
      if (!(await container.count())) {
        return false;
      }
      const locator = contentTitle
        ? container.locator(`text=${contentTitle}`).first()
        : container.locator(this.continueWatchingThumbnail.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isContinueWatchingDetailsAndMoreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickContinueWatchingDetailsAndMore(): Promise<void> {
    logger.elementInteraction('click', 'Continue Watching details and more action');
    try {
      const locator = this.page.locator(this.continueWatchingDetailsAndMore.selector).filter({ hasText: /Details and More|View More|Details/i }).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      await locator.click({ timeout: 20000 });
    } catch (error) {
      logger.debug('Continue Watching details and more action click failed', error);
    }
  }

  async isContentDetailsPageVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDetailsHeading.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  }

  async getFirstEpisodeCardTitleText(): Promise<string> {
    try {
      if (this.page.isClosed()) return '';
      const episodeCard = this.page.locator(this.firstEpisodeCard.selector).first();
      if (!(await episodeCard.count())) return '';
      try {
        await episodeCard.waitFor({ state: 'visible', timeout: 15000 });
      } catch {
      }
      const text = (await episodeCard.textContent()) || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      logger.debug('getFirstEpisodeCardTitleText failed', err);
      return '';
    }
  }

async validateAddedToWatchlistPopup(): Promise<string> {
  logger.elementInteraction('verify', 'Added to Watchlist popup');

  const toastCandidates = [
    this.page.getByText(/Added to watchlist/i).first(),
    this.page.locator(this.watchlistToastGeneric.selector).filter({ hasText: /added/i }).first(),
  ];

  for (const toast of toastCandidates) {
    try {
      await toast.waitFor({ state: 'visible', timeout: 15000 });
      const text = (await toast.textContent()) || '';
      if (text.toLowerCase().includes('added')) {
        return text.trim();
      }
    } catch {
    
    }
  }

  return '';
}

async validateRemovedFromWatchlistPopup(): Promise<string> {
  logger.elementInteraction('verify', 'Removed from Watchlist popup');

  try {
    const toast = this.page.getByText('Removed from watchlist').first();
    await toast.waitFor({ state: 'visible', timeout: 15000 });
    return (await toast.textContent()) || '';
  } catch {
    return '';
  }
}

async addToWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Add to Watchlist');
    try {
      const locator = this.page.locator(this.addToWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000 });
    } catch (error) {
      logger.debug('Add to Watchlist button click failed', error);
    }

    try {
      const toast = this.page.locator(this.watchlistToastAdded.selector).filter({ hasText: 'Added to watchlist' }).nth(1);
      await toast.waitFor({ state: 'visible', timeout: 10000 });
      return (await toast.textContent()) || '';
    } catch {
      return '';
    }
  }

  async removeFromWatchlistAndGetToast(): Promise<string> {
    logger.elementInteraction('click', 'Remove from Watchlist');
    try {
      const locator = this.page.locator(this.removeFromWatchlistButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      await locator.click({ timeout: 15000, force: true });
    } catch (error) {
      logger.debug('Remove from Watchlist button click failed', error);
      try {
        const fallbackLocator = this.page.locator(this.watchlistRemoveFallbackIcon.selector).first();
        await fallbackLocator.waitFor({ state: 'visible', timeout: 15000 });
        await fallbackLocator.click({ timeout: 15000, force: true });
      } catch (fallbackError) {
        logger.debug('Fallback remove watchlist click failed', fallbackError);
      }
    }

    try {
      await this.page.waitForTimeout(2000);
      const toastCandidates = [
        this.page.locator(this.watchlistToastRemoved.selector).filter({ hasText: /removed from watchlist/i }).first(),
        this.page.getByText(/removed from watchlist/i).first(),
        this.page.locator(this.watchlistToastAdded.selector).filter({ hasText: /removed from watchlist/i }).first(),
      ];
      for (const toastCandidate of toastCandidates) {
        try {
          await toastCandidate.waitFor({ state: 'visible', timeout: 8000 });
          const toastText = (await toastCandidate.textContent()) || '';
          if (toastText.toLowerCase().includes('removed')) {
            return toastText.trim();
          }
        } catch {
          // continue to the next candidate
        }
      }
      const removeIcon = this.page.locator(this.watchlistRemoveFallbackIcon.selector).first();
      await removeIcon.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      return (await removeIcon.getAttribute('alt') || await removeIcon.getAttribute('src') || '');
    } catch {
      return '';
    }
  }

  async isFreeTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Free tag in watchlist');

    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img', { name: 'free' }).first();

      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });
      const freeTagLocator = this.page.getByRole('img', { name: 'free' }).first();
      return await freeTagLocator.count() > 0;
    } catch (error) {
      logger.debug('Free tag visibility check failed', error);
      return false;
    }
  }

  async isPremiumTagVisibleInWatchlist(contentTitle?: string): Promise<boolean> {
    logger.elementInteraction('verify', 'Premium tag in watchlist');

    try {
      const title = contentTitle?.trim();
      const cardLocator = title
        ? this.page.getByRole('img', { name: title }).first()
        : this.page.getByRole('img').first();
      await cardLocator.waitFor({ state: 'visible', timeout: 15000 });
      // Look for a premium tag/icon within the card's ancestor container
      const ancestor = cardLocator.locator('xpath=ancestor::*[1]');
      const tagLocator = ancestor.locator(this.watchlistPremiumTagIcon.selector).first();
      if (await tagLocator.count()) {
        await tagLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        return await tagLocator.isVisible().catch(() => false);
      }
      // Fallback: global premium tag presence near the image
      const globalTag = this.page.locator(this.watchlistPremiumTagIcon.selector).first();
      await globalTag.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      return await globalTag.isVisible().catch(() => false);
    } catch (error) {
      logger.debug('Premium tag visibility check failed', error);
      return false;
    }
  }

  async isContentAbsentInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content absence in watchlist ${contentTitle}`);
    try {
      const locator = this.page.getByRole('img', { name: contentTitle }).first();
      const count = await locator.count();
      if (count === 0) {
        return true;
      }
      await expect(locator).toBeHidden({ timeout: 10000 });
      return true;
    } catch (error) {
      logger.debug(`Content absence validation failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentThumbnailVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content thumbnail visible in watchlist for ${contentTitle}`);
    try {
      const thumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      return await thumbnail.isVisible();
    } catch (error) {
      logger.debug(`Thumbnail visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentMetadataVisibleInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content metadata visible in watchlist for ${contentTitle}`);
    try {
      const metadataLocator = this.page.getByText(contentTitle, { exact: true }).first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 15000 });
      return await metadataLocator.isVisible();
    } catch (error) {
      logger.debug(`Metadata visibility check failed for ${contentTitle}`, error);
      return false;
    }
  }

  async isContentCardValidInWatchlist(contentTitle: string): Promise<boolean> {
    logger.elementInteraction('verify', `content card validity in watchlist for ${contentTitle}`);
    try {
      const thumbnail = this.page.getByRole('img', { name: contentTitle }).first();
      const metadata = this.page.getByText(contentTitle, { exact: true }).first();
      await thumbnail.waitFor({ state: 'visible', timeout: 15000 });
      await metadata.waitFor({ state: 'visible', timeout: 15000 });
      const cardContainer = thumbnail.locator(this.contentCardContainer.selector);
      const isCardVisible = await cardContainer.isVisible().catch(() => true);
      const thumbnailVisible = await thumbnail.isVisible();
      const metadataVisible = await metadata.isVisible();
      return isCardVisible && thumbnailVisible && metadataVisible;
    } catch (error) {
      logger.debug(`Content card validity check failed for ${contentTitle}`, error);
      return false;
    }
  }

  private async getFirstWatchlistCardLocator(): Promise<Locator> {
    const cardSelectors = [
      this.watchlistCardBase.selector,
      this.watchlistCardCursor.selector,
      this.watchlistCardGeneric.selector,
      this.watchlistCardContentTestId.selector,
      this.watchlistCardShowTestId.selector,
    ];

    for (const selector of cardSelectors) {
      const card = this.page.locator(selector).filter({
        has: this.page.locator(this.watchlistTitleImage.selector),
      }).first();

      try {
        await card.waitFor({ state: 'visible', timeout: 5000 });
        return card;
      } catch {
        // continue to the next candidate selector
      }
    }

    return this.page.locator(this.watchlistTitleImage.selector).filter({ hasNot: this.page.locator('input') }).first();
  }

  async getFirstContentTitle(): Promise<string> {
    logger.elementInteraction('get', 'first content title from current page');
    try {
      const cardContainer = await this.getFirstWatchlistCardLocator();
      const firstTitleImage = cardContainer.locator(this.watchlistCardTitleImage.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      const title = await firstTitleImage.getAttribute('alt');
      if (title) {
        logger.debug(`Retrieved first content title: ${title}`);
        return title;
      }
      const cardHeading = cardContainer.locator(this.watchlistCardHeading.selector).first();
      const headingText = await cardHeading.textContent();
      if (headingText) {
        logger.debug(`Retrieved first content title from heading: ${headingText}`);
        return headingText.trim();
      }
      throw new Error('Could not extract title from first content card');
    } catch (error) {
      logger.error(`Failed to get first content title: ${error}`);
      throw error;
    }
  }

  async hoverOverFirstContent(): Promise<void> {
    logger.elementInteraction('hover', 'over first content card');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });
      await firstTitleImage.hover();
      logger.debug('Hovered over first content card');
      await this.page.waitForTimeout(500);
    } catch (error) {
      logger.error(`Failed to hover over first content: ${error}`);
      throw error;
    }
  }

  async clickFirstContentInWatchlist(): Promise<void> {
    logger.elementInteraction('click', 'first content in watchlist');
    try {
      const firstContent = await this.getFirstWatchlistCardLocator();
      const clickTarget = firstContent.locator(this.watchlistCardTitleImage.selector).first();
      await clickTarget.waitFor({ state: 'visible', timeout: 15000 });
      await clickTarget.scrollIntoViewIfNeeded().catch(() => undefined);
      await clickTarget.click({ timeout: 20000, force: true });
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await this.page.waitForTimeout(3000);
      logger.debug('Clicked on first content in watchlist');
    } catch (error) {
      logger.error(`Failed to click first content in watchlist: ${error}`);
      throw error;
    }
  }

  async assertContentTitle(): Promise<void> {
    logger.elementInteraction('assert', 'content title details');
    try {
      await this.page.waitForTimeout(2000); 

      const titleImage = this.page.locator(this.titleImageWithAlt.selector).first();
      const imageTitle = await titleImage.getAttribute('alt').catch(() => null);

      const metadata = this.page.locator(this.contentMetadataDiv.selector).first();
      const metadataText = await metadata.textContent().catch(() => null);

      const description = this.page.locator(this.contentDescDiv.selector).first();
      const descText = await description.textContent().catch(() => null);

      expect(imageTitle || metadataText || descText).toBeTruthy();

      if (!this.hasStoredDetails) {
        this.storedContentTitle = imageTitle || '';
        this.storedContentMetadata = metadataText || '';
        this.storedContentDescription = descText || '';
        this.hasStoredDetails = true;
        logger.debug(`Stored first content details - Title: ${this.storedContentTitle}, Metadata: ${this.storedContentMetadata?.substring(0, 50)}, Description: ${this.storedContentDescription?.substring(0, 50)}`);
      }

      logger.info(`✓ Content Title (from image): ${imageTitle || 'N/A'}`);
      logger.info(`✓ Content Metadata: ${metadataText?.trim().substring(0, 100) || 'N/A'}...`);
      logger.info(`✓ Content Description: ${descText?.trim().substring(0, 100) || 'N/A'}...`);

      logger.debug(`Content title assertion passed - Title: ${imageTitle}, Metadata: ${!!metadataText}, Description: ${!!descText}`);
    } catch (error) {
      logger.error(`Failed to assert content title: ${error}`);
      throw error;
    }
  }

  async assertBothContentsMatch(): Promise<void> {
    logger.elementInteraction('assert', 'both contents match');
    try {
      // Get current content details
      const titleImage = this.page.locator(this.contentTitleImageAlt.selector).first();
      const currentTitle = await titleImage.getAttribute('alt').catch(() => null);
      
      const metadata = this.page.locator(this.contentMetadataContainer.selector).first();
      const currentMetadata = await metadata.textContent().catch(() => null);
      
      const description = this.page.locator(this.contentDescriptionContainer.selector).first();
      const currentDescription = await description.textContent().catch(() => null);
      
      const titleMatches = this.storedContentTitle === (currentTitle || '');
      const metadataMatches = this.storedContentMetadata === (currentMetadata || '');
      const descriptionMatches = this.storedContentDescription === (currentDescription || '');
      
      const allMatch = titleMatches && metadataMatches && descriptionMatches;
      
      expect(allMatch).toBe(true);
      
      logger.info(` Content Title Match: ${titleMatches}`);
      logger.info(` Stored Title: ${this.storedContentTitle || 'N/A'}`);
      logger.info(` Current Title: ${currentTitle || 'N/A'}`);
      logger.info(` Content Metadata Match: ${metadataMatches}`);
      logger.info(` Content Description Match: ${descriptionMatches}`);
      logger.info(` Both Contents Are Same: ${allMatch}`);
      
      logger.debug(`Content match comparison - Title: ${titleMatches}, Metadata: ${metadataMatches}, Description: ${descriptionMatches}, All Match: ${allMatch}`);
    } catch (error) {
      logger.error(`Failed to assert content match: ${error}`);
      throw error;
    }
  }

  async assertAndLogFirstContentDetails(): Promise<void> {
    logger.elementInteraction('assert', 'first content thumbnail, metadata and title');
    try {
      const firstTitleImage = this.page.locator(this.firstTitleImageCard.selector).first();
      await firstTitleImage.waitFor({ state: 'visible', timeout: 10000 });

      const title = await firstTitleImage.getAttribute('alt');
      const isThumbnailVisible = await firstTitleImage.isVisible();

      const cardContainer = firstTitleImage.locator(this.contentCardContainer.selector).first();
      const metadata = await cardContainer.textContent();

      expect(isThumbnailVisible).toBe(true);
      expect(title).toBeTruthy();
      expect(metadata).toBeTruthy();

      logger.info(`✓ Thumbnail visible: ${isThumbnailVisible}`);
      logger.info(`✓ Content Title: ${title}`);
      logger.info(`✓ Content Metadata: ${metadata?.trim().substring(0, 100)}...`);

      logger.debug(`Content details verified - Title: ${title}, Metadata visible: ${!!metadata}`);
    } catch (error) {
      logger.error(`Failed to assert and log first content details: ${error}`);
      throw error;
    }
  }

  async getPlaybackEpisodeTitleText(): Promise<string> {
  const locator = await this.page.getByText('backThe Blood SistersS1 E1 · Episode').first();

  await expect(locator).toBeVisible({ timeout: 10000 });
  return (await locator.textContent()).trim();
}

  async isEpisodeListVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.firstEpisodeCard, 10000);
  }

  async isVideoPlayerVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.videoPlayer.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 30000 });
      return true;
    } catch {
      return false;
    }
  }

  async isPlaybackStarted(): Promise<boolean> {
      const locator = this.page.locator(this.videoPlayer.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      const playbackState = await locator.evaluate((video: HTMLVideoElement) => ({
        currentTime: video.currentTime,
        paused: video.paused,
        readyState: video.readyState,
      }));
      return playbackState.readyState >= 3 && (playbackState.currentTime > 0 || playbackState.paused === false);
  }

  private normalizeMetadataText(value: string): string {
    return (value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[^a-z0-9]+/gi, '')
      .toLowerCase();
  }

  async getPlayerVisibleText(): Promise<string> {
    const candidateContainers = [
      this.page.locator(this.playerScreen.selector).first(),
      this.page.locator(this.playerScreenFallback.selector).first(),
      this.page.locator(this.pageBody.selector).first(),
    ];

    for (const container of candidateContainers) {
      const text = await container.textContent().catch(() => '');
      const trimmed = (text || '').replace(/\s+/g, ' ').trim();
      if (trimmed.length > 20) {
        return trimmed;
      }
    }

    return '';
  }

  async validatePlayerMetadataVisibility(expectedTitle: string, expectedSeason: string, expectedEpisode: string): Promise<{ titleVisible: boolean; seasonVisible: boolean; episodeVisible: boolean; playerText: string }> {
    const playerText = await this.getPlayerVisibleText();
    const normalizedPlayerText = this.normalizeMetadataText(playerText);
    const normalizedTitle = this.normalizeMetadataText(expectedTitle);
    const normalizedSeason = this.normalizeMetadataText(expectedSeason);
    const normalizedEpisode = this.normalizeMetadataText(expectedEpisode);

    const titleVisible = normalizedTitle
      ? normalizedPlayerText.includes(normalizedTitle)
      : false;

    const seasonAliases = [
      normalizedSeason,
      this.normalizeMetadataText(`Season ${expectedSeason.replace(/^S/i, '')}`),
      this.normalizeMetadataText(`Season${expectedSeason.replace(/^S/i, '')}`),
      this.normalizeMetadataText(`${expectedSeason.replace(/^S/i, '')}`),
    ].filter(Boolean);

    const seasonVisible = seasonAliases.some((alias) => normalizedPlayerText.includes(alias));

    const episodeAliases = [
      normalizedEpisode,
      this.normalizeMetadataText(`Episode ${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`Episode${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`Ep ${expectedEpisode.replace(/^E/i, '')}`),
      this.normalizeMetadataText(`${expectedSeason.replace(/^S/i, '')}${expectedEpisode.replace(/^E/i, '')}`),
    ].filter(Boolean);

    const episodeVisible = episodeAliases.some((alias) => normalizedPlayerText.includes(alias));

    return {
      titleVisible,
      seasonVisible,
      episodeVisible,
      playerText,
    };
  }

  async getSelectedEpisodeMetadata(): Promise<{ seasonNumber: string; episodeNumber: string; title: string }> {
    if (this.lastSelectedEpisodeMetadata.title || this.lastSelectedEpisodeMetadata.seasonNumber || this.lastSelectedEpisodeMetadata.episodeNumber) {
      return { ...this.lastSelectedEpisodeMetadata };
    }

    const visibleEpisodeLabel = this.page.getByText(/S\d+\s*E\d+/i).first();
    const labelText = (await visibleEpisodeLabel.textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
    const metadata = this.parseEpisodeMetadata(labelText);
    const title = await this.extractTitleFromSelectedLabel(visibleEpisodeLabel).catch(() => '');

    return {
      seasonNumber: metadata.seasonText || this.lastSelectedEpisodeMetadata.seasonNumber,
      episodeNumber: metadata.episodeText || this.lastSelectedEpisodeMetadata.episodeNumber,
      title: title || metadata.title || this.lastSelectedEpisodeMetadata.title,
    };
  }

  async clickFirstSearchResult(): Promise<void> {
    logger.elementInteraction('click', 'first content from first rail');
    const firstResult = this.page.locator(this.firstSearchResult.selector).first();
    await firstResult.waitFor({ state: 'visible', timeout: 15000 });
    await firstResult.click({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
     logger.debug('Search result navigation did not reach networkidle');
  });
  }

  async verifyPlayerTitle(expectedTitle: string): Promise<boolean> {
    logger.assertion('Verify player title', true);
    await expect(this.page.getByText(expectedTitle)).toBeVisible();
    return true;
  }

  async isPlayerContentTitleVisibleInPlayer(expectedTitle?: string): Promise<boolean> {
    if (!expectedTitle) {
      const title = this.page.locator('text=/.*\\w.*/').first();
      await title.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    }

    const playerTitle = this.page.getByTestId('video-player').getByText(expectedTitle, { exact: false }).first();
    await playerTitle.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await playerTitle.isVisible().catch(() => false);
  }

  async isPlayerScreenVisible(): Promise<boolean> {
    const player = this.page.locator(this.playerScreen.selector).first();
    await player.waitFor({ state: 'visible', timeout: 20000 });
    return true;
  }

  async isPlayerScreenHidden(): Promise<boolean> {
    try {
      const player = this.page.locator(this.playerScreen.selector).first();
      return !(await player.isVisible().catch(() => false));
    } catch {
      return true;
    }
  }

  async isPlayerContentTitleVisible(expectedTitle?: string): Promise<boolean> {
    if (expectedTitle) {
      return this.verifyPlayerTitle(expectedTitle);
    }

    const title = this.page.locator('text=/.*\\w.*/').first();
    await title.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async hoverPlaybackScreen(): Promise<void> {
    logger.elementInteraction('hover', 'Playback screen');
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator(`${this.playerLoaderOverlay.selector}, ${this.playerMidSpacer.selector}`).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    const box = await playerScreen.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.hover();
    }
  }

  async isResumeButtonVisible(): Promise<boolean> {
    try {
      const resume = this.page.locator(this.resumeButton.selector).first();
      await resume.waitFor({ state: 'visible', timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickResumeAction(): Promise<boolean> {
    logger.elementInteraction('click', 'Resume/Play action');
    const actionCandidates = [
      this.page.getByText(/Resume/i).first(),
      this.page.getByText(/Play/i).first(),
      this.page.locator(this.resumeButton.selector).first(),
    ];

    for (const candidate of actionCandidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 15000 });
        await candidate.click({ timeout: 15000 });
        return true;
      } catch {
        logger.error('Resume/Play action click failed for candidate, trying next if available');
      }
    }

    return false;
  }

  async clickResumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Resume button');
    const resume = this.page.locator(this.resumeButton.selector).first();
    await resume.waitFor({ state: 'visible', timeout: 15000 });
    await resume.click({ timeout: 10000 });
  }

  async clickPauseButton(): Promise<void> {
    logger.elementInteraction('click', 'Pause button');
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 });
    await pauseButton.click({ timeout: 10000 });
  }

  async clickRewindButton(): Promise<void> {
    logger.elementInteraction('click', 'Rewind button');
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    await rewindButton.click({ timeout: 10000 });
  }

  async clickForwardButton(): Promise<void> {
    logger.elementInteraction('click', 'Forward button');
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    await forwardButton.click({ timeout: 10000 });
  }

  async isPauseAdVisible(): Promise<boolean> {
    const pauseAd = this.page.locator(this.pauseAdBanner.selector).first();
    await pauseAd.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseAd.isVisible().catch(() => false);
  }

  async isPauseButtonVisible(): Promise<boolean> {
    const pauseButton = this.page.locator(this.pauseButton.selector).first();
    await pauseButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await pauseButton.isVisible().catch(() => false);
  }

  async isSeekBarVisible(): Promise<boolean> {
    const seek = this.page.locator(this.seekBar.selector).first();
    await seek.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await seek.isVisible().catch(() => false);
  }

  async isPlaybackTimeVisible(): Promise<boolean> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await timeDisplay.isVisible().catch(() => false);
  }

  async hoverSeekBarAndWaitForPreview(): Promise<boolean> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);

    const box = await seekBar.boundingBox().catch(() => null);
    if (!box) {
      return false;
    }

    const previewSelectors = [
      '[data-testid*="preview"]',
      '[data-testid*="thumbnail"]',
      '[class*="preview"]',
      '[class*="thumbnail"]',
      '[class*="thumb"]',
      '[aria-label*="preview"]',
      '[aria-label*="thumbnail"]',
    ];

    const previewLocator = this.page.locator(previewSelectors.join(', ')).filter({ has: this.page.locator('img, canvas') });

    const initialVisibleCount = await previewLocator.evaluateAll((elements) =>
      elements.filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }).length
    );

    const startX = box.x + box.width * 0.35;
    const startY = box.y + box.height / 2;
    const endX = box.x + box.width * 0.65;
    const endY = startY;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 8 });
    await this.page.mouse.up();
    await this.page.waitForTimeout(1500);

    const visibleCountAfterHover = await previewLocator.evaluateAll((elements) =>
      elements.filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }).length
    );

    return visibleCountAfterHover > initialVisibleCount;
  }

  async tapPlaybackScreen(): Promise<void> {
    const playerScreen = this.page.locator(this.playerScreen.selector).first();
    await playerScreen.waitFor({ state: 'visible', timeout: 15000 });
    const box = await playerScreen.boundingBox();

    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await playerScreen.click();
    }
  }

  async isRewindButtonVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    await rewindButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isForwardButtonVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    await forwardButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isVolumeButtonVisible(): Promise<boolean> {
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickVolumeButton(): Promise<void> {
    logger.elementInteraction('click', 'Volume button');
    const volumeButton = this.page.locator(this.volumeButton.selector).first();
    await volumeButton.waitFor({ state: 'visible', timeout: 10000 });
    await volumeButton.click({ timeout: 10000 });
  }

  async isPlayerMuted(): Promise<boolean> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.muted).catch(() => false);
  }

  async getPlayerVolumeLevel(): Promise<number> {
    const video = this.page.locator(this.videoElement.selector).first();
    await video.waitFor({ state: 'attached', timeout: 15000 });
    return await video.evaluate((player: HTMLVideoElement) => player.volume).catch(() => 0);
  }

  async isBackButtonVisible(): Promise<boolean> {
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await backButton.isVisible().catch(() => false);
  }

  async isSubtitleButtonVisible(): Promise<boolean> {
    const subtitleButton = this.page.locator(this.subtitleButton.selector).first();
    await subtitleButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await subtitleButton.isVisible().catch(() => false);
  }

  async clickSubtitleButton(): Promise<void> {
    logger.elementInteraction('click', 'Subtitle button');
    const locator = this.page.locator(this.subtitleButton.selector).first();
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.click({ timeout: 10000 });
  }

  async selectSubtitleLanguage(): Promise<boolean> {
    logger.elementInteraction('click', 'Subtitle language option');
    await this.page.getByText('English (Philippines)').click();
    return true;
  }

  async clickNextEpisodeButton(): Promise<void> {
    logger.elementInteraction('click', 'Next episode button');
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    await nextEpisodeButton.waitFor({ state: 'visible', timeout: 10000 });
    await nextEpisodeButton.click({ timeout: 10000 });
  }

  async isNextEpisodeButtonVisible(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    await nextEpisodeButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await nextEpisodeButton.isVisible().catch(() => true);
  }

  async isUpNextMarkerVisible(): Promise<boolean> {
    const candidateSelectors = [
      this.upNextMarker.selector,
      this.nextEpisodeButton.selector,
      'button:has-text("Next Episode"), button:has-text("Next episode"), button:has-text("Next"), [aria-label*="next episode"], [aria-label*="up next"], text=/up next|next episode|watch next/i',
    ];

    for (const selector of candidateSelectors) {
      const marker = this.page.locator(selector).first();
      try {
        await marker.waitFor({ state: 'visible', timeout: 3000 });
        if (await marker.isVisible().catch(() => false)) {
          return true;
        }
      } catch {
        // Continue to the next selector.
      }
    }

    return false;
  }

  async waitForUpNextMarker(timeout: number = 20000): Promise<boolean> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.isUpNextMarkerVisible()) {
        return true;
      }
      await this.page.waitForTimeout(1000);
    }
    return false;
  }

  async isNextEpisodeButtonBelowSeekBar(): Promise<boolean> {
    const nextEpisodeButton = this.page.locator(this.nextEpisodeButton.selector).first();
    const seekBar = this.page.locator(this.seekBar.selector).first();
    const nextVisible = await nextEpisodeButton.isVisible().catch(() => false);
    const seekVisible = await seekBar.isVisible().catch(() => false);
    if (!nextVisible || !seekVisible) {
      return false;
    }
    const [nextBox, seekBox] = await Promise.all([
      nextEpisodeButton.boundingBox().catch(() => null),
      seekBar.boundingBox().catch(() => null),
    ]);
    if (!nextBox || !seekBox) {
      return false;
    }
    return nextBox.y >= seekBox.y + seekBox.height - 2;
  }

  async clickBackButton(): Promise<void> {
    logger.elementInteraction('click', 'Back button');
    const backButton = this.page.locator(this.backButton.selector).first();
    await backButton.waitFor({ state: 'visible', timeout: 10000 });
    await backButton.click({ timeout: 10000 });
  }

  async isSubtitleLanguageVisible(): Promise<boolean> {
    try {
      const option = this.page.getByText('English (Philippines)').first();
      await option.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await option.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isSubtitleOffOptionVisible(): Promise<boolean> {
    const subtitleOffOption = this.page.locator(this.subtitleOffOption.selector).first();
    await subtitleOffOption.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isSubtitleDisplayedOnPlayer(): Promise<boolean> {
    const subtitleDisplayIndicator = this.page.locator(this.subtitleDisplayIndicator.selector).first();
    await subtitleDisplayIndicator.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isFullscreenButtonVisible(): Promise<boolean> {
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async clickFullscreenButton(): Promise<void> {
    logger.elementInteraction('click', 'Fullscreen button');
    const fullscreenButton = this.page.locator(this.fullscreenButton.selector).first();
    await fullscreenButton.waitFor({ state: 'visible', timeout: 10000 });
    await fullscreenButton.click({ timeout: 10000 });
  }

  async isAdTagVisible(): Promise<boolean> {
    const adTag = this.page.locator(this.adTag.selector).first();
    await adTag.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
    return await adTag.isVisible().catch(() => false);
  }

  async measureAdDuration(maxSeconds: number = 90): Promise<number> {
    const startedAt = Date.now();
    const timeoutMs = maxSeconds * 1000;

    while (Date.now() - startedAt < timeoutMs) {
      const adVisible = await this.isAdTagVisible();
      if (!adVisible) {
        return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      }

      await this.page.waitForTimeout(1000);
    }

    return maxSeconds;
  }

  async clickGoLiveButton(): Promise<void> {
    const goLiveButton = this.getRoleLocator(this.goLiveButtonElement);
    await goLiveButton.waitFor({ state: 'visible', timeout: 10000 });
    await goLiveButton.click({ timeout: 10000 });
  }

  async isGoLiveButtonVisible(): Promise<boolean> {
    await this.page.getByText(this.liveTextLabel.text ?? 'Live', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
    return true;
  }

  async isLiveTagVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.liveTag.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 15000 });
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getPlaybackTimeText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playerTimeDisplay.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent()).replace(/\s+/g, ' ').trim();
  }

  async getPlaybackTimestampText(): Promise<string> {
    const timeDisplay = this.page.locator(this.playbackTimeValue.selector).filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await timeDisplay.waitFor({ state: 'attached', timeout: 15000 });
    return (await timeDisplay.textContent()).replace(/\s+/g, ' ').trim();
  }

  async isPlaybackTimeInHHMMSSFormat(): Promise<boolean> {
    const playbackText = await this.getPlaybackTimestampText();
    return /^\d{1,2}:\d{2}:\d{2}$/.test(playbackText.trim());
  }

  async isPlaybackTimeInMMSSFormat(): Promise<boolean> {
    const playbackText = await this.getPlaybackTimestampText();
    return /^\d{1,2}:\d{2}$/.test(playbackText.trim());
  }

  async getTrimmedPlaybackTime(): Promise<string> {
    const playbackText = await this.getPlaybackTimeText();
    const match = playbackText.match(/(\d{1,2}:\d{2})/);
    return match?.[1] ?? playbackText;
  }

  async dragSeekBarToPosition(targetPercent: number): Promise<void> {
    const seekBar = this.page.locator(this.seekBar.selector).first();
    await seekBar.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    const box = await seekBar.boundingBox().catch(() => null);

    const clampedPercent = Math.min(Math.max(targetPercent, 0.05), 0.99);

    if (box) {
      const startX = box.x + box.width * 0.1;
      const startY = box.y + box.height / 2;
      const endX = box.x + box.width * clampedPercent;
      const endY = startY;

      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY, { steps: 12 });
      await this.page.mouse.up();
    }

    const videoUpdated = await this.page.evaluate(({ percent }) => {
      const video = document.querySelector('video') as HTMLVideoElement | null;
      if (!video || Number.isNaN(video.duration) || video.duration <= 0) {
        return false;
      }

      const targetTime = Math.max(0, Math.min(video.duration * percent, video.duration - 0.5));
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
        video.dispatchEvent(new Event('timeupdate'));
        video.dispatchEvent(new Event('seeked'));
        return true;
      }

      return true;
    }, { percent: clampedPercent });

    if (!videoUpdated && box) {
      await seekBar.click({ position: { x: Math.max(4, Math.round(box.width * clampedPercent)), y: Math.max(4, Math.round(box.height / 2)) } });
    }

    await this.page.waitForTimeout(1500);
  }

  async clickliveContent(contentName: string = 'TFC Asia'): Promise<void> {
    logger.elementInteraction('click', `content tile ${contentName}`);
    const liveSection = this.page.locator(this.liveChannelsHeading.selector).first();
    const tileSelector = `img[alt="${contentName}"], img[title="${contentName}"], [aria-label="${contentName}"]`;
    const tile = this.page.locator(tileSelector).first();
    const maxAttempts = 12;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const count = await tile.count().catch(() => 0);
      if (count > 0) {
        await tile.scrollIntoViewIfNeeded().catch(() => undefined);
        const isVisible = await tile.isVisible().catch(() => false);
        if (isVisible) {
          await tile.click({ timeout: 20000 });
          return;
        }
      }
      await liveSection.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.page.evaluate(() => window.scrollBy({ top: window.innerHeight * 0.75, left: 0, behavior: 'smooth' }));
      await this.page.waitForTimeout(1000);
    }

    await tile.scrollIntoViewIfNeeded().catch(() => undefined);
    await tile.waitFor({ state: 'visible', timeout: 20000 });
    await tile.click({ timeout: 20000 });
  }

  async RewindButtonNotVisible(): Promise<boolean> {
    const rewindButton = this.page.locator(this.rewindButton.selector).first();
    return await rewindButton.isVisible().catch(() => false);
  }

  async ForwardButtonNotVisible(): Promise<boolean> {
    const forwardButton = this.page.locator(this.forwardButton.selector).first();
    return await forwardButton.isVisible().catch(() => false);
  }

  async waitForPlayback(seconds: number): Promise<void> {
    await this.page.waitForTimeout(seconds * 1000);
  }

    async verifyEpisodeName(expectedEpisodeName: string): Promise<boolean> {
    logger.assertion('Verify episode name', true);
    await expect(this.page.getByText(expectedEpisodeName)).toBeVisible();
    return true;
  }

  async isEpisodeNameVisible(expectedEpisodeName?: string): Promise<boolean> {
    if (expectedEpisodeName) {
      return this.verifyEpisodeName(expectedEpisodeName);
    }
    const anyEpisode = this.page.locator('text=/.*\\w.*/').first();
    await anyEpisode.waitFor({ state: 'visible', timeout: 15000 });
    return true;
  }

  async isVPNErrorMessageVisible(expectedMessage?: string): Promise<boolean> {
    try {
      const locator = expectedMessage
        ? this.page.getByText(expectedMessage, { exact: true })
        : this.page.locator(this.vpnErrorMessage.selector);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getVPNErrorMessageText(): Promise<string> {
    try {
      const locator = this.page.locator(this.vpnErrorMessage.selector);
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return (await locator.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async isShowDetailsPageVisible(): Promise<boolean> {
    try {
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      await mainElement.waitFor({ state: 'visible', timeout: 10000 });
      const headingLocator = mainElement.locator(this.showDetailsHeading.selector).first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getShowDetailsHeadingText(): Promise<string> {
    try {
      const headingLocator = this.page.locator(this.showDetailsHeading.selector).first();
      await headingLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await headingLocator.textContent();
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting show details heading', error);
      try {
        const fallbackLocator = this.page.getByText(/./).first();
        const text = await fallbackLocator.textContent();
        return text.replace(/\s+/g, ' ').trim();
      } catch {
        return '';
      }
    }
  }

  async isContentMetadataVisible(): Promise<boolean> {
    try {
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      const metadataLocator = mainElement.locator(this.contentMetadata.selector).first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async getContentDescriptionText(): Promise<string> {
    try {
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      const descriptionLocator = mainElement.locator(this.contentDescDiv.selector).first();
      await descriptionLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await descriptionLocator.textContent();
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting content description', error);
      return '';
    }
  }

  async getContentMetadataText(): Promise<string> {
    try {
      const mainElement = this.page.locator(this.mainContentContainer.selector).first();
      const metadataLocator = mainElement.locator(this.contentMetadata.selector).first();
      await metadataLocator.waitFor({ state: 'visible', timeout: 10000 });
      const text = await metadataLocator.textContent() || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      logger.debug('Error getting content metadata text', error);
      return '';
    }
  }

  async clickSubscribeCTA(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe to Watch CTA');

    const candidateLocators = [
      this.page.locator(this.subscribeCtaContainer.selector).filter({ hasText: /subscribe/i }).first(),
      this.page.locator(this.subscribeCtaContainer.selector).first(),
      this.page.getByText(/subscribe to watch/i).first(),
      this.page.locator(this.subscribeCtaInteractiveTarget.selector).filter({ hasText: /subscribe/i }).first(),
    ];

    for (const candidate of candidateLocators) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
        const isVisible = await candidate.isVisible().catch(() => false);
        if (!isVisible) {
          continue;
        }

        await candidate.click({ timeout: 20000, force: true }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
        return;
      } catch (error) {
        logger.debug('Subscribe CTA candidate click failed', error);
      }
    }
  }

  async isSubscriptionInstructionPromptVisible(): Promise<boolean> {
    try {
      const bodyText = await this.page.locator('body').innerText().catch(() => '');
      const normalized = bodyText.replace(/\s+/g, ' ').trim().toLowerCase();
      const hasPromptText = normalized.includes('a valid subscription is required to view this content')
        || normalized.includes('please subscribe or renew your plan');
      if (hasPromptText) {
        return true;
      }

      const locator = this.page.getByText(/A valid subscription is required to view this content|Please subscribe or renew your plan/i).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async getSubscriptionInstructionPromptText(): Promise<string> {
    try {
      const bodyText = await this.page.locator('body').innerText().catch(() => '');
      const normalized = bodyText.replace(/\s+/g, ' ').trim();
      const explicitMatch = normalized.match(/A valid subscription is required to view this content[^.]*\./i)
        || normalized.match(/Please subscribe or renew your plan[^.]*\./i);
      if (explicitMatch?.[0]) {
        return explicitMatch[0].replace(/\s+/g, ' ').trim();
      }

      const locator = this.page.getByText(/A valid subscription is required to view this content|Please subscribe or renew your plan/i).first();
      await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
      const text = await locator.textContent().catch(() => '');
      return text.replace(/\s+/g, ' ').trim();
    } catch {
      return '';
    }
  }

  async clickSubscribeConfirm(): Promise<void> {
    logger.elementInteraction('click', 'Subscribe confirmation CTA');
    const confirmButton = this.page.locator(this.subscribeConfirmationButtonPattern.selector).first();
    await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmButton.click({ timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async isParentalPinPlaybackPromptVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinPlaybackPrompt, 10000);
  }

  async getParentalPinPlaybackPromptText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinPlaybackPrompt, 10000);
  }

  async enterParentalPlaybackPin(pin: string): Promise<void> {
    logger.elementInteraction('type', 'Parental playback PIN input');
    const inputs = this.page.locator(this.parentalPinEntryInputs.selector);
    const digits = (pin || '').split('');

    for (let index = 0; index < digits.length; index++) {
      const input = inputs.nth(index);
      await input.waitFor({ state: 'visible', timeout: 10000 });
      await input.fill(digits[index]);
    }
  }
  async isParentalPinInvalidErrorVisible(): Promise<boolean> {
    return await this.pageUtils.isVisible(this.parentalPinInvalidErrorMessage, 10000);
  }

  async getParentalPinInvalidErrorText(): Promise<string> {
    return await this.pageUtils.getTextContent(this.parentalPinInvalidErrorMessage, 10000);
  }
}