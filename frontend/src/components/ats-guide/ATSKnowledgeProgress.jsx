import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { atsGuideTOC } from "@/data/atsGuideContent";
import { calculateGuideProgress } from "@/lib/atsGuide";

// Topics tracked for knowledge progress — excludes the personalized/progress
// sections themselves, since those aren't "concepts" to learn.
const TOPICS = atsGuideTOC.filter((s) => !["why-flagged", "your-knowledge"].includes(s.id));

export function ATSKnowledgeProgress({ visited }) {
  const done = TOPICS.filter((t) => visited.has(t.id)).length;
  const total = TOPICS.length;
  const remaining = total - done;
  const items = Array.from({ length: total }, (_, i) => (i < done ? "done" : "pending"));
  const { label } = calculateGuideProgress(items);

  return (
    <Card className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className="font-display font-semibold text-sm">
            {done} concept{done === 1 ? "" : "s"} understood
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">
            {remaining > 0 ? `${remaining} to go over` : "Guide complete"} · {label}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => {
          const isDone = visited.has(t.id);
          return (
            <span
              key={t.id}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border",
                isDone
                  ? "bg-green-100 text-green-700 border-transparent dark:bg-green-500/15 dark:text-green-400"
                  : "text-[var(--color-ink-muted)] border-[var(--color-border)]"
              )}
            >
              {t.label}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
