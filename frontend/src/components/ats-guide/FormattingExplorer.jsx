import { useState } from "react";
import { Check, TriangleAlert, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formattingExplorer } from "@/data/atsGuideContent";
import { GuidelineStatus } from "./GuidelineStatus";

export function FormattingExplorer() {
  const [openId, setOpenId] = useState(null);
  const Icon = (status) => (status === "recommended" ? Check : TriangleAlert);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {formattingExplorer.map((pattern) => {
        const open = openId === pattern.id;
        const TraitIcon = Icon(pattern.status);
        return (
          <Card key={pattern.id} padding="sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display font-semibold text-sm">{pattern.label}</h3>
              <GuidelineStatus status={pattern.status} />
            </div>

            {pattern.status === "recommended" ? (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 mb-3 space-y-1.5" aria-hidden="true">
                {["SUMMARY", "SKILLS", "PROJECTS"].map((label) => (
                  <div key={label} className="h-5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center px-2">
                    <span className="text-[9px] font-semibold tracking-wide text-[var(--color-ink-muted)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 mb-3 grid grid-cols-2 gap-1.5" aria-hidden="true">
                <div className="h-14 rounded bg-[var(--color-surface)] border border-dashed border-[var(--color-warning)]/50 flex items-center justify-center">
                  <span className="text-[8px] text-[var(--color-ink-muted)] text-center px-1">decorative content</span>
                </div>
                <div className="h-14 rounded bg-[var(--color-surface)] border border-dashed border-[var(--color-warning)]/50 flex items-center justify-center">
                  <span className="text-[8px] text-[var(--color-ink-muted)] text-center px-1">complex reading order</span>
                </div>
              </div>
            )}

            <ul className="text-sm space-y-1.5 mb-3">
              {pattern.traits.map((t) => (
                <li key={t} className="flex items-start gap-2 text-[var(--color-ink-muted)]">
                  <TraitIcon
                    size={13}
                    className={cn(
                      "mt-0.5 shrink-0",
                      pattern.status === "recommended"
                        ? "text-green-600 dark:text-green-400"
                        : "text-[var(--color-warning)]"
                    )}
                  />
                  {t}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setOpenId(open ? null : pattern.id)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-strong)]"
            >
              Why?
              <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <dl className="text-xs space-y-2 mt-2">
                <dd className="text-[var(--color-ink-muted)] leading-relaxed">{pattern.why}</dd>
                {pattern.alternative && (
                  <div>
                    <dt className="font-semibold text-[var(--color-ink)]">Simpler alternative</dt>
                    <dd className="text-[var(--color-ink-muted)] leading-relaxed">{pattern.alternative}</dd>
                  </div>
                )}
              </dl>
            )}
          </Card>
        );
      })}
    </div>
  );
}
