const { stripAnsi } = require('../rca/ansi');
const { buildExcerpt, describeFailingLines } = require('./sourceFiles');

// Kept modest on purpose: hosted models are commonly rate-limited per minute
// (Groq's free tier allows 12k tokens/min), and RCA has usually just spent
// part of that budget on the same failure moments earlier.
const MAX_SNAPSHOT_CHARS = 1500;

/**
 * Asks for exact-match find/replace pairs rather than a unified diff.
 *
 * Models are unreliable at emitting valid patch hunks (line numbers and
 * @@ headers drift), and a malformed hunk either fails to apply or, worse,
 * applies to the wrong place. An exact oldCode string that must appear
 * exactly once in the file is trivially verifiable before we touch disk —
 * see validateEdit in ./index.js.
 */
/**
 * Names the exact line that threw, so the model fixes the statement that
 * actually failed rather than one the test's title merely implies.
 */
function failingLinesBlock(test) {
  const frames = describeFailingLines(test);
  if (!frames.length) return '';
  const body = frames.map((f) => `${f.file}:${f.line}\n    ${f.text}`).join('\n');
  return `
THE STATEMENT THAT FAILED (innermost frame first)
${body}

This is the line that threw. Any later assertion in the same test never ran, so changing one cannot fix this failure — work backwards from why THIS line failed.`;
}

function buildSpotFixPrompt(test, rca, errorContext, files) {
  const fileBlocks = files
    .map((f) => {
      const { text, truncated } = buildExcerpt(f);
      const header = truncated
        ? `--- FILE (excerpt around the failing lines): ${f.relative} ---`
        : `--- FILE: ${f.relative} ---`;
      return `${header}\n${text}`;
    })
    .join('\n\n');

  return `You are fixing a failing Playwright test in a TypeScript repo. Propose the smallest source change that makes it pass.

FAILING TEST
Title: ${test.title}
Location: ${test.file}:${test.line}

ERROR
${stripAnsi(test.error?.message) || '(no error message captured)'}
${failingLinesBlock(test)}

DIAGNOSIS ALREADY ESTABLISHED
${rca.summary}
${rca.rootCause || ''}

${errorContext?.pageSnapshot ? `PAGE SNAPSHOT AT FAILURE (accessibility tree — the ground truth for what actually rendered)\n${errorContext.pageSnapshot.slice(0, MAX_SNAPSHOT_CHARS)}\n` : ''}
SOURCE FILES YOU MAY EDIT
${fileBlocks}

RULES
- Only edit the files shown above. Never invent a path.
- "oldCode" must be copied byte-for-byte from the source shown, including indentation.
- "oldCode" must be UNIQUE in the file. These spec files are repetitive — lines like \`const data = testData['...'];\` open nearly every test — so a single line is almost never unique. Include several consecutive lines, and prefer ones containing a distinctive string such as the test title or a specific key, so the snippet can only match the test being fixed.
- Where a file is shown as an excerpt, "// ---- ... lines N-M ----" markers are annotations, not source. Never include them in "oldCode".
- Make the minimal change that addresses the diagnosed root cause. Do not reformat, rename, or "improve" unrelated code.

The test exists to catch bugs. A change that makes it pass without fixing the cause is worse than leaving it red. Therefore:
- NEVER change what an assertion expects just to match what was observed. If the app returned false where the test expects true, that is either a real app bug or a deliberate expectation a human must re-decide — not something to edit away.
- NEVER delete or comment out an assertion, and never add .skip or .fixme.
- Do NOT simply increase a timeout. Only adjust one if the evidence positively shows the app is merely slow, and say so in "reason".
- Do NOT add page.waitForTimeout() or any fixed sleep. Wait for the specific element or state instead (expect(...).toBeVisible(), locator.waitFor({ state }), waitForResponse) — a fixed sleep hides the race and slows every future run.
- Legitimate fixes look like: correcting a selector that no longer matches the rendered page, waiting for the right element before reading it, or fixing genuinely wrong navigation/setup steps.
- For a timeout waiting on a locator, change the code that DEFINES that locator — in this repo locators are declared in Page Object constructors (e.g. \`this.emailErrorMessage = { selector: 'form', text: '...' }\`), far from the method that awaits them. Trace the exact text in the "waiting for" line back to its declaration and edit it there.
- An argument that is only read to build an assertion or a log message does NOT change what the test waits for. Editing one leaves the failure completely unchanged, so verify how a value is actually used before proposing to change it.
- Match the surrounding code's formatting: one statement per line, same indentation and quote style. Never put two statements on one line.
- If the page snapshot shows the app never loaded (an error/challenge page), there is no code fix — return an empty "edits" array and explain why.
- If the honest answer is that the app looks broken rather than the test, return an empty "edits" array and say that in "explanation".
- If you cannot identify a confident fix, return an empty "edits" array rather than guessing.

Respond with ONLY a JSON object, no prose and no markdown fence:
{
  "explanation": "<what you changed and why, 1-3 sentences>",
  "confidence": "high" | "medium" | "low",
  "edits": [
    { "file": "<path exactly as shown above>", "oldCode": "<exact existing snippet>", "newCode": "<replacement>", "reason": "<one line>" }
  ]
}`;
}

module.exports = { buildSpotFixPrompt };
