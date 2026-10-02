const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { analyzerLimiter } = require("../middleware/rateLimit");

const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");
const JobMatch = require("../models/JobMatch");

const { matchJobDescription } = require("../services/jobMatchService");

const router = express.Router();
router.use(requireAuth);

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: "Invalid id" });

const createBody = z.object({
  resumeId: objectIdSchema,
  versionId: objectIdSchema,
  jobDescription: z.string().trim().min(30, "Paste the full job description (at least 30 characters)."),
  jobTitle: z.string().trim().max(120).optional(),
  company: z.string().trim().max(120).optional(),
});

/* -------------------------------------------------------------------------- */
/* POST /api/job-matches — run a match and save it                             */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  analyzerLimiter,
  validate(createBody),
  asyncHandler(async (req, res) => {
    const { resumeId, versionId, jobDescription, jobTitle, company } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) throw ApiError.notFound("Resume not found");

    const version = await ResumeVersion.findOne({ _id: versionId, resumeId });
    if (!version) throw ApiError.notFound("Version not found");

    const { match, model } = await matchJobDescription(
      version.rawText,
      jobDescription
    );

    const saved = await JobMatch.create({
      userId: req.user._id,
      resumeId,
      versionId,
      jobTitle: jobTitle || "",
      company: company || "",
      jobDescription,
      matchScore: match.matchScore,
      matchedKeywords: match.matchedKeywords,
      missingKeywords: match.missingKeywords,
      strengths: match.strengths,
      gaps: match.gaps,
      summary: match.summary,
      model,
    });

    res.status(201).json({ jobMatch: saved });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/job-matches — list history for the current user                    */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const jobMatches = await JobMatch.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-jobDescription")
      .lean();

    res.json({ jobMatches });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/job-matches/:id — full detail incl. job description                */
/* -------------------------------------------------------------------------- */

router.get(
  "/:id",
  validate(z.object({ id: objectIdSchema }), "params"),
  asyncHandler(async (req, res) => {
    const jobMatch = await JobMatch.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();
    if (!jobMatch) throw ApiError.notFound("Job match not found");

    res.json({ jobMatch });
  })
);

/* -------------------------------------------------------------------------- */
/* DELETE /api/job-matches/:id                                                 */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  validate(z.object({ id: objectIdSchema }), "params"),
  asyncHandler(async (req, res) => {
    const result = await JobMatch.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (result.deletedCount === 0) throw ApiError.notFound("Job match not found");

    res.json({ ok: true });
  })
);

module.exports = router;
