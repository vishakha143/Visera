import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  fresherEvidence,
  fresherStructure,
  experiencedEvidence,
  experiencedStructure,
} from "@/data/atsGuideContent";

const TABS = [
  { id: "fresher", label: "Fresher", evidence: fresherEvidence, structure: fresherStructure },
  { id: "experienced", label: "Experienced", evidence: experiencedEvidence, structure: experiencedStructure },
];

export function FresherSection() {
  const [tabId, setTabId] = useState("fresher");
  const tab = TABS.find((t) => t.id === tabId);

  return (
    <div>
      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-5 flex-wrap text-center">
        <span className="px-4 py-2 rounded-xl bg-[var(--color-surface-2)] text-sm font-semibold">
          No Internship
        </span>
        <span className="text-lg font-bold text-red-600 dark:text-red-400" aria-hidden="true">
          ≠
        </span>
        <span className="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-sm font-semibold">
          No Evidence
        </span>
      </div>

      <div className="rounded-xl bg-red-50 dark:bg-red-500/10 px-4 py-3 mb-5">
        <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
          <span className="font-semibold">Never</span> lower the quality or truthfulness of your
          resume just because you don't have an internship. It's not a penalty — it's one kind of
          evidence among several.
        </p>
      </div>

      <div className="inline-flex items-center gap-1 bg-[var(--color-surface-2)] p-1 rounded-full mb-5" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tabId === t.id}
            onClick={() => setTabId(t.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
              tabId === t.id
                ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">
            {tabId === "fresher" ? "Evidence that isn't a job title" : "What experience actually shows"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tab.evidence.map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-2)] text-[var(--color-ink)]"
              >
                {e}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {tabId === "fresher"
              ? "Formal employment is not the only evidence of technical ability. Ordering can vary by role — a strong project-heavy fresher might lead with Skills and Projects before Education."
              : "With professional experience, that experience becomes your strongest evidence — lead with it, and back it with what you actually did and delivered."}
          </p>
        </div>

        <Card padding="sm">
          <h3 className="text-sm font-semibold mb-3">A recommended structure</h3>
          <div className="space-y-1">
            {tab.structure.map((step, i) => (
              <div key={step}>
                <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-2)] text-sm text-center">
                  {step}
                </div>
                {i < tab.structure.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={12} className="text-[var(--color-ink-muted)]" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
