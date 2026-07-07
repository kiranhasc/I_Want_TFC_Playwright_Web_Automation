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
