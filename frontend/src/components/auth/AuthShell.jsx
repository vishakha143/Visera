import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthShell({ children, headline, subhead }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side – branding */}
      {/* LEFT PANEL — always dark for contrast */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 lg:p-14"
        style={{
          background:
            "linear-gradient(160deg, #0c0c0b 0%, #18181b 45%, #1c1917 100%)",
          color: "#fafaf9",
        }}
      >
        <div className="text-sm font-medium opacity-70">VISERA</div>

        <div>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-tight text-white">
            Your resume,
            <br />
            <em className="italic text-white/90">intelligently sharpened.</em>
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-md leading-relaxed">
            Drop your PDF, get an ATS score, fix what’s weak, and land
            interviews — powered by AI.
          </p>
        </div>

        <p className="text-xs text-white/40">
          Your data stays private. We never sell resume content.
        </p>
      </div>

      {/* Right side – form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[var(--color-bg)]">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}



export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  extra,
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-[var(--color-ink-muted)]">
          {label}
        </label>
        {extra}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
            Icon ? "pl-10" : "pl-3",
            isPassword ? "pr-10" : "pr-3"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthPrimaryButton({ children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "w-full h-11 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-accent-strong)] disabled:opacity-50 disabled:pointer-events-none",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AuthErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="text-xs text-[var(--color-danger)] bg-red-50 border border-red-100 rounded-xl px-3 py-2">
      {children}
    </div>
  );
}
