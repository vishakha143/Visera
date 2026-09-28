import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { atsDimensions } from "@/data/atsGuideContent";
import { GuidelineStatus } from "./GuidelineStatus";

export function ATSDimensionGrid() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {atsDimensions.map((d) => {
        const open = openId === d.id;
        return (
          <Card key={d.id} padding="sm">
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
            {open && (
              <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">{d.why}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
