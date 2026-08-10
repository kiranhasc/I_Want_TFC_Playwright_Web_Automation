/**
 * Finds spot fixes already tried against this exact test that were proven
 * NOT to work — applied, rerun, and still failed.
 *
 * A model getting the diagnosis wrong once is a capability limit no amount
 * of prompting fully closes. A model proposing the SAME already-disproven
 * fix a second time is a different, fixable problem: the evidence that it
 * doesn't work already exists on disk (a real rerun, not a guess), and
 * nothing before this fed it back in. Without this, "Regenerate" can loop
 * forever proposing the identical wrong edit, which is a credibility problem
 * this dashboard exists to prevent, not just a wasted API call.
 *
 * Deliberately requires verification.status === 'failed' specifically — a
 * real rerun that actually happened and actually failed — rather than
 * "reverted" alone, which also covers a human simply changing their mind
 * about a fix that may well have worked. Only a rerun-proven failure is
 * strong enough evidence to tell a model its own past proposal was wrong.
 */
const fs = require('fs');
const path = require('path');
const { RUNS_DIR } = require('../paths');
const { normalizeEol } = require('./sourceFiles');

/**
 * Every run record on disk whose test at (test.file, test.line) has a
 * verification-failed spot-fix attempt, most recent first. Best-effort: a
 * missing/corrupt run file is skipped rather than failing the whole lookup —
 * this is supporting evidence for a proposal, not something that should be
 * able to break generating one.
 */
function findPriorFailedAttempts(test, { excludeRunId, limit = 3 } = {}) {
  let runFiles;
  try {
    runFiles = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }

  const out = [];
  for (const fileName of runFiles) {
    const runId = fileName.replace(/\.json$/, '');
    if (runId === excludeRunId) continue;

    let run;
    try {
      run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, fileName), 'utf-8'));
    } catch {
      continue;
    }

    for (const t of Object.values(run.tests || {})) {
      if (t.file !== test.file || t.line !== test.line) continue;
      const sf = t.spotFix;
      if (!sf?.available || !sf.edits?.length) continue;
      if (sf.verification?.status !== 'failed') continue;

      out.push({
        runId,
        generatedAt: sf.generatedAt,
        explanation: sf.explanation || '',
        edits: sf.edits.map((e) => ({ file: e.file, oldCode: e.oldCode, newCode: e.newCode, reason: e.reason || '' })),
      });
    }
  }

  out.sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)));
  return out.slice(0, limit);
}

/**
 * True if `newCode` for `file` is the same change (or close enough — this
 * catches trivial rewording, not just byte-identical) as one already proven
 * not to fix this test. Whitespace-insensitive since re-formatting the same
 * edit is not a different edit.
 */
function normalizeForCompare(code) {
  return normalizeEol(code).replace(/\s+/g, ' ').trim();
}

function matchesPriorFailedAttempt(edit, priorAttempts) {
  const target = normalizeForCompare(edit.newCode);
  for (const attempt of priorAttempts) {
    for (const priorEdit of attempt.edits) {
      if (priorEdit.file !== edit.file) continue;
      if (normalizeForCompare(priorEdit.newCode) === target) return attempt;
    }
  }
  return null;
}

module.exports = { findPriorFailedAttempts, matchesPriorFailedAttempt };
