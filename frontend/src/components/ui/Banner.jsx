import { CheckCircle2, XCircle } from "lucide-react";

export function Banner({ tone, message, onDismiss }) {
  if (!message) return null;
  const Icon = tone === "error" ? XCircle : CheckCircle2;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-50 text-red-700"
          : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-xs underline shrink-0">
        Dismiss
      </button>
    </div>
  );
}
