import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { atsGuideTOC } from "@/data/atsGuideContent";
import { scrollToGuideSection } from "@/lib/atsGuide";

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.current.observe(el);
    });

    return () => observer.current?.disconnect();
  }, [ids]);

  return active;
}

export function ATSGuideTOC() {
  const ids = atsGuideTOC.map((s) => s.id);
  const active = useActiveSection(ids);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: sticky left rail */}
      <nav
        aria-label="ATS Guide sections"
        className="hidden lg:block sticky top-24 self-start w-56 shrink-0"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-3 px-2">
          Guide
        </p>
        <ul className="space-y-0.5">
          {atsGuideTOC.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => scrollToGuideSection(s.id)}
                aria-current={active === s.id ? "true" : undefined}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                  active === s.id
                    ? "bg-[var(--color-surface-2)] text-[var(--color-ink)] font-medium"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: jump-to-section dropdown */}
      <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-between px-3.5 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium"
        >
          Jump to section
          <ChevronDown size={16} className={cn("transition-transform", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-hover p-1.5">
            {atsGuideTOC.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  scrollToGuideSection(s.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm",
                  active === s.id
                    ? "bg-[var(--color-surface-2)] font-medium"
                    : "text-[var(--color-ink-muted)]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
