/**
 * Spot fix: AI proposes a concrete source edit for a failed test, a human
 * reviews the diff, and only then is it written to disk.
 *
 * Two invariants hold this together:
 *   1. Nothing is generated unless RCA classified the failure as 'code'.
 *      A CDN block or DNS failure has no code fix, and a model asked for one
 *      anyway will confidently invent a selector change (see ../rca/categories.js).
 *   2. Nothing is written without an explicit apply call, and apply
 *      re-validates against the file on disk rather than trusting the
 *      proposal — the file may have changed since it was generated.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('../paths');
const { loadErrorContext } = require('../rca/errorContext');
const { stripAnsi } = require('../rca/ansi');
const { complete, hasAiProvider, aiProviderUnavailableReason } = require('../rca/complete');
const { getConfig } = require('../rca/config');
const { FIXABLE_CATEGORY } = require('../rca/categories');
const {
  resolveEditableFile,
  collectCandidateFiles,
  addErrorLiteralMatches,
  addCalledMethodSources,
  addTestFlowSources,
  normalizeEol,
  applyEol,
} = require('./sourceFiles');
const { buildSpotFixPrompt } = require('./prompt');
const { diffLines } = require('./diff');
const { assessRisks, languageRisk } = require('./risk');
const { buildReceiverIndex, findUngroundedCall } = require('./locatorIndex');
const { findPriorFailedAttempts, matchesPriorFailedAttempt } = require('./priorAttempts');
const registry = require('./registry');

// Generating code needs a longer leash than summarising an error.
const TIMEOUT_MS = 90000;
const MAX_TOKENS = 3000;
// A spot fix is meant to be a small, reviewable change. More than this and a
// human should be reading the whole file, not approving a diff.
const MAX_EDITS = 5;

// Pre-edit copies of every file a spot fix overwrites, so a revert restores
// exact bytes without depending on git state (the file may well have had
// other uncommitted changes that a `git checkout --` would destroy).
const BACKUP_DIR = path.join(DATA_DIR, 'spotfix-backups');

const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

/** Models often wrap JSON in a markdown fence despite being told not to. */
function extractJson(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(text);
  } catch {
    // Fall back to the outermost brace pair, in case of leading/trailing prose.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) {
      throw new Error('Model did not return valid JSON');
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

/** Every start offset at which `needle` occurs in `haystack`. */
function allOccurrences(haystack, needle) {
  const hits = [];
  let from = 0;
  for (;;) {
    const i = haystack.indexOf(needle, from);
    if (i === -1) return hits;
    hits.push(i);
    from = i + 1; // Overlapping matches still each get their own anchor.
  }
}

const lineOf = (content, offset) => content.slice(0, offset).split('\n').length; // 1-based

const { enclosingTestBlock } = require('./testBlocks');

/**
 * Picks which occurrence of a repeated snippet the edit refers to.
 *
 * Spec files here are highly repetitive — the same assertion line appears in
 * five different tests — so a model naturally returns a snippet that occurs
 * many times, and demanding global uniqueness rejects otherwise-correct fixes.
 * Rather than trusting the model to disambiguate (it would have to count
 * lines), this uses something already known for certain: the line the failure
 * came from, via the test location and its stack frames.
 *
 * Deliberately conservative — if the enclosing test cannot be identified, or
 * holds more than one copy of the snippet, nothing is chosen. Editing the
 * wrong copy of a repeated block is exactly the silent corruption this
 * feature must never produce.
 */
function chooseOccurrence(content, offsets, anchorLines, relativePath) {
  if (offsets.length === 1) return offsets[0];
  if (!anchorLines?.length) {
    throw new Error(
      `The snippet to replace appears ${offsets.length} times in ${relativePath}, and there is no failure location to disambiguate it`
    );
  }

  const lines = content.split('\n');
  const occurrenceLines = offsets.map((offset) => ({ offset, line: lineOf(content, offset) }));

  for (const anchor of anchorLines) {
    const block = enclosingTestBlock(lines, anchor);
    if (!block) continue;
    const inBlock = occurrenceLines.filter((o) => o.line >= block.start && o.line < block.end);
    if (inBlock.length === 1) return inBlock[0].offset;
    if (inBlock.length > 1) {
      throw new Error(
        `The snippet to replace appears ${inBlock.length} times inside the failing test in ${relativePath} — too ambiguous to apply safely`
      );
    }
  }

  throw new Error(
    `The snippet to replace appears ${offsets.length} times in ${relativePath}, none of them inside the failing test`
  );
}

/**
 * Turns one raw model edit into a verified, applicable edit. Throws with a
 * user-facing reason if it cannot be trusted. This is the only place that
 * decides an edit is safe, so it is deliberately strict.
 *
 * The chosen location is pinned as a line span rather than left to a later
 * string replace, which would silently rewrite the first occurrence and not
 * necessarily the one verified here.
 */
function validateEdit(rawEdit, anchorsByFile = new Map()) {
  const { file, reason } = rawEdit || {};

  if (typeof rawEdit?.oldCode !== 'string' || !rawEdit.oldCode.trim()) {
    throw new Error('Edit has an empty "oldCode"');
  }
  if (typeof rawEdit?.newCode !== 'string') {
    throw new Error('Edit has no "newCode"');
  }

  // Compare in \n-space; the file on disk may be CRLF while the model always
  // emits \n. See normalizeEol in ./sourceFiles.js.
  const oldCode = normalizeEol(rawEdit.oldCode);
  const newCode = normalizeEol(rawEdit.newCode);
  if (oldCode === newCode) {
    throw new Error('Edit is a no-op (oldCode and newCode are identical)');
  }

  // Throws if the path is outside tests/ or src/, or not a source file.
  const target = resolveEditableFile(file);

  const offsets = allOccurrences(target.content, oldCode);
  if (offsets.length === 0) {
    throw new Error(`The snippet to replace was not found in ${target.relative} (the model may have paraphrased it)`);
  }
  const offset = chooseOccurrence(target.content, offsets, anchorsByFile.get(target.relative), target.relative);

  return {
    file: target.relative,
    absolutePath: target.path,
    oldCode,
    newCode,
    reason: typeof reason === 'string' ? reason : '',
    // The exact character offset this edit was verified at, so apply() rewrites
    // the occurrence that was reviewed rather than the file's first one.
    // A character offset rather than a line span because a model's snippet
    // routinely begins mid-line (it drops the leading indentation), and
    // baseSha256 below pins the content this offset is valid against.
    startOffset: offset,
    startLine: lineOf(target.content, offset), // for display only
    occurrenceCount: offsets.length,
    // Pinned so apply() can detect the file changing between propose and apply.
    baseSha256: sha256(target.content),
    diff: diffLines(oldCode, newCode),
    // Shapes that would make the test pass without fixing anything; shown as
    // warnings on the diff so the reviewer's attention goes to the right place.
    risks: assessRisks({ oldCode, newCode }),
  };
}

function unavailable(reason) {
  return { available: false, reason, edits: [] };
}

/**
 * Generates a spot-fix proposal for a failed test. Never writes to disk.
 * Returns { available, reason?, edits, explanation?, confidence?, model?, generatedAt }.
 */
async function proposeSpotFix(test, rca, { runId } = {}) {
  if (!rca) {
    return unavailable('Run "Analyze failure" first — a spot fix needs a diagnosis to work from.');
  }
  if (rca.category !== FIXABLE_CATEGORY) {
    return unavailable(
      `This failure is categorised as "${rca.category || 'unknown'}", not a code issue, so there is nothing in the repo to fix. ${rca.suggestedFix || ''}`.trim()
    );
  }
  if (!hasAiProvider()) {
    return unavailable(aiProviderUnavailableReason());
  }

  const files = collectCandidateFiles(test);
  if (!files.length) {
    return unavailable('Could not locate any editable source file for this test under tests/ or src/.');
  }
  // Widen the excerpts to include wherever the error's strings are declared —
  // under the Page Object pattern that is usually far from the stack frame.
  addErrorLiteralMatches(files, stripAnsi(test.error?.message));
  // A value assertion (expect(x).toContain(...)) can fail because the helper
  // method that produced x returned the wrong thing without throwing — that
  // method never appears in the stack trace and shares no literal with the
  // error text, so it would otherwise never be shown to the model at all.
  addCalledMethodSources(files, test);
  // Widens the excerpts further to include every helper the test itself
  // calls on the way to the failing line — not just the one adjacent to the
  // assertion — so a bug in an earlier step's actual behavior (as opposed to
  // what its name suggests) is visible rather than invented around.
  addTestFlowSources(files, test);

  // Every page-object instance this test/file touches, mapped to its real
  // method/locator catalog — the ground truth an edit is checked against
  // below, independent of which model proposed it.
  const receiverIndex = buildReceiverIndex(files.map((f) => f.content));

  // Real evidence, not a guess: fixes already applied to this exact test and
  // rerun for real that the app still failed. Both shown to the model (so it
  // has a chance to avoid repeating one) and checked deterministically below
  // (so it doesn't matter whether the model actually heeds that).
  const priorAttempts = findPriorFailedAttempts(test, { excludeRunId: runId });

  const errorContext = loadErrorContext(test);
  const prompt = buildSpotFixPrompt(test, rca, errorContext, files, priorAttempts);

  const { raw, model } = await complete(prompt, { timeoutMs: TIMEOUT_MS, maxTokens: MAX_TOKENS });
  const parsed = extractJson(raw);

  const rawEdits = Array.isArray(parsed.edits) ? parsed.edits : [];
  if (!rawEdits.length) {
    return unavailable(
      parsed.explanation || 'The model did not find a code change that would fix this failure.'
    );
  }
  if (rawEdits.length > MAX_EDITS) {
    return unavailable(
      `The model proposed ${rawEdits.length} edits, which is too broad for a spot fix — this needs manual review.`
    );
  }

  // Where the failure actually happened, per file — used to pick the right
  // occurrence when a snippet repeats. collectCandidateFiles already gathered
  // these from the test location and its in-repo stack frames.
  const anchorsByFile = new Map(files.map((f) => [f.relative, [...f.lines].filter(Boolean).sort((a, b) => a - b)]));

  const explanation = typeof parsed.explanation === 'string' ? parsed.explanation : '';
  // Independent of the code-shape checks in assessRisks: catches the model
  // hedging on the very thing it changed, in either the proposal-level
  // explanation or this specific edit's own reason. See risk.js.
  const proposalHedge = languageRisk(explanation);

  const edits = [];
  const rejected = [];
  for (const rawEdit of rawEdits) {
    try {
      const edit = validateEdit(rawEdit, anchorsByFile);
      // Hard rejection, not a risk warning: a call on a known page-object
      // instance to a method that class doesn't declare cannot be real,
      // regardless of how plausible the name sounds or which model wrote
      // it. This is what keeps behavior consistent across different
      // models — every one of them is checked against the same source.
      const ungrounded = findUngroundedCall(edit.oldCode, edit.newCode, receiverIndex);
      if (ungrounded) {
        rejected.push(
          `Edit to ${edit.file} calls ${ungrounded.receiver}.${ungrounded.method}(), which ${ungrounded.className} does not declare — likely a fabricated method name.`
        );
        continue;
      }
      // Hard rejection, same reasoning as the grounding check above: this
      // exact change was already applied to this exact test, actually rerun,
      // and actually still failed. No self-reported confidence overrides a
      // real rerun's result, regardless of how the model words it this time.
      const repeat = matchesPriorFailedAttempt(edit, priorAttempts);
      if (repeat) {
        rejected.push(
          `Edit to ${edit.file} repeats a change already applied and rerun against this exact test in run ${repeat.runId}, which still failed — not proposing it again.`
        );
        continue;
      }
      const hedge = proposalHedge || languageRisk(edit.reason);
      if (hedge) edit.risks = [...edit.risks, hedge];
      edits.push(edit);
    } catch (err) {
      rejected.push(err.message);
    }
  }

  if (!edits.length) {
    return unavailable(`No proposed edit could be verified against the source. ${rejected.join('; ')}`);
  }

  return {
    available: true,
    proposalId: crypto.randomUUID(),
    explanation,
    // Trust the model's self-reported confidence unless its own words
    // contradict it — "medium confidence" alongside "might not be accurate"
    // is not actually medium confidence.
    confidence: proposalHedge
      ? 'low'
      : ['high', 'medium', 'low'].includes(parsed.confidence)
        ? parsed.confidence
        : 'low',
    model,
    provider: getConfig().provider,
    edits,
    // Surfaced so a partially-verified proposal is never silently narrowed.
    rejected,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Writes a previously-generated proposal to disk after re-verifying it.
 *
 * Re-reads and re-checks every file: the proposal may be minutes old, the
 * auto-updater may have pulled new commits, or another spot fix may have
 * touched the same file. Validates all edits before writing any, so a bad
 * edit cannot leave the tree half-modified.
 */
function applySpotFix(proposal) {
  if (!proposal?.available || !Array.isArray(proposal.edits) || !proposal.edits.length) {
    throw new Error('There is no applicable spot-fix proposal to apply');
  }

  const planned = proposal.edits.map((edit) => {
    const target = resolveEditableFile(edit.absolutePath || edit.file);

    if (sha256(target.content) !== edit.baseSha256) {
      throw new Error(`${target.relative} has changed since this fix was proposed — re-analyze and generate a new one.`);
    }

    // Rewrite at the exact offset validateEdit verified. A string replace here
    // would hit the file's FIRST occurrence, which for a repeated snippet is
    // not necessarily the one shown in the reviewed diff.
    const start = edit.startOffset;
    if (target.content.slice(start, start + edit.oldCode.length) !== edit.oldCode) {
      throw new Error(
        `Cannot apply safely: ${target.relative} no longer matches the reviewed snippet at line ${edit.startLine}.`
      );
    }

    const updatedContent =
      target.content.slice(0, start) + edit.newCode + target.content.slice(start + edit.oldCode.length);
    return {
      path: target.path,
      relative: target.relative,
      eol: target.eol,
      originalContent: target.content,
      updatedContent,
    };
  });

  const backupDir = path.join(BACKUP_DIR, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const applied = [];
  for (const change of planned) {
    // Back up to disk rather than onto the run record: the run record is sent
    // to every connected browser on each snapshot, and a page object here runs
    // past 1600 lines.
    const backupPath = path.join(backupDir, change.relative.replace(/[\\/]/g, '__'));
    fs.writeFileSync(backupPath, applyEol(change.originalContent, change.eol), 'utf-8');

    // Restore the file's own line endings so applying a one-line fix doesn't
    // show up as every line changed in git.
    fs.writeFileSync(change.path, applyEol(change.updatedContent, change.eol), 'utf-8');

    applied.push({
      file: change.relative,
      absolutePath: change.path,
      eol: change.eol,
      backupPath,
      // Lets revert refuse if someone edited the file after we wrote it.
      appliedSha256: sha256(change.updatedContent),
    });
  }

  return { appliedAt: new Date().toISOString(), files: applied };
}

/**
 * Restores the files an applied spot fix overwrote.
 *
 * Refuses per-file if the content no longer matches what we wrote, so a
 * revert never clobbers someone's later manual edit.
 */
function revertSpotFix(applyRecord) {
  if (!applyRecord?.files?.length) {
    throw new Error('There is no applied spot fix to revert');
  }

  const reverted = [];
  const skipped = [];
  for (const file of applyRecord.files) {
    let current;
    let backup;
    try {
      current = normalizeEol(fs.readFileSync(file.absolutePath, 'utf-8'));
    } catch {
      skipped.push(`${file.file} (no longer readable)`);
      continue;
    }
    try {
      backup = fs.readFileSync(file.backupPath, 'utf-8');
    } catch {
      skipped.push(`${file.file} (its pre-fix backup is missing)`);
      continue;
    }
    if (sha256(current) !== file.appliedSha256) {
      skipped.push(`${file.file} (modified after the fix was applied)`);
      continue;
    }
    fs.writeFileSync(file.absolutePath, backup, 'utf-8');
    reverted.push(file.file);
  }

  if (!reverted.length) {
    throw new Error(`Nothing was reverted: ${skipped.join('; ')}`);
  }
  return { revertedAt: new Date().toISOString(), reverted, skipped };
}

// validateEdit is exported for tests: it is where every safety decision about
// an edit is made, so it needs to be exercisable without a live model call.
module.exports = { proposeSpotFix, applySpotFix, revertSpotFix, registry, validateEdit };
