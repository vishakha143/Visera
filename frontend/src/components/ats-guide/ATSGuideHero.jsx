import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { scrollToGuideSection } from "@/lib/atsGuide";

export function ATSGuideHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden rounded-[28px] mt-4 px-6 sm:px-10 py-14 sm:py-20 text-center text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-hero) 0%, var(--accent-hero-2) 55%, var(--accent) 100%)",
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm mb-5">
          ATS Guide
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl mx-auto text-balance">
          Understand ATS Before You Optimize Your Resume
        </h1>
        <p className="mt-5 text-white/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          ATS stands for Applicant Tracking System. Learn how resume screening works, what
          actually matters, and how to improve your resume without following outdated ATS myths.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button
            variant="primary"
            size="lg"
            className="bg-white text-[var(--accent-hero)] hover:bg-white/90"
            onClick={() => scrollToGuideSection("what-is-ats")}
          >
            Start Learning
            <ArrowRight size={16} />
          </Button>
          <Link to="/resumes">
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Check My Resume
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-xs text-white/65">
          Practical guidance · Not one-size-fits-all · No hacks or filler
        </p>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-10 mx-auto max-w-xs rounded-2xl bg-[var(--color-surface)] text-[var(--color-ink)] p-4 shadow-hover text-left"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Resume Scan</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-strong)]">
            <Sparkles size={12} />
            Live example
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-[var(--color-accent)] w-4/5" />
          <div className="h-2 rounded-full bg-[var(--color-surface-2)] w-full" />
          <div className="h-2 rounded-full bg-[var(--color-surface-2)] w-3/5" />
        </div>
      </motion.div>
    </section>
  );
}
