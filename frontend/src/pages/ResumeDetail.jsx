import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader2, FileText, Sparkles, CheckCircle2, XCircle, PenLine } from "lucide-react";
import {
  useResume,
  useFullVersion,
  useAnalyzeResume,
  useAnalysisForVersion,
  useApplyRewrites,
} from "@/hooks/useResumes";
import { resumesApi } from "@/api/resumes";
import { relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AtsGauge } from "@/components/dashboard/AtsGauge";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { StrengthsList } from "@/components/analysis/StrengthsList";
import { IssuesList } from "@/components/analysis/IssuesList";
import { KeywordChips } from "@/components/analysis/KeywordChips";
import { BulletRewrites } from "@/components/analysis/BulletRewrites";

const BREAKDOWN_LABELS = {
  keywords: "Job Keyword Match",
  formatting: "Formatting Safety",
  impact: "Bullet Impact",
  clarity: "Clarity",
};

function toBreakdownList(scoreBreakdown) {
  if (!scoreBreakdown) return [];
  return Object.entries(BREAKDOWN_LABELS)
    .filter(([key]) => scoreBreakdown[key] != null)
    .map(([key, label]) => ({ label, value: scoreBreakdown[key], max: 25 }));
}

function Banner({ tone, message, onDismiss }) {
  if (!message) return null;
  const Icon = tone === "error" ? XCircle : CheckCircle2;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-50 text-red-700"
          : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-xs underline shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function ResumeDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useResume(id);

  const resume = data?.resume;
  const versions = data?.versions ?? [];

  const latestVersionId =
    resume?.currentVersionId?._id ||
    resume?.currentVersionId ||
    versions[versions.length - 1]?._id ||
    null;

  // Which version's content is shown in Basics / Skills / etc.
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  useEffect(() => {
    if (latestVersionId) {
      setSelectedVersionId(latestVersionId);
    }
  }, [latestVersionId]);

  const activeVersionId = selectedVersionId || latestVersionId;

  const { data: versionPayload, isLoading: versionLoading } = useFullVersion(
    id,
    activeVersionId
  );

  const version = versionPayload?.version ?? versionPayload;
  const sections = version?.parsedSections;

  const analyze = useAnalyzeResume(id);
  const applyRewrites = useApplyRewrites(id);

  // Persisted analysis for whichever version is currently being viewed.
  const { data: analysisPayload, isFetching: analysisLoading } =
    useAnalysisForVersion(id, activeVersionId);
  const persistedAnalysis = analysisPayload?.analysis ?? null;

  // A freshly-run analysis (this session) takes priority over what's persisted,
  // since it may target a version whose stored analysis hasn't refetched yet.
  // Only valid for the version it was run against — switching versions falls
  // back to whatever's persisted for that version instead.
  const [freshAnalysis, setFreshAnalysis] = useState(null);
  const displayedAnalysis =
    (freshAnalysis?.versionId === activeVersionId ? freshAnalysis : null) ||
    persistedAnalysis;

  // All analyses for this resume, to compute score delta vs the previous run.
  const { data: analysesPayload } = useQuery({
    queryKey: ["resumes", id, "analyses"],
    queryFn: () => resumesApi.analyses(id),
    enabled: !!id,
  });
  const allAnalyses = analysesPayload?.analyses || [];
  const scoreDelta = (() => {
    if (!displayedAnalysis) return 0;
    const idx = allAnalyses.findIndex((a) => a._id === displayedAnalysis._id);
    const previous = idx >= 0 ? allAnalyses[idx + 1] : null;
    return previous ? displayedAnalysis.atsScore - previous.atsScore : 0;
  })();

  const [banner, setBanner] = useState(null);

  // Compare
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [diff, setDiff] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);

  useEffect(() => {
    if (versions.length >= 2) {
      setFromId(versions[0]._id);
      setToId(versions[versions.length - 1]._id);
    } else {
      setFromId("");
      setToId("");
      setDiff(null);
    }
  }, [versions]);

  async function handleAnalyze() {
    setBanner(null);
    try {
      const result = await analyze.mutateAsync({
        versionId: activeVersionId,
        targetRole: "Full Stack Developer",
      });
      const a = result?.analysis || result;
      setFreshAnalysis(a);
      queryClient.invalidateQueries({ queryKey: ["resumes", id] });
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "We couldn't analyze this resume right now. Please try again." });
    }
  }

  async function handleApplyRewrites(selectedIds) {
    if (!displayedAnalysis?._id) {
      setBanner({ tone: "error", message: "Run an analysis first, then select rewrites to apply." });
      return;
    }
    try {
      const result = await applyRewrites.mutateAsync({
        analysisId: displayedAnalysis._id,
        selected: selectedIds,
      });
      setFreshAnalysis(null);

      const newId = result?.version?._id;
      if (newId) setSelectedVersionId(newId);

      setBanner({ tone: "success", message: "Rewrites applied — a new version was created." });
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "Applying rewrites failed. Your resume was not changed." });
    }
  }

  async function handleCompare() {
    if (!fromId || !toId || fromId === toId) return;
    setDiffLoading(true);
    setDiff(null);
    try {
      const data = await resumesApi.diff(id, fromId, toId, "words");
      setDiff(data);
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "Comparing versions failed." });
    } finally {
      setDiffLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading resume…
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="p-8 space-y-3">
        <p className="font-semibold">Resume not found</p>
        <p className="text-sm text-red-600">
          {error?.message || "Could not load this resume"}
        </p>
        <Link to="/resumes" className="text-sm underline">
          Back to resumes
        </Link>
      </div>
    );
  }

  const basics = sections?.basics || {};
  const breakdown = toBreakdownList(displayedAnalysis?.scoreBreakdown);

  return (
    <div className="space-y-8">
      <Link
        to="/resumes"
        className="text-sm text-[var(--ink-muted)] hover:underline"
      >
        ← All resumes
      </Link>

      <Banner {...banner} onDismiss={() => setBanner(null)} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {resume.title}
            </h1>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              {resume.latestVersionNumber || versions.length || 1} version(s)
              {resume.updatedAt
                ? ` · Updated ${relativeTime(resume.updatedAt)}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/resumes/${id}/studio`}>
            <Button variant="outline">
              <PenLine size={15} />
              Edit in Studio
            </Button>
          </Link>
          <Button
            variant="accent"
            onClick={handleAnalyze}
            disabled={analyze.isPending}
          >
            {analyze.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {displayedAnalysis ? "Re-analyze this version" : "Run ATS analysis"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis overview */}
      {analysisLoading && !displayedAnalysis ? (
        <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
          <Loader2 className="animate-spin" size={16} />
          Checking for an existing analysis…
        </div>
      ) : displayedAnalysis ? (
        <div className="space-y-6">
          {displayedAnalysis.summary && (
            <Card className="max-w-2xl" padding="sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-1.5">
                Quick interpretation
              </p>
              <p className="text-sm leading-relaxed">{displayedAnalysis.summary}</p>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <AtsGauge score={displayedAnalysis.atsScore} delta={scoreDelta} />
            <ScoreBreakdown breakdown={breakdown} />
          </div>

          {(displayedAnalysis.keywordsPresent?.length > 0 ||
            displayedAnalysis.keywordsMissing?.length > 0) && (
            <KeywordChips
              present={displayedAnalysis.keywordsPresent}
              missing={displayedAnalysis.keywordsMissing}
            />
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <StrengthsList
              strengths={(displayedAnalysis.strengths || []).map((s) => ({
                title: s.title,
                note: s.evidence,
                source: s.source,
              }))}
            />
            <IssuesList issues={displayedAnalysis.issues} />
          </div>

          {displayedAnalysis.bulletRewrites?.length > 0 && (
            <BulletRewrites
              rewrites={displayedAnalysis.bulletRewrites}
              onApply={handleApplyRewrites}
              isApplying={applyRewrites.isPending}
            />
          )}
        </div>
      ) : (
        <Card className="py-10 text-center max-w-xl">
          <p className="text-sm font-medium mb-1">No analysis yet for this version</p>
          <p className="text-sm text-[var(--ink-muted)]">
            Run an ATS analysis to see your score, strengths, issues, and keyword matches.
          </p>
        </Card>
      )}

      {/* Versions list — click to view that version's content */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Versions
        </h2>
        <p className="text-xs text-[var(--ink-muted)]">
          Click a version to preview its parsed content and analysis below.
        </p>
        {versions.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">No versions yet</p>
        ) : (
          versions.map((v) => {
            const isActive = activeVersionId === v._id;
            return (
              <button
                type="button"
                key={v._id}
                onClick={() => setSelectedVersionId(v._id)}
                className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <span className="font-medium">{v.label}</span>
                <span className="text-[var(--ink-muted)]">
                  {" "}
                  · v{v.versionNumber} · {v.sourceType}
                  {isActive ? " · viewing" : ""}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Compare versions */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Compare versions
        </h2>

        {versions.length < 2 ? (
          <p className="text-sm text-[var(--ink-muted)]">
            You need at least two versions on this resume. Run analysis, then
            apply rewrites to create V2, then compare V1 vs V2.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 items-end">
              <label className="text-xs space-y-1">
                <span className="text-[var(--ink-muted)]">From</span>
                <select
                  className="block h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm min-w-[140px]"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                >
                  {versions.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.label} (v{v.versionNumber})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs space-y-1">
                <span className="text-[var(--ink-muted)]">To</span>
                <select
                  className="block h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm min-w-[140px]"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                >
                  {versions.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.label} (v{v.versionNumber})
                    </option>
                  ))}
                </select>
              </label>

              <Button
                type="button"
                onClick={handleCompare}
                disabled={diffLoading || !fromId || !toId || fromId === toId}
              >
                {diffLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Comparing…
                  </>
                ) : (
                  "Compare"
                )}
              </Button>
            </div>

            {(() => {
              const fromAnalysis = allAnalyses.find((a) => a.versionId === fromId || a.versionId?._id === fromId);
              const toAnalysis = allAnalyses.find((a) => a.versionId === toId || a.versionId?._id === toId);
              if (!fromAnalysis || !toAnalysis) return null;
              const delta = toAnalysis.atsScore - fromAnalysis.atsScore;
              const reasons = [];
              const dims = { keywords: "Keyword alignment", formatting: "Formatting", impact: "Bullet impact", clarity: "Clarity" };
              for (const [key, label] of Object.entries(dims)) {
                const d = (toAnalysis.scoreBreakdown?.[key] ?? 0) - (fromAnalysis.scoreBreakdown?.[key] ?? 0);
                if (d > 0) reasons.push(`${label} improved`);
                else if (d < 0) reasons.push(`${label} declined`);
                else reasons.push(`${label} remained stable`);
              }
              return (
                <div className="rounded-xl bg-[var(--color-surface-2)] p-4 text-sm space-y-2">
                  <p className="font-medium">
                    Visera's analysis {delta > 0 ? "improved" : delta < 0 ? "decreased" : "stayed the same"} by{" "}
                    {Math.abs(delta)} point{Math.abs(delta) === 1 ? "" : "s"}
                    <span className="text-[var(--color-ink-muted)] font-normal">
                      {" "}({fromAnalysis.atsScore} → {toAnalysis.atsScore})
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">Why: {reasons.join(". ")}.</p>
                  <p className="text-xs text-[var(--color-ink-muted)] italic">
                    A higher analysis score doesn't guarantee a better hiring outcome.
                  </p>
                </div>
              );
            })()}

            {diff?.stats && (
              <p className="text-xs text-[var(--ink-muted)]">
                +{diff.stats.added} chars added · −{diff.stats.removed} chars
                removed
              </p>
            )}

            {diff?.parts && (
              <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-xl border border-[var(--border)] p-4 max-h-80 overflow-auto">
                {diff.parts.map((p, i) => (
                  <span
                    key={i}
                    className={
                      p.added
                        ? "bg-green-100 text-green-900"
                        : p.removed
                          ? "bg-red-100 text-red-900 line-through"
                          : ""
                    }
                  >
                    {p.value}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Parsed content for selected version */}
      {versionLoading && (
        <div className="flex items-center gap-2 text-[var(--ink-muted)] text-sm">
          <Loader2 className="animate-spin" size={16} />
          Loading parsed sections…
        </div>
      )}

      {sections && (
        <div className="space-y-6">
          <p className="text-xs text-[var(--ink-muted)]">
            Showing content for{" "}
            <span className="font-semibold text-[var(--ink)]">
              {version?.label || "selected version"}
            </span>
            {version?.sourceType ? ` (${version.sourceType})` : ""}
          </p>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              Basics
            </h2>
            <p className="font-display text-lg font-semibold">
              {basics.name || "—"}
            </p>
            <p className="text-sm text-[var(--ink-muted)]">
              {[basics.email, basics.phone, basics.location]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </section>

          {sections.summary ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)] mb-2">
                Summary
              </h2>
              <p className="text-sm leading-relaxed">{sections.summary}</p>
            </section>
          ) : null}

          {sections.skills?.length > 0 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)] mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {sections.experience?.length > 0 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                Experience
              </h2>
              {sections.experience.map((exp, i) => (
                <div key={i}>
                  <p className="font-medium">
                    {exp.role}
                    {exp.company ? ` · ${exp.company}` : ""}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">{exp.period}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {(exp.bullets || []).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {sections.education?.length > 0 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                Education
              </h2>
              {sections.education.map((ed, i) => (
                <div key={i}>
                  <p className="font-medium">{ed.degree}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {ed.school}
                    {ed.period ? ` · ${ed.period}` : ""}
                  </p>
                  {ed.details ? (
                    <p className="text-xs text-[var(--ink-muted)]">{ed.details}</p>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {sections.projects?.length > 0 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                Projects
              </h2>
              {sections.projects.map((p, i) => (
                <div key={i}>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {p.description}
                  </p>
                  {p.tech?.length > 0 && (
                    <p className="text-xs mt-1 text-[var(--ink-muted)]">
                      {p.tech.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
