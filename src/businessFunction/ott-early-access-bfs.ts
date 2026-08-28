import { OTTEarlyAccessPage } from '../pom/OTTEarlyAccessPage';
import { loginToOTT } from './ott-auth-bfs';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { logger } from '../utils/logger';
import { de } from '@faker-js/faker';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';

export interface VerifyEarlyAccessInput {
    mode?: string;
    labelText: string;
    earlyAccessAttributeValue: string;
    graphqlQueryName: string
}

export interface VerifyEarlyAccessOutput {
    loggedIn: boolean;
    foundInGraphQL: boolean;
    railName?: string;
    assetTitle?: string;
    labelVisible: boolean;
}

export interface VerifyEarlyAccessUpgradePromptInput extends VerifyEarlyAccessInput {
    expectedUpgradeTitle: string;
    expectedUpgradeDescription: string;
    expectedMaybeLaterText: string;
    expectedUpgradeCtaText: string;
}

export interface VerifyEarlyAccessUpgradePromptOutput {
    loggedIn: boolean;
    foundInGraphQL: boolean;
    upgradeIconVisible: boolean;
    titleVisible: boolean;
    descriptionVisible: boolean;
    maybeLaterVisible: boolean;
    upgradeCtaVisible: boolean;
}

export interface VerifyEarlyAccessContinueWatchingOutput {
    loggedIn: boolean;
    foundInGraphQL: boolean;
    assetVisibleInContinueWatching: boolean;
}

export interface VerifyEarlyAccessPlaybackOutput {
    query?: string;
    earlyAccessTagVisible: boolean;
    episodeClicked: boolean;
    playbackStarted: boolean;
    playerTitleVisible: boolean;
}

export interface VerifyEarlyAccessPlaybackInput {
    mode?: string;
    graphqlQueryName?: string;
    labelText?: string;
}

export async function verifyEarlyAccessTag(page: any, input: VerifyEarlyAccessInput): Promise<VerifyEarlyAccessOutput> {
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = GraphQLHelper.getInstance(page);
    logger.step('Logging in before verifying Early Access tag');
    const login = await loginToOTT(page, { mode: input.mode });
    const loggedIn = login.isLoggedIn;
    if (!loggedIn) {
        logger.assertion('User must be logged in for Early Access validation', false);
        return { loggedIn: false, foundInGraphQL: false, labelVisible: false };
    }
    logger.step('Waiting for Collection GraphQL operation');
    const collectionResponse = await gql.waitForOperation(input.graphqlQueryName);
    const parser = new CollectionParser(collectionResponse as any);
    const found = parser.findAssetByLabel(input.labelText);
    if (!found) {
        logger.assertion(`Asset with label ${input.labelText} found in collection`, false);
        return { loggedIn: true, foundInGraphQL: false, labelVisible: false };
    }
    const railName = found.rail.title;
    const assetTitle = found.asset.title;
    logger.info(`Early Access candidate found in rail: ${railName}`);
    logger.info(`Early Access asset title: ${assetTitle}`);
    await earlyAccessPage.scrollToRail(railName);
    const assetLocator = await earlyAccessPage.findAssetLocatorByTitle(assetTitle);
    const labelVisible = await earlyAccessPage.isLabelVisibleForAsset(assetLocator, input.earlyAccessAttributeValue);
    logger.assertion('Early Access label visible near asset', labelVisible);
    return {
        loggedIn: true,
        foundInGraphQL: true,
        railName,
        assetTitle,
        labelVisible,
    };
}

