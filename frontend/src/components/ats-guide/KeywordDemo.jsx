import { useState } from "react";
import { Check, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  keywordDemoJobDescription,
  keywordDemoResume,
  keywordDemoTerms,
  keywordDemoOptions,
} from "@/data/atsGuideContent";

export function KeywordDemo({ onInteract }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [answer, setAnswer] = useState(null);

  const missingTerm = keywordDemoTerms.find((t) => t.status === "missing");

  function selectMissing() {
    setSelectedTerm(missingTerm.id);
    setAnswer(null);
    onInteract?.();
  }

  const guidance = answer ? keywordDemoOptions.find((o) => o.id === answer)?.guidance : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card padding="sm">
        <CardTitle className="text-sm mb-3">Job Description</CardTitle>
        <pre className="text-xs whitespace-pre-wrap font-sans text-[var(--color-ink-muted)] leading-relaxed">
          {keywordDemoJobDescription}
        </pre>
      </Card>
      <Card padding="sm">
        <CardTitle className="text-sm mb-3">Example Resume</CardTitle>
        <pre className="text-xs whitespace-pre-wrap font-sans text-[var(--color-ink-muted)] leading-relaxed">
          {keywordDemoResume}
        </pre>
      </Card>

      <Card padding="sm" className="md:col-span-2">
        <CardTitle className="text-sm mb-3">Terminology Match</CardTitle>
        <ul className="space-y-1.5">
          {keywordDemoTerms.map((t) => (
            <li key={t.id}>
              <button
                onClick={t.status === "missing" ? selectMissing : undefined}
                disabled={t.status !== "missing"}
                className={cn(
                  "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm",
                  t.status === "missing"
                    ? "bg-[var(--color-surface-2)] hover:opacity-80 cursor-pointer"
                    : "bg-transparent"
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    t.status === "present" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
                  )}
                >
                  {t.status === "present" ? <Check size={13} /> : <X size={13} />}
                  {t.status === "present" ? "Present" : "Missing"}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {selectedTerm && (
          <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
            <p className="text-sm font-medium mb-3">
              {missingTerm.label} is missing from the resume. Do you genuinely have this skill?
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {keywordDemoOptions.map((opt) => (
                <Button
                  key={opt.id}
                  size="sm"
                  variant={answer === opt.id ? "accent" : "outline"}
                  onClick={() => {
                    setAnswer(opt.id);
                    onInteract?.();
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            {guidance && (
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed bg-[var(--color-surface-2)] rounded-xl p-3.5">
                {guidance}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
