/**
 * Routes an arbitrary prompt to whichever AI provider RCA_PROVIDER selects,
 * so features beyond RCA (notably the spot-fix generator) reuse the one
 * provider/key the server is already configured with instead of growing
 * their own parallel config.
 *
 * Unlike analyzeTest(), this deliberately does NOT fall back to heuristics:
 * a caller asking for a raw completion needs a model, and silently returning
 * nothing would be worse than a clear "no AI provider configured" error.
 */
const { completeWithOllama, DEFAULT_URL: OLLAMA_URL, DEFAULT_MODEL: OLLAMA_MODEL } = require('./providers/ollama');
const { completeWithApi } = require('./providers/apiProvider');
const { getConfig } = require('./config');

/** True when RCA_PROVIDER points at something that can actually generate text. */
function hasAiProvider(config = getConfig()) {
  if (config.provider === 'ollama') return true;
  if (config.provider === 'api') return Boolean(config.apiKey);
  return false;
}

/** Human-readable reason why hasAiProvider() is false, for surfacing in the UI. */
function aiProviderUnavailableReason(config = getConfig()) {
  if (config.provider === 'api' && !config.apiKey) {
    return 'RCA_PROVIDER is "api" but RCA_API_KEY is not set on the dashboard server.';
  }
  return `RCA_PROVIDER is "${config.provider}", which cannot generate code. Set it to "api" (with RCA_API_KEY) or "ollama".`;
}

/** Returns { raw, model, source }. Throws if no AI provider is configured or the call fails. */
async function complete(prompt, { timeoutMs, maxTokens } = {}) {
  const config = getConfig();

  if (config.provider === 'ollama') {
    const raw = await completeWithOllama(prompt, {
      url: config.ollamaUrl,
      model: config.ollamaModel,
      timeoutMs,
    });
    return { raw, model: config.ollamaModel, source: 'ollama' };
  }

  if (config.provider === 'api') {
    const { raw, model } = await completeWithApi(prompt, {
      format: config.apiFormat,
      apiKey: config.apiKey,
      baseUrl: config.apiBaseUrl,
      model: config.apiModel,
      timeoutMs,
      maxTokens,
    });
    return { raw, model, source: 'api' };
  }

  throw new Error(aiProviderUnavailableReason(config));
}

module.exports = { complete, hasAiProvider, aiProviderUnavailableReason };
