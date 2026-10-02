import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Undo2,
  Redo2,
  Cloud,
  CloudOff,
} from "lucide-react";
import {
  useResume,
  useFullVersion,
  useSaveVersion,
  useAnalysisForVersion,
  useAnalyzeResume,
} from "@/hooks/useResumes";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";

const AUTOSAVE_DELAY_MS = 1500;

const EMPTY_SECTIONS = {
  basics: { name: "", title: "", location: "", email: "", phone: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

function emptyExperience() {
  return { role: "", company: "", period: "", bullets: [""] };
}

function emptyEducation() {
  return { degree: "", school: "", period: "" };
}

export default function Studio() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading: resumeLoading } = useResume(id);
  const resume = data?.resume;
  const versions = data?.versions ?? [];

  const activeVersionId =
    resume?.currentVersionId?._id ||
    resume?.currentVersionId ||
    versions[versions.length - 1]?._id ||
    null;

  const { data: versionPayload, isLoading: versionLoading } = useFullVersion(
    id,
    activeVersionId
  );
  const version = versionPayload?.version ?? versionPayload;

  const { data: analysisPayload } = useAnalysisForVersion(id, activeVersionId);
  const analysis = analysisPayload?.analysis ?? null;

  const saveVersion = useSaveVersion(id, activeVersionId);
  const analyze = useAnalyzeResume(id);

  const {
    value: sections,
    set: setSections,
    reset: resetSections,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(EMPTY_SECTIONS);
  const [banner, setBanner] = useState(null);
  // "idle" | "pending" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");

  const [lastSaved, setLastSaved] = useState(EMPTY_SECTIONS);
  const dirty = JSON.stringify(sections) !== JSON.stringify(lastSaved);

  useEffect(() => {
    if (version?.parsedSections) {
      resetSections(version.parsedSections);
      setLastSaved(version.parsedSections);
      setSaveStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version?._id]);

  function update(path, value) {
    const next = structuredClone(sections);
    let cursor = next;
    for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
    cursor[path[path.length - 1]] = value;
    setSections(next);
  }

  async function persist(payload) {
    setSaveStatus("saving");
    try {
      await saveVersion.mutateAsync(payload);
      setLastSaved(payload);
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setBanner({
        tone: "error",
        message: err?.message || "Couldn't save your changes. Please try again.",
      });
    }
  }

  // Autosave: save 1.5s after the user stops editing.
  useEffect(() => {
    if (!dirty) return undefined;
    setSaveStatus("pending");
    const timer = setTimeout(() => persist(sections), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // Warn before leaving with edits autosave hasn't flushed yet.
  useEffect(() => {
    function onBeforeUnload(e) {
      if (saveStatus !== "pending" && saveStatus !== "saving") return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveStatus]);

  // Undo/redo keyboard shortcuts — only when not typing in a field, so native
  // text-undo inside an input isn't hijacked.
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  async function handleSave() {
    setBanner(null);
    await persist(sections);
  }

  async function handleAnalyze() {
    setBanner(null);
    try {
      await analyze.mutateAsync({ versionId: activeVersionId });
      queryClient.invalidateQueries({
        queryKey: ["resumes", id, "analysis", activeVersionId],
      });
    } catch (err) {
      setBanner({
        tone: "error",
        message: err?.message || "Analysis failed. Please try again.",
      });
    }
  }

  if (resumeLoading || versionLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--color-ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading studio…
      </div>
    );
  }

  const basics = sections.basics || {};

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to={`/resumes/${id}`}
            className="text-sm text-[var(--color-ink-muted)] hover:underline"
          >
            ← Back to resume
          </Link>
          <h1 className="font-display text-xl font-semibold tracking-tight mt-2">
            {resume?.title} · Studio
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Editing {version?.label || "this version"} directly
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </Button>

          <span className="text-xs text-[var(--color-ink-muted)] inline-flex items-center gap-1.5 px-2">
            {saveStatus === "saving" || saveStatus === "pending" ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {saveStatus === "saving" ? "Saving…" : "Unsaved changes"}
              </>
            ) : saveStatus === "error" ? (
              <>
                <CloudOff size={13} className="text-red-500" />
                Save failed
              </>
            ) : saveStatus === "saved" || !dirty ? (
              <>
                <Cloud size={13} />
                All changes saved
              </>
            ) : null}
          </span>

          <Button variant="accent" onClick={handleSave} disabled={!dirty || saveVersion.isPending}>
            {saveVersion.isPending ? <Loader2 size={15} className="animate-spin" /> : "Save now"}
          </Button>
        </div>
      </div>

      <Banner {...banner} onDismiss={() => setBanner(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px] gap-5">
        {/* Pane 1: Editable form */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basics</CardTitle>
            </CardHeader>
            <div className="space-y-2.5">
              <Input
                placeholder="Full name"
                value={basics.name || ""}
                onChange={(e) => update(["basics", "name"], e.target.value)}
              />
              <Input
                placeholder="Title (e.g. Software Engineer)"
                value={basics.title || ""}
                onChange={(e) => update(["basics", "title"], e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  placeholder="Email"
                  value={basics.email || ""}
                  onChange={(e) => update(["basics", "email"], e.target.value)}
                />
                <Input
                  placeholder="Phone"
                  value={basics.phone || ""}
                  onChange={(e) => update(["basics", "phone"], e.target.value)}
                />
              </div>
              <Input
                placeholder="Location"
                value={basics.location || ""}
                onChange={(e) => update(["basics", "location"], e.target.value)}
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <Textarea
              placeholder="A short professional summary…"
              rows={4}
              value={sections.summary || ""}
              onChange={(e) => update(["summary"], e.target.value)}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Skills</CardTitle>
              <CardDescription>Comma-separated</CardDescription>
            </CardHeader>
            <Input
              placeholder="React, Node.js, MongoDB"
              value={(sections.skills || []).join(", ")}
              onChange={(e) =>
                update(
                  ["skills"],
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Experience</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  update(["experience"], [...(sections.experience || []), emptyExperience()])
                }
              >
                <Plus size={13} /> Add
              </Button>
            </CardHeader>
            <div className="space-y-4">
              {(sections.experience || []).map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--color-border)] p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Role"
                      value={exp.role || ""}
                      onChange={(e) => update(["experience", i, "role"], e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          ["experience"],
                          sections.experience.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Input
                    placeholder="Company"
                    value={exp.company || ""}
                    onChange={(e) => update(["experience", i, "company"], e.target.value)}
                  />
                  <Input
                    placeholder="Period (e.g. 2021-Present)"
                    value={exp.period || ""}
                    onChange={(e) => update(["experience", i, "period"], e.target.value)}
                  />
                  <div className="space-y-1.5">
                    {(exp.bullets || []).map((b, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Input
                          placeholder="Bullet point"
                          value={b}
                          onChange={(e) => {
                            const bullets = [...exp.bullets];
                            bullets[j] = e.target.value;
                            update(["experience", i, "bullets"], bullets);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              ["experience", i, "bullets"],
                              exp.bullets.filter((_, idx) => idx !== j)
                            )
                          }
                          className="text-red-500 shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        update(["experience", i, "bullets"], [...(exp.bullets || []), ""])
                      }
                      className="text-xs text-[var(--color-accent-strong)] font-medium"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
              {(sections.experience || []).length === 0 && (
                <p className="text-sm text-[var(--color-ink-muted)] py-2">
                  No experience entries yet.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Education</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  update(["education"], [...(sections.education || []), emptyEducation()])
                }
              >
                <Plus size={13} /> Add
              </Button>
            </CardHeader>
            <div className="space-y-3">
              {(sections.education || []).map((ed, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--color-border)] p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Degree"
                      value={ed.degree || ""}
                      onChange={(e) => update(["education", i, "degree"], e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          ["education"],
                          sections.education.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Input
                    placeholder="School"
                    value={ed.school || ""}
                    onChange={(e) => update(["education", i, "school"], e.target.value)}
                  />
                  <Input
                    placeholder="Period"
                    value={ed.period || ""}
                    onChange={(e) => update(["education", i, "period"], e.target.value)}
                  />
                </div>
              ))}
              {(sections.education || []).length === 0 && (
                <p className="text-sm text-[var(--color-ink-muted)] py-2">
                  No education entries yet.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Pane 2: Live preview */}
        <div className="lg:sticky lg:top-5 h-fit">
          <Card className="!p-0 overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-[var(--color-border)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                Live preview
              </p>
            </div>
            <div className="p-6 font-serif text-[13px] leading-snug bg-white text-neutral-900 min-h-[500px]">
              <p className="text-lg font-bold">{basics.name || "Your Name"}</p>
              {basics.title && <p className="text-indigo-700 text-sm">{basics.title}</p>}
              <p className="text-xs text-neutral-500 mb-3">
                {[basics.email, basics.phone, basics.location].filter(Boolean).join(" · ")}
              </p>

              {sections.summary && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide border-b border-neutral-300 mb-1">
                    Summary
                  </p>
                  <p>{sections.summary}</p>
                </div>
              )}

              {(sections.experience || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide border-b border-neutral-300 mb-1">
                    Experience
                  </p>
                  {sections.experience.map((exp, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-semibold">
                        {[exp.role, exp.company].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-[11px] text-neutral-500">{exp.period}</p>
                      <ul className="list-disc pl-4">
                        {(exp.bullets || []).filter(Boolean).map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {(sections.education || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wide border-b border-neutral-300 mb-1">
                    Education
                  </p>
                  {sections.education.map((ed, i) => (
                    <div key={i} className="mb-1">
                      <p className="font-semibold">{ed.degree}</p>
                      <p className="text-[11px] text-neutral-500">
                        {[ed.school, ed.period].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {(sections.skills || []).length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide border-b border-neutral-300 mb-1">
                    Skills
                  </p>
                  <p>{sections.skills.join(" · ")}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Pane 3: AI panel */}
        <div className="space-y-4 lg:sticky lg:top-5 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Insights</CardTitle>
            </CardHeader>
            {analysis ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-semibold">
                    {analysis.atsScore}
                  </span>
                  <span className="text-sm text-[var(--color-ink-muted)]">/ 100</span>
                </div>
                <div className="space-y-1.5">
                  {(analysis.issues || []).slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge
                        tone={
                          issue.severity === "high"
                            ? "danger"
                            : issue.severity === "medium"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <span className="truncate">{issue.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-muted)]">
                No analysis yet for this version.
              </p>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleAnalyze}
              disabled={analyze.isPending}
            >
              {analyze.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {analysis ? "Re-analyze" : "Run analysis"}
            </Button>
          </Card>

          {dirty && (
            <p className="text-xs text-[var(--color-ink-muted)] px-1">
              Your edits save automatically. Re-analyzing will score whatever was last saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
