/**
 * The write boundary for spot fixes.
 *
 * A spot fix is the only feature in this dashboard that modifies files on
 * disk, so which files it may touch is deliberately narrow and enforced
 * here rather than trusted from the model's output. Everything a Playwright
 * failure could legitimately need to change lives in tests/ (specs) or src/
 * (page objects, business functions, utils, test data).
 *
 * Explicitly NOT editable: playwright.config.ts (run/environment config, not
 * a test-logic bug), .env and anything at the repo root, dashboard/ itself,
 * and node_modules.
 */
const fs = require('fs');
const path = require('path');
const { REPO_ROOT } = require('../paths');

const EDITABLE_ROOTS = [path.join(REPO_ROOT, 'tests'), path.join(REPO_ROOT, 'src')];

const EDITABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Guards against sending an enormous generated/bundled file to the model and
// against a proposal rewriting something unreviewable.
const MAX_FILE_BYTES = 256 * 1024;

// Windows/macOS paths are case-insensitive, so compare folded — but always
// read and write the path as resolved, never the folded copy.
const CASE_INSENSITIVE_FS = process.platform === 'win32' || process.platform === 'darwin';
const forCompare = (p) => (CASE_INSENSITIVE_FS ? p.toLowerCase() : p);

function isUnderEditableRoot(resolved) {
  const candidate = forCompare(resolved);
  return EDITABLE_ROOTS.some((rawRoot) => {
    const root = forCompare(rawRoot);
    return candidate === root || candidate.startsWith(root + path.sep);
  });
}

/**
 * Line endings are normalised to \n everywhere inside the spot-fix pipeline.
 *
 * This repo's sources are CRLF (checked out on Windows), but a model emits
 * plain \n. Without normalising, any multi-line `oldCode` fails the
 * exact-match check no matter how faithfully the model copied it — the
 * proposal looks like a paraphrase when it is really just a \r mismatch.
 * The file's original ending is preserved and restored on write so applying
 * a fix never rewrites every line of the file.
 */
const normalizeEol = (text) => text.replace(/\r\n/g, '\n');
const applyEol = (text, eol) => (eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text);
const detectEol = (raw) => (raw.includes('\r\n') ? '\r\n' : '\n');

/**
 * Resolves a path (absolute, or repo-relative as a model is likely to emit)
 * to an editable source file. Returns { path, relative, content, eol } where
 * `content` is \n-normalised, or throws with a reason suitable for showing
 * the user.
 */
function resolveEditableFile(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') {
    throw new Error('Edit is missing a file path');
  }
  // path.resolve on an already-absolute path is a no-op, so this handles both
  // absolute paths (from stack traces) and repo-relative ones (from the model).
  const resolved = path.resolve(REPO_ROOT, rawPath.trim());

  if (!isUnderEditableRoot(resolved)) {
    throw new Error(`Refusing to edit "${rawPath}": only files under tests/ and src/ may be changed`);
  }
  if (!EDITABLE_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
    throw new Error(`Refusing to edit "${rawPath}": not a source file`);
  }

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch {
    throw new Error(`File does not exist: ${rawPath}`);
  }
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${rawPath}`);
  }
  if (stat.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large to spot-fix safely: ${rawPath}`);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  return {
    path: resolved,
    relative: path.relative(REPO_ROOT, resolved).split(path.sep).join('/'),
    content: normalizeEol(raw),
    eol: detectEol(raw),
  };
}

/**
 * The files worth showing the model, most-relevant first.
 *
 * The spec file alone is usually not enough: in this repo a failing wait
 * typically originates in a page object (src/pom/*) or business function
 * (src/businessFunction/*) several frames up, so the stack trace is mined for
 * additional in-repo frames. Playwright stack frames look like
 * "    at Foo.bar (C:\...\src\pom\X.ts:312:37)" as well as bare
 * "    at C:\...\tests\y.spec.ts:60:24".
 */
