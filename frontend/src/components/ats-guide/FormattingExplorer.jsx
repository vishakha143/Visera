import { Card } from "@/components/ui/Card";
import { formattingExplorer } from "@/data/atsGuideContent";
import { GuidelineStatus } from "./GuidelineStatus";

export function FormattingExplorer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {formattingExplorer.map((pattern) => (
        <Card key={pattern.id} padding="sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-display font-semibold text-sm">{pattern.label}</h3>
            <GuidelineStatus status={pattern.status} />
          </div>

          <ul className="text-sm space-y-1 mb-3">
            {pattern.traits.map((t) => (
              <li key={t} className="text-[var(--color-ink-muted)]">
                • {t}
              </li>
            ))}
          </ul>

          <dl className="text-xs space-y-2">
            <div>
              <dt className="font-semibold text-[var(--color-ink)]">Why?</dt>
              <dd className="text-[var(--color-ink-muted)] leading-relaxed">{pattern.why}</dd>
            </div>
            {pattern.alternative && (
              <div>
                <dt className="font-semibold text-[var(--color-ink)]">Simpler alternative</dt>
                <dd className="text-[var(--color-ink-muted)] leading-relaxed">{pattern.alternative}</dd>
              </div>
            )}
          </dl>
        </Card>
      ))}
    </div>
  );
}
