const express = require('express');
const fs = require('fs');
const { PROJECTS_MANIFEST } = require('../lib/paths');

/**
 * @param {import('../lib/runManager')} runManager
 * @param {import('../lib/autoUpdater').AutoUpdater} [autoUpdater]
 */
module.exports = function createApiRouter(runManager, autoUpdater) {
  const router = express.Router();

  router.get('/auto-update/status', (req, res) => {
    res.json(autoUpdater ? autoUpdater.getStatus() : { phase: 'idle' });
  });

  router.get('/projects', (req, res) => {
    const manifest = JSON.parse(fs.readFileSync(PROJECTS_MANIFEST, 'utf-8'));
    res.json(manifest);
  });

  router.get('/runs', (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    res.json(runManager.listRuns(limit));
  });

  router.get('/runs/:runId', (req, res) => {
    const run = runManager.loadRun(req.params.runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  });

  router.post('/runs', (req, res) => {
    const { env, project, grep } = req.body || {};
    if (!env) return res.status(400).json({ error: 'env is required' });
    const runId = runManager.start({ env, project, grep });
    res.status(202).json({ runId });
  });

  router.post('/runs/:runId/stop', (req, res) => {
    const ok = runManager.stop(req.params.runId);
    if (!ok) return res.status(404).json({ error: 'Run not found' });
    res.json({ ok: true });
  });

  router.post('/runs/:runId/rerun', (req, res) => {
    const { scope, target } = req.body || {};
    if (!['test', 'file', 'project', 'all-failed'].includes(scope)) {
      return res.status(400).json({ error: 'scope must be one of test|file|project|all-failed' });
    }
    try {
      const runId = runManager.rerun(req.params.runId, { scope, target });
      res.status(202).json({ runId });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/runs/:runId/tests/:testId/analyze', async (req, res) => {
    try {
      const rca = await runManager.analyzeTest(req.params.runId, req.params.testId);
      res.json(rca);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Generates a spot-fix proposal. Deliberately read-only with respect to the
  // working tree — /spot-fix/apply below is the only endpoint that writes.
  router.post('/runs/:runId/tests/:testId/spot-fix', async (req, res) => {
    try {
      const proposal = await runManager.proposeSpotFix(req.params.runId, req.params.testId);
      res.json(proposal);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Writes the reviewed proposal to disk, optionally rerunning the test after.
  router.post('/runs/:runId/tests/:testId/spot-fix/apply', (req, res) => {
    try {
      const result = runManager.applySpotFix(req.params.runId, req.params.testId, {
        rerun: Boolean(req.body?.rerun),
        // Provisional apply: kept only if the rerun comes back green.
        verify: Boolean(req.body?.verify),
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/runs/:runId/tests/:testId/spot-fix/revert', (req, res) => {
    try {
      const result = runManager.revertSpotFix(req.params.runId, req.params.testId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Bulk-clears run history. Kept above the ':runId' routes so that adding a
  // POST /runs/:runId later can't start swallowing "clear" as a run id.
  router.post('/runs/clear', (req, res) => {
    const keepLast = Number(req.body?.keepLast) || 0;
    if (keepLast < 0) return res.status(400).json({ error: 'keepLast must be zero or greater' });
    try {
      res.json(runManager.clearRuns({ keepLast }));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/runs/:runId', (req, res) => {
    try {
      runManager.deleteRun(req.params.runId);
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Every spot fix currently applied to the working tree, across all runs —
  // what backs the "uncommitted spot fixes" banner.
  router.get('/spot-fixes', (req, res) => {
    res.json(runManager.listAppliedSpotFixes());
  });

  // Revert by registry id, so undo works without knowing the originating run.
  router.post('/spot-fixes/:id/revert', (req, res) => {
    try {
      res.json(runManager.revertAppliedSpotFix(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/runs/last-failed/rerun', (req, res) => {
    const { env, project } = req.body || {};
    if (!env) return res.status(400).json({ error: 'env is required' });
    const runId = runManager.rerunLastFailed({ env, project });
    res.status(202).json({ runId });
  });

  // Ingestion endpoint for dashboard/reporter/dashboard-reporter.js running inside a spawned job.
  router.post('/internal/run-events', (req, res) => {
    runManager.ingestEvent(req.body || {});
    res.status(204).end();
  });

  return router;
};
