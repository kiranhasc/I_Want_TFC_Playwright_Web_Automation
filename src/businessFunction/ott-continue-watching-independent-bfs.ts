import { OTTAuthPage } from '../pom/OTTAuthPage';
import { OTTDetailsPage } from '../pom/OTTDetailsPage';
import { logger } from '../utils/logger';
import { Page } from '@playwright/test';
import { loginWithTVProvider } from './ott-auth-bfs';
import { GraphQLHelper } from '../utils/graphql/graphql-helper';
import { CollectionParser } from '../utils/graphql/parsers/collection-parser';

export interface ContinueWatchingIndependentInput {
    mode?: string;
    providerName?: string;
    graphqlQueryName?: string;
    assetQueryName?: string;
    continueWatchingQueryName?: string;
}

export interface ContinueWatchingIndependentOutput {
    isValid: boolean;
    itemFound: boolean;
    playerVisible: boolean;
    progressObserved: boolean;
    selectedContentName: string;
    selectedAssetId?: string;
    selectedEpisodeId?: string;
    assetQueryTitle?: string;
    forwardedTime: string;
    reason?: string;
}

export interface VerifySynacorLandingPagesInput {
    mode?: string;
    providerName?: string;
}

export interface VerifySynacorLandingPagesOutput {
    isLoggedIn: boolean;
    homeRailVisible: boolean;
    moviesRailVisible: boolean;
    showsRailVisible: boolean;
    watchlistRailVisible: boolean;
    gmaRailVisible: boolean;
    searchBarPlaceholder: string;
    searchBarPlaceholderMatches: boolean;
    signOutOptionVisible: boolean;
    reason?: string;
}

export async function verifySynacorLandingPages(
    page: Page,
    input?: VerifySynacorLandingPagesInput
): Promise<VerifySynacorLandingPagesOutput> {
    const authPage = new OTTAuthPage(page);
    logger.step('Verify Synacor landing pages after provider login');
    const loginResult = await loginWithTVProvider(page, {
        providerName: input?.providerName,
        mode: input?.mode,
    });

    const homeRailVisible = await authPage.isContinueWatchingRailVisible();
    await page.waitForTimeout(1000);
    await authPage.clickMoviesTab();
    const moviesRailVisible = await authPage.isTrendingMoviesRailVisible();
    await authPage.clickShowsTab();
    const showsRailVisible = await authPage.isTrendingShowsRailVisible();
    await authPage.clickMyWatchlistTab();
    const watchlistRailVisible = await authPage.isMyWatchlistRailVisible();
    await authPage.clickGMATab();
    const gmaRailVisible = await authPage.isTopStreamedRailVisible();

    await authPage.clickSearchBar();
    const searchBarPlaceholder = await authPage.getSearchBarPlaceholder();
    const normalizePlaceholderText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const normalizedPlaceholder = normalizePlaceholderText(searchBarPlaceholder);
    const searchBarPlaceholderMatches = normalizedPlaceholder.includes('search');

    await authPage.clickAccountIcon();
    const signOutOptionVisible = await authPage.isSignOutOptionVisible();

    return {
        isLoggedIn: loginResult.isLoggedIn,
        homeRailVisible,
        moviesRailVisible,
        showsRailVisible,
        watchlistRailVisible,
        gmaRailVisible,
        searchBarPlaceholder,
        searchBarPlaceholderMatches,
        signOutOptionVisible,
    };
}

