import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, Sun, Moon, Search } from "lucide-react";
import AILogo from "@/components/layout/AILogo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard-preview" },
  { label: "Pricing", href: "#pricing" },
  { label: "ATS Guide", href: "/ats-guide" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAtsGuide = location.pathname === "/ats-guide";

  function focusGuideSearch() {
    const input = document.getElementById("ats-guide-search-input");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6"
    >
      <div
        style={{ maxWidth: 1240, marginLeft: "auto", marginRight: "auto" }}
        className={cn(
          "rounded-xl md:rounded-full border transition-all duration-300",
          scrolled
            ? "bg-[var(--surface)]/85 border-[var(--border)] backdrop-blur-xl shadow-card"
            : "bg-[var(--surface)]/95 border-transparent backdrop-blur-md",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2">
          <Link to="/" className="flex items-center gap-2.5 pl-1 shrink-0">
            <AILogo />
            <span className="font-display text-[15px] font-semibold tracking-tight text-[var(--ink)] hidden sm:inline">
              VISERA
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0 overflow-hidden">
            {NAV_LINKS.map((l) => {
              const className =
                "px-3.5 py-1.5 rounded-full text-[13px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors whitespace-nowrap";
              return l.href.startsWith("#") ? (
                <a key={l.href} href={l.href} className={className}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} to={l.href} className={className}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isAtsGuide && (
              <button
                type="button"
                onClick={focusGuideSearch}
                aria-label="Search ATS Guide"
                title="Search ATS Guide"
                className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
              >
                <Search size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex h-9 px-4 rounded-full text-[13px] font-medium text-[var(--ink)] hover:bg-[var(--surface-2)] items-center transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-1.5 h-9 pl-4 pr-3.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Get started
              <ArrowRight
                size={13}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--surface-2)]"
              aria-label="Toggle menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="lg:hidden border-t border-[var(--border)] px-3 py-3 space-y-1"
          >
            {NAV_LINKS.map((l) => {
              const className =
                "block px-3 py-2 rounded-xl text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]";
              return l.href.startsWith("#") ? (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={className}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className={className}>
                  {l.label}
                </Link>
              );
            })}
            <Link
              to="/login"
              className="block px-3 py-2 rounded-xl text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-2)]"
            >
              Sign in
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}