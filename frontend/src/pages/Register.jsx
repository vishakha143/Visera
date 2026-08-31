import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, User, Mail, Lock } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthPrimaryButton,
  AuthErrorBanner,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={
        <>
          Your resume,
          <br />
          <em className="italic">intelligently sharpened.</em>
        </>
      }
      subhead="Drop your PDF, get an ATS score, fix what's weak, and land interviews — powered by AI."
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Get started
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-2 text-[15px]">
          Free to start. No credit card required.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-4">
          <AuthField
            label="Full name"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
            placeholder="Ada Lovelace"
            icon={User}
            autoComplete="name"
          />

          <AuthField
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="you@example.com"
            icon={Mail}
            autoComplete="email"
          />

          <AuthField
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            placeholder="At least 8 characters"
            icon={Lock}
            autoComplete="new-password"
            minLength={8}
          />

          <AuthErrorBanner>{error}</AuthErrorBanner>

          <div className="pt-1">
            <AuthPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight size={15} />
                </>
              )}
            </AuthPrimaryButton>
          </div>
        </form>

        <div className="text-sm text-[var(--color-ink-muted)] text-center mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--color-accent-strong)] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>

        <p className="text-[11px] text-[var(--color-ink-muted)]/80 text-center mt-6 leading-relaxed">
          By creating an account you agree to our terms.
          <br />
          We never share your resume data with third parties.
        </p>
      </motion.div>
    </AuthShell>
  );
}