export async function verifyContinueWatchingPlaybackIndependent(
    page: Page,
    input?: ContinueWatchingIndependentInput
): Promise<ContinueWatchingIndependentOutput> {
    logger.step('Independent Continue Watching playback validation (single-return)');

    const result: ContinueWatchingIndependentOutput = {
        isValid: false,
        itemFound: false,
        playerVisible: false,
        progressObserved: false,
        selectedContentName: '',
        forwardedTime: '',
    };

    try {
        const gql = GraphQLHelper.getInstance(page);
        const authPage = new OTTAuthPage(page);
        const detailsPage = new OTTDetailsPage(page);

        const normalizeTitle = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();
        const isGenericEpisodeLabel = (value: string): boolean => {
            const normalized = value.trim().toLowerCase();
            return /^(s\d+\s*e\d+|season\s*\d+|episode\s*\d+|ep\s*\d+|s\d+|e\d+)$/i.test(normalized)
                || /\b(s\d+\s*e\d+|season\s*\d+|episode\s*\d+|ep\s*\d+)\b/i.test(normalized);
        };
        const extractContinueWatchingTitles = (node: any, titles = new Set<string>()): Set<string> => {
            if (node == null) {
                return titles;
            }

            if (Array.isArray(node)) {
                node.forEach(item => extractContinueWatchingTitles(item, titles));
                return titles;
            }
            if (typeof node === 'object') {
                for (const [key, value] of Object.entries(node)) {
                    if (typeof value === 'string' && /title|name|alt/i.test(key)) {
                        const normalized = normalizeTitle(value);
                        if (normalized.length > 3 && !isGenericEpisodeLabel(normalized)) {
                            titles.add(normalized);
                        }
                    }
                    extractContinueWatchingTitles(value, titles);
                }
                return titles;
            }
            return titles;
        };
        const getPlaybackState = async (): Promise<{ currentTime: number; duration: number; paused: boolean } | null> => {
            for (const frame of page.frames()) {
                const state = await frame.evaluate(() => {
                    const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
                    const video = videos
                        .filter(candidate => candidate.readyState >= 2 && candidate.duration > 0)
                        .sort((left, right) => Number(right.currentTime > 0) - Number(left.currentTime > 0))[0];
                    return video
                        ? { currentTime: video.currentTime, duration: video.duration, paused: video.paused }
                        : null;
                }).catch(() => null);
                if (state) {
                    return state;
                }
            }
            return null;
        };
        const waitForPlaybackState = async (timeoutMs: number): Promise<{ currentTime: number; duration: number; paused: boolean } | null> => {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                const state = await getPlaybackState();
                if (state && (state.currentTime > 0 || !state.paused)) {
                    return state;
                }
                await page.waitForTimeout(500);
            }
            return getPlaybackState();
        };
        const seekActiveVideo = async (percent: number): Promise<void> => {
            for (const frame of page.frames()) {
                const updated = await frame.evaluate((targetPercent) => {
                    const video = Array.from(document.querySelectorAll('video'))
                        .find(candidate => Number.isFinite((candidate as HTMLVideoElement).duration)
                            && (candidate as HTMLVideoElement).duration > 0) as HTMLVideoElement | undefined;
                    if (!video) {
                        return false;
                    }
                    video.currentTime = Math.min(video.duration * targetPercent, video.duration - 1);
                    video.dispatchEvent(new Event('timeupdate'));
                    video.dispatchEvent(new Event('seeked'));
                    return true;
                }, percent).catch(() => false);
                if (updated) {
                    return;
                }
            }
        };
        if (input?.providerName) {
            await loginWithTVProvider(page, { providerName: input.providerName, mode: input.mode });
            await page.waitForLoadState('networkidle').catch(() => undefined);
            await page.waitForTimeout(2000);
        }
        const continueWatchingOperationName = input?.continueWatchingQueryName || 'ContinueWatching';
        logger.step(`Waiting for GraphQL operation: ${continueWatchingOperationName}`);
        const continueWatchingResponse = await gql.waitForOperation(continueWatchingOperationName);
        const continueWatchingTitles = [...extractContinueWatchingTitles(continueWatchingResponse.response)];
        const continueWatchingTitleSet = new Set(continueWatchingTitles);
        logger.info(`Found Continue Watching titles: ${JSON.stringify(continueWatchingTitles)}`);
        const operationName = input?.graphqlQueryName || 'Collection';
        logger.step(`Waiting for GraphQL operation: ${operationName}`);
        const collectionResponse = await gql.waitForOperation(operationName);
        const parser = new CollectionParser(collectionResponse as any);
        const assetResult = parser.findAsset((asset) => {
            const candidate = asset as any;
            const title = asset.title?.trim() || '';
            const normalizedTitle = normalizeTitle(title);
            const defaultEpisode = candidate.tvShowDetails?.defaultEpisode;
            const normalizedEpisodeTitle = normalizeTitle(defaultEpisode?.title || '');
            const assetType = (candidate.assetType || candidate.type || '').toString().trim().toLowerCase();
            const isTvShow = assetType === 'tvshow' || assetType === 'tv_show';
            const hasValidTitle = title.length > 3;
            const notEpisode = !/episode|season|series|show|live|channel|tv/i.test(title);
            const alreadyInContinueWatching = continueWatchingTitleSet.has(normalizedTitle)
                || (normalizedEpisodeTitle && continueWatchingTitleSet.has(normalizedEpisodeTitle));
            const monetization = candidate.monetization || defaultEpisode?.monetization;
            const hasProviderAccess = candidate.isPlayable !== false
                && defaultEpisode?.isPlayable !== false
                && !(monetization?.type === 'paid' && monetization?.hasSkuAccess === false);
            return hasValidTitle && notEpisode && isTvShow && hasProviderAccess && !alreadyInContinueWatching;
        });
        if (!assetResult) {
            result.reason = 'No playable movie asset found in Collection GraphQL response';
            return result;
        }
        result.selectedContentName = assetResult.asset.title;
        result.selectedAssetId = assetResult.asset.id;
        result.selectedEpisodeId = (assetResult.asset as any)?.tvShowDetails?.defaultEpisode?.id;
        logger.info(`Selected movie from GraphQL collection: ${result.selectedContentName}`);
        logger.info(`Selected movie asset id: ${result.selectedAssetId}`);
        if (result.selectedEpisodeId) {
            logger.info(`Selected movie default episode id: ${result.selectedEpisodeId}`);
        }
        await authPage.clickSearchBar();
        await authPage.enterSearchQuery(result.selectedContentName);
        await authPage.submitSearchQuery();
        await page.waitForLoadState('networkidle').catch(() => undefined);
        await page.waitForTimeout(2000);
        const searchResultsVisible = await authPage.isSearchResultsVisible(result.selectedContentName);
        if (!searchResultsVisible) {
            result.reason = 'Search results not visible for selected movie';
            return result;
        }
        await detailsPage.clickFirstSearchResult();
        const detailsVisible = await detailsPage.isShowDetailsPageVisible();
        if (!detailsVisible) {
            result.reason = 'Movie details page not visible after search';
            return result;
        }
        await page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await page.waitForTimeout(1500);
        const detailsHeading = await detailsPage.getShowDetailsHeadingText();
        const normalizedSelectedTitle = normalizeTitle(result.selectedContentName);
        const normalizedDetailsHeading = normalizeTitle(detailsHeading);
        result.itemFound = normalizedDetailsHeading.includes(normalizedSelectedTitle)
            || normalizedSelectedTitle.includes(normalizedDetailsHeading);
        if (!result.itemFound) {
            logger.warn('Selected movie title not visible on details page');
        }

        logger.step(`Starting playback for selected content: ${result.selectedContentName}`);
        await detailsPage.clickPlayButton();
        let playerVisible = await detailsPage.waitForPlayerReady(15000);
        if (!playerVisible) {
            await detailsPage.clickPlayVideoOverlayButton();
            playerVisible = await detailsPage.waitForPlayerReady(15000);
        }
        result.playerVisible = playerVisible;
        if (!playerVisible) {
            result.reason = 'Player screen not visible after clicking play for selected content';
            return result;
        }
        const playbackStarted = await waitForPlaybackState(30000);
        if (!playbackStarted) {
            result.reason = 'Playback did not start for selected content';
            return result;
        }
        await detailsPage.hoverPlaybackControls().catch(() => undefined);
        await detailsPage.dragSeekBarToPosition(0.8).catch(() => undefined);
        await seekActiveVideo(0.8);
        await page.waitForTimeout(2000);
        const playbackState = await getPlaybackState();
        const currentPlaybackTime = await detailsPage.getPlaybackTimeText().catch(() => '')
            || (playbackState ? `${Math.floor(playbackState.currentTime / 60)}:${String(Math.floor(playbackState.currentTime % 60)).padStart(2, '0')}` : '');
        result.forwardedTime = currentPlaybackTime;
        result.progressObserved = Boolean(playbackState && playbackState.currentTime > 0)
            || (!!currentPlaybackTime && currentPlaybackTime !== '0:00');
        logger.step('Returning to Home and scrolling to the Continue Watching tray');
        await authPage.navigateHome();
        await page.waitForTimeout(4000);
        const trayReady = await authPage.ensureContinueWatchingTrayInView(30000);
        if (!trayReady) {
            result.reason = 'Continue Watching tray could not be brought into view after returning home';
            return result;
        }
        const itemVisible = await authPage.isContinueWatchingItemVisible(result.selectedContentName);
        const trayItems = await authPage.getContinueWatchingTrayItemDetails();
        const selectedTrayItem = trayItems.find((item) => normalizeTitle(item.title).includes(normalizedSelectedTitle));
        const trayProgressVisible = selectedTrayItem?.hasProgress ?? false;
        result.progressObserved = result.progressObserved && itemVisible && trayProgressVisible;
        result.isValid = result.itemFound && result.playerVisible && itemVisible && result.progressObserved;
        if (!result.isValid && !result.reason) {
            result.reason = 'Continue Watching validation failed for selected movie';
        }
        return result;
    } catch (error) {
        result.reason = `Exception during independent CW validation: ${String(error)}`;
        return result;
    }
}
