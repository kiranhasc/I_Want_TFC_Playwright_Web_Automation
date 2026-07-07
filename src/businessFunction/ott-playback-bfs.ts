import { OTTPlaybackPage } from '../pom/OTTPlaybackPage';
import { logger } from '../utils/logger';

declare const process: { env: Record<string, string | undefined> };

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

export interface VerifyLivePlaybackPauseResumeInput {
    email?: string;
    password?: string;
}

export interface VerifyLivePlaybackPauseResumeOutput {
    isLoggedIn: boolean;
    liveSectionSelected: boolean;
    channelSelected: boolean;
    playbackStarted: boolean;
    pauseClicked: boolean;
    resumeClicked: boolean;
    currentTimeBeforePause: number;
    currentTimeAfterResume: number;
    playbackCompleted: boolean;
    pauseResumeWorked: boolean;
}

export async function verifyLivePlaybackPauseResume(page: any, input?: VerifyLivePlaybackPauseResumeInput): Promise<VerifyLivePlaybackPauseResumeOutput> {
    const playbackPage = new OTTPlaybackPage(page);
    const email = input?.email || process.env.VALID_LOGIN_EMAIL || process.env.FREE_USER_LOGIN_EMAIL || '';
    const password = input?.password || process.env.VALID_LOGIN_PASSWORD || process.env.FREE_USER_LOGIN_PASSWORD || '';

    logger.step('Starting live playback pause and resume validation flow');
    await playbackPage.loginWithFreeUser(email, password);

    const isLoggedIn = await playbackPage.isHomeScreenReady();
    logger.assertion('User loaded the home screen before live TV playback', isLoggedIn);

    const liveSectionSelected = await playbackPage.selectLiveTVSection();
    logger.assertion('Live TV section selected', liveSectionSelected);

    const channelSelected = await playbackPage.selectLiveChannel();
    logger.assertion('Live TV channel selected', channelSelected);

    const playbackStarted = await playbackPage.waitForPlaybackToStart();
    logger.assertion('Live playback started', playbackStarted);

    const pauseResumeState = playbackStarted
        ? await playbackPage.pauseAndResumePlayback()
        : { pauseClicked: false, resumeClicked: false, playbackCompleted: false, currentTimeBeforePause: 0, currentTimeAfterResume: 0 };

    const pauseResumeWorked = playbackStarted && (pauseResumeState.playbackCompleted || (pauseResumeState.pauseClicked && pauseResumeState.resumeClicked));

    logger.assertion('Pause/resume interaction completed for live playback', pauseResumeWorked);

    return {
        isLoggedIn,
        liveSectionSelected,
        channelSelected,
        playbackStarted,
        pauseClicked: pauseResumeState.pauseClicked,
        resumeClicked: pauseResumeState.resumeClicked,
        currentTimeBeforePause: pauseResumeState.currentTimeBeforePause,
        currentTimeAfterResume: pauseResumeState.currentTimeAfterResume,
        playbackCompleted: pauseResumeState.playbackCompleted,
        pauseResumeWorked,
    };
}
