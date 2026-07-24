import { Page } from '@playwright/test';
import { logger } from '../logger';
export interface GraphQLResult<T> {
    request: any;
    response: T;
}

export class GraphQLHelper {
    constructor(private readonly page: Page) {}

    async waitForOperation<T>(operationName: string, timeout: number = 60000): Promise<GraphQLResult<T>> {
        const normalizedOperationName = operationName.trim();
        logger.info(`Waiting for GraphQL operation: ${normalizedOperationName}`);

        const response = await this.page.waitForResponse(async response => {
            if (!response.url().includes('/graphql')) {
                return false;
            }

            try {
                const body = response.request().postDataJSON();
                const query = typeof body?.query === 'string' ? body.query : '';
                const operationNameInBody = typeof body?.operationName === 'string' ? body.operationName : '';
                return query.includes(`query ${normalizedOperationName}`) ||
                    query.includes(normalizedOperationName) ||
                    operationNameInBody.includes(normalizedOperationName);
            } catch (error) {
                logger.debug('Unable to parse GraphQL request body while waiting for operation', error);
                return false;
            }
        }, { timeout });

        logger.info(`Matched operation: ${normalizedOperationName}`);
        const responseBody = await response.json().catch(() => undefined);
        if (normalizedOperationName.toLowerCase() === 'collection' && responseBody?.data?.collection?.rails) {
            try {
                const titles: string[] = [];
                for (const rail of responseBody.data.collection.rails) {
                    if (!rail?.assets?.items) continue;
                    for (const asset of rail.assets.items) {
                        if (typeof asset?.title === 'string' && asset.title.trim().length > 0) {
                            titles.push(asset.title.trim());
                            if (titles.length >= 5) break;
                        }
                    }
                    if (titles.length >= 5) break;
                }
                if (titles.length > 0) {
                    const firstAsset = responseBody.data.collection.rails?.flatMap((rail: any) => rail.assets?.items ?? [])?.find((asset: any) => typeof asset?.title === 'string');
                    if (firstAsset) {
                        const assetTitle = firstAsset.title?.trim() ?? '';
                        const shortDescription = firstAsset.shortDescription ?? firstAsset.description ?? '';
                        const genres = Array.isArray(firstAsset.genres) ? firstAsset.genres.map((genre: any) => genre?.name ?? genre).filter(Boolean) : [];
                        const cast = Array.isArray(firstAsset.cast) ? firstAsset.cast.map((member: any) => {
                            if (typeof member === 'string') return member;
                            if (member?.name) return member.name;
                            return undefined;
                        }).filter(Boolean) : [];
                    }
                } else {
                    logger.info('Collection response matched, but no asset titles were found');
                }
            } catch (err) {
                logger.debug('Failed to extract titles from Collection GraphQL response', err);
            }
        }

        if (normalizedOperationName.toLowerCase() === 'search') {
            try {
                const titles: string[] = [];
                const seen = new Set<string>();
                const visited = new WeakSet<object>();

                const isUrlValue = (text: string) => {
                    const normalizedText = text.trim();
                    return /^(https?:\/\/|www\.)/i.test(normalizedText)
                        || /\.(jpg|jpeg|png|gif|webp|svg|mp4|mpd|json)(\?.*)?$/i.test(normalizedText);
                };

                const isAssetLikeObject = (record: Record<string, unknown>) => {
                    return typeof record.id !== 'undefined'
                        || typeof record.type === 'string'
                        || Array.isArray(record.genres)
                        || Array.isArray(record.cast)
                        || typeof record.monetization === 'object'
                        || typeof record.pricing === 'object'
                        || typeof record.description === 'string'
                        || typeof record.runtime === 'number';
                };

                const visit = (value: unknown) => {
                    if (!value || typeof value !== 'object') {
                        return;
                    }
                    if (visited.has(value as object)) {
                        return;
                    }
                    visited.add(value as object);

                    const record = value as Record<string, unknown>;
                    if (typeof record.title === 'string') {
                        const title = record.title.trim();
                        if (title && !seen.has(title) && !isUrlValue(title) && isAssetLikeObject(record)) {
                            seen.add(title);
                            titles.push(title);
                        }
                    }

                    for (const child of Object.values(record)) {
                        if (Array.isArray(child)) {
                            child.forEach(item => visit(item));
                        } else {
                            visit(child);
                        }
                    }
                };

                visit(responseBody?.data);
                if (titles.length > 0) {
                    logger.info(`Search response titles: ${titles.join(' | ')}`);
                    console.log(`[GRAPHQL DEBUG] Search titles: ${titles.join(' | ')}`);
                } else {
                    logger.info('Search response matched, but no titles were found');
                }
            } catch (err) {
                logger.debug('Failed to extract titles from Search GraphQL response', err);
            }
        }

        return {
            request: response.request().postDataJSON(),
            response: responseBody
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
