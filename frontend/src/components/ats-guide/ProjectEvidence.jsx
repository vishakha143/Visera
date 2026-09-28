import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { projectEvidenceLevels } from "@/data/atsGuideContent";

const TONE = {
  Weak: "border-[var(--color-border)]",
  Better: "border-[var(--color-accent)]/40",
  Stronger: "border-[var(--color-success)]/50",
};

export function ProjectEvidence() {
  return (
    <div className="space-y-3">
      {projectEvidenceLevels.map((p) => (
        <Card key={p.level} padding="sm" className={cn("border-l-4", TONE[p.level])}>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
            {p.level}
          </span>
          <p className="text-sm mt-1 leading-relaxed">{p.text}</p>
        </Card>
      ))}
      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed pt-1">
        Don't invent users, revenue, performance percentages, business impact, team size, or
        production scale that the project didn't actually have.
      </p>
    </div>
  );
}
