/**
 * Flags edits that make a test pass without fixing anything.
 *
 * This is the main failure mode of AI-generated test fixes, and it is not
 * hypothetical — the first proposal this feature ever produced changed
 * `expect(isAddToWatchlistButtonVisible).toBe(false)` to `.toBe(true)`,
 * i.e. it rewrote the assertion to agree with the bug the test had just
 * caught. The prompt forbids this, but a model will still do it, so the
 * dangerous shapes are detected here and surfaced in the diff for the human
 * approving it. These are warnings, not blocks: occasionally the expectation
 * really is the stale thing, and only a person can tell.
 */

const ASSERTION_CALL = /\.(toBe|toEqual|toStrictEqual|toContain|toHaveText|toHaveValue|toHaveCount|toBeVisible|toBeHidden|toBeTruthy|toBeFalsy)\b/;

// 'high' risks defeat the test's purpose outright (it will pass no matter
// what the app does), which also means a rerun proves nothing — see
// runManager.applySpotFix, which refuses to apply one of these without
// explicit acknowledgement, and never treats its own rerun as validation.
// 'low' risks are quality concerns (slower/flakier suite) worth a human's
// attention but not something a passing rerun is misleading about.
const RISKS = [
  {
    id: 'assertion-flipped',
    label: 'Rewrites what the test asserts',
    severity: 'high',
    detail:
      'This changes the expected value of an assertion rather than fixing the behaviour under test. If the app is genuinely wrong, applying this hides a real bug instead of reporting it.',
    test: ({ oldCode, newCode }) => {
      if (!ASSERTION_CALL.test(oldCode) || !ASSERTION_CALL.test(newCode)) return false;
      // Boolean inversion is the clearest signal.
      const flipped =
        (/\btoBe\(\s*(true|false)\s*\)/.test(oldCode) && /\btoBe\(\s*(true|false)\s*\)/.test(newCode) &&
          oldCode.match(/\btoBe\(\s*(true|false)\s*\)/)[1] !== newCode.match(/\btoBe\(\s*(true|false)\s*\)/)[1]) ||
        // Negation added or removed around an assertion.
        /\.not\./.test(oldCode) !== /\.not\./.test(newCode);
      if (flipped) return true;
      // Same assertion method, different expected literal, nothing else changed.
      const strip = (s) => s.replace(/\s+/g, '');
      const oldMethod = oldCode.match(ASSERTION_CALL)?.[1];
      const newMethod = newCode.match(ASSERTION_CALL)?.[1];
      return Boolean(oldMethod && oldMethod === newMethod && strip(oldCode) !== strip(newCode) &&
        strip(oldCode).replace(/['"`][^'"`]*['"`]/g, 'S') === strip(newCode).replace(/['"`][^'"`]*['"`]/g, 'S'));
    },
  },
  {
    id: 'assertion-removed',
    label: 'Removes an assertion',
    severity: 'high',
    detail: 'The replacement drops one or more expect() calls, so the test will pass without checking what it used to check.',
    test: ({ oldCode, newCode }) => {
      const count = (s) => (s.match(/\bexpect\s*\(/g) || []).length;
      return count(newCode) < count(oldCode);
    },
  },
  {
    id: 'test-skipped',
    label: 'Skips the test',
    severity: 'high',
    detail: 'This disables the test rather than fixing it.',
    test: ({ oldCode, newCode }) =>
      (/\.(skip|fixme)\b/.test(newCode) && !/\.(skip|fixme)\b/.test(oldCode)) ||
      (/^\s*\/\//m.test(newCode) && /\bexpect\s*\(/.test(oldCode) && !/\bexpect\s*\(/.test(newCode.replace(/^\s*\/\/.*$/gm, ''))),
  },
  {
    /**
     * The same "make it pass unconditionally" harm as assertion-flipped, just
     * relocated one layer upstream — instead of rewriting the expect() call,
     * hardcode the value it reads to whatever the assertion wants, so no
     * expect()/toBe() syntax ever appears in the diff for ASSERTION_CALL to
     * catch. Observed for real: `isLiveContentVisible: isLiveIconVisible`
     * (a computed flag) became `isLiveContentVisible: true` in a business
     * function, which made a failing precondition pass by deleting the check
     * rather than fixing why it failed — and was applied and "verified"
     * before this rule existed to catch it.
     */
    id: 'hardcoded-boolean-result',
    label: 'Hardcodes a computed flag instead of fixing how it is computed',
    severity: 'high',
    detail:
      'The old code derived this value from something (a variable, a call, a condition); the new code just returns true/false unconditionally instead. Any assertion or caller reading this now always gets the same answer regardless of what actually happens in the app.',
    test: ({ oldCode, newCode }) => {
      const oldLines = oldCode.split('\n');
      const newLines = newCode.split('\n');
      if (oldLines.length !== newLines.length) return false; // only simple, line-aligned value swaps
      const VALUE_POSITION = /(?::|=(?!=)|return)\s*([^;,}\n]+?)\s*[;,}]?\s*$/;
      const BOOL_LITERAL = /^(true|false)$/;
      for (let i = 0; i < oldLines.length; i += 1) {
        if (oldLines[i].trim() === newLines[i].trim()) continue;
        const oldValue = oldLines[i].match(VALUE_POSITION)?.[1]?.trim();
        const newValue = newLines[i].match(VALUE_POSITION)?.[1]?.trim();
        if (!oldValue || !newValue) continue;
        if (!BOOL_LITERAL.test(oldValue) && BOOL_LITERAL.test(newValue)) return true;
      }
      return false;
    },
  },
  {
    id: 'hard-coded-sleep',
    label: 'Adds a fixed sleep',
    severity: 'low',
    detail:
      'page.waitForTimeout() pauses for a fixed duration regardless of what the app is doing. Playwright discourages it: it makes the suite slower on every run and only hides the race rather than removing it. Waiting for the specific element or state is the durable fix.',
    test: ({ oldCode, newCode }) => {
      const count = (s) => (s.match(/waitForTimeout\s*\(/g) || []).length;
      return count(newCode) > count(oldCode);
    },
  },
  {
    id: 'timeout-inflated',
    label: 'Only increases a timeout',
    severity: 'low',
    detail:
      'Waiting longer masks slowness rather than addressing it, and makes the suite slower on every future run. Worth confirming the app is genuinely just slow.',
    test: ({ oldCode, newCode }) => {
      const oldNums = (oldCode.match(/\b\d{3,}\b/g) || []).map(Number);
      const newNums = (newCode.match(/\b\d{3,}\b/g) || []).map(Number);
      if (!oldNums.length || oldNums.length !== newNums.length) return false;
      const onlyNumbersDiffer =
        oldCode.replace(/\b\d{3,}\b/g, 'N') === newCode.replace(/\b\d{3,}\b/g, 'N');
      return onlyNumbersDiffer && newNums.some((n, i) => n > oldNums[i]);
    },
  },
];

/**
 * Catches the model contradicting its own proposal in plain English.
 *
 * Observed for real: a proposal explained itself as changing a value "which
 * might not be accurate" — i.e. the model's own stated reasoning for the
 * edit doubted the very thing it was hardcoding. self-reported "confidence"
 * doesn't catch this (it said "medium"); the prose does. Every code-shape
 * detector above can be evaded by relocating the harmful pattern somewhere
 * unmatched, but the model still has to explain itself in words, and a
 * fabricated fix tends to leak uncertainty there even when the code looks
 * confident. This is a second, independent signal — not a replacement for
 * the code-shape detectors above.
 */
const HEDGE_LANGUAGE = /\b(might not be|might be wrong|might be inaccurate|may not be accurate|may not be correct|possibly (?:wrong|inaccurate|incorrect)|not (?:sure|certain)|unclear (?:if|whether)|could be (?:wrong|stale|inaccurate)|seems? to be|appears? to be|likely (?:a|the) (?:bug|issue)|assuming|guessing)\b/i;

function hasHedgeLanguage(text) {
  return HEDGE_LANGUAGE.test(text || '');
}

/** A risk object (matching assessRisks' shape) if `text` hedges, else null. */
function languageRisk(text) {
  if (!hasHedgeLanguage(text)) return null;
  const quoted = (text || '').length > 160 ? `${text.slice(0, 160)}…` : text;
  return {
    id: 'uncertain-reasoning',
    label: "The model's own explanation hedges on this",
    severity: 'high',
    detail: `Its stated reasoning doubts the very thing it changed: "${quoted}" — treat that as the model telling you it isn't sure, not as something a passing rerun resolves.`,
  };
}

/** Returns [{ id, label, detail, severity }] for every risky shape this edit matches. */
function assessRisks(edit) {
  const found = [];
  for (const risk of RISKS) {
    let matched = false;
    try {
      matched = risk.test(edit);
    } catch {
      matched = false; // A detector must never break proposal generation.
    }
    if (matched) found.push({ id: risk.id, label: risk.label, detail: risk.detail, severity: risk.severity });
  }
  return found;
}

/**
 * True if any edit in a proposal defeats the test's purpose outright
 * (assertion-flipped/-removed, test-skipped). Applying one of these is
 * gated on explicit human acknowledgement in runManager.applySpotFix —
 * a warning alone was not enough (see the risk.js file header).
 */
function hasHighRisk(edits) {
  return (edits || []).some((edit) => (edit.risks || []).some((r) => r.severity === 'high'));
}

module.exports = { assessRisks, hasHighRisk, hasHedgeLanguage, languageRisk };
