import { GraphQLResult } from '../graphql-helper';
import { CollectionResponse, Rail, Asset } from '../../graphql/graphql-types.ts';

export interface CollectionAssetResult {
    rail: any;
    asset: any;
}

export class CollectionParser {
   constructor(
        private readonly collection: GraphQLResult<CollectionResponse>
    ) {}

    getRails(): Rail[] {
        return this.collection.response.data.collection.rails;
    }

    getRailByIndex(index: number): Rail {
        return this.getRails()[index];
    }

    getCards(railIndex: number): Asset[] {
        return this.getRailByIndex(railIndex).assets.items;
    }

    getCard(railIndex: number, cardIndex: number): Asset {
        return this.getCards(railIndex)[cardIndex];
    }

    findAsset(predicate: (asset: Asset) => boolean): CollectionAssetResult | undefined {
        for (const rail of this.getRails()) {
            const asset = rail.assets.items.find(predicate);
            if (asset) {
                return {
                    rail,
                    asset
                };
            }
        }
        return undefined;
    }

    findAssetByLabel(labelText: string): CollectionAssetResult | undefined {
        return this.findAsset(asset =>
            asset.labels?.some(
            label => label.text === labelText
            ) ?? false
        );
    }
}

