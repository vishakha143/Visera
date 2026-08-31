import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function BulletRewrites({ rewrites = [], onApply, isApplying }) {
  const [selected, setSelected] = useState(() =>
    rewrites.map((r) => r._id)
  );

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(rewrites.map((r) => r._id));
  }

  function clearAll() {
    setSelected([]);
  }

  if (rewrites.length === 0) {
    return (
      <Card className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
        No rewrite suggestions available.
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-wrap gap-3">
        <div>
          <CardTitle className="text-base">AI Bullet Rewrites</CardTitle>
          <CardDescription className="mt-1">
            Select the suggestions you want to apply
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select all
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={selected.length === 0 || isApplying}
            onClick={() => onApply?.(selected)}
          >
            {isApplying ? "Applying..." : `Apply ${selected.length} rewrite${selected.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {rewrites.map((rw) => {
          const isSelected = selected.includes(rw._id);
          return (
            <div
              key={rw._id}
              className={`p-4 rounded-2xl border transition-colors ${
                isSelected
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <Badge tone="neutral">{rw.section}</Badge>
                <button
                  onClick={() => toggle(rw._id)}
                  className={`h-6 w-6 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] text-transparent"
                  }`}
                >
                  <Check size={12} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)] mb-1">
                    Original
                  </div>
                  <p className="text-[var(--color-ink-muted)] line-through decoration-[var(--color-ink-muted)]/40">
                    {rw.original}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)] mb-1">
                    Suggested
                  </div>
                  <p className="font-medium text-[var(--color-ink)]">
                    {rw.rewritten}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] pt-1">
                  {rw.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}