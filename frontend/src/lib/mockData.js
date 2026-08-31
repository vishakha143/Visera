function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function makeVersion({ id, label, score, sourceType, createdAt }) {
  return {
    _id: id,
    label,
    score,
    sourceType,
    createdAt,
    parsedSections: {
      basics: {
        name: "Alex Rivera",
        title: "Senior Frontend Engineer",
        email: "alex@example.com",
        location: "San Francisco, CA",
      },
      summary:
        "Frontend engineer with 6+ years shipping production React apps at consumer-scale.",
      experience: [
        {
          role: "Senior Frontend Engineer",
          company: "Acme Analytics",
          period: "2023 — Present",
          bullets: [
            "Shipped 4 React dashboards adopted by 12k+ daily users; cut TTI 38%.",
            "Led migration from Webpack to Vite — build times down from 92s to 11s.",
          ],
        },
      ],
      education: [
        { degree: "B.S. Computer Science", school: "UC Berkeley", period: "2016 — 2020" },
      ],
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind", "Vite"],
    },
  };
}

export const mockResumes = [
  {
    _id: "resume_1",
    title: "Senior Frontend Engineer — Stripe",
    createdAt: daysAgo(20),
    updatedAt: hoursAgo(2),
    currentVersionId: "v_1_3",
    bestScore: 86,
    versionCount: 3,
    versions: [
      makeVersion({ id: "v_1_1", label: "V1", score: 62, sourceType: "upload", createdAt: daysAgo(20) }),
      makeVersion({ id: "v_1_2", label: "V2", score: 78, sourceType: "rewrite", createdAt: daysAgo(8) }),
      makeVersion({ id: "v_1_3", label: "V3", score: 86, sourceType: "rewrite", createdAt: hoursAgo(2) }),
    ],
  },
  {
    _id: "resume_2",
    title: "Full-Stack Engineer — Vercel",
    createdAt: daysAgo(34),
    updatedAt: daysAgo(3),
    currentVersionId: "v_2_2",
    bestScore: 74,
    versionCount: 2,
    versions: [
      makeVersion({ id: "v_2_1", label: "V1", score: 58, sourceType: "upload", createdAt: daysAgo(34) }),
      makeVersion({ id: "v_2_2", label: "V2", score: 74, sourceType: "rewrite", createdAt: daysAgo(3) }),
    ],
  },
];

export function findMockResume(id) {
  return mockResumes.find((r) => r._id === id);
}

