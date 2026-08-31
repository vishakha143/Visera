import { cn } from "@/lib/utils";

export function Card({ children, className, padding = "md", variant = "default", ...props }) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  const variants = {
    default: "bg-[var(--color-surface)] border border-[var(--color-border)]",
    accent: "bg-[var(--color-accent)] text-white border-transparent",
  };

  return (
    <div
      className={cn(
        "rounded-2xl shadow-card",
        paddings[padding],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn("font-display text-base font-semibold tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn("text-sm text-[var(--color-ink-muted)]", className)}>
      {children}
    </p>
  );
}