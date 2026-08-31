import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function StrengthsList({ strengths = [] }) {
  if (strengths.length === 0) {
    return (
      <Card className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
        No strengths recorded yet.
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">Strengths</CardTitle>
          <CardDescription className="mt-1">
            What’s already working well
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-3">
        {strengths.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <div className="text-sm font-medium">{s.title}</div>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {s.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}