export function listMockResumesShallow() {
  return mockResumes.map((r) => ({
    _id: r._id,
    title: r.title,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    versionCount: r.versionCount,
    bestScore: r.bestScore,
  }));
}
export function getMockDashboard() {
  return {
    totals: {
      resumes: 2,
      rewrites: 3,
      analyses: 5,
    },
    kpi: {
      atsScore: {
        value: 86,
        delta: 8,
        spark: [62, 68, 74, 78, 82, 86],
      },
      versions: {
        value: 5,
        spark: [1, 2, 3, 4, 5],
      },
      issuesIdentified: {
        value: 12,
        delta: -3,
        spark: [18, 16, 15, 14, 13, 12],
      },
      keywordsMatched: {
        value: 18,
        total: 24,
        delta: 4,
        spark: [10, 12, 14, 15, 17, 18],
      },
    },
    scoreSeries: [
      { label: "V1", score: 62, at: "2026-07-20" },
      { label: "V2", score: 78, at: "2026-08-01" },
      { label: "V3", score: 86, at: "2026-08-10" },
    ],
    latestResume: {
      _id: "resume_1",
      title: "Senior Frontend Engineer — Stripe",
    },
    versionStack: [
      { id: "v_1_3", label: "V3", score: 86, sourceType: "rewrite" },
      { id: "v_1_2", label: "V2", score: 78, sourceType: "rewrite" },
      { id: "v_1_1", label: "V1", score: 62, sourceType: "upload" },
    ],
    activity: [
      {
        id: "a1",
        type: "rewrite",
        title: "Applied AI rewrites",
        subtitle: "Senior Frontend Engineer — Stripe",
        at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "a2",
        type: "analyze",
        title: "Ran analysis",
        subtitle: "Score improved to 86",
        at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: "a3",
        type: "upload",
        title: "Uploaded resume",
        subtitle: "Full-Stack Engineer — Vercel",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
    ],
  };
}
export function getMockInsights() {
  return {
    empty: false,
    averageScore: 74,
    bestScore: {
      value: 86,
      resumeTitle: "Senior Frontend Engineer — Stripe",
    },
    totalAnalyses: 5,
    scoreTrend: [
      { score: 62, at: "2026-07-20", resumeTitle: "Stripe Resume" },
      { score: 58, at: "2026-07-22", resumeTitle: "Vercel Resume" },
      { score: 78, at: "2026-08-01", resumeTitle: "Stripe Resume" },
      { score: 74, at: "2026-08-05", resumeTitle: "Vercel Resume" },
      { score: 86, at: "2026-08-10", resumeTitle: "Stripe Resume" },
    ],
    topIssues: [
      { title: "Weak action verbs in Experience section", severity: "high", count: 4 },
      { title: "Missing keywords for target role", severity: "high", count: 3 },
      { title: "Inconsistent date formatting", severity: "medium", count: 2 },
      { title: "First bullet too long", severity: "low", count: 2 },
    ],
    topMissingKeywords: [
      { keyword: "GraphQL", count: 3 },
      { keyword: "Docker", count: 2 },
      { keyword: "Kubernetes", count: 2 },
      { keyword: "Redis", count: 1 },
    ],
    topPresentKeywords: [
      { keyword: "React", count: 5 },
      { keyword: "TypeScript", count: 4 },
      { keyword: "Vite", count: 3 },
      { keyword: "Tailwind", count: 3 },
    ],
    resumePerformance: [
      {
        resumeId: "resume_1",
        title: "Senior Frontend Engineer — Stripe",
        latestScore: 86,
        bestScore: 86,
        improvement: 24,
        analysesCount: 3,
      },
      {
        resumeId: "resume_2",
        title: "Full-Stack Engineer — Vercel",
        latestScore: 74,
        bestScore: 74,
        improvement: 16,
        analysesCount: 2,
      },
    ],
  };
}
export function getMockHistory() {
  return {
    totals: {
      all: 6,
      upload: 2,
      analyze: 3,
      rewrite: 1,
    },
    events: [
      {
        id: "e1",
        type: "rewrite",
        title: "Applied AI rewrites",
        subtitle: "Senior Frontend Engineer — Stripe · V3 created",
        label: "Rewrite",
        at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        resumeId: "resume_1",
      },
      {
        id: "e2",
        type: "analyze",
        title: "Analysis completed",
        subtitle: "Score: 86 · Stripe resume",
        label: "Analyze",
        at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        resumeId: "resume_1",
      },
      {
        id: "e3",
        type: "analyze",
        title: "Analysis completed",
        subtitle: "Score: 74 · Vercel resume",
        label: "Analyze",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        resumeId: "resume_2",
      },
      {
        id: "e4",
        type: "upload",
        title: "Resume uploaded",
        subtitle: "Full-Stack Engineer — Vercel",
        label: "Upload",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        resumeId: "resume_2",
      },
      {
        id: "e5",
        type: "analyze",
        title: "Analysis completed",
        subtitle: "Score: 78 · Stripe resume",
        label: "Analyze",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        resumeId: "resume_1",
      },
      {
        id: "e6",
        type: "upload",
        title: "Resume uploaded",
        subtitle: "Senior Frontend Engineer — Stripe",
        label: "Upload",
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        resumeId: "resume_1",
      },
    ],
  };
}
export function getMockVersions() {
  return {
    totals: {
      all: 5,
      uploads: 2,
      rewrites: 3,
    },
    versions: [
      {
        id: "v_1_3",
        label: "V3",
        resumeId: "resume_1",
        resumeTitle: "Senior Frontend Engineer — Stripe",
        score: 86,
        sourceType: "rewrite",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "v_1_2",
        label: "V2",
        resumeId: "resume_1",
        resumeTitle: "Senior Frontend Engineer — Stripe",
        score: 78,
        sourceType: "rewrite",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
      {
        id: "v_2_2",
        label: "V2",
        resumeId: "resume_2",
        resumeTitle: "Full-Stack Engineer — Vercel",
        score: 74,
        sourceType: "rewrite",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: "v_1_1",
        label: "V1",
        resumeId: "resume_1",
        resumeTitle: "Senior Frontend Engineer — Stripe",
        score: 62,
        sourceType: "upload",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      },
      {
        id: "v_2_1",
        label: "V1",
        resumeId: "resume_2",
        resumeTitle: "Full-Stack Engineer — Vercel",
        score: 58,
        sourceType: "upload",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 34).toISOString(),
      },
    ],
  };
}
export function getMockAnalysis(versionId) {
  // Simple mock – same structure for any version for now
  return {
    _id: "an_" + versionId,
    versionId,
    atsScore: 86,
    model: "gemini-2.5-flash",
    summary:
      "Excellent tier. Layout parses cleanly, every senior-role bullet has a quantified outcome, and keyword coverage is strong.",
    scoreBreakdown: [
      { label: "Keywords", value: 90 },
      { label: "Format", value: 74 },
      { label: "Impact", value: 91 },
      { label: "Readability", value: 82 },
      { label: "Action verbs", value: 79 },
    ],
    issues: [
      {
        title: "Weak action verbs in Experience section",
        severity: "high",
        fix: "Swap 'helped', 'worked on' for strong verbs like 'shipped', 'led', 'cut'.",
      },
      {
        title: "Missing keywords for target role",
        severity: "high",
        fix: "Add 'GraphQL' and 'Docker' — both appear in the JD but are missing.",
      },
      {
        title: "Inconsistent date formatting",
        severity: "medium",
        fix: "Use one format throughout (e.g. 'Jan 2024 — Present').",
      },
      {
        title: "First bullet of latest role is too long",
        severity: "low",
        fix: "Cap each bullet at ~20 words.",
      },
    ],
    strengths: [
      {
        title: "Quantified outcomes in senior-role bullets",
        note: "12k+ users, 38% TTI cut, 92s → 11s build.",
      },
      {
        title: "Clean single-column layout",
        note: "Parses perfectly across ATS systems.",
      },
      {
        title: "Strong action verbs in latest role",
        note: "shipped, led, owned — all impact verbs.",
      },
      {
        title: "Domain-relevant skill stack",
        note: "React, TypeScript, Vite — matches JD.",
      },
    ],
    keywordsPresent: ["React", "TypeScript", "Node.js", "Vite", "Jest", "AWS"],
    keywordsMissing: ["GraphQL", "Docker", "Kubernetes", "Redis"],
    bulletRewrites: [
      {
        _id: "rw_1",
        section: "experience",
        original: "Worked on dashboards for the analytics team.",
        rewritten:
          "Shipped 4 React analytics dashboards adopted by 12k+ daily users — cut load time 38%.",
        rationale: "Quantified outcome + strong verb + named the user-base scale.",
      },
      {
        _id: "rw_2",
        section: "experience",
        original: "Helped migrate the build system.",
        rewritten:
          "Led migration from Webpack to Vite, reducing build times from 92s to 11s across 14 packages.",
        rationale: "Named the technologies + concrete metric + scope.",
      },
      {
        _id: "rw_3",
        section: "summary",
        original: "Frontend engineer with several years of experience.",
        rewritten:
          "Frontend engineer with 6+ years shipping production React at consumer scale.",
        rationale: "Specific tenure + 'production' + scale signal.",
      },
    ],
  };
}