export async function verifyEarlyAccessUpgradePromptMessage(page: any, input: VerifyEarlyAccessUpgradePromptInput): Promise<VerifyEarlyAccessUpgradePromptOutput> {
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = GraphQLHelper.getInstance(page);
    logger.step('Logging in before verifying the Early Access upgrade prompt');
    const login = await loginToOTT(page, { mode: input.mode });
    const loggedIn = login.isLoggedIn;
    let foundInGraphQL = false;
    let upgradeIconVisible = false;
    let titleVisible: boolean;
    let descriptionVisible: boolean;
    let maybeLaterVisible: boolean;
    let upgradeCtaVisible: boolean;
    if (loggedIn) {
        logger.step('Waiting for Collection GraphQL operation');
        const collectionResponse = await gql.waitForOperation(input.graphqlQueryName);
        const parser = new CollectionParser(collectionResponse as any);
        const found = parser.findAssetByLabel(input.labelText);
        if (found) {
            foundInGraphQL = true;
            const railName = found.rail.title;
            const assetTitle = found.asset.title;
            logger.info(`Early Access candidate found in rail: ${railName}`);
            logger.info(`Early Access asset title: ${assetTitle}`);
            await earlyAccessPage.scrollToRail(railName);
            const assetLocator = await earlyAccessPage.findAssetLocatorByTitle(assetTitle);
            const labelVisible = await earlyAccessPage.isLabelVisibleForAsset(assetLocator, input.earlyAccessAttributeValue);
            if (labelVisible) {
                await page.waitForTimeout(5000)
                await earlyAccessPage.openAssetDetails(assetTitle);
                await page.waitForTimeout(5000)
                const playClicked = await earlyAccessPage.openLatestEarlyAccessEpisode(input.earlyAccessAttributeValue);
                if (playClicked) {
                    const promptResult = await earlyAccessPage.verifyUpgradePromptMessage();
                    upgradeIconVisible = promptResult.upgradeIconVisible;
                    titleVisible = promptResult.titleVisible;
                    descriptionVisible = promptResult.descriptionVisible;
                    maybeLaterVisible = promptResult.maybeLaterVisible;
                    upgradeCtaVisible = promptResult.upgradeCtaVisible;
                }
            }
        }
    }
    if (!loggedIn) {
        logger.assertion('User must be logged in for Early Access prompt validation', false);
    } else if (!foundInGraphQL) {
        logger.assertion(`Asset with label ${input.labelText} found in collection`, false);
    }
    logger.assertion('Early Access upgrade icon visible', upgradeIconVisible);
    logger.assertion('Upgrade prompt title visible', titleVisible);
    logger.assertion('Upgrade prompt description visible', descriptionVisible);
    logger.assertion('Maybe later CTA visible', maybeLaterVisible);
    logger.assertion('Upgrade CTA visible', upgradeCtaVisible);
    return {
        loggedIn,
        foundInGraphQL,
        upgradeIconVisible,
        titleVisible,
        descriptionVisible,
        maybeLaterVisible,
        upgradeCtaVisible,
    };
}

export async function verifyEarlyAccessEpisodeTag(page: any, input: VerifyEarlyAccessInput): Promise<VerifyEarlyAccessOutput> {
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = GraphQLHelper.getInstance(page);
    logger.step('Logging in before verifying the Early Access episode tag');
    const login = await loginToOTT(page, { mode: input.mode });
    const loggedIn = login.isLoggedIn;
    if (!loggedIn) {
        logger.assertion('User must be logged in for Early Access validation', false);
        return { loggedIn: false, foundInGraphQL: false, labelVisible: false };
    }
    logger.step('Waiting for Collection GraphQL operation');
    const collectionResponse = await gql.waitForOperation(input.graphqlQueryName);
    const parser = new CollectionParser(collectionResponse as any);
    const found = parser.findAssetByLabel(input.labelText);
    if (!found) {
        logger.assertion(`Asset with label ${input.labelText} found in collection`, false);
        return { loggedIn: true, foundInGraphQL: false, labelVisible: false };
    }
    const railName = found.rail.title;
    const assetTitle = found.asset.title;
    logger.info(`Early Access candidate found in rail: ${railName}`);
    logger.info(`Early Access asset title: ${assetTitle}`);
    await earlyAccessPage.scrollToRail(railName);
    const assetLocator = await earlyAccessPage.findAssetLocatorByTitle(assetTitle);
    const labelVisible = await earlyAccessPage.isLabelVisibleForAsset(assetLocator, input.earlyAccessAttributeValue);
    if (!labelVisible) {
        logger.assertion('Early Access label not visible on content thumbnail', false);
        return { loggedIn: true, foundInGraphQL: true, labelVisible: false };
    }
    await earlyAccessPage.openAssetDetails(assetTitle);
    const episodeLabelVisible = await earlyAccessPage.isEpisodeLabelVisible(input.earlyAccessAttributeValue);
    logger.assertion('Early Access label visible on episode thumbnail', episodeLabelVisible);
    return {
        loggedIn: true,
        foundInGraphQL: true,
        labelVisible: episodeLabelVisible,
    };
}

