import { useState } from "react";
import { Sun, Moon, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import apiClient from "@/api/client";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState("profile");

  const [name, setName] = useState(user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    if (!name.trim()) {
      setProfileErr("Name is required");
      return;
    }
    try {
      setProfileLoading(true);
      const { data } = await apiClient.patch("/auth/profile", {
        name: name.trim(),
      });
      const updatedName = data.user?.name || name.trim();
      updateUser({ name: updatedName });
      setProfileMsg("Profile updated");
    } catch (err) {
      setProfileErr(err?.message || "Could not update profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }

    try {
      setPwLoading(true);
      await apiClient.patch("/auth/password", {
        currentPassword,
        newPassword,
      });
      setPwSuccess("Password updated. Please sign in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout?.();
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setPwError(err?.message || "Could not update password");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "appearance", label: "Appearance", icon: Sun },
          { key: "password", label: "Password", icon: Lock },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === item.key
                ? "border-[var(--color-accent)] text-[var(--color-accent-strong)]"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              Your display name appears on the dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 block">
                Full name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 block">
                Email
              </label>
              <Input value={user?.email || ""} disabled />
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1.5">
                Email cannot be changed yet.
              </p>
            </div>
            {profileErr && (
              <p className="text-xs text-red-600">{profileErr}</p>
            )}
            {profileMsg && (
              <p className="text-xs text-green-600">{profileMsg}</p>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tab === "appearance" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose how the app looks.</CardDescription>
          </CardHeader>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition-colors ${
                theme === "light"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-ink-muted)]"
              }`}
            >
              <Sun size={18} className="mb-2" />
              <div className="font-medium text-sm">Light</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Soft and clean
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4 rounded-2xl border-2 text-left transition-colors ${
                theme === "dark"
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-ink-muted)]"
              }`}
            >
              <Moon size={18} className="mb-2" />
              <div className="font-medium text-sm">Dark</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Easy on the eyes
              </div>
            </button>
          </div>
        </Card>
      )}

      {tab === "password" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
            <CardDescription>
              Use your current password to set a new one.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordInput
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
              autoComplete="current-password"
            />
            <PasswordInput
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              setShow={setShowNew}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            {pwSuccess && (
              <p className="text-xs text-green-600">{pwSuccess}</p>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={pwLoading}>
                {pwLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder = "••••••••",
  autoComplete,
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}