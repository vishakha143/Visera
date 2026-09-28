import { useEffect, useState } from "react";
import { Check, X, Minus } from "lucide-react";
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

  const allItems = atsChecklist.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => state[i.id] === "done").length;

  useEffect(() => {
    onProgressChange?.({ done: doneCount, total: allItems.length });
  }, [doneCount, allItems.length, onProgressChange]);

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
          {doneCount} / {allItems.length} reviewed
        </span>
      </div>

      <div className="space-y-6">
        {atsChecklist.map((group) => (
          <div key={group.category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-2.5">
              {group.category}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const itemState = state[item.id] || "not-set";
                const meta = STATE_META[itemState];
                return (
                  <button
                    key={item.id}
                    onClick={() => cycle(item.id)}
                    className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-md border border-[var(--color-border)] flex items-center justify-center shrink-0",
                        meta ? meta.tone : "bg-transparent"
                      )}
                      aria-hidden="true"
                    >
                      {meta && <meta.icon size={12} />}
                    </span>
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-xs text-[var(--color-ink-muted)] shrink-0">
                      {meta ? meta.label : "Not set"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
