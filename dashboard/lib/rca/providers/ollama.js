/**
 * Local-only AI provider: talks to a locally-running Ollama instance
 * (https://ollama.com) over plain HTTP on localhost/LAN. No data leaves the
 * machine/network running the model — there is no third-party vendor in
 * this path, unlike a hosted API. Best fit for a single developer's machine;
 * see providers/apiProvider.js for a team-wide, centrally-configured option.
 */
const { buildPrompt, parseModelResponse } = require('../promptFormat');

const DEFAULT_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'llama3.2';
const TIMEOUT_MS = 20000;

/** Throws on any failure (unreachable, timeout, bad response) — caller decides the fallback. */
async function runOllama(test, errorContext, { url = DEFAULT_URL, model = DEFAULT_MODEL } = {}) {
  const res = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: buildPrompt(test, errorContext), stream: false }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Ollama responded with ${res.status}`);
  }
  const data = await res.json();
  const parsed = parseModelResponse(data.response || '');
  return { source: 'ollama', model, ...parsed };
}

module.exports = { runOllama, DEFAULT_URL, DEFAULT_MODEL };