export async function verifyEarlyAccessNotInContinueWatchingAfterPlayback(page: any, input: VerifyEarlyAccessInput): Promise<VerifyEarlyAccessContinueWatchingOutput> {
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const authPage = new OTTAuthPage(page);
    const playbackPage = new OTTPlaybackPage(page);
    const gql = GraphQLHelper.getInstance(page);
    logger.step('Logging in before verifying the Early Access Continue Watching scenario');
    const login = await loginToOTT(page, { mode: input.mode });
    const loggedIn = login.isLoggedIn;
    if (!loggedIn) {
        logger.assertion('User must be logged in for Early Access Continue Watching validation', false);
        return { loggedIn: false, foundInGraphQL: false, assetVisibleInContinueWatching: false };
    }
    logger.step('Waiting for Collection GraphQL operation');
    const collectionResponse = await gql.waitForOperation(input.graphqlQueryName);
    const parser = new CollectionParser(collectionResponse as any);
    const found = parser.findAssetByLabel(input.labelText);
    if (!found) {
        logger.assertion(`Asset with label ${input.labelText} found in collection`, false);
        return { loggedIn: true, foundInGraphQL: false, assetVisibleInContinueWatching: false };
    }
    const railName = found.rail.title;
    const assetTitle = found.asset.title;
    logger.info(`Early Access candidate found in rail: ${railName}`);
    logger.info(`Early Access asset title: ${assetTitle}`);
    await earlyAccessPage.scrollToRail(railName);
    const assetLocator = await earlyAccessPage.findAssetLocatorByTitle(assetTitle);
    const labelVisible = await earlyAccessPage.isLabelVisibleForAsset(assetLocator, input.earlyAccessAttributeValue);
    if (!labelVisible) {
        logger.assertion('Early Access label not visible on content thumbnail', false);
        return { loggedIn: true, foundInGraphQL: true, assetVisibleInContinueWatching: false };
    }
    await earlyAccessPage.openAssetDetails(assetTitle);
    await earlyAccessPage.isEpisodeLabelVisible(input.earlyAccessAttributeValue);
    const playClicked = await earlyAccessPage.openLatestEarlyAccessEpisode(input.earlyAccessAttributeValue);
    if (!playClicked) {
        logger.assertion('Could not open the latest Early Access episode', false);
        return { loggedIn: true, foundInGraphQL: true, assetVisibleInContinueWatching: false };
    }
    await playbackPage.clickFirstAvailablePlayButton().catch(() => undefined);
    await page.waitForTimeout(30000);
    await page.reload()
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
    await authPage.waitForContinueWatchingTrayToBeReady(60000);
    const itemStatus = await authPage.isContinueWatchingItemVisibleWithTag(assetTitle, input.earlyAccessAttributeValue);
    const visibleInContinueWatching = itemStatus.visible && itemStatus.hasTag;
    logger.assertion('The played asset should not be shown with the Early Access badge in Continue Watching tray', !visibleInContinueWatching);
    return {
        loggedIn: true,
        foundInGraphQL: true,
        assetVisibleInContinueWatching: visibleInContinueWatching,
    }
}
export async function verifyEarlyAccessPlaybackFlow(page: any, input?: VerifyEarlyAccessPlaybackInput): Promise<VerifyEarlyAccessPlaybackOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const playbackPage = new OTTPlaybackPage(page);
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = GraphQLHelper.getInstance(page);
    const mode = input?.mode;
    logger.step('Starting Early Access Maybe Later navigation verification flow');
    const loginResult = await loginToOTT(page, { mode });
    const collectionResponse = await gql.waitForOperation(input?.graphqlQueryName ?? 'Collection');
    const parser = new CollectionParser(collectionResponse as any);
    const foundAsset = parser.findAssetByLabel(input?.labelText ?? 'Early Access');
    if (!foundAsset?.asset?.title) {
        logger.warn('Early Access asset not found in Collection GraphQL response');
        return {
            earlyAccessTagVisible: false,
            episodeClicked: false,
            playbackStarted: false,
            playerTitleVisible: false,
        };
    }
    const query = (foundAsset.asset.title ?? '').trim();
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    await authPage.submitSearchQuery();
    await authPage.isSearchResultsVisible(query);
    await page.waitForTimeout(5000);
    await detailsPage.clickFirstSearchResult();
    await detailsPage.isShowDetailsPageVisible();
    await page.waitForTimeout(3000);
    await earlyAccessPage.scrollUntilEarlyAccessTagVisible();
    const earlyAccessTagVisible = await earlyAccessPage.scrollUntilEarlyAccessTagVisible();
    logger.assertion('Early Access tag visible on episode thumbnail', earlyAccessTagVisible);
    await page.waitForTimeout(3000);
    const episodeClicked = await earlyAccessPage.clickEpisodeCardWithEarlyAccessTag();
    logger.assertion('Early Access episode clicked', episodeClicked);
    await page.waitForTimeout(3000);
    await detailsPage.clickPlayButton();
    await detailsPage.hoverPlaybackScreen();
    const playbackStarted = await detailsPage.isPlaybackTimeVisible();
    const playerTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer();
    logger.assertion('Playback started after clicking Play', playbackStarted);
    logger.assertion('Player content title visible in player', playerTitleVisible);
    await page.waitForTimeout(3000);
    return {
        earlyAccessTagVisible: true,
        episodeClicked: true,
        playbackStarted,
        playerTitleVisible,
    };
}

