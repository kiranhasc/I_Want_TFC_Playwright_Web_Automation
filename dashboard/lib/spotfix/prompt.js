const { stripAnsi } = require('../rca/ansi');
const { buildExcerpt, describeFailingLines, describeAssertionContext, listTestBodyCalls } = require('./sourceFiles');
const { buildLocatorIndex, renderLocatorIndex } = require('./locatorIndex');

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

/**
 * Spells out the test's full assertion sequence — not just which line threw,
 * but which checks ran, which one failed, and, critically, which ones never
 * got to run at all.
 *
 * failingLinesBlock alone was not enough to stop this: a model told "this
 * line threw" still proposed "fixing" that line's own precondition check
 * without registering that the test's real subject — named in its title —
 * was a *different* assertion that never executed. Naming that assertion
 * explicitly, and stating outright that no evidence exists for or against
 * it, removes the inference step the model kept getting wrong.
 */
function assertionContextBlock(test) {
  const ctx = describeAssertionContext(test);
  if (!ctx || !ctx.after.length) return '';

  const render = (list) => list.map((a) => `  ${a.line}: ${a.text}`).join('\n') || '  (none)';

  return `
ASSERTIONS THAT NEVER RAN
This test makes ${ctx.before.length + 1 + ctx.after.length} assertions in sequence. It died on the failing one above, before ever reaching:
${render(ctx.after)}

If one of those is the check the test's title is actually about, this failure happened upstream of it — you have zero evidence whether that check would have passed or failed, because the app never got the chance to be observed on that point. Fix ONLY why the line that threw actually failed, using concrete evidence (the error, the page snapshot). Do not "fix" this by changing, weakening, or hardcoding the result of a DIFFERENT value or assertion so the test happens to get further — that is not a fix, it is deleting the check. If you cannot point to concrete evidence for what's actually wrong with the line that threw, return no edits.`;
}

/**
 * Narrates the test's own call sequence up to the failure, in order — a step
 * list, not source code. Its job is to stop the model from trusting a
 * method's NAME as a description of what it does: a step called specifically
 * to remove something can, once its actual body is read (shown below in
 * SOURCE FILES), turn out to re-add it before returning. That mismatch is
 * only visible by reading the implementation, never by reading the call site
 * or the method name alone — this block exists to prompt that reading, not
 * to replace it.
 */
function testFlowBlock(test) {
  const calls = listTestBodyCalls(test);
  if (!calls.length) return '';
  const body = calls.map((c) => `  ${c.line}: ${c.receiver ? `${c.receiver}.` : ''}${c.method}(...)`).join('\n');
  return `
STEPS THIS TEST TAKES BEFORE THE FAILURE (in order; each one's real implementation is included below where it could be resolved)
${body}

A step's name describes intent, not necessarily behavior. Before proposing a fix, check whether an earlier step's actual implementation already undoes what a later step (including the one that failed) assumes is still true — e.g. a helper called specifically to remove/undo something whose body, read in full, unconditionally performs the opposite action before returning. Base this on what the code shown below actually does, never on what a method's name suggests it does.`;
}

/**
 * Lists prior spot fixes for this exact test that were applied, rerun, and
 * proven NOT to fix it — the strongest evidence there is: a real rerun, not
 * a guess. Repeating one is hard-rejected afterward regardless of what the
 * model does with this (see matchesPriorFailedAttempt in ./priorAttempts and
 * its call site in ./index.js) — this block is what gives the model a
 * chance to avoid wasting the proposal on a rejection in the first place.
 */
function priorFailedAttemptsBlock(priorAttempts) {
  if (!priorAttempts?.length) return '';
  const body = priorAttempts
    .map((a, i) => {
      const edits = a.edits.map((e) => `    File: ${e.file}\n    Change tried:\n${e.newCode}`).join('\n');
      return `  Attempt ${i + 1} (explanation given at the time: "${a.explanation}"):\n${edits}`;
    })
    .join('\n\n');
  return `
ALREADY TRIED AND PROVEN NOT TO WORK
The following change(s) were previously applied to this exact test and rerun for real — the test still failed. Do not propose the same change again in different words; that would be proposing something already disproven, not a fix. If you cannot think of anything genuinely different backed by concrete evidence, return no edits and say in "explanation" that the previously-tried approaches don't cover it.
${body}`;
}

function buildSpotFixPrompt(test, rca, errorContext, files, priorAttempts = []) {
  const fileBlocks = files
    .map((f) => {
      const { text, truncated } = buildExcerpt(f);
      const header = truncated
        ? `--- FILE (excerpt around the failing lines): ${f.relative} ---`
        : `--- FILE: ${f.relative} ---`;
      // Only worth the tokens when the excerpt is partial — a whole-file
      // block already shows every locator/method there is.
      const catalog = truncated ? renderLocatorIndex(f.relative, buildLocatorIndex(f.content)) : '';
      return [`${header}\n${text}`, catalog].filter(Boolean).join('\n\n');
    })
    .join('\n\n');

  return `You are fixing a failing Playwright test in a TypeScript repo. Propose the smallest source change that makes it pass.

FAILING TEST
Title: ${test.title}
Location: ${test.file}:${test.line}

ERROR
${stripAnsi(test.error?.message) || '(no error message captured)'}
${failingLinesBlock(test)}
${assertionContextBlock(test)}
${testFlowBlock(test)}

A SEPARATE, EARLIER PASS'S PRELIMINARY GUESS (unverified — do not defer to this)
${rca.summary}
${rca.rootCause || ''}
This was written before the step-by-step trace and file evidence below existed, from the error text alone, and it can be wrong in ways that look plausible — including diagnosing the wrong step entirely. Treat it only as one hypothesis to check against the STEPS/SOURCE FILES evidence below, never as a settled conclusion. If that evidence points somewhere else, go with the evidence and say in "explanation" that you're overriding this earlier guess and why.
${priorFailedAttemptsBlock(priorAttempts)}

${errorContext?.pageSnapshot ? `PAGE SNAPSHOT AT FAILURE (accessibility tree — the ground truth for what actually rendered)\n${errorContext.pageSnapshot.slice(0, MAX_SNAPSHOT_CHARS)}\n` : ''}
SOURCE FILES YOU MAY EDIT
${fileBlocks}

RULES
- Only edit the files shown above. Never invent a path.
- "oldCode" must be copied byte-for-byte from the source shown, including indentation.
- "oldCode" must be UNIQUE in the file. These spec files are repetitive — lines like \`const data = testData['...'];\` open nearly every test — so a single line is almost never unique. Include several consecutive lines, and prefer ones containing a distinctive string such as the test title or a specific key, so the snippet can only match the test being fixed.
- Where a file is shown as an excerpt, "// ---- ... lines N-M ----" markers are annotations, not source. Never include them in "oldCode".
- Make the minimal change that addresses the diagnosed root cause. Do not reformat, rename, or "improve" unrelated code.
- Call only methods and locators that actually appear in the source shown (including any "full locator/method catalog" listing) — never invent a plausible-sounding method name. A call to a method a class does not declare is rejected automatically before a human ever sees it, so it wastes the whole proposal. If the method you need doesn't exist, that itself is worth saying in "explanation" rather than inventing one.
- Do not infer what a helper method does from its name or from how the test calls it. Read its actual body wherever it is shown below. A structural mismatch between an earlier step's real behavior and what a later step assumes is a common root cause that no amount of improving the later step's own matching/waiting logic can fix.

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
