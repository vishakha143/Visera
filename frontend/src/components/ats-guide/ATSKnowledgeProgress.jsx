import { Card } from "@/components/ui/Card";
import { calculateGuideProgress } from "@/lib/atsGuide";

export function ATSKnowledgeProgress({ done, total }) {
  const items = Array.from({ length: total }, (_, i) => (i < done ? "done" : "pending"));
  const { fraction, label } = calculateGuideProgress(items);

  return (
    <Card className="max-w-md mx-auto text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-2">
        Your ATS Knowledge
      </p>
      <p className="font-display text-xl font-semibold mb-3">{label}</p>
      <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all"
          style={{ width: `${Math.round(fraction * 100)}%` }}
        />
      </div>
      <p className="text-xs text-[var(--color-ink-muted)] tabular">
        {done} / {total} topics explored
      </p>
    </Card>
  );
}
