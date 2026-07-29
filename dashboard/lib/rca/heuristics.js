/**
 * Zero-cost, zero-network RCA: pattern-matches known failure signatures
 * against the test's error message/stack and (when available) the page
 * snapshot captured in error-context.md. Always available as a fallback
 * when no AI provider is configured or reachable.
 */
const { stripAnsi } = require('./ansi');

const RULES = [
  {
    id: 'cdn-access-denied',
    test: (text) => /access denied/i.test(text) && /edgesuite\.net|akamai|don't have permission to access/i.test(text),
    build: () => ({
      summary: 'Blocked by the CDN edge (Akamai) before the app ever loaded.',
      rootCause:
        "The page snapshot shows an Akamai 'Access Denied' error page instead of the real site. This happens at the CDN/edge layer, before any application code runs, so every downstream selector wait times out. It is not a bug in the test or the app — it's either bot-detection flagging automated traffic, or a geo/network restriction.",
      suggestedFix:
        'Re-run in headed mode (the codebase does not set headless explicitly, so plain `playwright test` without --headed runs headless and is more likely to be flagged). If headed still gets Access Denied, the block is network/geo-level and needs the same VPN/path used for manual browsing.',
    }),
  },
  {
    id: 'locator-timeout',
    test: (text) => /timeouterror/i.test(text) && /waitfor/i.test(text) && /locator/i.test(text),
    build: (match) => ({
      summary: `Element never became visible in time: ${match[1] ? match[1].trim() : 'target locator'}.`,
      rootCause:
        'The awaited element never appeared within the timeout. Common causes: the page never reached the expected state (check earlier steps/navigation), the selector no longer matches current markup, or the app is slower than the wait allows.',
      suggestedFix:
        'Check the page snapshot below for what actually rendered at failure time. If the site structure changed, update the selector in the relevant Page Object. If the app is just slow, consider a longer explicit wait rather than a blanket timeout increase.',
    }),
  },
  {
    id: 'toast-text-mismatch',
    test: (text) => /expect\(received\)\.toContain\(expected\)/i.test(text) && /received string:\s*""/i.test(text),
    build: () => ({
      summary: 'Expected confirmation text (e.g. a toast) was empty when checked.',
      rootCause:
        'The assertion expected a substring (like "added"/"removed") inside some captured text, but got an empty string — the toast/message likely hadn\'t rendered yet when the check ran, or its selector/copy changed.',
      suggestedFix:
        'Add an explicit wait for the toast element to become visible before reading its text, instead of reading immediately after the triggering click. If the copy changed, update the expected substring.',
    }),
  },
  {
    id: 'network-error',
    test: (text) => /net::err_|econnrefused|enotfound|err_connection/i.test(text),
    build: () => ({
      summary: 'A network-level request failed (connection refused/DNS/reset).',
      rootCause:
        'The browser could not complete a network request at all — this is below the application layer (DNS, connectivity, or the target host refusing connections), not a test logic issue.',
      suggestedFix:
        'Verify the target environment URL is reachable from this machine right now, and that no VPN/proxy/firewall is interfering with the specific request.',
    }),
  },
  {
    id: 'assertion-mismatch',
    test: (text) => /expect\(.*\)\.(toBe|toEqual|toContain|toHaveText)/i.test(text),
    build: () => ({
      summary: 'A value assertion failed (actual did not match expected).',
      rootCause:
        'The page state differed from what the test expected — either genuine app behavior changed, test data is stale, or the assertion is checking the wrong element.',
      suggestedFix:
        'Compare "Expected" vs "Received" in the error details below, and cross-check against the page snapshot to see what was actually on screen.',
    }),
  },
];

function combinedText(test, errorContext) {
  const parts = [stripAnsi(test.error?.message) || '', stripAnsi(test.error?.stack) || ''];
  if (errorContext) parts.push(errorContext.errorDetails, errorContext.pageSnapshot);
  return parts.filter(Boolean).join('\n');
}

/** Never throws; falls back to a generic "needs manual review" result if nothing matches. */
function runHeuristics(test, errorContext) {
  const text = combinedText(test, errorContext);
  for (const rule of RULES) {
    if (!rule.test(text)) continue;
    const locatorMatch = text.match(/locator\('([^']+)'\)/) || [];
    return { ruleId: rule.id, source: 'heuristic', ...rule.build(locatorMatch) };
  }
  return {
    ruleId: 'no-match',
    source: 'heuristic',
    summary: 'No known failure pattern matched — needs manual review.',
    rootCause: 'This failure did not match any of the known signatures this dashboard recognizes automatically.',
    suggestedFix: 'Check the error details, page snapshot, and screenshot/trace below to diagnose manually.',
  };
}

module.exports = { runHeuristics };
