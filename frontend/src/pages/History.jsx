import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Upload,
  Sparkles,
  PenLine,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, relativeTime } from "@/lib/utils";
import { useHistory } from "@/hooks/useAnalytics";

const FILTERS = [
  { key: "all", label: "All", icon: HistoryIcon },
  { key: "upload", label: "Uploads", icon: Upload },
  { key: "analyze", label: "Analyses", icon: Sparkles },
  { key: "rewrite", label: "Rewrites", icon: PenLine },
];

const ICONS = {
  upload: Upload,
  analyze: Sparkles,
  rewrite: PenLine,
};

const TONES = {
  upload: "neutral",
  analyze: "accent",
  rewrite: "warning",
};

function dayKey(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function History() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useHistory();
  const [filter, setFilter] = useState("all");

  const events = Array.isArray(data?.events) ? data.events : [];
  const totals = data?.totals ?? {
    all: events.length,
    upload: events.filter((e) => e.type === "upload").length,
    analyze: events.filter((e) => e.type === "analyze").length,
    rewrite: events.filter((e) => e.type === "rewrite").length,
  };

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const e of filtered) {
      const key = dayKey(e.at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(e);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading history…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        {error?.message || "Failed to load history"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          History
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Everything you&apos;ve done across your resumes, in time order.
        </p>
      </div>

      <div className="inline-flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] p-1 rounded-full shadow-card">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count = totals[f.key] ?? 0;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-9 px-3.5 text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5",
                isActive
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              <Icon size={13} />
              {f.label}
              <span
                className={cn(
                  "tabular text-[10px] px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-white/15 text-[var(--color-bg)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <Card className="py-16 text-center">
          <HistoryIcon size={28} className="mx-auto mb-3 opacity-40" />
          <h2 className="font-display text-lg font-semibold">No activity yet</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            Upload or analyze a resume to see history here.
          </p>
        </Card>
      ) : (
        <div className="space-y-7">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-[var(--color-ink-muted)]">
                  {day}
                </h3>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-[10px] text-[var(--color-ink-muted)] tabular">
                  {items.length}
                </span>
              </div>

              <Card className="!p-0 overflow-hidden">
                {items.map((e, idx) => {
                  const Icon = ICONS[e.type] || HistoryIcon;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() =>
                        e.resumeId && navigate(`/resumes/${e.resumeId}`)
                      }
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--color-surface-2)] transition-colors",
                        idx > 0 && "border-t border-[var(--color-border)]"
                      )}
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-muted)]">
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {e.title}
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                          {e.subtitle}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge tone={TONES[e.type] || "neutral"}>
                          {e.label}
                        </Badge>
                        <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
                          {relativeTime(e.at)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}