/** Shared prompt construction + response parsing for every AI-backed RCA provider. */
const { stripAnsi } = require('./ansi');
const { normalizeCategory } = require('./categories');

function buildPrompt(test, errorContext) {
  return `You are helping a QA engineer triage a failed Playwright test. Be concise (3-5 sentences for root cause, 2-3 for the fix). Do not invent details not present below.

Test: ${test.title}
File: ${test.file}:${test.line}

Error:
${stripAnsi(test.error?.message) || '(no error message captured)'}

${errorContext?.errorDetails ? `Error details:\n${errorContext.errorDetails}\n` : ''}
${errorContext?.pageSnapshot ? `Page snapshot at failure time (accessibility tree):\n${errorContext.pageSnapshot.slice(0, 4000)}\n` : ''}

Classify the failure into exactly one CATEGORY:
- code: the test or page-object source is wrong (stale selector, wrong expected text, missing/insufficient wait). Fixable by editing this repo's source.
- environment: run config, test data, credentials, or connectivity is wrong, OR the application itself failed to render. Nothing in the repo to change. In particular, if the page snapshot shows navigation and footer but an empty content area (a "main" node with no children), the app rendered nothing — every failed assertion below that is a symptom, and no test edit can fix it. Classify that as environment, never as code.
- infrastructure: blocked outside the app (CDN/WAF/bot-detection "Access Denied", browser launch failure). Note that an "Access Denied" or challenge page means the app never loaded, so downstream selector timeouts are symptoms, not the cause.
- unknown: not enough signal to tell.

Respond in exactly this format:
SUMMARY: <one-line root cause>
CATEGORY: <code|environment|infrastructure|unknown>
ROOT_CAUSE: <detailed explanation>
SUGGESTED_FIX: <concrete suggestion, with a code snippet if relevant>`;
}

function parseModelResponse(raw) {
  const summary = raw.match(/SUMMARY:\s*(.+)/i)?.[1]?.trim();
  const category = raw.match(/CATEGORY:\s*(.+)/i)?.[1]?.trim();
  // ROOT_CAUSE may be followed by either remaining section, in either order.
  const rootCause = raw.match(/ROOT_CAUSE:\s*([\s\S]*?)(?=SUGGESTED_FIX:|CATEGORY:|$)/i)?.[1]?.trim();
  const suggestedFix = raw.match(/SUGGESTED_FIX:\s*([\s\S]*?)(?=CATEGORY:|$)/i)?.[1]?.trim();
  if (!summary && !rootCause && !suggestedFix) {
    // Model didn't follow the format — surface the raw text rather than losing it.
    return { summary: raw.slice(0, 200), category: 'unknown', rootCause: raw, suggestedFix: '' };
  }
  return {
    summary: summary || '(no summary)',
    category: normalizeCategory(category),
    rootCause: rootCause || '',
    suggestedFix: suggestedFix || '',
  };
}

module.exports = { buildPrompt, parseModelResponse };
