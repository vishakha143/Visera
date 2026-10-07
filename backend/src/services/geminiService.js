const { SchemaType } = require("@google/generative-ai");
const { z } = require("zod");

const ApiError = require("../utils/ApiError");
const { runDeterministicChecks } = require("./deterministicChecks");
const { isConfigured, callGeminiJSON, withRetry } = require("./geminiClient");

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
      description: "Up to 5 prioritized issues requiring judgment (not already-flagged programmatic facts)",
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
      description: "Up to 5 standout strengths requiring judgment (not already-flagged programmatic facts)",
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
    .default([]),
  strengths: z
    .array(
      z.object({
        title: z.string(),
        evidence: z.string(),
      })
    )
    .default([]),
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

function buildPrompt(rawText, targetRole, deterministic) {
  const ruleFindingTitles = [
    ...deterministic.issues.map((i) => i.title),
    ...deterministic.strengths.map((s) => s.title),
  ];

  return [
    "You are a senior technical recruiter and ATS expert reviewing a resume.",
    targetRole
      ? `Target role: ${targetRole}.`
      : "No specific target role was provided — assess for the role the candidate appears to be aiming for.",
    "",
    "Score the resume from 0-100 based on ATS readiness (keyword match, parseable formatting, quantified impact, clarity).",
    "Return up to 5 prioritized issues and up to 5 standout strengths, and 5-10 weak bullets rewritten to be stronger and ATS-friendly (use only figures already in the resume; where a bullet has none, suggest in the rationale what the user could quantify).",
    "Rewrites must preserve the original meaning. Each rewrite needs a one-line rationale.",
    "Never add facts, numbers, tools, timeframes or claims (e.g. \"daily\", \"active\", team sizes) that are not in the original bullet; only tighten wording, lead with a stronger verb, and keep any figures that are already there.",
    "Identify keywords clearly present and notable keywords missing for the apparent target role.",
    "Be specific and evidence-based — cite phrasing from the resume in explanations.",
    "",
    "The following facts were already established programmatically (word count, contact info, section presence, quantified-bullet ratio). Do NOT restate these as your own issues or strengths — focus your judgment on things that require actual reading comprehension: writing quality, bullet impact, clarity, and how well the content matches the target role.",
    `- Word count: ${deterministic.stats.wordCount}`,
    `- Experience entries: ${deterministic.stats.experienceCount}, Education entries: ${deterministic.stats.educationCount}, Skills listed: ${deterministic.stats.skillsCount}`,
    `- ${deterministic.stats.quantifiedBullets} of ${deterministic.stats.totalBullets} bullets contain a measurable number`,
    ruleFindingTitles.length
      ? `- Already flagged programmatically: ${ruleFindingTitles.join("; ")}`
      : "- No programmatic issues or strengths were flagged",
    "",
    "RESUME TEXT:",
    "===========",
    rawText,
    "===========",
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

async function analyzeResume(rawText, targetRole, parsedSections) {
  if (!isConfigured()) {
    throw ApiError.internal("GEMINI_API_KEY is not configured on the server.");
  }

  if (!rawText || !String(rawText).trim()) {
    throw ApiError.badRequest("Resume text is required for analysis.");
  }

  const deterministic = runDeterministicChecks(rawText, parsedSections);
  const prompt = buildPrompt(rawText, targetRole, deterministic);

  try {
    const { validated, model, usage } = await withRetry(async () => {
      const { text, model, usage } = await callGeminiJSON({
        prompt,
        responseSchema,
        temperature: 0.4,
      });
      const parsed = JSON.parse(text);
      return { validated: analysisValidator.parse(parsed), model, usage };
    });

    const merged = {
      ...validated,
      issues: [
        ...deterministic.issues,
        ...validated.issues.map((i) => ({ ...i, source: "ai" })),
      ],
      strengths: [
        ...deterministic.strengths,
        ...validated.strengths.map((s) => ({ ...s, source: "ai" })),
      ],
    };

    return {
      analysis: merged,
      model,
      promptTokens: usage.promptTokenCount,
      responseTokens: usage.candidatesTokenCount,
    };
  } catch (err) {
    throw ApiError.internal(`Gemini analysis failed: ${err?.message || "unknown error"}`);
  }
}

module.exports = { analyzeResume };