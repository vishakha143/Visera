import { Lightbulb } from "lucide-react";

// Full-width inline banner rendered under a section's content — matches the
// approved ATS Guide design (amber callout, not a sidebar card).
export function GuideTakeaway({ title = "Key takeaway", text, action }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl bg-[var(--color-accent-soft)] px-5 py-4">
      <div className="flex items-start gap-2.5">
        <Lightbulb size={15} className="text-[var(--color-accent-strong)] mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-strong)] mb-1">
            {title}
          </p>
          <p className="text-sm leading-relaxed text-[var(--color-ink)]">{text}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
