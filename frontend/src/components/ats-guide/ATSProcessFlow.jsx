import { useState } from "react";
import { ChevronDown, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { atsProcessSteps } from "@/data/atsGuideContent";

export function ATSProcessFlow() {
  const [openId, setOpenId] = useState(atsProcessSteps[0].id);

  return (
    <div className="max-w-xl">
      {atsProcessSteps.map((step, i) => {
        const open = openId === step.id;
        return (
          <div key={step.id}>
            <button
              onClick={() => setOpenId(open ? null : step.id)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] text-xs font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="font-medium text-sm">{step.title}</span>
              </span>
              <ChevronDown
                size={16}
                className={cn("text-[var(--color-ink-muted)] transition-transform shrink-0", open && "rotate-180")}
              />
            </button>
            {open && (
              <p className="px-4 pt-2 pb-4 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {step.detail}
              </p>
            )}
            {i < atsProcessSteps.length - 1 && (
              <div className="flex justify-center py-1.5">
                <ArrowDown size={14} className="text-[var(--color-ink-muted)]" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
