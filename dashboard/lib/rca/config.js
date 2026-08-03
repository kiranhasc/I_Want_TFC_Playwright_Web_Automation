const { DEFAULT_URL: OLLAMA_DEFAULT_URL, DEFAULT_MODEL: OLLAMA_DEFAULT_MODEL } = require('./providers/ollama');

/**
 * RCA_PROVIDER controls what generates the analysis:
 *   - 'heuristic' (default): free, instant, zero network, pattern-matching only.
 *   - 'ollama': local model via Ollama, on the machine running the dashboard
 *     server. Zero data leaves that machine/network, but only that one
 *     machine gets AI-backed analysis — not a fit for a shared team deploy.
 *   - 'api': a single API key/endpoint configured once here on the server,
 *     used by the whole team. RCA_API_FORMAT picks the wire format:
 *       - 'openai' (default): OpenAI, Groq, OpenRouter, Together, Mistral,
 *         Azure-OpenAI-style proxies, self-hosted OpenAI-compatible servers.
 *       - 'anthropic': direct Claude API key.
 *     Requires RCA_API_KEY; RCA_API_BASE_URL/RCA_API_MODEL are optional
 *     overrides (each format has a sensible default).
 *
 * Read fresh on each call rather than cached at import time, so editing .env
 * and restarting the server is enough — no code change needed.
 *
 * Lives in its own module (rather than in index.js) so both the RCA
 * orchestrator and complete.js can read it without a circular import.
 */
function getConfig() {
  return {
    provider: process.env.RCA_PROVIDER || 'heuristic',
    ollamaUrl: process.env.RCA_OLLAMA_URL || OLLAMA_DEFAULT_URL,
    ollamaModel: process.env.RCA_OLLAMA_MODEL || OLLAMA_DEFAULT_MODEL,
    apiFormat: process.env.RCA_API_FORMAT || 'openai',
    apiKey: process.env.RCA_API_KEY || null,
    apiBaseUrl: process.env.RCA_API_BASE_URL || null,
    apiModel: process.env.RCA_API_MODEL || null,
  };
}

module.exports = { getConfig };
