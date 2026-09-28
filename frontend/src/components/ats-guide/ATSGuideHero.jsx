import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { scrollToGuideSection } from "@/lib/atsGuide";

const PIPELINE = ["Resume", "Parsing", "Structure", "Keywords", "Relevance", "Human Review"];

export function ATSGuideHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="pt-28 pb-16 text-center">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] mb-5">
          ATS Guide
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto text-balance">
          Understand ATS Before You Optimize Your Resume
        </h1>
        <p className="mt-5 text-[var(--color-ink-muted)] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Learn how resume parsing, keywords, structure, formatting, and relevance can affect
          automated screening — and what Visera actually checks.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link to="/resumes">
            <Button variant="accent" size="lg">
              Analyze My Resume
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => scrollToGuideSection("what-is-ats")}>
            Explore the Guide
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-14 flex items-center justify-center flex-wrap gap-2 max-w-2xl mx-auto"
      >
        {PIPELINE.map((step, i) => (
          <span key={step} className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] shadow-card">
              {step}
            </span>
            {i < PIPELINE.length - 1 && (
              <ArrowRight size={14} className="text-[var(--color-ink-muted)] shrink-0" />
            )}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
