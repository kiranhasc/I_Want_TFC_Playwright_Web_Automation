const express = require('express');
const path = require('path');
const fs = require('fs');
const { ALLOWED_FILE_ROOTS } = require('../lib/paths');

const router = express.Router();

/** Resolves ?path= and asserts it falls under an allow-listed root, blocking path traversal. */
function resolveAllowedPath(rawPath) {
  if (!rawPath) return null;
  const resolved = path.resolve(rawPath);
  const isAllowed = ALLOWED_FILE_ROOTS.some((root) => resolved.startsWith(root + path.sep) || resolved === root);
  if (!isAllowed) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

function serveFile(req, res, { contentType, cors } = {}) {
  const filePath = resolveAllowedPath(req.query.path);
  if (!filePath) {
    res.status(404).json({ error: 'File not found or not in an allowed directory' });
    return;
  }
  if (cors) res.setHeader('Access-Control-Allow-Origin', '*');
  if (contentType) res.type(contentType);
  res.sendFile(filePath);
}

// <img> tag target for failure screenshots captured by Playwright's own attachments.
router.get('/screenshot', (req, res) => serveFile(req, res, { contentType: 'image/png' }));

// <video> tag target; res.sendFile supports Range requests for scrubbing.
router.get('/video', (req, res) => serveFile(req, res));

// Permissive CORS so trace.playwright.dev can fetch this zip client-side via
// https://trace.playwright.dev/?trace=<url-encoded link to this route>.
router.get('/trace', (req, res) => serveFile(req, res, { contentType: 'application/zip', cors: true }));

module.exports = router;
