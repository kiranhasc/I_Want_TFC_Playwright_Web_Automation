/** Shared prompt construction + response parsing for every AI-backed RCA provider. */
const { stripAnsi } = require('./ansi');

function buildPrompt(test, errorContext) {
  return `You are helping a QA engineer triage a failed Playwright test. Be concise (3-5 sentences for root cause, 2-3 for the fix). Do not invent details not present below.

Test: ${test.title}
File: ${test.file}:${test.line}

Error:
${stripAnsi(test.error?.message) || '(no error message captured)'}

${errorContext?.errorDetails ? `Error details:\n${errorContext.errorDetails}\n` : ''}
${errorContext?.pageSnapshot ? `Page snapshot at failure time (accessibility tree):\n${errorContext.pageSnapshot.slice(0, 4000)}\n` : ''}

Respond in exactly this format:
SUMMARY: <one-line root cause>
ROOT_CAUSE: <detailed explanation>
SUGGESTED_FIX: <concrete suggestion, with a code snippet if relevant>`;
}

function parseModelResponse(raw) {
  const summary = raw.match(/SUMMARY:\s*(.+)/i)?.[1]?.trim();
  const rootCause = raw.match(/ROOT_CAUSE:\s*([\s\S]*?)(?=SUGGESTED_FIX:|$)/i)?.[1]?.trim();
  const suggestedFix = raw.match(/SUGGESTED_FIX:\s*([\s\S]*)/i)?.[1]?.trim();
  if (!summary && !rootCause && !suggestedFix) {
    // Model didn't follow the format — surface the raw text rather than losing it.
    return { summary: raw.slice(0, 200), rootCause: raw, suggestedFix: '' };
  }
  return { summary: summary || '(no summary)', rootCause: rootCause || '', suggestedFix: suggestedFix || '' };
}

module.exports = { buildPrompt, parseModelResponse };
