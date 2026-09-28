import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { atsMyths } from "@/data/atsGuideContent";

export function MythCards({ onOpen }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {atsMyths.map((m) => {
        const open = openId === m.id;
        return (
          <Card key={m.id} padding="sm">
            <button
              onClick={() => {
                const next = open ? null : m.id;
                setOpenId(next);
                if (next) onOpen?.(m.id);
              }}
              aria-expanded={open}
              className="w-full text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Myth
                  </span>
                  <p className="text-sm font-medium mt-1">{m.myth}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={cn("text-[var(--color-ink-muted)] shrink-0 transition-transform mt-0.5", open && "rotate-180")}
                />
              </div>
            </button>
            {open && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success)]">
                  Reality
                </span>
                <p className="text-sm mt-1 leading-relaxed text-[var(--color-ink-muted)]">{m.reality}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
