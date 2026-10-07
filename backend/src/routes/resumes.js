const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { uploadPdf } = require("../middleware/upload");

const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");

const { analyzerLimiter } = require("../middleware/rateLimit");
const Analysis = require("../models/Analysis");
const { analyzeResume } = require("../services/geminiService")

const { diffText, summarize } = require("../services/diffService");

const { extractText } = require("../services/pdfService");
const { parseResume: parseStructured } = require("../services/structureParser");

const router = express.Router();
router.use(requireAuth);

/* -------------------------------------------------------------------------- */
/* Validation helpers                                                          */
/* -------------------------------------------------------------------------- */

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: "Invalid id" });

const idParam = z.object({ id: objectIdSchema });

/* -------------------------------------------------------------------------- */
/* Load helpers                                                                */
/* -------------------------------------------------------------------------- */

async function loadOwnedResume(req) {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!resume) throw ApiError.notFound("Resume not found");
  return resume;
}

async function loadVersion(resumeId, versionId) {
  const version = await ResumeVersion.findOne({
    _id: versionId,
    resumeId,
  });
  if (!version) throw ApiError.notFound("Version not found");
  return version;
}

/* -------------------------------------------------------------------------- */
/* POST /api/resumes  — upload PDF → create resume + V1                        */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  uploadPdf("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("PDF file is required");

    const { text, meta } = await extractText(req.file.buffer);
    const parsedSections = await parseStructured(text);

    const title =
      (req.body.title || "").trim() ||
      req.file.originalname.replace(/\.pdf$/i, "") ||
      "Untitled Resume";

    const resume = await Resume.create({
      userId: req.user._id,
      title,
      latestVersionNumber: 1,
    });

    const version = await ResumeVersion.create({
      resumeId: resume._id,
      versionNumber: 1,
      label: "V1",
      rawText: text,
      parsedSections,
      sourceType: "upload",
      parentVersionId: null,
    });

    resume.currentVersionId = version._id;
    await resume.save();

    res.status(201).json({ resume, version, meta });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/resumes  — list current user's resumes                             */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ resumes });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/resumes/:id  — one resume + its versions                           */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);

    const versions = await ResumeVersion.find({ resumeId: resume._id })
      .sort({ versionNumber: 1 })
      .select("-rawText")
      .lean();

    res.json({ resume, versions });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/resumes/:id/versions/:versionId  — one version (with rawText)      */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id/versions/:versionId",
  validate(
    z.object({
      id: objectIdSchema,
      versionId: objectIdSchema,
    }),
    "params"
  ),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);
    const version = await loadVersion(resume._id, req.params.versionId);
    res.json({ version });
  })
);

/* -------------------------------------------------------------------------- */
/* PATCH /api/resumes/:id/versions/:versionId  — save manual edits in place    */
/* -------------------------------------------------------------------------- */

const linkSchema = z.object({ label: z.string().optional(), url: z.string().optional() });

const parsedSectionsBody = z.object({
  basics: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      location: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      links: z.array(linkSchema).optional(),
    })
    .optional(),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        location: z.string().optional(),
        period: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        school: z.string().optional(),
        location: z.string().optional(),
        period: z.string().optional(),
        details: z.string().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        tech: z.array(z.string()).optional(),
        links: z.array(linkSchema).optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().optional(),
        issuer: z.string().optional(),
        year: z.string().optional(),
      })
    )
    .optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

function serializeSections(sections) {
  const lines = [];
  const b = sections.basics || {};

  if (b.name) lines.push(b.name);
  if (b.title) lines.push(b.title);
  const contact = [b.email, b.phone, b.location].filter(Boolean).join(" · ");
  if (contact) lines.push(contact);

  if (sections.summary) {
    lines.push("", "SUMMARY", sections.summary);
  }

  if (sections.experience?.length) {
    lines.push("", "EXPERIENCE");
    for (const exp of sections.experience) {
      lines.push([exp.role, exp.company].filter(Boolean).join(" · "));
      if (exp.period) lines.push(exp.period);
      for (const bullet of exp.bullets || []) lines.push(`• ${bullet}`);
    }
  }

  if (sections.education?.length) {
    lines.push("", "EDUCATION");
    for (const ed of sections.education) {
      lines.push([ed.degree, ed.school].filter(Boolean).join(" · "));
      if (ed.period) lines.push(ed.period);
    }
  }

  if (sections.skills?.length) {
    lines.push("", "SKILLS", sections.skills.join(" · "));
  }

  if (sections.projects?.length) {
    lines.push("", "PROJECTS");
    for (const p of sections.projects) {
      lines.push(p.name || "");
      if (p.description) lines.push(p.description);
      if (p.tech?.length) lines.push(p.tech.join(" · "));
    }
  }

  return lines.join("\n").trim();
}

