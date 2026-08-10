const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { RUNS_DIR, REPORTS_DIR, REPO_ROOT, ARTIFACTS_DIR, PROJECTS_MANIFEST } = require('./paths');
const { spawnPlaywrightJob, killJobTree, listTestCount } = require('./processRunner');
const { analyzeTest: runRcaAnalysis } = require('./rca');
const { proposeSpotFix, applySpotFix, revertSpotFix, registry: spotFixRegistry } = require('./spotfix');
const { assessRisks, hasHighRisk, languageRisk } = require('./spotfix/risk');
const { KeepAwake } = require('./keepAwake');
const { archiveAttachments } = require('./artifactArchive');
const { syncRun, deleteRunFromIndex } = require('./db');
const { generateRunSummary } = require('./runSummary');

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

// How long a 'running' run may emit nothing before it's treated as wedged.
// Must exceed the longest single test (this suite tops out at a 180s
// test.setTimeout), hence a default well clear of that.
const STALL_THRESHOLD_MS = Number(process.env.DASHBOARD_STALL_TIMEOUT_MS) || 10 * 60 * 1000;
const STALL_AUTO_STOP = process.env.DASHBOARD_STALL_ACTION === 'stop';
// 'skip' kills only the wedged job and continues with the next queued
// project/module — the whole point being a browser dying on one module
// doesn't have to cost every module after it. 'stop' (above) remains the
// stronger, kill-everything option for when that's actually what's wanted.
const STALL_AUTO_SKIP = process.env.DASHBOARD_STALL_ACTION === 'skip';

/**
 * Playwright's reporter API gives test.location.file as an absolute path.
 * Passing that straight back as `<absolute-path>:<line>` breaks Playwright's
 * own CLI arg parser on Windows, because the drive-letter colon collides
 * with the line-number colon and the whole thing is treated as a regex that
 * matches nothing ("No tests found"). A repo-root-relative, forward-slash
 * path works with Playwright's file-matching regardless of platform.
 */
function toRelativeTarget(absoluteFile, line) {
  const relative = path.relative(REPO_ROOT, absoluteFile).split(path.sep).join('/');
  return `${relative}:${line}`;
}

/**
 * Owns the run/job state machine: creates run records, spawns Playwright
 * child processes (sequentially, one job per project), persists every run
 * to dashboard/data/runs/<runId>.json, and broadcasts live progress over
 * the WebSocket. This JSON file is the single source of truth read by the
 * REST API and by rerun-extraction — the Playwright 'json' reporter output
 * is a secondary artifact only.
 */
class RunManager {
  constructor({ port, broadcast, keepAwake = new KeepAwake() }) {
    this.port = port;
    this.broadcast = broadcast;
    // Held for the lifetime of each job queue so the machine can't sleep
    // mid-run and suspend the whole process tree. See lib/keepAwake.js.
    this.keepAwake = keepAwake;
    this.activeJobs = new Map(); // jobId -> { child }
    // runId -> epoch ms of the last reporter event. A run whose worker wedges
    // (e.g. the browser dies and Playwright blocks forever waiting on it)
    // keeps its process alive and its status 'running' while emitting nothing,
    // so silence is the only reliable signal that it has died. See
    // checkStalledRuns.
    this.lastEventAt = new Map();
    // rerunRunId -> { sourceRunId, testId, registryId }. A spot fix applied in
    // "verify" mode is provisional until the rerun it triggered comes back
    // green; see _resolvePendingVerification.
    this.pendingVerifications = new Map();
    // The single authoritative in-memory object per run while it's
    // queued/running. stop(), ingestEvent(), and the job-queue's own
    // `close` handler must all mutate this SAME object rather than each
    // independently loading their own copy from disk — otherwise a
    // handler holding a stale snapshot can clobber a newer save (e.g. a
    // job's 'close' callback overwriting a 'stopped' status with
    // 'failed' because its closure never saw the stop). Removed once a
    // run finishes, after which disk reads are safe again.
    this.activeRuns = new Map(); // runId -> run object
    if (!fs.existsSync(RUNS_DIR)) fs.mkdirSync(RUNS_DIR, { recursive: true });
  }

  /** The live in-memory object while a run is active; a disk snapshot otherwise. */
  _getMutableRun(runId) {
    return this.activeRuns.get(runId) || this.loadRun(runId);
  }

  _runFilePath(runId) {
    return path.join(RUNS_DIR, `${runId}.json`);
  }

