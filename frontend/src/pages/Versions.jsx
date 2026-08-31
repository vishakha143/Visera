import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  FileText,
  PenLine,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn, relativeTime } from "@/lib/utils";
import { useAllVersions } from "@/hooks/useAnalytics";

const FILTERS = [
  { key: "all", label: "All versions" },
  { key: "upload", label: "Uploads" },
  { key: "rewrite", label: "Rewrites" },
];

export default function Versions() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useAllVersions();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const versions = data?.versions || [];
  const totals = data?.totals || { all: 0, uploads: 0, rewrites: 0 };

  const filtered = useMemo(() => {
    let list = versions;
    if (filter === "upload") list = list.filter((x) => x.sourceType === "upload");
    if (filter === "rewrite") list = list.filter((x) => x.sourceType === "rewrite");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (x) =>
          x.resumeTitle?.toLowerCase().includes(q) ||
          x.label?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [versions, filter, query]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading versions…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        {error?.message || "Failed to load versions"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Versions
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Every iteration across every resume, in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="Total versions" value={totals.all} icon={Layers} />
        <StatCard label="Uploads" value={totals.uploads} icon={FileText} />
        <StatCard
          label="Rewrites"
          value={totals.rewrites}
          icon={PenLine}
          accent
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-1 rounded-full shadow-card">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-8 px-3.5 text-xs font-medium rounded-full transition-colors",
                filter === f.key
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-[280px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
          />
          <Input
            className="pl-9"
            placeholder="Search resume or version..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Layers size={28} className="mx-auto mb-3 opacity-40" />
          <h2 className="font-display text-lg font-semibold">No versions match</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            Try a different filter or search term.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => {
            const isUpload = v.sourceType === "upload";
            return (
              <Card
                key={v.id}
                className="flex items-center gap-4 cursor-pointer hover:shadow-hover transition-shadow"
                onClick={() => navigate(`/resumes/${v.resumeId}`)}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                    isUpload
                      ? "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]"
                      : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                  )}
                >
                  {isUpload ? <FileText size={18} /> : <PenLine size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-base font-semibold tabular">
                      {v.label}
                    </span>
                    <span className="text-[var(--color-ink-muted)] text-sm truncate">
                      {v.resumeTitle}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {isUpload ? "Uploaded" : "Rewritten"}{" "}
                    {relativeTime(v.createdAt)}
                  </div>
                </div>

                {v.score != null ? (
                  <div className="text-right shrink-0">
                    <div className="font-display tabular text-xl font-semibold">
                      {v.score}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                      ATS
                    </div>
                  </div>
                ) : (
                  <Badge tone="neutral">No score</Badge>
                )}

                <Badge
                  tone={isUpload ? "neutral" : "accent"}
                  className="capitalize"
                >
                  {v.sourceType}
                </Badge>

                <ChevronRight size={16} className="text-[var(--color-ink-muted)]" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Card
      className={
        accent ? "bg-[var(--color-accent)] text-white border-transparent" : ""
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
            accent
              ? "bg-white/15 text-white"
              : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
          )}
        >
          <Icon size={16} />
        </div>
        <div>
          <div
            className={`text-xs ${accent ? "text-white/70" : "text-[var(--color-ink-muted)]"}`}
          >
            {label}
          </div>
          <div className="font-display tabular text-2xl font-semibold tracking-tight">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}