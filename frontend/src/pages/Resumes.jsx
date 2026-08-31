import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { UploadDropzone } from "@/components/resume/UploadDropzone";
import { relativeTime } from "@/lib/utils";
import { useResumesList, useDeleteResume } from "@/hooks/useResumes";

export default function Resumes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const del = useDeleteResume();

  const { data: resumes = [], isLoading, isError, error } = useResumesList();

  function handleUploaded(resume) {
    queryClient.invalidateQueries({ queryKey: ["resumes"] });
    navigate(`/resumes/${resume._id}`);
  }

  async function handleDelete(e, resumeId) {
    e.stopPropagation(); // don't open detail
    if (!confirm("Delete this resume and all its versions?")) return;
    try {
      await del.mutateAsync(resumeId);
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Your Resumes
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Upload a new resume or continue where you left off.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload a resume</CardTitle>
              <CardDescription className="mt-1">
                PDF only. We will extract the text and create version V1.
              </CardDescription>
            </CardHeader>
            <UploadDropzone onUploaded={handleUploaded} />
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {isLoading && (
            <Card className="flex items-center justify-center gap-2 py-16 text-[var(--color-ink-muted)]">
              <Loader2 size={18} className="animate-spin" />
              Loading…
            </Card>
          )}

          {isError && (
            <Card className="py-8 px-4 text-sm text-red-600">
              {error?.message || "Failed to load resumes"}
            </Card>
          )}

          {!isLoading && !isError && resumes.length === 0 && (
            <Card className="flex flex-col items-center justify-center text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-ink-muted)] flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold">
                No resumes yet
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] mt-2 max-w-xs">
                Upload your first PDF to get started.
              </p>
            </Card>
          )}

          {!isLoading &&
            resumes.map((resume) => (
              <Card
                key={resume._id}
                className="flex items-center gap-4 cursor-pointer hover:shadow-hover transition-shadow"
                onClick={() => navigate(`/resumes/${resume._id}`)}
              >
                <div className="h-11 w-11 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{resume.title}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {resume.latestVersionNumber || 1} version
                    {(resume.latestVersionNumber || 1) > 1 ? "s" : ""} · Updated{" "}
                    {relativeTime(resume.updatedAt || resume.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, resume._id)}
                  disabled={del.isPending}
                  className="h-9 w-9 rounded-full hover:bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-red-600 shrink-0"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}