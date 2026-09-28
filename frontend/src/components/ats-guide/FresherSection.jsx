import { ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fresherEvidence, fresherStructure } from "@/data/atsGuideContent";

export function FresherSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Evidence that isn't a job title</h3>
        <div className="flex flex-wrap gap-2">
          {fresherEvidence.map((e) => (
            <span
              key={e}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-2)] text-[var(--color-ink)]"
            >
              {e}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)] leading-relaxed">
          Formal employment is not the only evidence of technical ability. Ordering can vary by
          role — a strong project-heavy fresher might lead with Skills and Projects before
          Education.
        </p>
      </div>

      <Card padding="sm">
        <h3 className="text-sm font-semibold mb-3">A recommended structure</h3>
        <div className="space-y-1">
          {fresherStructure.map((step, i) => (
            <div key={step}>
              <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-2)] text-sm text-center">
                {step}
              </div>
              {i < fresherStructure.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown size={12} className="text-[var(--color-ink-muted)]" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
