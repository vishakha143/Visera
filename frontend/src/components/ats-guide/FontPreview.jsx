import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { fontPreviewOptions, fontPreviewSample } from "@/data/atsGuideContent";

export function FontPreview() {
  const [selected, setSelected] = useState(fontPreviewOptions[0].id);
  const active = fontPreviewOptions.find((f) => f.id === selected) || fontPreviewOptions[0];

  return (
    <div className="max-w-xl">
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Preview a font">
        {fontPreviewOptions.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f.id)}
            aria-pressed={selected === f.id}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              selected === f.id
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-transparent"
                : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card padding="sm" style={{ fontFamily: active.family }}>
        <p className="text-sm font-semibold">{fontPreviewSample.name}</p>
        <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
          {fontPreviewSample.title}
        </p>
        <p className="text-sm leading-relaxed">{fontPreviewSample.bullet}</p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <Card padding="sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">
            Readable typography
          </p>
          <p className="text-sm leading-relaxed">
            Built responsive interfaces using React and JavaScript.
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-warning)] mb-2">
            Overly decorative typography
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "cursive", letterSpacing: "0.03em" }}
          >
            Built responsive interfaces using React and JavaScript.
          </p>
        </Card>
      </div>

      <p className="text-xs text-[var(--color-ink-muted)] mt-3">
        There is no universal ATS-approved font. Readability and consistent document structure
        matter more than any single typeface.
      </p>
    </div>
  );
}
