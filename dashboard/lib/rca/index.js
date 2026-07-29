const { loadErrorContext } = require('./errorContext');
const { runHeuristics } = require('./heuristics');
const { runOllama, DEFAULT_URL: OLLAMA_DEFAULT_URL, DEFAULT_MODEL: OLLAMA_DEFAULT_MODEL } = require('./providers/ollama');
const { runApiProvider } = require('./providers/apiProvider');

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
 * All AI paths fall back to heuristics on any failure (missing key,
 * unreachable, bad response) so analysis never hard-fails for the user.
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

async function analyzeTest(test) {
  const errorContext = loadErrorContext(test);
  const config = getConfig();
  const generatedAt = () => new Date().toISOString();
  const errorContextFile = errorContext?.file || null;

  if (config.provider === 'ollama') {
    try {
      const result = await runOllama(test, errorContext, { url: config.ollamaUrl, model: config.ollamaModel });
      return { ...result, generatedAt: generatedAt(), errorContextFile };
    } catch (err) {
      const fallback = runHeuristics(test, errorContext);
      return {
        ...fallback,
        note: `Ollama unavailable (${err.message}); showing heuristic analysis instead.`,
        generatedAt: generatedAt(),
        errorContextFile,
      };
    }
  }

  if (config.provider === 'api') {
    try {
      const result = await runApiProvider(test, errorContext, {
        format: config.apiFormat,
        apiKey: config.apiKey,
        baseUrl: config.apiBaseUrl,
        model: config.apiModel,
      });
      return { ...result, generatedAt: generatedAt(), errorContextFile };
    } catch (err) {
      const fallback = runHeuristics(test, errorContext);
      return {
        ...fallback,
        note: `AI provider unavailable (${err.message}); showing heuristic analysis instead.`,
        generatedAt: generatedAt(),
        errorContextFile,
      };
    }
  }

  const result = runHeuristics(test, errorContext);
  return { ...result, generatedAt: generatedAt(), errorContextFile };
}

module.exports = { analyzeTest, getConfig };
