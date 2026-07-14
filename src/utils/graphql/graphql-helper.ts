import { Page } from '@playwright/test';
import { logger } from '../logger';
export interface GraphQLResult<T> {
    request: any;
    response: T;
}



export class GraphQLHelper {
    constructor(private readonly page: Page) {}

    async waitForOperation<T>(operationName: string,timeout: number = 60000): Promise<GraphQLResult<T>> {
        logger.info(`Waiting for GraphQL operation: ${operationName}`);
        const response = await this.page.waitForResponse(async response => {
            if (!response.url().includes('/graphql')) {
                return false;
            }
            const body = response.request().postDataJSON();
            //console.log(body?.query);
            return body?.query?.includes(`query ${operationName}`);
        });
        logger.info(`Matched operation: ${operationName}`);
        return {
            request: response.request().postDataJSON(),
            response: await response.json()
        };
    }

    async findAssetByTitle(collectionResponse: any, movieTitle: string) {
        const rails = collectionResponse.response.data.collection.rails;
        for (const rail of rails) {
            const asset = rail.assets?.items?.find(
                (item: any) => item.title === movieTitle
            );
            if (asset) {
                return {
                    railName: rail.title,
                    assetId: asset.id,
                    assetTitle: asset.title,
                    // asset
                };
            }
        }
        return undefined;
    }
}
