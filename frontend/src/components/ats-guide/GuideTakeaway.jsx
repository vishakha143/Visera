import { Card, CardTitle } from "@/components/ui/Card";
import { GuidelineStatus } from "./GuidelineStatus";

export function GuideTakeaway({ title = "Key takeaway", text, status, action }) {
  if (!text) return null;
  return (
    <Card className="sticky top-24">
      <CardTitle className="text-sm text-[var(--color-ink-muted)] font-medium mb-2">
        {title}
      </CardTitle>
      <p className="text-sm leading-relaxed">{text}</p>
      {status && (
        <div className="mt-3">
          <GuidelineStatus status={status} />
        </div>
      )}
      {action}
    </Card>
  );
}
