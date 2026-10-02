import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { projectEvidenceLevels } from "@/data/atsGuideContent";

const CHECKS = [
  { id: "tech", label: "Tech stack identified", pass: true },
  { id: "outcome", label: "What it does is clear", pass: true },
  { id: "metrics", label: "Impact or metrics", pass: false, note: "Could be a stretch — only add real numbers you can back up." },
];

export function ProjectSelfCheck() {
  const [improved, setImproved] = useState(false);
  const weak = projectEvidenceLevels.find((p) => p.level === "Weak");
  const stronger = projectEvidenceLevels.find((p) => p.level === "Stronger");

  return (
    <Card padding="sm" className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-2">
        Self-check example
      </p>
      <p className="text-sm mb-3">{improved ? stronger.text : weak.text}</p>

      <div className="space-y-1.5 mb-3">
        {CHECKS.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-xs">
            {c.pass || improved ? (
              <Check size={13} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            ) : (
              <TriangleAlert size={13} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
            )}
            <span className="text-[var(--color-ink-muted)]">
              {c.label}
              {!c.pass && !improved && c.note && (
                <span className="block text-[var(--color-warning)] mt-0.5">{c.note}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {!improved && (
        <Button variant="accent" size="sm" onClick={() => setImproved(true)}>
          Improve
        </Button>
      )}
    </Card>
  );
}
