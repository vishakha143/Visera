import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { atsMyths } from "@/data/atsGuideContent";

export function MythCards({ onOpen }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]">
      {atsMyths.map((m) => {
        const open = openId === m.id;
        return (
          <div key={m.id} className="bg-[var(--color-surface)]">
            <button
              onClick={() => {
                const next = open ? null : m.id;
                setOpenId(next);
                if (next) onOpen?.(m.id);
              }}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <span className="text-sm font-medium">"{m.myth}"</span>
              <ChevronDown
                size={16}
                className={cn("text-[var(--color-ink-muted)] shrink-0 transition-transform", open && "rotate-180")}
              />
            </button>
            {open && (
              <div className="px-4 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                  Reality
                </span>
                <p className="text-sm mt-1 leading-relaxed text-[var(--color-ink-muted)]">{m.reality}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
