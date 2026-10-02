import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { atsDimensions } from "@/data/atsGuideContent";
import { GuidelineStatus } from "./GuidelineStatus";

export function ATSDimensionGrid() {
  const [openId, setOpenId] = useState(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {atsDimensions.map((d) => {
        const open = openId === d.id;
        return (
          <Card
            key={d.id}
            padding="sm"
            className={cn(
              "transition-shadow",
              open && "ring-2 ring-[var(--color-accent)]/40"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-sm">{d.title}</h3>
              <GuidelineStatus status={d.status} />
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{d.summary}</p>
            <button
              onClick={() => setOpenId(open ? null : d.id)}
              aria-expanded={open}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-strong)]"
            >
              Why it matters
              <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">{d.why}</p>
                  {d.viseraChecks && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex gap-1.5">
                      <Sparkles size={12} className="text-[var(--color-accent-strong)] mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        <span className="font-medium text-[var(--color-accent-strong)]">Visera checks: </span>
                        {d.viseraChecks}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
