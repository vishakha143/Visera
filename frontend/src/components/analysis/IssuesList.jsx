import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SEV_TONE = {
  low: "neutral",
  medium: "warning",
  high: "danger",
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
          <CardTitle className="text-base">Issues Found</CardTitle>
          <CardDescription className="mt-1">
            Things that are hurting your ATS score
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {issues.map((issue, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]"
          >
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{issue.title}</span>
                <Badge tone={SEV_TONE[issue.severity] || "neutral"}>
                  {issue.severity}
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                {issue.fix}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}