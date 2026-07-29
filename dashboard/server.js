const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const { FRONTEND_DIST_DIR } = require('./lib/paths');
const RunManager = require('./lib/runManager');
const createApiRouter = require('./routes/api');
const filesRouter = require('./routes/files');
const { regenerateProjectsManifest } = require('./lib/generateProjectsManifest');
const { AutoUpdater } = require('./lib/autoUpdater');

const PORT = Number(process.env.DASHBOARD_PORT) || 4300;
const HOST = '127.0.0.1'; // Localhost-only: this server can spawn arbitrary Playwright
// test runs on request, so it must never be exposed on the network by default.

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(data);
  }
}

const runManager = new RunManager({ port: PORT, broadcast });

// Keep dashboard/config/projects.json in sync with playwright.config.ts on
// every boot. Never let a sync failure block the server from starting.
try {
  regenerateProjectsManifest();
} catch (err) {
  console.error('[dashboard] failed to sync projects.json on startup:', err.message);
}

const autoUpdater = new AutoUpdater({
  broadcast,
  isRunActive: () => runManager.activeJobs.size > 0,
});
if (process.env.DASHBOARD_AUTO_UPDATE !== 'false') {
  autoUpdater.start();
}
if (process.env.DASHBOARD_WATCH_FRONTEND !== 'false') {
  autoUpdater.startLocalFrontendWatch();
}

wss.on('connection', (socket) => {
  // Push a snapshot of recent runs so a freshly opened tab isn't blank mid-run.
  socket.send(JSON.stringify({ type: 'snapshot', runs: runManager.listRuns(20) }));
});

app.use('/api/files', filesRouter);
app.use('/api', createApiRouter(runManager, autoUpdater));

if (fs.existsSync(FRONTEND_DIST_DIR)) {
  app.use(express.static(FRONTEND_DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res
      .status(503)
      .send('Dashboard frontend is not built yet. Run "npm run dashboard:build" first.');
  });
}

server.listen(PORT, HOST, () => {
  console.log(`Playwright dashboard running at http://${HOST}:${PORT}`);
});
