import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { resumesApi } from "@/api/resumes";

// Personalized "Why Visera flagged this" context, built entirely from the
// existing resumes + analyses endpoints (resumes sorted by updatedAt desc,
// analyses sorted by createdAt desc — so the first of each is the latest).
// Reuses resumesApi rather than adding a new endpoint. Both queries are
// gated on isAuthenticated so anonymous visitors never trigger a resume
// fetch on this public page.
export function useAtsGuideContext() {
  const { isAuthenticated } = useAuth();

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["ats-guide", "resumes"],
    queryFn: () => resumesApi.list(),
    enabled: isAuthenticated,
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.resumes)) return data.resumes;
      return [];
    },
  });

  const latestResume = resumes?.[0] || null;
  const latestResumeId = latestResume?._id || latestResume?.id;

  const {
    data: analysesData,
    isLoading: analysesLoading,
    isError,
  } = useQuery({
    queryKey: ["ats-guide", "analyses", latestResumeId],
    queryFn: () => resumesApi.analyses(latestResumeId),
    enabled: isAuthenticated && !!latestResumeId,
  });

  const latestAnalysis = analysesData?.analyses?.[0] || null;

  const flags = buildFlags(latestAnalysis);

  return {
    enabled: isAuthenticated,
    loading: isAuthenticated && (resumesLoading || (!!latestResumeId && analysesLoading)),
    failed: isAuthenticated && !!latestResumeId && isError,
    hasResume: !!latestResume,
    hasAnalysis: !!latestAnalysis,
    resume: latestResume,
    analysis: latestAnalysis,
    flags,
  };
}

function buildFlags(analysis) {
  if (!analysis) return [];
  const flags = [];

  (analysis.keywordsMissing || []).forEach((keyword) => {
    flags.push({
      type: "missing_keyword",
      keyword,
      source: "job_description",
      status: "missing",
      severity: "context",
      reason: `${keyword} was detected as relevant but not found in your resume.`,
      guideSection: "keywords",
    });
  });

  (analysis.issues || []).forEach((issue) => {
    const lower = `${issue.title} ${issue.explanation || ""}`.toLowerCase();
    let guideSection = null;
    if (lower.includes("format") || lower.includes("layout") || lower.includes("table") || lower.includes("column")) {
      guideSection = "formatting";
    } else if (lower.includes("length") || lower.includes("page")) {
      guideSection = "resume-length";
    } else if (lower.includes("heading") || lower.includes("section")) {
      guideSection = "section-headings";
    }
    if (guideSection) {
      flags.push({
        type: "issue",
        keyword: issue.title,
        severity: issue.severity === "high" ? "risk" : "context",
        reason: issue.explanation || issue.fix || issue.title,
        guideSection,
      });
    }
  });

  return flags;
}
