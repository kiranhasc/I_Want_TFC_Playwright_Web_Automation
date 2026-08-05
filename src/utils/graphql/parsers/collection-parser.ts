import { GraphQLResult } from '../graphql-helper';
import { CollectionResponse, Rail, Asset } from '../../graphql/graphql-types';

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

    private getRailText(rail: Rail): string {
        return [rail?.title, rail?.subtitle, rail?.description].filter(Boolean).join(' ').toLowerCase();
    }

    private matchesRailPattern(railText: string, pattern: RegExp | string): boolean {
        if (typeof pattern === 'string') {
            return railText.includes(pattern.toLowerCase());
        }
        return pattern.test(railText);
    }

    findAssetInPreferredRails(
        preferredRailPatterns: Array<RegExp | string>,
        predicate: (asset: Asset) => boolean
    ): CollectionAssetResult | undefined {
        for (const pattern of preferredRailPatterns) {
            for (const rail of this.getRails()) {
                const railText = this.getRailText(rail);
                if (!this.matchesRailPattern(railText, pattern)) {
                    continue;
                }
                const asset = rail.assets?.items?.find(predicate);
                if (asset) {
                    return { rail, asset };
                }
            }
        }
        return this.findAsset(predicate);
    }

    getPreferredAssetTitle(preferredRailPatterns: Array<RegExp | string>): string {
        const result = this.findAssetInPreferredRails(preferredRailPatterns, (asset: Asset) => typeof asset.title === 'string' && asset.title.trim().length > 0);
        return String(result?.asset?.title ?? '').trim();
    }

    getPreferredRailTitles(preferredRailPatterns: Array<RegExp | string>, limit: number = 10): string[] {
        for (const pattern of preferredRailPatterns) {
            for (const rail of this.getRails()) {
                const railText = this.getRailText(rail);
                if (!this.matchesRailPattern(railText, pattern)) {
                    continue;
                }

                const titles = (rail.assets?.items ?? [])
                    .map((asset: Asset) => typeof asset.title === 'string' ? asset.title.trim() : '')
                    .filter(Boolean);

                return titles.slice(0, limit);
            }
        }

        return [];
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

