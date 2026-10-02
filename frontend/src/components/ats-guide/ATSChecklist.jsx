import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Minus, PartyPopper } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { atsChecklist } from "@/data/atsGuideContent";

const STORAGE_KEY = "ats_guide_checklist_v1";
const STATES = ["not-set", "done", "review", "not-applicable"];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore — anonymous progress is a convenience, not critical state
  }
}

const STATE_META = {
  done: { icon: Check, label: "Done", tone: "bg-[var(--color-success)] text-white" },
  review: { icon: Minus, label: "Review", tone: "bg-[var(--color-warning)] text-white" },
  "not-applicable": { icon: X, label: "Not applicable", tone: "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]" },
};

export function ATSChecklist({ onProgressChange }) {
  const [state, setState] = useState(() => loadState());
  const reduceMotion = useReducedMotion();

  const allItems = atsChecklist.flatMap((g) => g.items);
  const reviewedCount = allItems.filter((i) => state[i.id] && state[i.id] !== "not-set").length;
  const allReviewed = reviewedCount === allItems.length;

  useEffect(() => {
    onProgressChange?.({ reviewed: reviewedCount, total: allItems.length });
  }, [reviewedCount, allItems.length, onProgressChange]);

  function cycle(id) {
    setState((prev) => {
      const current = prev[id] || "not-set";
      const idx = STATES.indexOf(current);
      const next = STATES[(idx + 1) % STATES.length];
      const updated = { ...prev, [id]: next };
      saveState(updated);
      return updated;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 text-sm">
        <span className="text-[var(--color-ink-muted)]">Guide progress (not an ATS score)</span>
        <span className="font-display font-semibold tabular">
          {reviewedCount} / {allItems.length} reviewed
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {atsChecklist.map((group) => {
          const groupReviewed = group.items.filter(
            (i) => state[i.id] && state[i.id] !== "not-set"
          ).length;
          return (
            <Card key={group.category} padding="sm">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                  {group.category}
                </h3>
                <span className="text-[10px] font-medium text-[var(--color-ink-muted)] tabular">
                  {groupReviewed}/{group.items.length}
                </span>
              </div>
              <div className="h-1 rounded-full bg-[var(--color-surface-2)] overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-[var(--color-accent)]"
                  animate={{ width: `${(groupReviewed / group.items.length) * 100}%` }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
                />
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const itemState = state[item.id] || "not-set";
                  const meta = STATE_META[itemState];
                  return (
                    <button
                      key={item.id}
                      onClick={() => cycle(item.id)}
                      aria-label={`${item.label} — ${meta ? meta.label : "Not set"}. Click to change.`}
                      className="w-full flex items-center gap-2.5 text-left py-1.5 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      <span
                        className={cn(
                          "h-4.5 w-4.5 rounded-md border border-[var(--color-border)] flex items-center justify-center shrink-0",
                          meta ? meta.tone : "bg-transparent",
                          !reduceMotion && "transition-colors duration-200"
                        )}
                        aria-hidden="true"
                      >
                        {meta && <meta.icon size={11} />}
                      </span>
                      <span className="text-xs flex-1 leading-snug">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {allReviewed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            className="mt-5 rounded-2xl bg-[var(--color-accent-soft)] px-5 py-4 flex items-center gap-3 flex-wrap"
          >
            <PartyPopper size={18} className="text-[var(--color-accent-strong)] shrink-0" />
            <p className="text-sm flex-1 min-w-[200px]">
              You've reviewed the major ATS-friendly resume principles.
            </p>
            <Link to="/resumes">
              <Button variant="accent" size="sm">
                Analyze My Resume
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
