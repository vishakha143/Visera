import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthPrimaryButton,
  AuthErrorBanner,
} from "@/components/auth/AuthShell";
import apiClient from "@/api/client";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Request a new link from Forgot password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={
        <>
          Choose a new
          <br />
          <em className="italic">password.</em>
        </>
      }
      subhead="This link expires in one hour."
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
          Reset password
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-2 text-[15px]">
          Enter a new password for your account.
        </p>

        {done ? (
          <p className="mt-9 text-sm text-[var(--color-ink-muted)]">
            Password updated. Redirecting to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            <AuthField
              label="New password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              icon={Lock}
              autoComplete="new-password"
              minLength={8}
            />
            <AuthField
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
              icon={Lock}
              autoComplete="new-password"
            />
            <AuthErrorBanner>{error}</AuthErrorBanner>
            <AuthPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Update password"
              )}
            </AuthPrimaryButton>
          </form>
        )}
      </motion.div>
    </AuthShell>
  );
}