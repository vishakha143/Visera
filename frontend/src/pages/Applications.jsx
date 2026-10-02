import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Loader2,
  Plus,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";
import { useResumesList, useResume } from "@/hooks/useResumes";
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
} from "@/hooks/useApplications";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { relativeTime } from "@/lib/utils";

const COLUMNS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
];

const COLUMN_ACCENT = {
  saved: "border-t-[var(--color-ink-muted)]",
  applied: "border-t-blue-400",
  interviewing: "border-t-amber-400",
  offer: "border-t-green-500",
  rejected: "border-t-red-400",
  withdrawn: "border-t-[var(--color-ink-muted)]",
};

function NewApplicationForm({ onClose, onCreated }) {
  const { data: resumesData } = useResumesList();
  const resumes = Array.isArray(resumesData) ? resumesData : [];

  const [resumeId, setResumeId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resumeId && resumes.length > 0) setResumeId(resumes[0]._id);
  }, [resumes, resumeId]);

  const { data: resumeDetail } = useResume(resumeId);
  const versions = resumeDetail?.versions ?? [];

  useEffect(() => {
    if (versions.length > 0) {
      const current =
        resumeDetail?.resume?.currentVersionId?._id ||
        resumeDetail?.resume?.currentVersionId;
      setVersionId(current || versions[versions.length - 1]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, versions.length]);

  const createApplication = useCreateApplication();

  async function handleSubmit() {
    setError("");
    if (!resumeId || !versionId) {
      setError("Choose a resume version.");
      return;
    }
    if (!jobTitle.trim() || !company.trim()) {
      setError("Job title and company are required.");
      return;
    }
    try {
      await createApplication.mutateAsync({
        resumeId,
        versionId,
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        jobUrl: jobUrl.trim(),
      });
      onCreated();
    } catch (err) {
      setError(err?.message || "Couldn't save this application.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">Track a new application</CardTitle>
          <CardDescription>Starts in "Saved"</CardDescription>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--color-ink-muted)]">
          <X size={16} />
        </button>
      </CardHeader>

      <div className="space-y-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {resumes.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            Upload a resume first before tracking applications.
          </p>
        ) : (
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Input
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <Input
          placeholder="Job posting URL (optional)"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
        />

        <Button
          variant="accent"
          className="w-full"
          onClick={handleSubmit}
          disabled={createApplication.isPending || resumes.length === 0}
        >
          {createApplication.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          Add application
        </Button>
      </div>
    </Card>
  );
}

function ApplicationCard({ app, onDelete }) {
  const updateApplication = useUpdateApplication();
  const [notes, setNotes] = useState(app.notes || "");
  const [expanded, setExpanded] = useState(false);

  function handleStatusChange(status) {
    updateApplication.mutate({ id: app._id, status });
  }

  function handleNotesBlur() {
    if (notes !== (app.notes || "")) {
      updateApplication.mutate({ id: app._id, notes });
    }
  }

  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] border-t-2 ${COLUMN_ACCENT[app.status]} bg-[var(--color-surface)] p-3 space-y-2`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{app.jobTitle}</p>
          <p className="text-xs text-[var(--color-ink-muted)] truncate">{app.company}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(app._id)}
          className="text-[var(--color-ink-muted)] hover:text-red-500 shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={app.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-8 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-xs"
        >
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-accent-strong)]"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      <p className="text-[10px] text-[var(--color-ink-muted)]">
        {app.appliedAt ? `Applied ${relativeTime(app.appliedAt)}` : `Saved ${relativeTime(app.createdAt)}`}
      </p>

      {expanded ? (
        <Textarea
          rows={2}
          placeholder="Notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          className="text-xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-[var(--color-ink-muted)] hover:underline"
        >
          {app.notes ? "Edit notes" : "+ Add notes"}
        </button>
      )}
    </div>
  );
}

export default function Applications() {
  const navigate = useNavigate();
  const { data, isLoading } = useApplications();
  const applications = data?.applications ?? [];
  const counts = data?.counts ?? {};

  const deleteApplication = useDeleteApplication();
  const [showForm, setShowForm] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleDelete(id) {
    try {
      await deleteApplication.mutateAsync(id);
    } catch (err) {
      setBanner({ tone: "error", message: err?.message || "Couldn't delete." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-1">
            Track every job you've applied to and which resume version you sent.
          </p>
        </div>
        <Button variant="accent" onClick={() => setShowForm((v) => !v)}>
          <Plus size={15} />
          Track application
        </Button>
      </div>

      <Banner {...banner} onDismiss={() => setBanner(null)} />

      {showForm && (
        <NewApplicationForm
          onClose={() => setShowForm(false)}
          onCreated={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 p-8 text-[var(--color-ink-muted)]">
          <Loader2 className="animate-spin" size={18} />
          Loading applications…
        </div>
      ) : applications.length === 0 && !showForm ? (
        <Card className="py-16 text-center">
          <Briefcase size={28} className="mx-auto mb-3 opacity-40" />
          <h2 className="font-display text-lg font-semibold">No applications tracked yet</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-sm mx-auto">
            Track jobs you've applied to, see which resume version you sent, and follow their
            status through to an offer.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="accent" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Track application
            </Button>
            <Button variant="outline" onClick={() => navigate("/job-matcher")}>
              Go to Job Matcher
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.key);
            return (
              <div key={col.key} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                    {col.label}
                  </h3>
                  <span className="text-[10px] tabular text-[var(--color-ink-muted)]">
                    {counts[col.key] ?? items.length}
                  </span>
                </div>
                <div className="space-y-2.5 min-h-[60px]">
                  {items.map((app) => (
                    <ApplicationCard key={app._id} app={app} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
