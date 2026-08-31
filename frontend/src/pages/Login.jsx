import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthPrimaryButton,
  AuthErrorBanner,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={
        <>
          Sharpen your resume,
          <br />
          <em className="italic">with intelligence.</em>
        </>
      }
      subhead="Score against ATS, fix weak bullets, and ship a stronger version of yourself in minutes."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Welcome back
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-2 text-[15px]">
          Sign in to keep sharpening your resume.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="you@example.com"
            icon={Mail}
          />

          <AuthField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            placeholder="••••••••"
            icon={Lock}
            extra={
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--color-accent-strong)] font-semibold hover:underline"
              >
                Forgot?
              </Link>
            }
          />

          <AuthErrorBanner>{error}</AuthErrorBanner>

          <div className="pt-1">
            <AuthPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </AuthPrimaryButton>
          </div>
        </form>

        <div className="text-sm text-[var(--color-ink-muted)] text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-[var(--color-accent-strong)] font-semibold hover:underline"
          >
            Create one
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
