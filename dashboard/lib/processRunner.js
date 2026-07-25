const { spawn, execSync } = require('child_process');
const { REPO_ROOT } = require('./paths');

const IS_WINDOWS = process.platform === 'win32';

// This repo's playwright.config.ts pins `channel: 'chrome'` for every
// project, so the only browser binary a dashboard-triggered job can spawn
// is the system Chrome.
const BROWSER_IMAGE_NAME = 'chrome.exe';

function listPids(imageName) {
  if (!IS_WINDOWS) return new Set();
  try {
    const out = execSync(`tasklist /FI "IMAGENAME eq ${imageName}" /FO CSV /NH`, { encoding: 'utf-8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const match = line.match(/^"[^"]+","(\d+)"/);
      if (match) pids.add(match[1]);
    }
    return pids;
  } catch {
    return new Set();
  }
}

/**
 * Spawns `npx playwright test ...` scoped to one project, with the given
 * env vars merged in. Returns the ChildProcess; caller wires up
 * stdout/stderr/exit handling.
 */
function spawnPlaywrightJob({ env, project, grep, targets = [], extraEnv = {} }) {
  // Matches this repo's existing npm run test:* convention (see package.json)
  // so a dashboard-triggered run behaves the same as running it from the
  // CLI: a visible browser window per test, one at a time.
  const args = ['cross-env', `TEST_ENV=${env}`, 'playwright', 'test', '--workers=1', '--headed'];
  if (project) args.push(`--project=${project}`);
  if (grep) args.push('--grep', grep);
  args.push(...targets);

  // Snapshot browser PIDs that already existed before this job started, so
  // killJobTree can tell "leftover from this job" apart from "the user's
  // own separate Chrome windows" (see comment there for why this is needed).
  const preExistingBrowserPids = listPids(BROWSER_IMAGE_NAME);

  const child = spawn('npx', args, {
    cwd: REPO_ROOT,
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  child.preExistingBrowserPids = preExistingBrowserPids;
  return child;
}

/**
 * Kills a spawned job and its full process tree, then sweeps for browser
 * processes that escaped the tree-kill.
 *
 * `npx` on Windows spawns playwright as a child, which in turn spawns
 * worker + browser processes, so in principle `taskkill /T` walking the
 * tree from the `npx` wrapper's PID should reach all of them. In practice,
 * Chrome's main process frequently re-parents itself on Windows (observed:
 * a launched chrome.exe's ParentProcessId no longer pointed at anything in
 * our spawned tree by the time we queried it), so it silently survives
 * `taskkill /T` and keeps running. Since dashboard jobs run strictly one at
 * a time (see RunManager._runJobQueue), any chrome.exe that appeared after
 * this job started and is still alive after the tree-kill is safe to
 * assume belongs to this job — sweep and kill those directly by PID,
 * without touching chrome.exe processes that predate the job (e.g. the
 * user's own separate browsing session).
 */
function killJobTree(child) {
  if (!child || child.pid == null || child.killed) return;

  if (IS_WINDOWS) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    setTimeout(() => sweepOrphanedBrowsers(child.preExistingBrowserPids || new Set()), 500);
  } else {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }
}

function sweepOrphanedBrowsers(preExistingPids) {
  const currentPids = listPids(BROWSER_IMAGE_NAME);
  for (const pid of currentPids) {
    if (!preExistingPids.has(pid)) {
      spawn('taskkill', ['/pid', pid, '/F']);
    }
  }
}

module.exports = { spawnPlaywrightJob, killJobTree };