router.patch(
  "/:id/versions/:versionId",
  validate(
    z.object({ id: objectIdSchema, versionId: objectIdSchema }),
    "params"
  ),
  validate(parsedSectionsBody),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);
    const version = await loadVersion(resume._id, req.params.versionId);

    // Every field in parsedSectionsBody is optional (a partial edit only
    // touches the sections it includes), so merge onto the existing
    // document instead of replacing it outright — a blind replace would
    // silently wipe any section a caller didn't send.
    const merged = {
      ...(version.parsedSections?.toObject?.() ?? version.parsedSections ?? {}),
      ...req.body,
    };

    version.parsedSections = merged;
    version.rawText = serializeSections(merged);
    await version.save();

    res.json({ version });
  })
);

/* -------------------------------------------------------------------------- */
/* DELETE /api/resumes/:id  — delete resume + all versions                     */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);
    await ResumeVersion.deleteMany({ resumeId: resume._id });
    await Analysis.deleteMany({ resumeId: resume._id });
    await resume.deleteOne();
    res.json({ ok: true });
  })
);
const analyzeBody = z.object({
  versionId: objectIdSchema.optional(),
  targetRole: z.string().trim().max(120).optional(),
});

/* -------------------------------------------------------------------------- */
/* POST /api/resumes/:id/analyze                                               */
/* -------------------------------------------------------------------------- */

router.post(
  "/:id/analyze",
  analyzerLimiter, // or analyzeLimiter — use the name you export
  validate(idParam, "params"),
  validate(analyzeBody, "body"),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);

    const versionId = req.body.versionId || resume.currentVersionId;
    if (!versionId) {
      throw ApiError.badRequest("No version available to analyze");
    }

    const version = await loadVersion(resume._id, versionId);

    const { analysis, model, promptTokens, responseTokens } =
      await analyzeResume(version.rawText, req.body.targetRole, version.parsedSections);

    const saved = await Analysis.create({
      userId: req.user._id,
      resumeId: resume._id,
      versionId: version._id,
      atsScore: analysis.atsScore,
      scoreBreakdown: analysis.scoreBreakdown,
      issues: analysis.issues,
      strengths: analysis.strengths,
      bulletRewrites: analysis.bulletRewrites,
      keywordsPresent: analysis.keywordsPresent,
      keywordsMissing: analysis.keywordsMissing,
      summary: analysis.summary,
      model,
      promptTokens,
      responseTokens,
    });

    version.latestAnalysisId = saved._id;
    await version.save();

    res.status(201).json({ analysis: saved });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/resumes/:id/analyses  — all analyses for this resume               */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id/analyses",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);

    const analyses = await Analysis.find({ resumeId: resume._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ analyses });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/resumes/:id/versions/:versionId/analysis  — latest for a version   */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id/versions/:versionId/analysis",
  validate(
    z.object({
      id: objectIdSchema,
      versionId: objectIdSchema,
    }),
    "params"
  ),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);
    const version = await loadVersion(resume._id, req.params.versionId);

    const analysis = await Analysis.findOne({
      resumeId: resume._id,
      versionId: version._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!analysis) throw ApiError.notFound("Analysis not found for this version");

    res.json({ analysis: analysis || null });
  })
);

const rewriteBody = z.object({
  analysisId: objectIdSchema,
  rewriteIds: z.array(objectIdSchema).optional(),
  label: z.string().trim().max(40).optional(),
});

function applyRewritesToText(rawText, rewrites) {
  let result = rawText;
  for (const r of rewrites) {
    if (!r.original || !r.rewritten) continue;
    const idx = result.indexOf(r.original);
    if (idx >= 0) {
      result = result.slice(0, idx) + r.rewritten + result.slice(idx + r.original.length);
    } else {
      result += `\n${r.rewritten}`;
    }
  }
  return result;
}

function patchBulletsInSections(sections, rewrites) {
  if (!sections) return true;
  const cloned = JSON.parse(JSON.stringify(sections));
  for (const r of rewrites) {
    if (!r?.original || !r?.rewritten) continue;
    for (const exp of cloned.experience || []) {
      if (!Array.isArray(exp.bullets)) continue;
      exp.bullets = exp.bullets.map((b) =>
        b === r.original ? r.rewritten : b
      );
    }
  }
  return cloned;
}

function looksEmpty(sections) {
  if (!sections) return null;
  const b = sections.basics || {};
  const hasIdentity = b.name || b.email || b.title;
  const hasBody =
    sections.summary ||
    sections.experience?.length ||
    sections.education?.length ||
    sections.skills?.length;
  return !hasIdentity && !hasBody;
}

