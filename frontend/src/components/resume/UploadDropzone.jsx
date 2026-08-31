import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import apiClient from "@/api/client"; // or { apiClient } — match your export

export function UploadDropzone({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError("");
    if (rejectedFiles.length > 0) {
      setError("Only PDF files are allowed");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file); // must match backend uploadPdf("file")

      const { data } = await apiClient.post("/resumes", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend: { resume, version, meta }
      const resume = data.resume;

      setFile(null);
      if (onUploaded) onUploaded(resume);
    } catch (err) {
      setError(err.message || err?.response?.data?.error?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setError("");
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
        )}
      >
        <input {...getInputProps()} />

        <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] flex items-center justify-center mb-4">
          <UploadCloud size={22} />
        </div>

        {isDragActive ? (
          <p className="text-sm font-medium text-[var(--color-accent-strong)]">
            Drop the PDF here...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium">Drag & drop your resume here</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              or click to browse (PDF only)
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div className="h-9 w-9 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] flex items-center justify-center">
            <FileText size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="text-[var(--color-ink-muted)] hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      {file && (
        <Button
          variant="accent"
          className="w-full"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Resume"
          )}
        </Button>
      )}
    </div>
  );
}