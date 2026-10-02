const { SchemaType } = require("@google/generative-ai");
const { z } = require("zod");

const ApiError = require("../utils/ApiError");
const { isConfigured, callGeminiJSON, withRetry } = require("./geminiClient");

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    matchScore: {
      type: SchemaType.NUMBER,
      description: "0-100 — how well this resume matches this specific job description",
    },
    matchedKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Keywords/requirements from the JD that the resume already covers",
    },
    missingKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Keywords/requirements from the JD the resume does not cover",
    },
    strengths: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2-4 specific reasons this candidate fits the role",
    },
    gaps: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "2-4 specific gaps against this JD's requirements",
    },
    summary: {
      type: SchemaType.STRING,
      description: "One short paragraph verdict on fit for this specific role",
    },
  },
  required: [
    "matchScore",
    "matchedKeywords",
    "missingKeywords",
    "strengths",
    "gaps",
    "summary",
  ],
};

const matchValidator = z.object({
  matchScore: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  summary: z.string(),
});

function buildPrompt(resumeText, jobDescription) {
  return [
    "You are a senior technical recruiter comparing a candidate's resume against one specific job description.",
    "Score how well this resume matches THIS job (0-100), not resume quality in general.",
    "List keywords/requirements from the job description the resume already covers, and ones it's missing.",
    "Give 2-4 specific strengths for this role and 2-4 specific gaps against this JD's stated requirements.",
    "Be specific and evidence-based — cite phrasing from both documents.",
    "",
    "RESUME:",
    "===========",
    resumeText,
    "===========",
    "",
    "JOB DESCRIPTION:",
    "===========",
    jobDescription,
    "===========",
  ].join("\n");
}

async function matchJobDescription(resumeText, jobDescription) {
  if (!isConfigured()) {
    throw ApiError.internal("GEMINI_API_KEY is not configured on the server.");
  }
  if (!resumeText || !String(resumeText).trim()) {
    throw ApiError.badRequest("Resume text is required for matching.");
  }
  if (!jobDescription || !String(jobDescription).trim()) {
    throw ApiError.badRequest("Job description is required for matching.");
  }

  const prompt = buildPrompt(resumeText, jobDescription);

  try {
    const { validated, model, usage } = await withRetry(async () => {
      const { text, model, usage } = await callGeminiJSON({
        prompt,
        responseSchema,
        temperature: 0.3,
      });
      const parsed = JSON.parse(text);
      return { validated: matchValidator.parse(parsed), model, usage };
    });

    return {
      match: validated,
      model,
      promptTokens: usage.promptTokenCount,
      responseTokens: usage.candidatesTokenCount,
    };
  } catch (err) {
    throw ApiError.internal(`Job match analysis failed: ${err?.message || "unknown error"}`);
  }
}

module.exports = { matchJobDescription };
