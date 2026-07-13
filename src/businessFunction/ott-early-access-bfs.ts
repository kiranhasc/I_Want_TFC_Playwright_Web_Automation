import { OTTEarlyAccessPage } from '../pom/OTTEarlyAccessPage';
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

export async function verifyEarlyAccessTag(page: any, input: VerifyEarlyAccessInput): Promise<VerifyEarlyAccessOutput> {
    const earlyAccessPage = new OTTEarlyAccessPage(page);
    const gql = new GraphQLHelper(page);

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

    // Ensure the rail and asset are visible on the page
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
