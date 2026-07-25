const path = require('path');

const DASHBOARD_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DASHBOARD_ROOT, '..');
const DATA_DIR = path.join(DASHBOARD_ROOT, 'data');
const RUNS_DIR = path.join(DATA_DIR, 'runs');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
const FRONTEND_DIST_DIR = path.join(DASHBOARD_ROOT, 'frontend', 'dist');
const PROJECTS_MANIFEST = path.join(DASHBOARD_ROOT, 'config', 'projects.json');

// Directories under which file-serving routes are allowed to read from.
// Anything outside these roots is rejected, even though the server only
// binds to localhost, to guard against path-traversal in the ?path= query.
const ALLOWED_FILE_ROOTS = [
  path.join(REPO_ROOT, 'test-results'),
];

module.exports = {
  DASHBOARD_ROOT,
  REPO_ROOT,
  DATA_DIR,
  RUNS_DIR,
  REPORTS_DIR,
  FRONTEND_DIST_DIR,
  PROJECTS_MANIFEST,
  ALLOWED_FILE_ROOTS,
};
