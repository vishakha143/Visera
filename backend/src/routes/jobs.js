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
const { searchJobs, isConfigured, sourcesInUse } = require("../services/jobSearchService");
const { scoreJob } = require("../services/jobScoring");

const router = express.Router();
router.use(requireAuth);

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), { message: "Invalid id" });

const searchQuery = z.object({
  resumeId: objectId,
  versionId: objectId.optional(),
  q: z.string().trim().min(2, "Enter a job title or skill to search for.").max(120),
  location: z.string().trim().max(120).optional(),
  remote: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).max(10).optional(),
});

router.get("/status", (req, res) => res.json({ configured: isConfigured(), sources: sourcesInUse() }));

router.get(
  "/search",
  analyzerLimiter,
  validate(searchQuery, "query"),
  asyncHandler(async (req, res) => {
    const { resumeId, versionId, q, location, page } = req.query;
    const remote = req.query.remote === "true";

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) throw ApiError.notFound("Resume not found");

    const version = await ResumeVersion.findOne({
      _id: versionId || resume.currentVersionId,
      resumeId,
    });
    if (!version) throw ApiError.notFound("Version not found");

    // "Remote" is a search term, not a location filter, so it widens results
    // instead of excluding everything outside one city.
    const { total, jobs } = await searchJobs({
      query: remote ? `${q} remote` : q,
      location: remote ? undefined : location,
      page,
    });

    const results = jobs
      .map((job) => ({
        ...job,
        match: scoreJob(job, {
          sections: version.parsedSections,
          rawText: version.rawText,
          query: q,
          remote,
          location,
        }),
      }))
      .sort((a, b) => b.match.score - a.match.score);

    res.json({ total, versionId: version._id, jobs: results });
  })
);

module.exports = router;