export async function verifyEarlyAccessPlaybackFlowFromGraphQL(page: any, input?: VerifyEarlyAccessPlaybackInput): Promise<VerifyEarlyAccessPlaybackOutput> {
    const authPage = new OTTAuthPage(page);
    const detailsPage = new OTTDetailsPage(page);
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = GraphQLHelper.getInstance(page);
    const labelText = input?.labelText?.trim() || 'Early Access';
    logger.step('Starting GraphQL-driven Early Access playback verification flow');
    const loginResult = await loginToOTT(page, { mode: input?.mode });
    if (!loginResult.isLoggedIn) {
        logger.assertion('User must be logged in for Early Access playback validation', false);
        return {
            earlyAccessTagVisible: false,
            episodeClicked: false,
            playbackStarted: false,
            playerTitleVisible: false,
        };
    }
    const collectionOperationName = input?.graphqlQueryName ?? 'Collection';
    const normalizedLabelText = labelText.replace(/\s+/g, ' ').toLowerCase();
    let parser: CollectionParser | undefined;
    let foundAsset: ReturnType<CollectionParser['findAsset']>;

    for (let attempt = 1; attempt <= 2 && !foundAsset; attempt += 1) {
        logger.info(`Fetching Collection GraphQL response for Early Access content (attempt ${attempt}/2)`);
        const collectionResponse = await gql.waitForOperation(collectionOperationName, 30000, true, true);
        parser = new CollectionParser(collectionResponse as any);
        foundAsset = parser.findAsset(asset =>
            asset.labels?.some(label =>
                String(label.text ?? '').replace(/\s+/g, ' ').trim().toLowerCase() === normalizedLabelText
            ) ?? false
        );
    }
    const query = foundAsset?.asset?.title?.trim();
    if (!query) {
        logger.warn('Early Access content not found in Collection GraphQL response');
        const availableLabels = parser?.getRails()
            .flatMap(rail => rail.assets?.items ?? [])
            .flatMap(asset => asset.labels ?? [])
            .map(label => String(label.text ?? '').trim())
            .filter(Boolean);
        logger.warn(`No asset matched label '${labelText}'. Available GraphQL labels: ${Array.from(new Set(availableLabels)).join(', ')}`);
        logger.assertion(`Asset with label ${labelText} found in Collection GraphQL response`, false);
        return {
            earlyAccessTagVisible: false,
            episodeClicked: false,
            playbackStarted: false,
            playerTitleVisible: false,
        };
    }
    logger.info(`Searching for Early Access content selected by GraphQL: ${query}`);
    await authPage.clickSearchBar();
    await authPage.enterSearchQuery(query);
    await authPage.submitSearchQuery();
    const searchResultsVisible = await authPage.isSearchResultsVisible(query);
    logger.assertion('Search results visible for GraphQL-selected Early Access content', searchResultsVisible);
    if (!searchResultsVisible) {
        return {
            query,
            earlyAccessTagVisible: false,
            episodeClicked: false,
            playbackStarted: false,
            playerTitleVisible: false,
        };
    }
    await detailsPage.clickFirstSearchResult();
    await detailsPage.isShowDetailsPageVisible();
    const earlyAccessTagVisible = await earlyAccessPage.scrollUntilEarlyAccessTagVisible();
    logger.assertion('Early Access tag visible on episode thumbnail', earlyAccessTagVisible);
    const episodeClicked = earlyAccessTagVisible
        ? await earlyAccessPage.clickFirstEpisodeWithEarlyAccessContent()
        : false;
    logger.assertion('Early Access episode clicked', episodeClicked);
    if (!episodeClicked) {
        return {
            query,
            earlyAccessTagVisible,
            episodeClicked: false,
            playbackStarted: false,
            playerTitleVisible: false,
        };
    }
    await detailsPage.clickPlayButton();
    await page.waitForTimeout(4000);
    await detailsPage.hoverPlaybackScreen();
    const playbackStarted = await detailsPage.isPlaybackTimeVisible();
    const playerTitleVisible = await detailsPage.isPlayerContentTitleVisibleInPlayer();
    logger.assertion('Playback started after clicking Play', playbackStarted);
    logger.assertion('Player content title visible in player', playerTitleVisible);

    return {
        query,
        earlyAccessTagVisible,
        episodeClicked,
        playbackStarted,
        playerTitleVisible,
    };
}