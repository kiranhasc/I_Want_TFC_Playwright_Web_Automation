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
    category: 'infrastructure',
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
    /**
     * The app's shell rendered but its content area came back empty — nav and
     * footer present, `main` with no children at all. Every downstream check
     * then fails for one reason: there was nothing on the page to check.
     *
     * Worth its own rule because it is otherwise indistinguishable from a
     * stale-selector bug, and gets mislabelled as a code issue: the observed
     * case was a live-channel page that navigated correctly (the document
     * title matched) but rendered an empty `main`, which the AI classified as
     * "code" and then tried to fix by rewriting an assertion. No edit to this
     * repo can populate a page the app left blank.
     *
     * Matched against the page snapshot only, where `- main` on its own line
     * means a main element with no accessible children.
     */
    id: 'empty-content-area',
    category: 'environment',
    test: (text, errorContext) => /^\s*-\s*main\s*$/m.test(errorContext?.pageSnapshot || ''),
    build: () => ({
      summary: 'The app rendered its shell but the content area came back empty.',
      rootCause:
        "The page snapshot shows navigation and footer present but `main` with no children — the app loaded its frame and then rendered nothing inside it. Any assertion about on-page content fails as a consequence, so the failing assertion is a symptom rather than the cause. This is not a test-logic bug: no change to the test or page objects can populate an empty page.",
      suggestedFix:
        'Open the same URL manually in a normal browser. If the content renders there but not under test, it is environmental — geo/entitlement restrictions or bot detection blocking the automated session (this app has a history of Akamai blocks). If it is empty there too, it is an application bug to raise with the developers rather than anything to fix here.',
    }),
  },
  {
    id: 'locator-timeout',
    category: 'code',
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
    category: 'code',
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
    category: 'environment',
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
    category: 'code',
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
    // errorContext is passed too: some signals (an empty content area) live in
    // the structure of the page snapshot, not in the flattened error text.
    if (!rule.test(text, errorContext)) continue;
    const locatorMatch = text.match(/locator\('([^']+)'\)/) || [];
    return { ruleId: rule.id, source: 'heuristic', category: rule.category, ...rule.build(locatorMatch) };
  }
  return {
    ruleId: 'no-match',
    source: 'heuristic',
    category: 'unknown',
    summary: 'No known failure pattern matched — needs manual review.',
    rootCause: 'This failure did not match any of the known signatures this dashboard recognizes automatically.',
    suggestedFix: 'Check the error details, page snapshot, and screenshot/trace below to diagnose manually.',
  };
}

const BARE_TIMEOUT_RE = /test timeout of \d+ms exceeded/i;
// Playwright renders a failed expect() as its own block containing
// "expect(received)" (or expect(locator), expect(page), ...) followed by a
// matcher call — a concrete sign that test code actually ran and evaluated a
// condition, as opposed to the test just hanging with nothing to show for it.
const EXPECTATION_FAILURE_RE = /expect\([^)]*\)\s*\.\s*\w+\(/i;
// Rules whose category is already backed by concrete, specific evidence
// (an Akamai block page, a genuinely empty content area, a network-level
// failure) — never worth overriding just because the failure also happens to
// carry the generic "Test timeout of Nms exceeded" wrapper text.
const STRONG_EVIDENCE_RULE_IDS = new Set(['cdn-access-denied', 'empty-content-area', 'network-error']);

/**
 * Bare "Test timeout of Nms exceeded" is the single most common failure
 * shape in this suite, and on its own it says nothing about *why* — an AI
 * asked to classify it has to guess from a long, generic page snapshot, and
 * two failures with near-identical evidence can land in different
 * categories purely depending on how the model reads that snapshot each
 * time. (Observed directly: two timeouts in the same run, same spec file —
 * one called "environment", one called "code" — with no rule enforcing
 * either was actually right.)
 *
 * This runs *after* whichever provider produced a result (AI or heuristic)
 * and corrects the category using the one concrete signal available: did a
 * real assertion actually run and fail before the timeout, or did the test
 * just hang with no evidence either way? It leaves the provider's own
 * summary/rootCause/suggestedFix text alone — only the category (and an
 * explanatory note) are touched, and only for the bare-timeout shape.
 */
function applyTimeoutCategoryGuard(test, errorContext, result, hangingAction = null) {
  if (!result) return result;
  const message = stripAnsi(test.error?.message) || '';
  if (!BARE_TIMEOUT_RE.test(message)) return result;
  if (STRONG_EVIDENCE_RULE_IDS.has(result.ruleId)) return result;

  // A timeout is only evidence-free when we genuinely cannot see where it
  // got stuck. When the trace names the exact call still in flight (see
  // ../rca/traceActions.js), that is real, specific evidence — a named
  // locator that can be checked against the DOM snapshot — so the
  // downgrade below no longer applies. The whole point of forcing "unknown"
  // was to refuse to guess with nothing to go on; with the hanging locator
  // in hand there is something to go on, and the provider was shown it.
  if (hangingAction?.selector) {
    return {
      ...result,
      note: [
        result.note,
        `Trace shows the test was still waiting on ${hangingAction.title || hangingAction.method} (${hangingAction.describedParams}) when the timeout fired — this categorisation is based on that, not on a bare timeout alone.`,
      ]
        .filter(Boolean)
        .join(' '),
    };
  }

  const hasFailedExpectation = EXPECTATION_FAILURE_RE.test(errorContext?.errorDetails || '');

  if (hasFailedExpectation) {
    if (result.category === 'code') return result;
    return {
      ...result,
      category: 'code',
      note: [
        result.note,
        'Category corrected to "code": the captured error details show a specific assertion (expect(...)) actually ran and failed before the timeout — this is not a bare hang.',
      ]
        .filter(Boolean)
        .join(' '),
    };
  }

  // Bare hang, zero assertion evidence — don't let a model's read of the
  // page snapshot pass as a confident "code" or "environment" verdict when
  // nothing in the evidence actually distinguishes the two. Honest
  // "unknown" beats a coin flip dressed up as analysis.
  if (result.category === 'unknown') return result;
  return {
    ...result,
    category: 'unknown',
    note: [
      result.note,
      'Category corrected to "unknown": this is a bare timeout with no assertion ever captured — nothing in the evidence distinguishes a stale selector/locator (code) from the app never reaching the expected state (environment). Check the page snapshot manually.',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

module.exports = { runHeuristics, applyTimeoutCategoryGuard };
