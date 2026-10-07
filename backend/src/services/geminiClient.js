const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

// Single default, matching config/env.js's own fallback — the one place
// this string should live, so services can't silently drift apart on it.
const DEFAULT_MODEL = "gemini-3.6-flash";

const genAI = env.geminiApiKey
  ? new GoogleGenerativeAI(env.geminiApiKey)
  : null;

function isConfigured() {
  return !!genAI;
}

// Google's newest models regularly answer 503 "high demand", so each request
// walks a short fallback list instead of failing on the first overloaded model.
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];

function modelChain() {
  return [...new Set([env.geminiModel || DEFAULT_MODEL, ...FALLBACK_MODELS])];
}

async function generateWithFallback(prompt, { temperature, responseSchema }) {
  let lastErr;
  for (const name of modelChain()) {
    try {
      const model = genAI.getGenerativeModel({
        model: name,
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
          responseSchema,
        },
      });
      const result = await model.generateContent(prompt);
      return { result, modelName: name };
    } catch (err) {
      lastErr = err;
      console.warn(`[gemini] ${name} failed: ${String(err.message).slice(0, 160)}`);
    }
  }
  throw lastErr;
}

async function callGeminiJSON({ prompt, responseSchema, temperature = 0.4 }) {
  const { result, modelName } = await generateWithFallback(prompt, { temperature, responseSchema });
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");

  const usage = result.response.usageMetadata || {};
  return {
    text,
    model: modelName,
    usage: {
      promptTokenCount: usage.promptTokenCount,
      candidatesTokenCount: usage.candidatesTokenCount,
    },
  };
}

// Retries the whole call+parse+validate cycle a caller passes in — a
// malformed JSON response or a schema mismatch is worth one clean retry,
// same as a transient API error.
async function withRetry(fn, attempts = 2) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === attempts) break;
    }
  }
  throw lastErr;
}

module.exports = { isConfigured, callGeminiJSON, generateWithFallback, withRetry, DEFAULT_MODEL };
