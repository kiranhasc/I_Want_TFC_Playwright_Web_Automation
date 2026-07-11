// utils/graphql/types/collection.types.ts

export interface CollectionResponse {
    data: {
        collection: {
            rails: Rail[];
        };
    };
}

export interface Rail {
    id: string;
    title: string;
    assets: {
        items: Asset[];
    };
}

export interface Asset {
    id: string;
    title: string;
    images: {
        landscape: string;
        portrait: string;
    };
}

export interface Label {
    id: string;
    text: string;
    position?: string;
    url?: string;
}

export interface Asset {
    id: string;
    title: string;

    images: {
        landscape: string;
        portrait: string;
    };

    labels?: Label[];
}

export interface Episode {
    id: string;
    title: string;
    synopsis?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    duration?: string;
    thumbnailUrl?: string;
}

export interface TVShowEpisodesResponse {
    data: {
        tvShow: {
            id: string;
            title: string;
            episodes: Episode[];
        };
    };
}