import { motion, useReducedMotion } from "framer-motion";
import { GuidelineStatus } from "./GuidelineStatus";
import { GuideTakeaway } from "./GuideTakeaway";

// Three-column desktop layout per section: content (this component's children)
// on the left/center, a contextual takeaway card on the right. On mobile the
// takeaway stacks below the content.
export function GuideSection({
  id,
  eyebrow,
  title,
  status,
  summary,
  takeaway,
  takeawayStatus,
  children,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section id={id} className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 py-12 border-b border-[var(--color-border)] last:border-none">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 flex-wrap mb-2">
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
              {eyebrow}
            </span>
          )}
          {status && <GuidelineStatus status={status} />}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
          {title}
        </h2>
        {summary && (
          <p className="text-[var(--color-ink-muted)] leading-relaxed max-w-2xl mb-6">
            {summary}
          </p>
        )}
        <div className="space-y-6">{children}</div>
      </motion.div>

      {takeaway && <GuideTakeaway text={takeaway} status={takeawayStatus} />}
    </section>
  );
}