  _saveRun(run) {
    fs.writeFileSync(this._runFilePath(run.runId), JSON.stringify(run, null, 2));
    // The run JSON file is still the single source of truth (read back by
    // loadRun/listRuns exactly as before) — this just keeps the SQLite
    // history index (db.js) from drifting out of sync with it. Best-effort:
    // syncRun never throws, so an indexing hiccup can never break a run.
    syncRun(run);
  }

  /**
   * Recomputes every stored spot-fix edit's risks from its oldCode/newCode on
   * every read, rather than trusting whatever was persisted.
   *
   * risk.js's rule set (and what counts as 'high' severity) can change after
   * a proposal was already generated and saved to disk — exactly what
   * happened today: a proposal saved before 'severity' existed still reads
   * back with risks that have no severity, so the apply-time guard silently
   * never triggers for it. Recomputing is cheap (a few regexes over a
   * handful of KB) and means a run's spot-fix data can never go stale
   * relative to the code guarding it.
   */
  _healSpotFixRisks(run) {
    for (const test of Object.values(run.tests || {})) {
      const spotFix = test.spotFix;
      const proposalHedge = languageRisk(spotFix?.explanation);
      for (const edit of spotFix?.edits || []) {
        if (typeof edit.oldCode === 'string' && typeof edit.newCode === 'string') {
          const risks = assessRisks({ oldCode: edit.oldCode, newCode: edit.newCode });
          const hedge = proposalHedge || languageRisk(edit.reason);
          if (hedge) risks.push(hedge);
          edit.risks = risks;
        }
      }
    }
    return run;
  }

  loadRun(runId) {
    const file = this._runFilePath(runId);
    if (!fs.existsSync(file)) return null;
    return this._healSpotFixRisks(JSON.parse(fs.readFileSync(file, 'utf-8')));
  }

