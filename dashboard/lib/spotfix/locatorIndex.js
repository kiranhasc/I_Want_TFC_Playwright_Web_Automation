/**
 * Extracts the full catalog of locators and methods a Page Object class
 * actually declares, so the model working on it (a) can see the whole
 * vocabulary instead of guessing from whatever fits in an excerpt window,
 * and (b) can be checked against afterward: any method/locator name a
 * proposal references that isn't in this catalog didn't come from the real
 * source — see rejectUngroundedEdits in index.js.
 *
 * This is what makes behavior consistent across different models. Wording
 * still varies model to model, but every model is checked against the same
 * ground truth, so a model that invents a plausible-sounding method name
 * gets rejected exactly as reliably as one that doesn't.
 */
const LOCATOR_DECL = /^\s*this\.(\w+)\s*=\s*\{\s*selector:\s*(['"`])((?:\\.|(?!\2).)*)\2/;
const METHOD_DECL = /^\s*(?:private\s+|public\s+|protected\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::|\{)/;
// Excludes control-flow keywords and the constructor, which match METHOD_DECL's
// shape but are never something a spot fix would call by name.
const NOT_A_METHOD = new Set(['constructor', 'if', 'for', 'while', 'switch', 'catch', 'function']);

/** { locators: [{ name, selector, line }], methods: [{ name, line }] } for one file's content. */
function buildLocatorIndex(content) {
  const lines = content.split('\n');
  const locators = [];
  const methods = [];
  const seenMethods = new Set();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const loc = line.match(LOCATOR_DECL);
    if (loc) {
      locators.push({ name: loc[1], selector: loc[3], line: i + 1 });
      continue;
    }

    const method = line.match(METHOD_DECL);
    if (method && !NOT_A_METHOD.has(method[1]) && !seenMethods.has(method[1])) {
      methods.push({ name: method[1], line: i + 1 });
      seenMethods.add(method[1]);
    }
  }

  return { locators, methods };
}

/**
 * Compact text block listing a file's full locator/method vocabulary — cheap
 * to include in full even when the source excerpt itself is truncated, since
 * it's names only, not implementations.
 */
function renderLocatorIndex(relativePath, index) {
  if (!index.locators.length && !index.methods.length) return '';
  const locatorLines = index.locators.map((l) => `  this.${l.name} → ${l.selector}`).join('\n');
  const methodLines = index.methods.map((m) => `  ${m.name}()`).join('\n');
  return `--- ${relativePath}: full locator/method catalog (this class has more than fits in the excerpt above — only names/selectors declared here are real) ---
${locatorLines ? `Locators:\n${locatorLines}\n` : ''}${methodLines ? `Methods:\n${methodLines}` : ''}`;
}

const fs = require('fs');
const path = require('path');
const { REPO_ROOT } = require('../paths');

const HELPER_DIRS = [path.join(REPO_ROOT, 'src', 'pom'), path.join(REPO_ROOT, 'src', 'businessFunction')];

function listHelperFiles() {
  const out = [];
  for (const dir of HELPER_DIRS) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (name.endsWith('.ts') || name.endsWith('.js')) out.push(path.join(dir, name));
    }
  }
  return out;
}

/**
 * Maps each `const x = new SomeClass(...)` instance in the shown source to
 * that class's full locator/method catalog, by finding whichever file under
 * src/pom declares `class SomeClass`.
 *
 * This is what turns "detailsPage.someMethod()" from an opaque string into
 * something checkable: once `detailsPage` is known to be an OTTDetailsPage,
 * a call to a method OTTDetailsPage never declares is unambiguous, not a
 * judgement call — regardless of which model proposed it.
 */
function buildReceiverIndex(fileContents) {
  const classFiles = listHelperFiles();
  const classCache = new Map(); // className -> index | null

  const indexForClass = (className) => {
    if (classCache.has(className)) return classCache.get(className);
    let result = null;
    for (const filePath of classFiles) {
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        continue;
      }
      if (new RegExp(`\\bclass\\s+${className}\\b`).test(content)) {
        result = buildLocatorIndex(content);
        break;
      }
    }
    classCache.set(className, result);
    return result;
  };

  const receiverIndex = new Map(); // receiverVarName -> { locators: Set, methods: Set }
  const INSTANCE_DECL = /\b(?:const|let|var)\s+(\w+)\s*=\s*new\s+(\w+)\s*\(/g;
  for (const content of fileContents) {
    for (const m of content.matchAll(INSTANCE_DECL)) {
      const [, varName, className] = m;
      if (receiverIndex.has(varName)) continue;
      const idx = indexForClass(className);
      if (idx) {
        receiverIndex.set(varName, {
          className,
          locators: new Set(idx.locators.map((l) => l.name)),
          methods: new Set(idx.methods.map((mth) => mth.name)),
        });
      }
    }
  }
  return receiverIndex;
}

/**
 * The first `receiver.method(` call in `newCode` but not `oldCode` where
 * `receiver` is a known page-object instance and `method` isn't in its real
 * method list — i.e. a call the model introduced that cannot exist. Returns
 * null if every newly-introduced call on a known receiver is real (calls on
 * unrecognised receivers — `page`, `locator`, chained builtins — are left
 * alone; they're Playwright/JS API surface this index doesn't own).
 */
function findUngroundedCall(oldCode, newCode, receiverIndex) {
  if (!receiverIndex.size) return null;
  const CALL = /\b(\w+)\.(\w+)\s*\(/g;
  const oldCalls = new Set([...oldCode.matchAll(CALL)].map((m) => `${m[1]}.${m[2]}`));
  for (const m of newCode.matchAll(CALL)) {
    const [, receiver, method] = m;
    const key = `${receiver}.${method}`;
    if (oldCalls.has(key)) continue; // already present before the edit — not newly introduced
    const info = receiverIndex.get(receiver);
    if (!info) continue; // unrecognised receiver — not ours to validate
    if (!info.methods.has(method)) return { receiver, method, className: info.className };
  }
  return null;
}

module.exports = { buildLocatorIndex, renderLocatorIndex, buildReceiverIndex, findUngroundedCall };
