import { motion, useReducedMotion } from "framer-motion";
import { GuidelineStatus } from "./GuidelineStatus";
import { GuideTakeaway } from "./GuideTakeaway";

// Single-column section body (matches the approved design): eyebrow + status,
// title, summary, interactive content, then a full-width "Key takeaway"
// banner. Sits inside the page's TOC-rail layout, not a per-section 3-column grid.
export function GuideSection({
  id,
  eyebrow,
  title,
  status,
  summary,
  takeaway,
  children,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className="scroll-mt-28 py-12 border-b border-[var(--color-border)] last:border-none"
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

      {takeaway && (
        <div className="mt-6">
          <GuideTakeaway text={takeaway} />
        </div>
      )}
    </motion.section>
  );
}