  listRuns(limit = 20) {
    if (!fs.existsSync(RUNS_DIR)) return [];
    const files = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json'));
    const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), 'utf-8')));
    runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return runs.slice(0, limit);
  }

  /** A run whose spot fix is still applied is the only record of why a file in the repo changed. */
  _hasUnrevertedSpotFix(run) {
    return Object.values(run.tests || {}).some((t) => t.spotFix?.applied?.files?.length);
  }

  /**
   * Deletes one finished run and the artifacts it owns.
   *
   * Refuses on two conditions rather than deleting anyway: an active run would
   * keep writing its file straight back, and a run holding an unreverted spot
   * fix is the only trace of why a source file in the working tree differs —
   * throwing that away leaves an unexplained edit behind.
   *
   * test-results/ is deliberately untouched: Playwright keys that directory by
   * test rather than by run, so it is shared across runs and not this run's to
   * delete.
   */
  deleteRun(runId) {
    const run = this.loadRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    if (run.status === 'running' || run.status === 'queued') {
      throw new Error('This run is still active — stop it before deleting it');
    }
    if (this._hasUnrevertedSpotFix(run)) {
      throw new Error('This run has a spot fix still applied to your working tree — undo it first');
    }

    fs.rmSync(this._runFilePath(runId), { force: true });
    // The Playwright json reporter writes one file per dashboard run.
    fs.rmSync(path.join(REPORTS_DIR, `${runId}.json`), { force: true });
    // This run's archived attachments (see artifactArchive.js) — otherwise
    // deleted runs would leak screenshots/traces on disk forever.
    fs.rmSync(path.join(ARTIFACTS_DIR, runId), { recursive: true, force: true });
    deleteRunFromIndex(runId);

    this.activeRuns.delete(runId);
    this.lastEventAt.delete(runId);
    return true;
  }

  /**
   * Bulk-deletes run history, leaving the `keepLast` most recent runs alone.
   *
   * keepLast is a straight "don't touch the N newest" cut rather than a quota
   * of successful deletions: a protected run must not silently consume a slot
   * that the user expected to hold a run they can actually see.
   *
   * Every protection lives in deleteRun, so this only has to catch and report.
   * Skipping rather than failing means one pinned run can't block clearing the
   * rest, and the caller still learns what survived and why.
   */
  clearRuns({ keepLast = 0 } = {}) {
    const runs = this.listRuns(Number.MAX_SAFE_INTEGER); // newest first
    const deleted = [];
    const skipped = [];

    for (const run of runs.slice(keepLast)) {
      try {
        this.deleteRun(run.runId);
        deleted.push(run.runId);
      } catch (err) {
        skipped.push({ runId: run.runId, reason: err.message });
      }
    }

    this.broadcast({ type: 'runs-cleared', deleted: deleted.length });
    return { deleted: deleted.length, skipped };
  }

  _newRun(trigger) {
    const runId = crypto.randomUUID();
    const run = {
      runId,
      createdAt: new Date().toISOString(),
      trigger,
      jobs: [],
      status: 'queued',
      stats: { total: 0, passed: 0, failed: 0, skipped: 0, running: 0 },
      tests: {},
      // True once stats.total reflects the REAL grand total rather than
      // however many modules' 'begin' events have arrived so far — see
      // start()/rerun() (which set it) and ingestEvent (which respects it).
      totalKnownUpfront: false,
    };
    this._saveRun(run);
    this.activeRuns.set(run.runId, run);
    return run;
  }

  /**
   * Manual run trigger from the "New Run" form.
   *
   * A specific project is still one job — nothing to split. "All projects"
   * used to also be one job, with Playwright itself sequencing through every
   * project inside that single process. That made a stall unrecoverable
   * except by ending the whole run: the dashboard's own job queue (and so
   * skipStalledJob) only ever saw ONE job, with no next entry to advance to,
   * no matter how many of the real projects had already finished. Splitting
   * "all projects" into one dashboard job per project — same grouping
   * rerun() already uses — is what actually makes "skip the stuck module and
   * continue" mean something for the common case (a fresh run, not just a
   * rerun of failures).
   *
   * That splitting has its own side effect worth guarding against: stats.total
   * used to be known instantly (one combined Playwright invocation reports
   * its true total on its single 'begin' event), but split across N jobs it
   * would otherwise only grow as each module's own job starts, showing a
   * misleadingly small total for most of the run. listTestCount asks
   * Playwright to list (never run) the same target up front so the real
   * total is known before the first module even starts.
   */
  start({ env, project, grep }) {
    const run = this._newRun({ type: 'manual', env, project: project || null, grep: grep || null, sourceRunId: null });
    const jobSpecs = project ? [{ project, targets: [] }] : this._allProjectJobSpecs();

    if (!project) {
      const total = listTestCount({ env, grep });
      if (total != null) {
        run.stats.total = total;
        run.totalKnownUpfront = true;
        this._saveRun(run);
        this.broadcast({ type: 'run-event', runId: run.runId, event: 'stats', payload: { stats: run.stats } });
      }
      // total === null: listTestCount already logged why; fall back to the
      // old incremental behavior rather than blocking the run on this.
    }

    this._runJobQueue(run, jobSpecs, { env, grep });
    return run.runId;
  }

  /** One job spec per configured project, in manifest order. */
  _allProjectJobSpecs() {
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(PROJECTS_MANIFEST, 'utf-8'));
    } catch {
      // Manifest unreadable — fall back to the old single-job behavior
      // rather than failing the run outright.
      return [{ project: null, targets: [] }];
    }
    const projects = manifest.projects || [];
    if (!projects.length) return [{ project: null, targets: [] }];
    return projects.map((p) => ({ project: p.name, targets: [] }));
  }

  /** Convenience shortcut: rerun via Playwright's own --last-failed (immediately-preceding CLI run only). */
  rerunLastFailed({ env, project }) {
    const run = this._newRun({ type: 'last-failed', env, project: project || null, grep: null, sourceRunId: null });
    this._runJobQueue(run, [{ project: project || null, targets: [], lastFailed: true }], { env });
    return run.runId;
  }

  /** Rerun failures from a specific past run, grouped by project, targeted by exact file:line. */
  rerun(sourceRunId, { scope, target }) {
    const source = this.loadRun(sourceRunId);
    if (!source) throw new Error(`Source run ${sourceRunId} not found`);

    const failedTests = Object.values(source.tests).filter((t) => FAILURE_STATUSES.has(t.status));
    let targetTests = failedTests;
    if (scope === 'test') targetTests = failedTests.filter((t) => t.testId === target);
    else if (scope === 'file') targetTests = failedTests.filter((t) => t.file === target);
    else if (scope === 'project') targetTests = failedTests.filter((t) => t.project === target);
    // scope === 'all-failed' keeps every failed test in the source run

    if (targetTests.length === 0) {
      throw new Error('No matching failed tests to rerun');
    }

    const byProject = new Map();
    for (const t of targetTests) {
      const key = t.project || '__default__';
      if (!byProject.has(key)) byProject.set(key, []);
      byProject.get(key).push(t);
    }

    const jobSpecs = [...byProject.entries()].map(([project, tests]) => ({
      project: project === '__default__' ? null : project,
      targets: [...new Set(tests.map((t) => toRelativeTarget(t.file, t.line)))],
    }));

    const run = this._newRun({
      type: 'rerun',
      env: source.trigger.env,
      project: null,
      grep: null,
      sourceRunId,
      scope,
      target: target || null,
    });
    // Already known exactly — targetTests is the literal list of tests about
    // to be rerun, one dashboard-job-queue entry per project it spans. No
    // need for a listTestCount pass here (unlike start()): unlike "all
    // projects", where the true count isn't known until Playwright itself
    // resolves it, a rerun's total IS just this length, for free.
    run.stats.total = targetTests.length;
    run.totalKnownUpfront = true;
    this._runJobQueue(run, jobSpecs, { env: source.trigger.env });
    return run.runId;
  }

  stop(runId) {
    const run = this._getMutableRun(runId);
    if (!run) return false;
    for (const jobMeta of run.jobs) {
      const active = this.activeJobs.get(jobMeta.jobId);
      if (active) killJobTree(active.child);
      if (jobMeta.status === 'running' || jobMeta.status === 'queued') jobMeta.status = 'stopped';
    }
    run.status = 'stopped';
    this._saveRun(run);
    this.broadcast({ type: 'run-status', runId, status: 'stopped' });
    return true;
  }

  /**
   * Kills only the currently-wedged job and lets the queue continue with the
   * next module — the recovery path for a run that is "stuck between
   * modules" rather than genuinely needing to stop altogether.
   *
   * Deliberately does NOT touch `run.status`. stop() halts the whole queue by
   * setting run.status = 'stopped', which runNext (in _runJobQueue) checks
   * before spawning anything further. Leaving that alone here means runNext
   * behaves exactly as it already does for a job that crashed on its own —
   * its 'close' handler unconditionally advances to the next job regardless
   * of exit code — so killing the wedged process is enough to make the
   * existing queueing logic pick up and continue on its own; nothing about
   * _runJobQueue itself needs to change.
   */
  skipStalledJob(runId) {
    const run = this.activeRuns.get(runId);
    if (!run || run.status !== 'running') return false;
    const runningJob = run.jobs.find((j) => j.status === 'running');
    if (!runningJob) return false;
    const active = this.activeJobs.get(runningJob.jobId);
    if (!active) return false;

    // Set BEFORE killing: the 'close' handler only fills in a status when it
    // finds the job still 'running' (see stop() using the same pattern), so
    // this is what keeps the job recorded as stalled rather than a plain
    // 'failed' — the record should say what actually happened.
    runningJob.status = 'stalled';
    runningJob.finishedAt = new Date().toISOString();
    // Prevents the next 60s stall-check tick from immediately re-flagging
    // this run before the next module's process has had a chance to spawn
    // and emit its own first event.
    this.lastEventAt.set(runId, Date.now());
    run.stalledSince = null;
    this._saveRun(run);
    this.broadcast({ type: 'job-status', runId, jobId: runningJob.jobId, status: 'stalled' });
    this.broadcast({ type: 'run-stalled', runId, stalledSince: null });

    killJobTree(active.child);
    return true;
  }

  /** Spawns job specs one project at a time, chaining the next job off the previous process's 'close' event. */
  _runJobQueue(run, jobSpecs, { env, grep }) {
    run.status = 'running';
    this._saveRun(run);
    this.broadcast({ type: 'run-status', runId: run.runId, status: 'running' });

    // Paired with exactly one release on each of the two terminal branches
    // of runNext below, which are the only ways out of the recursion.
    this.keepAwake.acquire();

    const runNext = (index) => {
      if (run.status === 'stopped') {
        // stop() already finalized this run; don't spawn the next queued
        // project even though the killed job's 'close' event just fired.
        this.activeRuns.delete(run.runId);
        this.lastEventAt.delete(run.runId);
        this.keepAwake.release();
        // A stopped rerun proves nothing, so any fix riding on it is rolled back.
        this._resolvePendingVerification(run);
        return;
      }
      if (index >= jobSpecs.length) {
        // A 'stalled' module counts as a failure for the run's own headline
        // status, same as 'failed' — the run did continue past it (that's
        // the whole point of skipStalledJob), but that module's results are
        // still incomplete/unknown, which is not a 'passed' run.
        const finalStatus = run.jobs.some((j) => j.status === 'failed' || j.status === 'stalled')
          ? 'failed'
          : run.jobs.some((j) => j.status === 'stopped')
            ? 'stopped'
            : 'passed';
        run.status = finalStatus;
        this._saveRun(run);
        this.broadcast({ type: 'run-status', runId: run.runId, status: finalStatus });
        this.activeRuns.delete(run.runId);
        this.lastEventAt.delete(run.runId);
        this.keepAwake.release();
        // Keep or roll back any spot fix whose verification rerun this was.
        this._resolvePendingVerification(run);
        // A stopped run's data is a partial/interrupted snapshot, not a
        // meaningful result to summarize — only passed/failed runs qualify.
        if (finalStatus === 'passed' || finalStatus === 'failed') this._generateRunSummaryAsync(run.runId);
        return;
      }

      const spec = jobSpecs[index];
      const jobId = crypto.randomUUID();
      const jobMeta = {
        jobId,
        project: spec.project,
        pid: null,
        status: 'running',
        startedAt: new Date().toISOString(),
        finishedAt: null,
      };
      run.jobs.push(jobMeta);
      this._saveRun(run);
      this.broadcast({ type: 'job-status', runId: run.runId, jobId, status: 'running' });

      const child = spawnPlaywrightJob({
        env,
        project: spec.project,
        grep,
        targets: [...(spec.targets || []), ...(spec.lastFailed ? ['--last-failed'] : [])],
        extraEnv: {
          DASHBOARD_SERVER_URL: `http://127.0.0.1:${this.port}`,
          DASHBOARD_RUN_ID: run.runId,
          DASHBOARD_JOB_ID: jobId,
        },
      });

      jobMeta.pid = child.pid;
      this.activeJobs.set(jobId, { child });
      this._saveRun(run);

      child.on('close', (code) => {
        this.activeJobs.delete(jobId);
        jobMeta.finishedAt = new Date().toISOString();
        if (jobMeta.status === 'running') jobMeta.status = code === 0 ? 'passed' : 'failed';
        this._saveRun(run);
        this.broadcast({ type: 'job-status', runId: run.runId, jobId, status: jobMeta.status });
        runNext(index + 1);
      });
    };

    runNext(0);
  }

  /** Runs RCA for one test in a run, persists the result onto that test record, and returns it. */
  async analyzeTest(runId, testId) {
    const run = this._getMutableRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const test = run.tests[testId];
    if (!test) throw new Error(`Test ${testId} not found in run ${runId}`);

    const rca = await runRcaAnalysis(test);
    test.rca = rca;
    // A fresh diagnosis invalidates any proposal built from the previous one.
    delete test.spotFix;
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'test-rca', payload: { testId, rca } });
    return rca;
  }

  _getTest(runId, testId) {
    const run = this._getMutableRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const test = run.tests[testId];
    if (!test) throw new Error(`Test ${testId} not found in run ${runId}`);
    return { run, test };
  }

  /**
   * Generates a spot-fix proposal for one failed test. Writes nothing to
   * disk — the proposal is persisted onto the test record so the UI can show
   * the diff and later apply exactly what was reviewed.
   */
  async proposeSpotFix(runId, testId) {
    const { run, test } = this._getTest(runId, testId);

    const proposal = await proposeSpotFix(test, test.rca, { runId });
    test.spotFix = proposal;
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'test-spot-fix', payload: { testId, spotFix: proposal } });
    return proposal;
  }

  /**
   * Applies the stored proposal to disk. Optionally reruns the test straight
   * after, which is the whole point of a spot fix — confirming the change
   * actually turns the test green.
   */
  applySpotFix(runId, testId, { rerun = false, verify = false, acknowledgeRisks = false } = {}) {
    const { run, test } = this._getTest(runId, testId);
    if (!test.spotFix) throw new Error('No spot-fix proposal exists for this test — generate one first');
    if (test.spotFix.applied) throw new Error('This spot fix has already been applied');
    if (verify && !rerun) throw new Error('Verifying a spot fix requires rerunning the test');
    // High-severity risks (assertion-flipped/-removed, test-skipped) defeat
    // the test's purpose outright, and a rerun cannot catch that: an
    // assertion rewritten to match what was observed will trivially pass by
    // construction, so "verify" would falsely certify exactly the edits that
    // most need a human's judgement. Applying one requires saying so
    // explicitly — a risk label alone was proven not enough to stop this in
    // practice. See spotfix/risk.js.
    if (hasHighRisk(test.spotFix.edits) && !acknowledgeRisks) {
      throw new Error(
        'This fix changes what the test checks (not just how it checks it) — review the warning above the diff, then confirm to apply anyway. A passing rerun would not prove this is correct.'
      );
    }

    const applyRecord = applySpotFix(test.spotFix);
    // Registered so the fix stays revertable from anywhere, including after
    // "Apply & rerun" navigates to a different run. See spotfix/registry.js.
    const entry = spotFixRegistry.record({ runId, testId, testTitle: test.title, applyRecord });
    test.spotFix = {
      ...test.spotFix,
      applied: { ...applyRecord, registryId: entry.id },
      verification: verify ? { status: 'pending' } : null,
    };
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'test-spot-fix', payload: { testId, spotFix: test.spotFix } });
    this._broadcastAppliedSpotFixes();

    const rerunRunId = rerun ? this.rerun(runId, { scope: 'test', target: testId }) : null;
    if (verify && rerunRunId) {
      this.pendingVerifications.set(rerunRunId, { sourceRunId: runId, testId, registryId: entry.id });
    }
    return { applied: test.spotFix.applied, rerunRunId, verifying: Boolean(verify && rerunRunId) };
  }

  /**
   * Decides the fate of a provisionally-applied spot fix once its rerun ends.
   *
   * This is what makes an applied fix mean something. Without it, "Apply &
   * rerun" leaves the edit in the working tree whether or not it helped — the
   * observed case being a fix that changed an argument the failing wait never
   * reads, so the rerun failed identically and the useless edit stayed behind.
   * Anything that does not come back green is rolled back automatically, so a
   * surviving fix is one that demonstrably turned the test green.
   *
   * Test ids are stable across runs (they are derived from file and title),
   * which is what lets the rerun's result be matched back to the original.
   */
  _resolvePendingVerification(finishedRun) {
    const pending = this.pendingVerifications.get(finishedRun.runId);
    if (!pending) return;
    this.pendingVerifications.delete(finishedRun.runId);

    const rerunTest = finishedRun.tests[pending.testId];
    const passed = rerunTest?.status === 'passed';

    let verification;
    if (passed) {
      verification = {
        status: 'passed',
        rerunRunId: finishedRun.runId,
        detail: 'The test passed on rerun, so this fix was kept.',
        checkedAt: new Date().toISOString(),
      };
    } else {
      const outcome = rerunTest ? `still ${rerunTest.status}` : 'did not report a result';
      let detail = `The test ${outcome} on rerun, so the fix was rolled back.`;
      try {
        this.revertAppliedSpotFix(pending.registryId);
      } catch (err) {
        detail = `The test ${outcome} on rerun, but rolling the fix back failed: ${err.message}`;
      }
      verification = {
        status: 'failed',
        rerunRunId: finishedRun.runId,
        detail,
        checkedAt: new Date().toISOString(),
      };
    }

    // revertAppliedSpotFix above may already have rewritten the source run, so
    // re-read it rather than holding a stale copy.
    try {
      const { run, test } = this._getTest(pending.sourceRunId, pending.testId);
      if (test.spotFix) {
        test.spotFix = { ...test.spotFix, verification };
        this._saveRun(run);
        this.broadcast({
          type: 'run-event',
          runId: pending.sourceRunId,
          event: 'test-spot-fix',
          payload: { testId: pending.testId, spotFix: test.spotFix },
        });
      }
    } catch {
      // Source run is gone; the working tree is already in the right state.
    }
  }

  /** Restores the files an applied spot fix overwrote. */
  revertSpotFix(runId, testId) {
    const { run, test } = this._getTest(runId, testId);
    if (!test.spotFix?.applied) throw new Error('This spot fix has not been applied, so there is nothing to revert');

    const result = revertSpotFix(test.spotFix.applied);
    spotFixRegistry.removeByTest(runId, testId);
    test.spotFix = { ...test.spotFix, applied: null, reverted: result };
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'test-spot-fix', payload: { testId, spotFix: test.spotFix } });
    this._broadcastAppliedSpotFixes();
    return result;
  }

  /** Every spot fix currently sitting in the working tree, newest first. */
  listAppliedSpotFixes() {
    return spotFixRegistry
      .list()
      .map(spotFixRegistry.toPublic)
      .sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1));
  }

  /**
   * Reverts by registry id rather than by run/test, so the undo works from a
   * global banner without the caller knowing which run produced the fix.
   *
   * Reverts from the registry's own copy of the apply record so a pruned run
   * file can't strand a change in the working tree; the run record is then
   * updated opportunistically if it still exists.
   */
  revertAppliedSpotFix(registryId) {
    const entry = spotFixRegistry.get(registryId);
    if (!entry) throw new Error('That spot fix is no longer recorded as applied');

    const result = revertSpotFix({ files: entry.files });
    spotFixRegistry.remove(registryId);

    try {
      const { run, test } = this._getTest(entry.runId, entry.testId);
      if (test.spotFix) {
        test.spotFix = { ...test.spotFix, applied: null, reverted: result };
        this._saveRun(run);
        this.broadcast({
          type: 'run-event',
          runId: entry.runId,
          event: 'test-spot-fix',
          payload: { testId: entry.testId, spotFix: test.spotFix },
        });
      }
    } catch {
      // The run is gone; the files are already restored, which is what matters.
    }

    this._broadcastAppliedSpotFixes();
    return result;
  }

  /**
   * Flags runs that have gone silent, and optionally kills them.
   *
   * A wedged run is invisible to every other check: the npx/Playwright/worker
   * processes are all still alive, the run status is still 'running', and no
   * error is ever raised — it simply stops emitting events. Observed cause:
   * the browser under test disappears and the worker blocks indefinitely on a
   * browser that no longer exists, so even Playwright's own per-test timeout
   * never lands. Only the absence of events reveals it.
   *
   * The threshold has to clear the longest legitimate gap between events,
   * which is one whole test: this suite's slowest sets test.setTimeout(180000),
   * so anything past ~4 minutes of silence is already abnormal. The default
   * leaves generous headroom on top of that.
   *
   * Flagging is the default rather than acting, because ending someone's
   * long run on a heuristic is worse than showing them it needs attention.
   * Two opt-in auto-actions, via DASHBOARD_STALL_ACTION:
   *   - "stop": stop the whole run — nothing further runs.
   *   - "skip": kill only the wedged module and continue with the rest of
   *     the queue (see skipStalledJob) — a browser dying on one module
   *     doesn't have to cost every module after it.
   */
  checkStalledRuns({ thresholdMs = STALL_THRESHOLD_MS, autoStop = STALL_AUTO_STOP, autoSkip = STALL_AUTO_SKIP } = {}) {
    const now = Date.now();
    const stalled = [];

    for (const run of this.activeRuns.values()) {
      if (run.status !== 'running') continue;
      const last = this.lastEventAt.get(run.runId);
      // No event yet at all: measure from when the run started instead, so a
      // job that dies before its first test still gets caught.
      const since = last ?? new Date(run.createdAt).getTime();
      if (now - since < thresholdMs) continue;

      stalled.push({ runId: run.runId, silentForMs: now - since });

      if (!run.stalledSince) {
        run.stalledSince = new Date(since).toISOString();
        this._saveRun(run);
        this.broadcast({
          type: 'run-stalled',
          runId: run.runId,
          stalledSince: run.stalledSince,
          silentForMs: now - since,
        });
        console.warn(
          `[dashboard] run ${run.runId} has emitted no events for ${Math.round((now - since) / 60000)} min` +
            (autoStop ? ' — stopping it' : autoSkip ? ' — skipping the stuck module and continuing' : ' — it may be wedged; stop it from the dashboard')
        );
      }

      if (autoStop) {
        try {
          this.stop(run.runId);
        } catch (err) {
          console.error(`[dashboard] could not auto-stop stalled run ${run.runId}:`, err.message);
        }
      } else if (autoSkip) {
        try {
          this.skipStalledJob(run.runId);
        } catch (err) {
          console.error(`[dashboard] could not auto-skip stalled module in run ${run.runId}:`, err.message);
        }
      }
    }

    return stalled;
  }

  _broadcastAppliedSpotFixes() {
    this.broadcast({ type: 'spot-fixes-applied', fixes: this.listAppliedSpotFixes() });
  }

  /**
   * Adopts spot fixes that were applied before the registry existed, so an
   * already-modified working tree doesn't stay invisible to the banner.
   *
   * Run at startup. Idempotent: an applied fix carries the registryId it was
   * adopted under, so restarts don't create duplicate entries. Never throws —
   * a bad run file must not stop the server from booting.
   */
  backfillAppliedSpotFixes() {
    let adopted = 0;
    let runFiles;
    try {
      runFiles = fs.existsSync(RUNS_DIR) ? fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json')) : [];
    } catch {
      return 0;
    }

    const known = new Set(spotFixRegistry.list().map((e) => e.id));

    for (const file of runFiles) {
      let run;
      try {
        run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, file), 'utf-8'));
      } catch {
        continue;
      }
      let dirty = false;
      for (const [testId, test] of Object.entries(run.tests || {})) {
        const applied = test.spotFix?.applied;
        if (!applied?.files?.length) continue;
        if (applied.registryId && known.has(applied.registryId)) continue;

        const entry = spotFixRegistry.record({
          runId: run.runId,
          testId,
          testTitle: test.title,
          applyRecord: applied,
        });
        applied.registryId = entry.id;
        known.add(entry.id);
        dirty = true;
        adopted += 1;
      }
      if (dirty) this._saveRun(run);
    }
    return adopted;
  }

  _recomputeStats(run) {
    const stats = { total: run.stats.total, passed: 0, failed: 0, skipped: 0, running: 0 };
    for (const t of Object.values(run.tests)) {
      if (t.status === 'running') stats.running += 1;
      else if (t.status === 'passed') stats.passed += 1;
      else if (t.status === 'skipped') stats.skipped += 1;
      else stats.failed += 1;
    }
    run.stats = stats;
  }

  /** Ingests a lifecycle event POSTed by the custom Playwright reporter running inside a spawned job. */
  ingestEvent(payload) {
    const { runId, jobId, event } = payload;
    const run = this._getMutableRun(runId);
    if (!run) return;

    // Any reporter event is proof the run is alive; see checkStalledRuns.
    this.lastEventAt.set(runId, Date.now());
    if (run.stalledSince) {
      run.stalledSince = null;
      this.broadcast({ type: 'run-stalled', runId, stalledSince: null });
    }

    if (event === 'begin') {
      // When the true grand total was already established up front (see
      // start()/rerun()), each module's own 'begin' event must NOT also add
      // to it — that would double-count. Without totalKnownUpfront this is
      // the only way a multi-job run's total is known at all, so it still
      // needs to accumulate incrementally as the fallback.
      if (!run.totalKnownUpfront) run.stats.total += payload.totalTests || 0;
    } else if (event === 'test-begin') {
      run.tests[payload.testId] = {
        testId: payload.testId,
        title: payload.title,
        titlePath: payload.titlePath,
        project: payload.project,
        file: payload.file,
        line: payload.line,
        retry: payload.retry,
        status: 'running',
        duration: null,
        error: null,
        attachments: [],
      };
      this._recomputeStats(run);
    } else if (event === 'test-end') {
      const existing = run.tests[payload.testId] || {};
      // Copy attachments out of test-results/ now, before the next Playwright
      // invocation (of anything, anywhere in the suite) wipes that directory
      // out from under this run's history — see artifactArchive.js.
      const attachments = archiveAttachments(runId, payload.testId, payload.attachments || []);
      run.tests[payload.testId] = {
        ...existing,
        testId: payload.testId,
        title: payload.title,
        titlePath: payload.titlePath,
        project: payload.project,
        file: payload.file,
        line: payload.line,
        retry: payload.retry,
        status: payload.status,
        duration: payload.duration,
        error: payload.error || null,
        attachments,
      };
      this._recomputeStats(run);
    }

    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, jobId, event, payload });
  }

  /**
   * Fire-and-forget: called right after a run finishes, never blocks the
   * run-finish flow on an AI call. A missing provider or a failed call is
   * logged and otherwise invisible — a summary is a convenience, not
   * something a run's completion should ever depend on.
   */
  _generateRunSummaryAsync(runId) {
    generateRunSummary(runId)
      .then((summary) => {
        if (!summary) return; // no AI provider configured — silently skip
        const run = this.loadRun(runId);
        if (!run) return;
        run.aiSummary = summary;
        this._saveRun(run);
        this.broadcast({ type: 'run-event', runId, event: 'run-summary', payload: { summary } });
      })
      .catch((err) => {
        console.error(`[dashboard] run summary generation failed for ${runId}:`, err.message);
      });
  }

  /** User-triggered (re)generation — awaited, so the caller can show the real error if it fails. */
  async generateRunSummaryNow(runId) {
    const run = this.loadRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    const summary = await generateRunSummary(runId);
    if (!summary) throw new Error('No AI provider is configured on the dashboard server.');
    run.aiSummary = summary;
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'run-summary', payload: { summary } });
    return summary;
  }
}

module.exports = RunManager;
