import { useParams, useNavigate, Link } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResumeDocument } from "@/components/export/ResumeDocument";
import { findMockResume } from "@/lib/mockData";

export default function ExportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resume = findMockResume(id);

  if (!resume) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/resumes")}
          className="flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={14} /> All resumes
        </button>
        <Card className="py-16 text-center">
          <h2 className="font-display text-lg font-semibold">Resume not found</h2>
          <Button className="mt-6" onClick={() => navigate("/resumes")}>
            Back to resumes
          </Button>
        </Card>
      </div>
    );
  }

  const version =
    resume.versions.find((v) => v._id === resume.currentVersionId) ||
    resume.versions[resume.versions.length - 1];

  const fileName = `${(resume.title || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`;

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
            {resume.title} · {version?.label}
          </p>
        </div>

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
      </div>

      {/* Preview */}
      <Card className="!p-0 overflow-hidden">
        <CardHeader className="px-5 pt-5">
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            ATS-friendly single-column layout
          </CardDescription>
        </CardHeader>

        <div className="h-[70vh] border-t border-[var(--color-border)]">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <ResumeDocument resume={resume} version={version} />
          </PDFViewer>
        </div>
      </Card>
    </div>
  );
}