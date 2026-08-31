const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { z } = require("zod");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const genAI = env.geminiApiKey
  ? new GoogleGenerativeAI(env.geminiApiKey)
  : null;

/* -------------------------------------------------------------------------- */
/* Gemini response schema                                                      */
/* -------------------------------------------------------------------------- */

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    atsScore: {
      type: SchemaType.NUMBER,
      description: "ATS-readiness score from 0 to 100",
    },
    scoreBreakdown: {
      type: SchemaType.OBJECT,
      properties: {
        keywords: { type: SchemaType.NUMBER, description: "0-25" },
        formatting: { type: SchemaType.NUMBER, description: "0-25" },
        impact: { type: SchemaType.NUMBER, description: "0-25" },
        clarity: { type: SchemaType.NUMBER, description: "0-25" },
      },
      required: ["keywords", "formatting", "impact", "clarity"],
    },
    issues: {
      type: SchemaType.ARRAY,
      description: "Exactly 5 prioritized issues",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          severity: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["low", "medium", "high"],
          },
          explanation: { type: SchemaType.STRING },
          fix: { type: SchemaType.STRING },
        },
        required: ["title", "severity", "explanation", "fix"],
      },
    },
    strengths: {
      type: SchemaType.ARRAY,
      description: "Exactly 5 strengths",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
        },
        required: ["title", "evidence"],
      },
    },
    bulletRewrites: {
      type: SchemaType.ARRAY,
      description: "5-10 weak bullets rewritten to be stronger and ATS-friendly",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          section: { type: SchemaType.STRING },
          original: { type: SchemaType.STRING },
          rewritten: { type: SchemaType.STRING },
          rationale: { type: SchemaType.STRING },
        },
        required: ["section", "original", "rewritten", "rationale"],
      },
    },
    keywordsPresent: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    keywordsMissing: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    summary: {
      type: SchemaType.STRING,
      description: "One short paragraph overall verdict",
    },
  },
  required: [
    "atsScore",
    "scoreBreakdown",
    "issues",
    "strengths",
    "bulletRewrites",
    "keywordsPresent",
    "keywordsMissing",
    "summary",
  ],
};

/* -------------------------------------------------------------------------- */
/* Zod validator (from your screenshot)                                        */
/* -------------------------------------------------------------------------- */

const analysisValidator = z.object({
  atsScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    keywords: z.number().min(0).max(25),
    formatting: z.number().min(0).max(25),
    impact: z.number().min(0).max(25),
    clarity: z.number().min(0).max(25),
  }),
  issues: z
    .array(
      z.object({
        title: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        explanation: z.string(),
        fix: z.string(),
      })
    )
    .min(1),
  strengths: z
    .array(
      z.object({
        title: z.string(),
        evidence: z.string(),
      })
    )
    .min(1),
  bulletRewrites: z
    .array(
      z.object({
        section: z.string(),
        original: z.string(),
        rewritten: z.string(),
        rationale: z.string(),
      })
    )
    .default([]),
  keywordsPresent: z.array(z.string()).default([]),
  keywordsMissing: z.array(z.string()).default([]),
  summary: z.string(),
});

/* -------------------------------------------------------------------------- */
/* Prompt                                                                      */
/* -------------------------------------------------------------------------- */

function buildPrompt(rawText, targetRole) {
  return [
    "You are a senior technical recruiter and ATS expert reviewing a resume.",
    targetRole
      ? `Target role: ${targetRole}.`
      : "No specific target role was provided — assess for the role the candidate appears to be aiming for.",
    "",
    "Score the resume from 0-100 based on ATS readiness (keyword match, parseable formatting, quantified impact, clarity).",
    "Return exactly 5 prioritized issues, 5 standout strengths, and 5-10 weak bullets rewritten to be stronger, quantified, and ATS-friendly.",
    "Rewrites must preserve the original meaning. Each rewrite needs a one-line rationale.",
    "Identify keywords clearly present and notable keywords missing for the apparent target role.",
    "Be specific and evidence-based — cite phrasing from the resume in explanations.",
    "",
    "RESUME TEXT:",
    "===========",
    rawText,
    "===========",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Gemini call (same SDK style as your working structureParser)                */
/* -------------------------------------------------------------------------- */

async function callGemini(prompt) {
  const model = genAI.getGenerativeModel({
    model: env.geminiModel || "gemini-3.6-flash",
    generationConfig: {
      temperature: 0.4,
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
    usage: {
      promptTokenCount: usage.promptTokenCount,
      candidatesTokenCount: usage.candidatesTokenCount,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

async function analyzeResume(rawText, targetRole) {
  if (!genAI) {
    throw ApiError.internal("GEMINI_API_KEY is not configured on the server.");
  }

  if (!rawText || !String(rawText).trim()) {
    throw ApiError.badRequest("Resume text is required for analysis.");
  }

  const prompt = buildPrompt(rawText, targetRole);
  let lastErr;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { text, usage } = await callGemini(prompt);
      const parsed = JSON.parse(text);
      const validated = analysisValidator.parse(parsed);

      return {
        analysis: validated,
        model: env.geminiModel || "gemini-3.6-flash",
        promptTokens: usage.promptTokenCount,
        responseTokens: usage.candidatesTokenCount,
      };
    } catch (err) {
      lastErr = err;
      if (attempt === 2) break;
    }
  }

  throw ApiError.internal(
    `Gemini analysis failed: ${lastErr?.message || "unknown error"}`
  );
}

module.exports = { analyzeResume };