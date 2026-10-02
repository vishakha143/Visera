import { Card } from "@/components/ui/Card";
import { GuidelineStatus } from "./GuidelineStatus";

const ORDER = ["recommended", "context", "risk", "informational"];

export function StatusExplainer() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {ORDER.map((status) => (
        <Card key={status} padding="sm">
          <GuidelineStatus status={status} className="mb-2" />
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {DESCRIPTIONS[status]}
          </p>
        </Card>
      ))}
    </div>
  );
}

const DESCRIPTIONS = {
  recommended: "Generally a good practice.",
  context: "Useful in many situations, but it depends on your target role, employer, or resume.",
  risk: "Could create parsing or readability problems in some systems — worth a second look.",
  informational: "Useful background, but not something you need to act on.",
};
