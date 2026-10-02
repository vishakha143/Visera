const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

// Single default, matching config/env.js's own fallback — the one place
// this string should live, so services can't silently drift apart on it.
const DEFAULT_MODEL = "gemini-2.0-flash";

const genAI = env.geminiApiKey
  ? new GoogleGenerativeAI(env.geminiApiKey)
  : null;

function isConfigured() {
  return !!genAI;
}

async function callGeminiJSON({ prompt, responseSchema, temperature = 0.4 }) {
  const model = genAI.getGenerativeModel({
    model: env.geminiModel || DEFAULT_MODEL,
    generationConfig: {
      temperature,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");

  const usage = result.response.usageMetadata || {};
  return {
    text,
    model: env.geminiModel || DEFAULT_MODEL,
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

module.exports = { isConfigured, callGeminiJSON, withRetry, DEFAULT_MODEL };
