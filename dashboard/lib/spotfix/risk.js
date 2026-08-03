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

const RISKS = [
  {
    id: 'assertion-flipped',
    label: 'Rewrites what the test asserts',
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
    detail: 'The replacement drops one or more expect() calls, so the test will pass without checking what it used to check.',
    test: ({ oldCode, newCode }) => {
      const count = (s) => (s.match(/\bexpect\s*\(/g) || []).length;
      return count(newCode) < count(oldCode);
    },
  },
  {
    id: 'test-skipped',
    label: 'Skips the test',
    detail: 'This disables the test rather than fixing it.',
    test: ({ oldCode, newCode }) =>
      (/\.(skip|fixme)\b/.test(newCode) && !/\.(skip|fixme)\b/.test(oldCode)) ||
      (/^\s*\/\//m.test(newCode) && /\bexpect\s*\(/.test(oldCode) && !/\bexpect\s*\(/.test(newCode.replace(/^\s*\/\/.*$/gm, ''))),
  },
  {
    id: 'hard-coded-sleep',
    label: 'Adds a fixed sleep',
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

/** Returns [{ id, label, detail }] for every risky shape this edit matches. */
function assessRisks(edit) {
  const found = [];
  for (const risk of RISKS) {
    let matched = false;
    try {
      matched = risk.test(edit);
    } catch {
      matched = false; // A detector must never break proposal generation.
    }
    if (matched) found.push({ id: risk.id, label: risk.label, detail: risk.detail });
  }
  return found;
}

module.exports = { assessRisks };
