const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { RUNS_DIR, REPO_ROOT } = require('./paths');
const { spawnPlaywrightJob, killJobTree } = require('./processRunner');
const { analyzeTest: runRcaAnalysis } = require('./rca');

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

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
  constructor({ port, broadcast }) {
    this.port = port;
    this.broadcast = broadcast;
    this.activeJobs = new Map(); // jobId -> { child }
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
  }

  loadRun(runId) {
    const file = this._runFilePath(runId);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }

  listRuns(limit = 20) {
    if (!fs.existsSync(RUNS_DIR)) return [];
    const files = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json'));
    const runs = files.map((f) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), 'utf-8')));
    runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return runs.slice(0, limit);
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
    };
    this._saveRun(run);
    this.activeRuns.set(run.runId, run);
    return run;
  }

  /** Manual run trigger from the "New Run" form. */
  start({ env, project, grep }) {
    const run = this._newRun({ type: 'manual', env, project: project || null, grep: grep || null, sourceRunId: null });
    this._runJobQueue(run, [{ project: project || null, targets: [] }], { env, grep });
    return run.runId;
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

  /** Spawns job specs one project at a time, chaining the next job off the previous process's 'close' event. */
  _runJobQueue(run, jobSpecs, { env, grep }) {
    run.status = 'running';
    this._saveRun(run);
    this.broadcast({ type: 'run-status', runId: run.runId, status: 'running' });

    const runNext = (index) => {
      if (run.status === 'stopped') {
        // stop() already finalized this run; don't spawn the next queued
        // project even though the killed job's 'close' event just fired.
        this.activeRuns.delete(run.runId);
        return;
      }
      if (index >= jobSpecs.length) {
        const finalStatus = run.jobs.some((j) => j.status === 'failed')
          ? 'failed'
          : run.jobs.some((j) => j.status === 'stopped')
            ? 'stopped'
            : 'passed';
        run.status = finalStatus;
        this._saveRun(run);
        this.broadcast({ type: 'run-status', runId: run.runId, status: finalStatus });
        this.activeRuns.delete(run.runId);
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
    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, event: 'test-rca', payload: { testId, rca } });
    return rca;
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

    if (event === 'begin') {
      run.stats.total += payload.totalTests || 0;
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
        attachments: payload.attachments || [],
      };
      this._recomputeStats(run);
    }

    this._saveRun(run);
    this.broadcast({ type: 'run-event', runId, jobId, event, payload });
  }
}

module.exports = RunManager;
