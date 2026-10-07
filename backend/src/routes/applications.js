const express = require("express");
const { z } = require("zod");
const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const Resume = require("../models/Resume");
const ResumeVersion = require("../models/ResumeVersion");
const Application = require("../models/Application");
const { STATUSES } = Application;

const router = express.Router();
router.use(requireAuth);

const objectIdSchema = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: "Invalid id" });

// Only web links: the URL is rendered as an href, so "javascript:" etc. must not get in.
const jobUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), { message: "Job link must start with http:// or https://" });

const createBody = z.object({
  resumeId: objectIdSchema,
  versionId: objectIdSchema,
  jobTitle: z.string().trim().min(1).max(160),
  company: z.string().trim().min(1).max(160),
  jobUrl: jobUrlSchema.optional(),
  status: z.enum(STATUSES).optional(),
  jobMatchId: objectIdSchema.optional(),
  notes: z.string().max(4000).optional(),
});

const updateBody = z.object({
  jobTitle: z.string().trim().min(1).max(160).optional(),
  company: z.string().trim().min(1).max(160).optional(),
  jobUrl: jobUrlSchema.optional(),
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(4000).optional(),
});

/* -------------------------------------------------------------------------- */
/* POST /api/applications                                                      */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  validate(createBody),
  asyncHandler(async (req, res) => {
    const { resumeId, versionId } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) throw ApiError.notFound("Resume not found");

    const version = await ResumeVersion.findOne({ _id: versionId, resumeId });
    if (!version) throw ApiError.notFound("Version not found");

    const status = req.body.status || "saved";

    // Already tracked this exact job match? Return the existing application
    // instead of creating a duplicate (e.g. a double-click, or clicking
    // "Track application" again after revisiting a past match).
    if (req.body.jobMatchId) {
      const existing = await Application.findOne({
        userId: req.user._id,
        jobMatchId: req.body.jobMatchId,
      });
      if (existing) return res.status(200).json({ application: existing });
    }

    const application = await Application.create({
      userId: req.user._id,
      resumeId,
      versionId,
      jobMatchId: req.body.jobMatchId || null,
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      jobUrl: req.body.jobUrl || "",
      status,
      appliedAt: status === "applied" ? new Date() : null,
      notes: req.body.notes || "",
    });

    res.status(201).json({ application });
  })
);

/* -------------------------------------------------------------------------- */
/* GET /api/applications — list, grouped counts included                      */
/* -------------------------------------------------------------------------- */

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const applications = await Application.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    for (const a of applications) counts[a.status] = (counts[a.status] || 0) + 1;

    res.json({ applications, counts, statuses: STATUSES });
  })
);

/* -------------------------------------------------------------------------- */
/* PATCH /api/applications/:id — update status/notes/details                   */
/* -------------------------------------------------------------------------- */

router.patch(
  "/:id",
  validate(z.object({ id: objectIdSchema }), "params"),
  validate(updateBody),
  asyncHandler(async (req, res) => {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!application) throw ApiError.notFound("Application not found");

    const wasApplied = application.status === "applied" || !!application.appliedAt;

    Object.assign(application, req.body);

    if (req.body.status === "applied" && !wasApplied) {
      application.appliedAt = new Date();
    }

    await application.save();
    res.json({ application });
  })
);

/* -------------------------------------------------------------------------- */
/* DELETE /api/applications/:id                                                */
/* -------------------------------------------------------------------------- */

router.delete(
  "/:id",
  validate(z.object({ id: objectIdSchema }), "params"),
  asyncHandler(async (req, res) => {
    const result = await Application.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (result.deletedCount === 0) throw ApiError.notFound("Application not found");

    res.json({ ok: true });
  })
);

module.exports = router;
