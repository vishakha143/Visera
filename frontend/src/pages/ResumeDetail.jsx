import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, Sparkles } from "lucide-react";
import {
  useResume,
  useFullVersion,
  useAnalyzeResume,
} from "@/hooks/useResumes";
import { resumesApi } from "@/api/resumes";
import { relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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

  // Compare
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [diff, setDiff] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);

  // Analysis + apply rewrites
  const [analysis, setAnalysis] = useState(null);
  const [selected, setSelected] = useState([]);
  const [rewriteLoading, setRewriteLoading] = useState(false);

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
    try {
      const result = await analyze.mutateAsync({
        targetRole: "Full Stack Developer",
      });
      const a = result?.analysis || result;
      setAnalysis(a);
      setSelected((a?.bulletRewrites || []).map((_, i) => i));
      queryClient.invalidateQueries({ queryKey: ["resumes", id] });
    } catch (err) {
      alert(err?.message || "Analysis failed");
    }
  }

  function toggleIndex(i) {
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  async function handleApplyRewrites() {
    if (!analysis?._id) {
      alert("Run analysis first");
      return;
    }
    if (selected.length === 0) {
      alert("Select at least one rewrite");
      return;
    }
    try {
      setRewriteLoading(true);
      const result = await resumesApi.rewrite(id, {
        analysisId: analysis._id,
        selected,
      });
      await queryClient.invalidateQueries({ queryKey: ["resumes", id] });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
      await queryClient.invalidateQueries({
        queryKey: ["analytics", "versions"],
      });
      setAnalysis(null);
      setSelected([]);

      // Jump to the new version if API returns it
      const newId = result?.version?._id;
      if (newId) setSelectedVersionId(newId);

      alert("Rewrites applied — new version created");
    } catch (err) {
      alert(err?.message || "Apply rewrites failed");
    } finally {
      setRewriteLoading(false);
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
      alert(err?.message || "Compare failed");
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

  return (
    <div className="space-y-8">
      <Link
        to="/resumes"
        className="text-sm text-[var(--ink-muted)] hover:underline"
      >
        ← All resumes
      </Link>

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
              Run ATS analysis
            </>
          )}
        </Button>
      </div>

      {/* Versions list — click to view that version's content */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Versions
        </h2>
        <p className="text-xs text-[var(--ink-muted)]">
          Click a version to preview its parsed content below.
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

      {/* Suggested rewrites */}
      {analysis?.bulletRewrites?.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              Suggested rewrites
            </h2>
            <Button
              type="button"
              variant="accent"
              onClick={handleApplyRewrites}
              disabled={rewriteLoading || selected.length === 0}
            >
              {rewriteLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Applying…
                </>
              ) : (
                `Apply ${selected.length} rewrite(s)`
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {analysis.bulletRewrites.map((r, i) => (
              <label
                key={i}
                className="flex gap-3 rounded-xl border border-[var(--border)] p-3 cursor-pointer hover:bg-[var(--surface-2)]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(i)}
                  onChange={() => toggleIndex(i)}
                  className="mt-1"
                />
                <div className="text-sm space-y-1 min-w-0">
                  <p className="text-xs text-[var(--ink-muted)]">{r.section}</p>
                  <p className="text-red-700/90 line-through">{r.original}</p>
                  <p className="text-green-800">{r.rewritten}</p>
                  {r.rationale ? (
                    <p className="text-xs text-[var(--ink-muted)]">
                      {r.rationale}
                    </p>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
        </section>
      )}

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