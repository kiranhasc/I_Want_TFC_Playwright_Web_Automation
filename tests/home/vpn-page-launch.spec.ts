import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyVPNPlaybackRestriction } from '../../src/businessFunction/ott-details-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('VPN Playback Restriction', () => {
    test.skip('@High IW3-T4699: Verify VPN playback restriction error message and prevent playback', async ({ page }) => {
        const data = testCaseData['tc-auth-019-vpn-playback-restriction'];
        const result = await verifyVPNPlaybackRestriction(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
            expectedVPNErrorMessage: data.expectedVPNErrorMessage,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.vpnErrorVisible).toBe(true);
        expect(result.errorMessage).toBe(data.expectedVPNErrorMessage);
        expect(result.playbackStarted).toBe(false);
    });
});