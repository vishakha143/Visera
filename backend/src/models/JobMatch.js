const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema(
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
    jobTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    jobDescription: { type: String, required: true },
    matchScore: { type: Number, min: 0, max: 100, required: true },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    gaps: { type: [String], default: [] },
    summary: { type: String, default: "" },
    model: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobMatch", jobMatchSchema);
