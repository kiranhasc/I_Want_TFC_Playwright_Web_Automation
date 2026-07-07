import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { logger } from '../utils/logger';

export interface PlayFreeAssetInput {
    email?: string;
    password?: string;
}

export interface PlayFreeAssetOutput {
    isLoggedIn: boolean;
    isPlayableContentDetected: boolean;
    playAttempted: boolean;
    playbackStarted: boolean;
}

export async function playFreeAsset(page: any, input?: PlayFreeAssetInput): Promise<PlayFreeAssetOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting free asset playback flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
    logger.assertion('Free user loaded the home screen', isLoggedIn);

    const isPlayableContentDetected = await playbackPage.hoverFirstPlayableContentCard();
    logger.assertion('Playable free content detected', isPlayableContentDetected);

    const playAttempted = isPlayableContentDetected
        ? await playbackPage.clickFirstAvailablePlayButton()
        : false;
    logger.assertion('Play button attempted on detected content', playAttempted);

    const playbackStarted = await playbackPage.isPlaybackStarted();
    logger.assertion('Playback started for free content', playbackStarted);

    return {
        isLoggedIn,
        isPlayableContentDetected,
        playAttempted,
        playbackStarted,
    };
}

export interface VerifyPremiumContentGateInput {
    email?: string;
    password?: string;
    expectedMessage?: string;
    expectedMaybeLaterText?: string;
    expectedSubscribeText?: string;
}

export interface VerifyPremiumContentGateOutput {
    playAttempted: boolean;
    premiumGateDisplayed: boolean;
    gateMessage: string;
    maybeLaterVisible: boolean;
    subscribeToWatchVisible: boolean;
}

export async function verifyPremiumContentGate(page: any, input?: VerifyPremiumContentGateInput): Promise<VerifyPremiumContentGateOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting premium content gate validation flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
    logger.assertion('Free user loaded the home screen for premium content gate check', isLoggedIn);

    const premiumContentSelected = await playbackPage.clickFirstPremiumContentCard();
    logger.assertion('Premium content card selected', premiumContentSelected);

    const laterEpisodeSelected = await playbackPage.clickLaterEpisodeFromPremiumContent();
    logger.assertion('Later episode selected for premium content', laterEpisodeSelected);

    const playAttempted = laterEpisodeSelected;
    logger.assertion('Attempted playback on premium content', playAttempted);

    const premiumGateDisplayed = await playbackPage.isPremiumContentGateVisible();
    const gateMessage = premiumGateDisplayed ? await playbackPage.getPremiumGateMessageText() : '';
    const maybeLaterVisible = await playbackPage.isMaybeLaterVisible();
    const subscribeToWatchVisible = await playbackPage.isSubscribeToWatchVisible();

    logger.assertion('Premium content gate displayed', premiumGateDisplayed);
    logger.assertion('Maybe Later action visible', maybeLaterVisible);
    logger.assertion('Subscribe to watch action visible', subscribeToWatchVisible);

    return {
        playAttempted,
        premiumGateDisplayed,
        gateMessage,
        maybeLaterVisible,
        subscribeToWatchVisible,
    };
}
