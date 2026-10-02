import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.6.24 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

export function SocialAuthButtons({ onGoogle, onGithub, disabled }) {
  const [pending, setPending] = useState(null);

  async function handle(kind, fn) {
    setPending(kind);
    try {
      await fn();
    } finally {
      setPending(null);
    }
  }

  const busy = disabled || !!pending;

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        disabled={busy}
        onClick={() => handle("google", onGoogle)}
        className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-ink)] inline-flex items-center justify-center gap-2.5 transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50 disabled:pointer-events-none"
      >
        {pending === "google" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => handle("github", onGithub)}
        className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium text-[var(--color-ink)] inline-flex items-center justify-center gap-2.5 transition-colors hover:bg-[var(--color-surface-2)] disabled:opacity-50 disabled:pointer-events-none"
      >
        {pending === "github" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GithubIcon />
        )}
        Continue with GitHub
      </button>
    </div>
  );
}

export function AuthDivider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 my-6" role="separator">
      <div className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-xs text-[var(--color-ink-muted)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  );
}
