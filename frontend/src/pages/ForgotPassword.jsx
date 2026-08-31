import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthPrimaryButton,
  AuthErrorBanner,
} from "@/components/auth/AuthShell";
import apiClient from "@/api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      // Still show success-style message to avoid email enumeration,
      // or show err.message if you prefer:
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={
        <>
          Reset access,
          <br />
          <em className="italic">securely.</em>
        </>
      }
      subhead="We’ll email you a link to set a new password."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] mb-6"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Forgot password
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-2 text-[15px]">
          Enter the email on your account.
        </p>

        {sent ? (
          <div className="mt-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-ink-muted)]">
            If an account exists for <strong>{email}</strong>, you will receive
            reset instructions shortly. Check spam if needed.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={Mail}
            />
            <AuthErrorBanner>{error}</AuthErrorBanner>
            <AuthPrimaryButton type="submit" disabled={loading || !email.trim()}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </AuthPrimaryButton>
          </form>
        )}
      </motion.div>
    </AuthShell>
  );
}