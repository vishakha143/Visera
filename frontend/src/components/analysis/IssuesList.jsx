import { AlertCircle, Info, TriangleAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SEV_TONE = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

const SEV_ICON = {
  low: Info,
  medium: AlertCircle,
  high: TriangleAlert,
};

const SEV_ICON_TONE = {
  low: "bg-[var(--color-surface-2)] text-[var(--color-ink-muted)]",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-red-50 text-red-600",
};

export function IssuesList({ issues = [] }) {
  if (issues.length === 0) {
    return (
      <Card className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
        No issues found. Looking good.
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">Worth Reviewing</CardTitle>
          <CardDescription className="mt-1">
            Here's what you can improve
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {issues.map((issue, i) => {
          const Icon = SEV_ICON[issue.severity] || Info;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${SEV_ICON_TONE[issue.severity] || SEV_ICON_TONE.low}`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{issue.title}</span>
                  <Badge tone={SEV_TONE[issue.severity] || "neutral"}>
                    {issue.severity}
                  </Badge>
                  {issue.source === "rule" && (
                    <Badge tone="neutral" title="Detected by a fixed rule, not AI judgment">
                      rule-based
                    </Badge>
                  )}
                </div>
                {issue.explanation && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                    <span className="font-medium text-[var(--color-ink)]">Why: </span>
                    {issue.explanation}
                  </p>
                )}
                {issue.fix && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                    <span className="font-medium text-[var(--color-ink)]">What you can do: </span>
                    {issue.fix}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
