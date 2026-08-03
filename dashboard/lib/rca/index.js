const { loadErrorContext } = require('./errorContext');
const { runHeuristics } = require('./heuristics');
const { runOllama } = require('./providers/ollama');
const { runApiProvider } = require('./providers/apiProvider');
const { getConfig } = require('./config');

/**
 * See ./config.js for what RCA_PROVIDER selects. All AI paths fall back to
 * heuristics on any failure (missing key, unreachable, bad response) so
 * analysis never hard-fails for the user.
 */
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
