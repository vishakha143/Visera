import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { ArrowLeft, Download, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResumeDocument } from "@/components/export/ResumeDocument";
import { useResume } from "@/hooks/useResumes";
import { resumesApi } from "@/api/resumes";

export default function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useResume(id);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [verifyState, setVerifyState] = useState({ status: "idle" }); // idle | running | done | error

  const resume = data?.resume;
  const versions = data?.versions ?? [];

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
      <div className="space-y-6">
        <button
          onClick={() => navigate("/resumes")}
          className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} /> All resumes
        </button>
        <Card className="py-16 text-center">
          <h2 className="font-display text-lg font-semibold">
            {error?.message || "Resume not found"}
          </h2>
          <Button className="mt-6" onClick={() => navigate("/resumes")}>
            Back to resumes
          </Button>
        </Card>
      </div>
    );
  }

  const currentVersionId =
    resume.currentVersionId?._id || resume.currentVersionId || null;

  const version =
    versions.find((v) => v._id === (selectedVersionId || currentVersionId)) ||
    versions[versions.length - 1];

  const fileName = `${(resume.title || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;

  async function handleVerify() {
    if (!version) return;
    setVerifyState({ status: "running" });
    try {
      const blob = await pdf(
        <ResumeDocument resume={resume} version={version} />
      ).toBlob();
      const result = await resumesApi.verifyExport(id, version._id, blob);
      setVerifyState({ status: "done", result });
    } catch (err) {
      setVerifyState({
        status: "error",
        message: err?.response?.data?.message || err.message || "Verification failed",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/resumes/${id}`)}
            className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] mb-2"
          >
            <ArrowLeft size={14} /> Back to resume
          </button>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Export PDF
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            {resume.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <select
              value={version?._id || ""}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
            >
              {versions.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.label}
                </option>
              ))}
            </select>
          )}

          {version && (
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={verifyState.status === "running"}
            >
              {verifyState.status === "running" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ShieldCheck size={15} />
              )}
              Verify ATS Readability
            </Button>
          )}

          {version && (
            <PDFDownloadLink
              document={<ResumeDocument resume={resume} version={version} />}
              fileName={fileName}
            >
              {({ loading }) => (
                <Button variant="accent" disabled={loading}>
                  <Download size={15} />
                  {loading ? "Preparing..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {verifyState.status === "error" && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{verifyState.message}</p>
        </Card>
      )}

      {verifyState.status === "done" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ATS Readability Check</CardTitle>
            <CardDescription>
              We re-extracted text from your exact export the same way an ATS would, and checked
              it against your resume's own data.
            </CardDescription>
          </CardHeader>

          <div className="flex items-center gap-3 mb-4">
            <div
              className={`font-display text-2xl font-semibold ${
                verifyState.result.score >= 90
                  ? "text-green-600"
                  : verifyState.result.score >= 70
                    ? "text-amber-600"
                    : "text-red-600"
              }`}
            >
              {verifyState.result.score}%
            </div>
            <div className="text-sm text-[var(--color-ink-muted)]">
              {verifyState.result.foundCount} / {verifyState.result.totalChecks} fields
              detected in the extracted text
            </div>
          </div>

          {verifyState.result.checks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {verifyState.result.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {c.found ? (
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-500 shrink-0" />
                  )}
                  <span className={c.found ? "" : "text-red-700"}>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {verifyState.result.checks.some((c) => !c.found) && (
            <p className="text-xs text-[var(--color-ink-muted)] mt-4 leading-relaxed">
              Fields marked missing weren't found verbatim in the PDF's extracted text — this can
              happen with unusual formatting or special characters, and may cause an ATS to miss
              that information too.
            </p>
          )}
        </Card>
      )}

      {/* Preview */}
      <Card className="!p-0 overflow-hidden">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            ATS-friendly single-column layout
          </CardDescription>
        </CardHeader>

        {version ? (
          <div className="h-[70vh] border-t border-[var(--color-border)]">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <ResumeDocument resume={resume} version={version} />
            </PDFViewer>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-ink-muted)] py-10 text-center border-t border-[var(--color-border)]">
            No version available to export yet — upload or analyze a resume first.
          </p>
        )}
      </Card>
    </div>
  );
}