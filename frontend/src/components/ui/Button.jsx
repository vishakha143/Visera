import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--color-ink)] text-[var(--color-bg)] hover:bg-[var(--color-ink)]/90",
  accent:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)]",
  outline:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]",
  ghost:
    "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-5 text-sm rounded-xl gap-2",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}