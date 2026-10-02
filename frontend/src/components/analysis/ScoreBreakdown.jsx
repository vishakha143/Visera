import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function ScoreBreakdown({ breakdown = [] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle className="text-base">Score Breakdown</CardTitle>
          <CardDescription className="mt-1">
            How the ATS score was calculated
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {breakdown.map((item) => {
          const max = item.max ?? 100;
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-[var(--color-ink-muted)]">{item.label}</span>
                <span className="font-display font-semibold tabular">
                  {item.value}
                  {item.max ? <span className="text-[var(--color-ink-muted)] font-normal"> / {item.max}</span> : null}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {item.description && (
                <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}