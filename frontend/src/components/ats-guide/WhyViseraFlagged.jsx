import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { scrollToGuideSection } from "@/lib/atsGuide";

// Bridges education to the user's actual Visera analysis. Content comes
// entirely from the real analysis object — nothing here is invented.
export function WhyViseraFlagged({ loading, failed, hasResume, hasAnalysis, flags, resume }) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 w-40 bg-[var(--color-surface-2)] rounded mb-3" />
        <div className="h-3 w-full bg-[var(--color-surface-2)] rounded mb-2" />
        <div className="h-3 w-2/3 bg-[var(--color-surface-2)] rounded" />
      </Card>
    );
  }

  if (failed) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-ink-muted)]">
          We couldn't load your personalized resume insights. The ATS Guide is still available.
        </p>
      </Card>
    );
  }

  if (!hasResume) {
    return (
      <Card>
        <p className="text-sm font-medium mb-1">Learn first. Analyze when you're ready.</p>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          Upload your resume to see how these principles apply to your document.
        </p>
        <Link to="/resumes">
          <Button variant="accent" size="sm">
            Analyze My Resume
          </Button>
        </Link>
      </Card>
    );
  }

  if (!hasAnalysis) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-ink-muted)]">
          You have a resume, but no analysis yet. Run an analysis to see personalized flags here.
        </p>
        <Link to={`/resumes/${resume._id || resume.id}`}>
          <Button variant="outline" size="sm" className="mt-3">
            Open Resume
          </Button>
        </Link>
      </Card>
    );
  }

  if (flags.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Your latest analysis has no flags mapped to this guide right now — nice work.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {flags.map((flag, i) => (
        <Card key={`${flag.type}-${flag.keyword}-${i}`} padding="sm">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-warning)]/15 text-[var(--color-warning)] flex items-center justify-center shrink-0">
              <AlertTriangle size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Visera flagged: {flag.keyword}
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                {flag.reason}
              </p>
              {flag.type === "missing_keyword" && (
                <p className="text-xs text-[var(--color-ink-muted)] mt-1.5">
                  Should you add it? Only if you genuinely have relevant experience or learning.
                </p>
              )}
              <button
                onClick={() => scrollToGuideSection(flag.guideSection)}
                className="mt-2 text-xs font-medium text-[var(--color-accent-strong)]"
              >
                Learn more →
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
