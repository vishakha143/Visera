import { CircleCheck, GitBranch, TriangleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGuidelineStatusLabel, getGuidelineStatusDescription } from "@/lib/atsGuide";

const ICONS = {
  recommended: CircleCheck,
  context: GitBranch,
  risk: TriangleAlert,
  informational: Info,
};

// Status is never conveyed by color alone — icon + text label always ship together.
const TONES = {
  recommended: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  context: "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
  risk: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  informational: "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]",
};

export function GuidelineStatus({ status = "informational", showDescription = false, className }) {
  const Icon = ICONS[status] || Info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[status] || TONES.informational,
        className
      )}
      title={getGuidelineStatusDescription(status)}
    >
      <Icon size={12} aria-hidden="true" />
      {getGuidelineStatusLabel(status)}
      {showDescription && (
        <span className="hidden sm:inline text-[11px] font-normal opacity-80">
          — {getGuidelineStatusDescription(status)}
        </span>
      )}
    </span>
  );
}
