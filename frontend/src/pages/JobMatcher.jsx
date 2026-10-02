import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Loader2,
  Sparkles,
  Trash2,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { useResumesList, useResume } from "@/hooks/useResumes";
import {
  useJobMatches,
  useCreateJobMatch,
  useDeleteJobMatch,
} from "@/hooks/useJobMatches";
import { useCreateApplication } from "@/hooks/useApplications";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { relativeTime } from "@/lib/utils";

function ScoreRing({ score }) {
  const tone =
    score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className={`font-display text-4xl font-semibold ${tone}`}>
      {score}
      <span className="text-lg text-[var(--color-ink-muted)] font-normal"> / 100</span>
    </div>
  );
}

export default function JobMatcher() {
  const navigate = useNavigate();
  const { data: resumesData, isLoading: resumesLoading } = useResumesList();
  const resumes = Array.isArray(resumesData) ? resumesData : [];

  const [resumeId, setResumeId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [banner, setBanner] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!resumeId && resumes.length > 0) {
      setResumeId(resumes[0]._id);
    }
  }, [resumes, resumeId]);

  const { data: resumeDetail } = useResume(resumeId);
  const versions = resumeDetail?.versions ?? [];

  useEffect(() => {
    if (versions.length > 0) {
      const current =
        resumeDetail?.resume?.currentVersionId?._id ||
        resumeDetail?.resume?.currentVersionId;
      setVersionId(current || versions[versions.length - 1]._id);
    } else {
      setVersionId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, versions.length]);

  const createMatch = useCreateJobMatch();
  const deleteMatch = useDeleteJobMatch();
  const { data: historyData } = useJobMatches();
  const history = historyData?.jobMatches ?? [];

  async function handleMatch() {
    setBanner(null);
    if (!resumeId || !versionId) {
      setBanner({ tone: "error", message: "Choose a resume first." });
      return;
    }
    if (jobDescription.trim().length < 30) {
      setBanner({ tone: "error", message: "Paste the full job description (at least 30 characters)." });
      return;
    }
    try {
      const res = await createMatch.mutateAsync({
        resumeId,
        versionId,
        jobDescription,
        jobTitle,
        company,
      });
      setResult(res.jobMatch);
      setTracked(false);
    } catch (err) {
      setBanner({
        tone: "error",
        message: err?.message || "Couldn't run the match. Please try again.",
      });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMatch.mutateAsync(id);
      if (result?._id === id) setResult(null);
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "Couldn't delete that match." });
    }
  }

  const createApplication = useCreateApplication();
  const [tracked, setTracked] = useState(false);

  async function handleTrack() {
    if (!result) return;
    try {
      await createApplication.mutateAsync({
        resumeId: result.resumeId,
        versionId: result.versionId,
        jobMatchId: result._id,
        jobTitle: result.jobTitle || "Untitled role",
        company: result.company || "Unknown company",
      });
      setTracked(true);
      setBanner({ tone: "success", message: "Added to Applications." });
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "Couldn't track this application." });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Job Matcher
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Paste a job description and see how well a resume version matches it.
        </p>
      </div>

      <Banner {...banner} onDismiss={() => setBanner(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New match</CardTitle>
            <CardDescription>Choose a resume version and paste the JD</CardDescription>
          </CardHeader>

          <div className="space-y-3">
            {resumesLoading ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                <Loader2 className="animate-spin" size={14} /> Loading resumes…
              </div>
            ) : resumes.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-muted)]">
                No resumes yet —{" "}
                <button
                  className="underline"
                  onClick={() => navigate("/resumes")}
                  type="button"
                >
                  upload one first
                </button>
                .
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={versionId}
                    onChange={(e) => setVersionId(e.target.value)}
                    className="h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                    disabled={versions.length === 0}
                  >
                    {versions.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    placeholder="Job title (optional)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Company (optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <Textarea
                  placeholder="Paste the full job description here…"
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                <Button
                  variant="accent"
                  className="w-full"
                  onClick={handleMatch}
                  disabled={createMatch.isPending}
                >
                  {createMatch.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Matching…
                    </>
                  ) : (
                    <>
                      <Target size={15} />
                      Find match
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </Card>

        <div>
          {result ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-base">
                    {result.jobTitle || "Match result"}
                    {result.company ? ` · ${result.company}` : ""}
                  </CardTitle>
                  <CardDescription>{result.summary}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrack}
                  disabled={tracked || createApplication.isPending}
                >
                  {createApplication.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Briefcase size={13} />
                  )}
                  {tracked ? "Tracked" : "Track application"}
                </Button>
              </CardHeader>

              <ScoreRing score={result.matchScore} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-2">
                    Matched
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.length === 0 ? (
                      <span className="text-xs text-[var(--color-ink-muted)]">None</span>
                    ) : (
                      result.matchedKeywords.map((k, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                        >
                          {k}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-2">
                    Missing
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.length === 0 ? (
                      <span className="text-xs text-[var(--color-ink-muted)]">None</span>
                    ) : (
                      result.missingKeywords.map((k, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700"
                        >
                          {k}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-1.5">
                    Strengths for this role
                  </p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-1.5">
                    Gaps against this JD
                  </p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    {result.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="py-16 text-center h-full flex flex-col items-center justify-center">
              <Sparkles size={28} className="mx-auto mb-3 opacity-40" />
              <h2 className="font-display text-lg font-semibold">No match run yet</h2>
              <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-xs mx-auto">
                Pick a resume, paste a job description, and run a match to see your fit score.
              </p>
            </Card>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match history</CardTitle>
            <CardDescription>Your past job matches</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {history.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] text-sm cursor-pointer hover:bg-[var(--color-surface)] transition-colors"
                onClick={() => {
                  setResult(m);
                  setTracked(false);
                }}
              >
                <Badge
                  tone={
                    m.matchScore >= 75 ? "success" : m.matchScore >= 50 ? "warning" : "danger"
                  }
                >
                  {m.matchScore}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {m.jobTitle || "Untitled role"}
                    {m.company ? ` · ${m.company}` : ""}
                  </div>
                  <div className="text-xs text-[var(--color-ink-muted)]">
                    {relativeTime(m.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m._id);
                  }}
                  className="text-[var(--color-ink-muted)] hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={14} className="text-[var(--color-ink-muted)] shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
