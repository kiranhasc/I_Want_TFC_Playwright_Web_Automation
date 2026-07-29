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
