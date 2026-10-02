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
// Distinct hues per status (matching Badge.jsx's literal-color convention) so
// "context" and "risk" stay visually distinguishable even though this theme's
// own accent color is also amber.
const TONES = {
  recommended: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  context: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  risk: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
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
