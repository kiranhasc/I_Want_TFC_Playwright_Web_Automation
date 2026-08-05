import { OTTEarlyAccessPage } from '../pom/OTTEarlyAccessPage';
import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { loginToOTT } from './ott-auth-bfs';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';
import { logger } from '../utils/logger';

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
    titleVisible: string;
    descriptionVisible: string;
    maybeLaterVisible: string;
    upgradeCtaVisible: string;
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
    let titleVisible: string;
    let descriptionVisible: string;
    let maybeLaterVisible: string;
    let upgradeCtaVisible: string;
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

export interface VerifyEarlyAccessContinueWatchingOutput {
    loggedIn: boolean;
    foundInGraphQL: boolean;
    assetVisibleInContinueWatching: boolean;
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
    };
}