function collectCandidateFiles(test, { limit = 3 } = {}) {
  const ordered = [];
  const byPath = new Map();

  const add = (candidatePath, line) => {
    if (!candidatePath) return;
    let file;
    try {
      file = resolveEditableFile(candidatePath);
    } catch {
      return; // Not editable (node_modules frame, config, missing) — just skip.
    }
    const existing = byPath.get(file.path);
    if (existing) {
      // Same file appearing in several frames: keep every line of interest.
      if (line) existing.lines.add(line);
      return;
    }
    const entry = { ...file, lines: new Set(line ? [line] : []) };
    byPath.set(file.path, entry);
    ordered.push(entry);
  };

  add(test.file, test.line);

  const stack = test.error?.stack || '';
  // Capture the path and line of each frame. Handles both drive-letter
  // absolute paths and POSIX ones, and both "at Foo.bar (path:l:c)" and
  // bare "at path:l:c" frame shapes.
  for (const match of stack.matchAll(
    /(?:at\s+(?:.*?\s+)?\(?)([A-Za-z]:[\\/][^\n():]*?|\/[^\n():]*?):(\d+):\d+/g
  )) {
    add(match[1], Number(match[2]));
  }

  return ordered.slice(0, limit);
}

/**
 * The exact source lines the failure came from, deepest frame first.
 *
 * Without this the model infers what broke from the test's *title*, which is
 * actively misleading: a test named "…Add to Watchlist option is not
 * displayed…" failed on a preceding precondition assertion, and the model
 * duly proposed inverting the watchlist assertion on the next line — one that
 * never executed. Quoting the failing line removes the guesswork.
 */
function describeFailingLines(test, { limit = 3 } = {}) {
  const stack = test.error?.stack || '';
  const out = [];
  const seen = new Set();

  for (const match of stack.matchAll(
    /(?:at\s+(?:.*?\s+)?\(?)([A-Za-z]:[\\/][^\n():]*?|\/[^\n():]*?):(\d+):\d+/g
  )) {
    let file;
    try {
      file = resolveEditableFile(match[1]);
    } catch {
      continue; // node_modules or otherwise not ours.
    }
    const line = Number(match[2]);
    const key = `${file.relative}:${line}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const text = file.content.split('\n')[line - 1];
    if (text !== undefined) out.push({ file: file.relative, line, text: text.trim() });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Widens each candidate file's excerpt to also cover wherever the strings in
 * the error message are defined.
 *
 * Stack frames alone are not enough under the Page Object pattern used here.
 * A failing wait reports the frame that *used* a locator — OTTAuthPage.ts:312
 * — while the locator's text is declared in the constructor hundreds of lines
 * away (OTTAuthPage.ts:123). Excerpting only around the stack frame hides the
 * one line that needs changing, and the model then "fixes" whatever it can
 * see instead: in the observed case it edited an expectedErrorMessage
 * argument that is only ever used for an assertion, so the rerun waited for
 * the same text and failed identically.
 *
 * Kept separate from `lines` (the failure anchors) because those also drive
 * which occurrence of a repeated snippet an edit refers to; a match somewhere
 * else in the file must widen the context without moving that anchor.
 */
function addErrorLiteralMatches(files, errorText) {
  // Quoted literals from the error, e.g. getByText('Please enter a valid…').
  const literals = [...String(errorText || '').matchAll(/['"`]([^'"`\n]{6,120})['"`]/g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (!literals.length) return files;

  for (const file of files) {
    const extra = new Set();
    const lines = file.content.split('\n');
    for (const [i, line] of lines.entries()) {
      if (literals.some((lit) => line.includes(lit))) extra.add(i + 1);
    }
    file.extraLines = extra;
  }
  return files;
}

/**
 * Builds the slice of a file worth sending to the model: windows of
 * CONTEXT_LINES around each line implicated by the stack trace, merged where
 * they overlap.
 *
 * Whole files are not an option — a business-function module here runs past
 * 1600 lines, and sending several of those at once exceeded the token-per-
 * minute budget of a typical hosted model outright. Excerpting also sharpens
 * the result, since the model is not hunting for the relevant code.
 *
 * Deliberately emits no line-number gutter: the model must copy `oldCode`
 * byte-for-byte for the exact-match apply to work, and a gutter would end up
 * inside the copied snippet. Ranges are stated in the header instead.
 */
function buildExcerpt(file, { contextLines = 25, maxLines = 120 } = {}) {
  const allLines = file.content.split('\n');
  if (allLines.length <= maxLines) {
    return { text: file.content, truncated: false };
  }

  // Stack-frame anchors plus wherever the error's strings are declared.
  const interesting = [...file.lines, ...(file.extraLines || [])].filter((n) => Number.isFinite(n) && n > 0);
  if (!interesting.length) {
    return { text: allLines.slice(0, maxLines).join('\n'), truncated: true };
  }

  const windows = interesting
    .map((line) => ({
      start: Math.max(1, line - contextLines),
      end: Math.min(allLines.length, line + contextLines),
    }))
    .sort((a, b) => a.start - b.start);

  const merged = [windows[0]];
  for (const w of windows.slice(1)) {
    const last = merged[merged.length - 1];
    if (w.start <= last.end + 1) last.end = Math.max(last.end, w.end);
    else merged.push(w);
  }

  const chunks = merged.map((w) => {
    const body = allLines.slice(w.start - 1, w.end).join('\n');
    return `// ---- ${file.relative} lines ${w.start}-${w.end} ----\n${body}`;
  });

  return { text: chunks.join('\n\n// ---- (lines omitted) ----\n\n'), truncated: true };
}

module.exports = {
  resolveEditableFile,
  collectCandidateFiles,
  describeFailingLines,
  addErrorLiteralMatches,
  buildExcerpt,
  normalizeEol,
  applyEol,
  EDITABLE_ROOTS,
};
