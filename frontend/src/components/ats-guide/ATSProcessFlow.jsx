import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { atsProcessSteps } from "@/data/atsGuideContent";

export function ATSProcessFlow() {
  const [activeId, setActiveId] = useState(atsProcessSteps[0].id);
  const active = atsProcessSteps.find((s) => s.id === activeId);
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {atsProcessSteps.map((step, i) => (
          <span key={step.id} className="flex items-center gap-2">
            <button
              onClick={() => setActiveId(step.id)}
              aria-pressed={activeId === step.id}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors",
                activeId === step.id
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-transparent"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0",
                  activeId === step.id
                    ? "bg-[var(--color-bg)] text-[var(--color-ink)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]"
                )}
              >
                {i + 1}
              </span>
              {step.title}
            </button>
            {i < atsProcessSteps.length - 1 && (
              <ArrowRight size={14} className="text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
            )}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Card padding="sm" className="mt-4 max-w-xl">
              <p className="text-sm font-medium mb-1">{active.title}</p>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{active.detail}</p>

              {active.why && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-1">
                    Why it matters
                  </p>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{active.why}</p>
                </div>
              )}

              {active.viseraChecks && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex gap-2">
                  <Sparkles size={14} className="text-[var(--color-accent-strong)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-strong)] mb-1">
                      What Visera checks
                    </p>
                    <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                      {active.viseraChecks}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