router.post(
  "/:id/rewrite",
  validate(idParam, "params"),
  validate(rewriteBody),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);

    const analysis = await Analysis.findOne({
      _id: req.body.analysisId,
      resumeId: resume._id,
    });
    if (!analysis) throw ApiError.notFound("Analysis not found");

    const baseVersion = await loadVersion(resume._id, analysis.versionId);

    const allRewrites = Array.isArray(analysis.bulletRewrites)
      ? analysis.bulletRewrites
      : [];

    const selected = req.body.rewriteIds?.length
      ? allRewrites.filter((r) =>
          req.body.rewriteIds.includes(String(r._id))
        )
      : allRewrites;

    if (!selected.length) {
      throw ApiError.badRequest("No rewrites selected to apply");
    }

    const newRaw = applyRewritesToText(baseVersion.rawText || "", selected);

    const patchedFromBase = patchBulletsInSections(
      baseVersion.parsedSections,
      selected
    );

    const reparsed = await parseStructured(newRaw);
    const finalParsed = looksEmpty(reparsed) ? patchedFromBase : reparsed;

    const nextNumber = (resume.latestVersionNumber || 0) + 1;

    const newVersion = await ResumeVersion.create({
      resumeId: resume._id,
      versionNumber: nextNumber,
      label: req.body.label?.trim() || `V${nextNumber}`,
      rawText: newRaw,
      parsedSections: finalParsed || {
        basics: {},
        summary: "",
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
      },
      sourceType: "rewrite",
      parentVersionId: baseVersion._id,
    });

    resume.latestVersionNumber = nextNumber;
    resume.currentVersionId = newVersion._id;
    await resume.save();

    res.status(201).json({
      version: newVersion,
      appliedCount: selected.length,
    });
  })
);

const asObjectId = z.preprocess(
  (val) => (Array.isArray(val) ? val[0] : val),
  objectIdSchema
);

const diffQuery = z.object({
  from: asObjectId,
  to: asObjectId,
  mode: z.enum(["words", "lines"]).optional(),
});

/* -------------------------------------------------------------------------- */
/* POST /api/resumes/:id/versions/:versionId/verify-export                     */
/* Re-parses the exported PDF and checks it against the version's own data,    */
/* so the user can see whether an ATS would actually read the export cleanly.   */
/* -------------------------------------------------------------------------- */

function buildExpectedFields(sections) {
  const fields = [];
  const basics = sections?.basics || {};

  if (basics.name) fields.push({ key: "name", label: "Name", value: basics.name });
  if (basics.email) fields.push({ key: "email", label: "Email", value: basics.email });
  if (basics.phone) fields.push({ key: "phone", label: "Phone", value: basics.phone });

  for (const exp of sections?.experience || []) {
    if (exp.company) {
      fields.push({
        key: `exp-company-${exp.company}`,
        label: `Employer: ${exp.company}`,
        value: exp.company,
      });
    }
    if (exp.role) {
      fields.push({
        key: `exp-role-${exp.role}`,
        label: `Title: ${exp.role}`,
        value: exp.role,
      });
    }
  }

  for (const edu of sections?.education || []) {
    if (edu.school) {
      fields.push({
        key: `edu-school-${edu.school}`,
        label: `School: ${edu.school}`,
        value: edu.school,
      });
    }
  }

  for (const skill of sections?.skills || []) {
    fields.push({ key: `skill-${skill}`, label: `Skill: ${skill}`, value: skill });
  }

  return fields;
}

function normalize(str) {
  return String(str || "").toLowerCase().replace(/\s+/g, " ").trim();
}

router.post(
  "/:id/versions/:versionId/verify-export",
  validate(
    z.object({
      id: objectIdSchema,
      versionId: objectIdSchema,
    }),
    "params"
  ),
  uploadPdf("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("PDF file is required");
    const resume = await loadOwnedResume(req);
    const version = await loadVersion(resume._id, req.params.versionId);

    const { text: extractedText } = await extractText(req.file.buffer);
    const normalizedExtracted = normalize(extractedText);

    const expectedFields = buildExpectedFields(version.parsedSections);
    const checks = expectedFields.map((f) => ({
      label: f.label,
      found: normalizedExtracted.includes(normalize(f.value)),
    }));

    const foundCount = checks.filter((c) => c.found).length;
    const score = checks.length
      ? Math.round((foundCount / checks.length) * 100)
      : 100;

    res.json({
      score,
      totalChecks: checks.length,
      foundCount,
      checks,
      extractedTextLength: extractedText.length,
    });
  })
);

router.get(
  "/:id/diff",
  validate(idParam, "params"),
  validate(diffQuery, "query"),
  asyncHandler(async (req, res) => {
    const resume = await loadOwnedResume(req);

    const [fromV, toV] = await Promise.all([
      loadVersion(resume._id, req.query.from),
      loadVersion(resume._id, req.query.to),
    ]);

    const parts = diffText(fromV.rawText, toV.rawText, req.query.mode);

    res.json({
      from: {
        id: fromV._id,
        label: fromV.label,
        versionNumber: fromV.versionNumber,
      },
      to: {
        id: toV._id,
        label: toV.label,
        versionNumber: toV.versionNumber,
      },
      parts,
      stats: summarize(parts),
    });
  })
);

module.exports = router;