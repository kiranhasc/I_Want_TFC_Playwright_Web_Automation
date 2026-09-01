/**
 * Custom Playwright reporter that streams live test-lifecycle events to the
 * dashboard's backend while a run was triggered from the dashboard UI.
 *
 * Entirely guarded by DASHBOARD_SERVER_URL — when a developer runs
 * `npm run test:qa` etc. straight from the CLI without the dashboard server
 * running, every method below is a no-op and never throws, so plain CLI
 * usage is completely unaffected.
 */
class DashboardReporter {
  constructor() {
    this.serverUrl = process.env.DASHBOARD_SERVER_URL || null;
    this.runId = process.env.DASHBOARD_RUN_ID || null;
    this.jobId = process.env.DASHBOARD_JOB_ID || null;
    this.enabled = Boolean(this.serverUrl && this.runId && this.jobId);
    this._retryQueue = new Map();
    this._retryMaxAge = 60000; // cleanup old entries after 1 min
  }

  _scheduleRetry(key, event, payload, retriesLeft = 3) {
    if (!this.enabled || retriesLeft <= 0) return;
    if (this._retryQueue.has(key)) return;

    const attempt = () => {
      this._retryQueue.delete(key);
      this._post(event, payload, { retry: retriesLeft > 1, retriesLeft: retriesLeft - 1 });
    };

    const timeoutId = setTimeout(attempt, 1500);
    this._retryQueue.set(key, { timeoutId, createdAt: Date.now() });
    
    // Cleanup: prevent retry queue from growing unbounded with old entries
    if (this._retryQueue.size > 1000) {
      const cutoff = Date.now() - this._retryMaxAge;
      for (const [k, v] of this._retryQueue.entries()) {
        if (v.createdAt < cutoff) {
          clearTimeout(v.timeoutId);
          this._retryQueue.delete(k);
        }
      }
    }
  }

  _post(event, payload, { retry = true, retriesLeft = 3 } = {}) {
    if (!this.enabled) return;
    const body = JSON.stringify({ runId: this.runId, jobId: this.jobId, event, ...payload });
    const url = `${this.serverUrl}/api/internal/run-events`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      if (retry) {
        const key = `${this.runId}:${this.jobId}:${event}:${JSON.stringify(payload)}`;
        this._scheduleRetry(key, event, payload, retriesLeft);
      }
      // Best-effort only: a dashboard hiccup must never fail a test run.
      // Retry attempts are deliberately deferred so a final end event is not
      // silently dropped when the dashboard is briefly busy or the localhost
      // request races with process shutdown.
    });
  }

  _identity(test) {
    const project = test.parent ? test.parent.project() : null;
    return {
      testId: test.id,
      title: test.title,
      titlePath: test.titlePath(),
      project: project ? project.name : null,
      file: test.location.file,
      line: test.location.line,
    };
  }

  onBegin(config, suite) {
    try {
      this._post('begin', {
        totalTests: suite.allTests().length,
        projects: config.projects.map((p) => p.name),
      });
    } catch (err) {
      // Best-effort: reporter failures must never crash the run.
      console.error('[dashboard-reporter] onBegin error:', err.message);
    }
  }

  onTestBegin(test, result) {
    try {
      this._post('test-begin', { ...this._identity(test), retry: result.retry });
    } catch (err) {
      console.error('[dashboard-reporter] onTestBegin error:', err.message);
    }
  }

  onTestEnd(test, result) {
    try {
      this._post('test-end', {
        ...this._identity(test),
        retry: result.retry,
        status: result.status,
        duration: result.duration,
        error: result.errors && result.errors[0]
          ? { message: result.errors[0].message, stack: result.errors[0].stack }
          : null,
        attachments: (result.attachments || []).map((a) => ({
          name: a.name,
          contentType: a.contentType,
          path: a.path || null,
        })),
      });
    } catch (err) {
      console.error('[dashboard-reporter] onTestEnd error:', err.message);
    }
  }

  onEnd(result) {
    try {
      this._post('end', { status: result.status });
    } catch (err) {
      console.error('[dashboard-reporter] onEnd error:', err.message);
    }
  }

  // This reporter only POSTs events over HTTP — it never writes to the
  // terminal. Without this, Playwright assumes any custom reporter owns
  // stdio and suppresses its own built-in terminal output (e.g. `--list`
  // prints nothing, and normal runs get no console progress at all).
  printsToStdio() {
    return false;
  }
}

module.exports = DashboardReporter;
