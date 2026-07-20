import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyEarlyAccessTag } from '../../src/businessFunction/ott-early-access-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Early Access Tag', () => {
    test('@High IW3-T3667: Verify Early Access tag is shown on On Air content thumbnail', async ({ page }) => {
        test.setTimeout(90000)
        const data = testCaseData['tc-discovery-001-early-access'];
        const result = await verifyEarlyAccessTag(page, { mode: data.mode, graphqlQueryName: data.graphqlQueryName, labelText: data.labelText, earlyAccessAttributeValue: data.earlyAccessAttributeValue });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        expect(result.labelVisible).toBe(true);
    });
});
