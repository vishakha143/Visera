const mongoose = require("mongoose");

const STATUSES = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    versionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeVersion",
      required: true,
    },
    jobMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobMatch",
      default: null,
    },
    jobTitle: { type: String, required: true, trim: true, maxlength: 160 },
    company: { type: String, required: true, trim: true, maxlength: 160 },
    jobUrl: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: STATUSES, default: "saved" },
    appliedAt: { type: Date, default: null },
    notes: { type: String, default: "", maxlength: 4000 },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, status: 1 });
// One application per job match — tracking the same match twice (e.g. a
// double-click, or revisiting it later) should update, not duplicate.
applicationSchema.index(
  { userId: 1, jobMatchId: 1 },
  { unique: true, partialFilterExpression: { jobMatchId: { $type: "objectId" } } }
);

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STATUSES = STATUSES;
