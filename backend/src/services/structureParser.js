const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { z } = require("zod");
const env = require("../config/env");
const { generateWithFallback } = require("./geminiClient");

const genAI = env.geminiApiKey
  ? new GoogleGenerativeAI(env.geminiApiKey)
  : null;

/* -------------------------------------------------------------------------- */
/* Gemini JSON schema (same shape as your original)                            */
/* -------------------------------------------------------------------------- */

const linkSchema = {
  type: SchemaType.OBJECT,
  properties: {
    label: { type: SchemaType.STRING },
    url: { type: SchemaType.STRING },
  },
  required: ["label", "url"],
};

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    basics: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        location: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        links: { type: SchemaType.ARRAY, items: linkSchema },
      },
      required: ["name", "title", "location", "email", "phone", "links"],
    },
    summary: { type: SchemaType.STRING },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          period: { type: SchemaType.STRING },
          bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["company", "role", "period", "bullets"],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          degree: { type: SchemaType.STRING },
          school: { type: SchemaType.STRING },
          location: { type: SchemaType.STRING },
          period: { type: SchemaType.STRING },
          details: { type: SchemaType.STRING },
        },
        required: ["degree", "school", "period"],
      },
    },
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    projects: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          tech: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          links: { type: SchemaType.ARRAY, items: linkSchema },
        },
        required: ["name", "description"],
      },
    },
    certifications: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          issuer: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING },
        },
        required: ["name"],
      },
    },
    languages: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    interests: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "interests",
  ],
};

/* -------------------------------------------------------------------------- */
/* Zod validator (same shape as your original)                                 */
/* -------------------------------------------------------------------------- */

const validator = z.object({
  basics: z.object({
    name: z.string().default(""),
    title: z.string().default(""),
    location: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        details: z.string().default(""),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
        links: z
          .array(z.object({ label: z.string(), url: z.string() }))
          .default([]),
      })
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      })
    )
    .default([]),
  languages: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

const EMPTY = {
  basics: {
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    links: [],
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
};

/* -------------------------------------------------------------------------- */
/* Prompt (original + stricter project/skills rules)                           */
/* -------------------------------------------------------------------------- */

function buildPrompt(rawText) {
  return [
    "You are a resume parser. The input is text extracted from a PDF — lines may be jumbled or out of natural reading order.",
    "",
    "Extract structured data:",
    '- basics: name, professional title, location, email, phone, social links (LinkedIn / GitHub / portfolio etc; label like "LinkedIn", full URL)',
    "- summary: the professional summary paragraph (rejoin if split across lines)",
    "- experience: jobs most recent first, with company, role, period (preserve original date format), location if available, and bullet points",
    "- education: degree, school, period, location, optional details",
    "- skills: flat array of technical skills only",
    "- projects: name, one-sentence description, optional tech tags, optional links",
    "- certifications: name, issuer, year",
    "- languages: flat array",
    "- interests: flat array",
    "",
    "Rules:",
    "- Be conservative: omit fields that are not clearly present. Use empty strings/arrays where missing.",
    "- Do not invent or paraphrase — extract verbatim where possible.",
    "- Each experience bullet should read as a complete sentence.",
    "- Preserve original date formats (e.g. 'Jan 2022 – Dec 2023').",
    "- Include ALL distinct projects found in the resume, not just one.",
    "- For projects.tech: ONLY concrete tools/languages/frameworks used in THAT project (e.g. React, Node.js, MongoDB). Maximum 8 items. Never put soft skills, school names, CGPA, percentages, job titles, or company names in tech.",
    "- For skills: unique technical skills only; deduplicate; maximum about 30; no full sentences.",
    "- For links: only include an item if a real URL is present in the text. If only a label exists (e.g. the word LinkedIn with no URL), omit that link.",
    "- basics.title: use a professional headline only if clearly present; otherwise leave empty string.",
    "",
    "RESUME TEXT:",
    rawText,
  ].join("\n");
}

/* -------------------------------------------------------------------------- */
/* Post-clean (new — keeps schema, reduces noisy model output)                 */
/* -------------------------------------------------------------------------- */

function cleanParsed(data) {
  data.skills = [
    ...new Set(
      (data.skills || [])
        .map((s) => String(s).trim())
        .filter(Boolean)
    ),
  ].slice(0, 30);

  data.projects = (data.projects || []).map((p) => ({
    ...p,
    tech: [
      ...new Set(
        (p.tech || [])
          .map((t) => String(t).trim())
          .filter((t) => t && t.length < 40)
      ),
    ].slice(0, 8),
    links: (p.links || []).filter(
      (l) => l.url && /^https?:\/\//i.test(l.url)
    ),
  }));

  data.basics.links = (data.basics.links || []).filter(
    (l) => l.url && /^https?:\/\//i.test(l.url)
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Main parse                                                                  */
/* -------------------------------------------------------------------------- */

async function parseResume(rawText) {
  if (!genAI || !rawText || !rawText.trim()) return EMPTY;

  const prompt = buildPrompt(rawText);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { result } = await generateWithFallback(prompt, { temperature: 0.1, responseSchema });
      const text = result.response.text();

      if (!text) throw new Error("Empty response");

      const parsed = JSON.parse(text);
      const validated = validator.parse(parsed);
      return cleanParsed(validated);
    } catch (err) {
      if (attempt === 2) {
        console.error("Structured parse failed:", err.message);
        return EMPTY;
      }
    }
  }

  return EMPTY;
}

module.exports = { parseResume, EMPTY };