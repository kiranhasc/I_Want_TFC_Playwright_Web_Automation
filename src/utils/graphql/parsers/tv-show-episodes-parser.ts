import { GraphQLResult } from '../graphql-helper';
import { Episode, TVShowEpisodesResponse } from '../../graphql/graphql-types';

export class TVShowEpisodesParser {
    constructor(
        private readonly response: GraphQLResult<TVShowEpisodesResponse>
    ) { }

    getTVShowTitle(): string {
        return this.response.response.data.tvShow.title;
    }

    getTVShowId(): string {
        return this.response.response.data.tvShow.id;
    }

    getEpisodes(): Episode[] {
        return this.response.response.data.tvShow.episodes;
    }

    getEpisodeByIndex(index: number): Episode | undefined {
        return this.getEpisodes()[index];
    }

    findEpisode(predicate: (episode: Episode) => boolean): Episode | undefined {
        return this.getEpisodes().find(predicate);
    }

    findEpisodeByTitle(title: string): Episode | undefined {
        return this.findEpisode(episode => episode.title === title);
    }

    hasEpisode(title: string): boolean {
        return !!this.findEpisodeByTitle(title);
    }
}
