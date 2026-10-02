import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function KeywordChips({ present = [], missing = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keywords Present</CardTitle>
          <CardDescription>Found in your resume</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {present.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">None detected</p>
          ) : (
            present.map((k) => (
              <span
                key={k}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
              >
                {k}
              </span>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Not Detected in Your Resume</CardTitle>
          <CardDescription>Present in the target job description</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2 mb-3">
          {missing.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">Nothing missing</p>
          ) : (
            missing.map((k) => (
              <span
                key={k}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
              >
                {k}
              </span>
            ))
          )}
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            Only add a term if it genuinely reflects your skills or experience — a lower keyword
            match is better than claiming something you don't have.
          </p>
        )}
      </Card>
    </div>
  );
}
