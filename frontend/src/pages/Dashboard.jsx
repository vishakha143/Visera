import { useNavigate } from "react-router-dom";
import {
  Gauge,
  Layers,
  Lightbulb,
  KeyRound,
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading dashboard…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-sm text-red-600">
        {error?.message || "Failed to load dashboard"}
      </div>
    );
  }

  const {
    kpi,
    scoreSeries = [],
    latestResume,
    versionStack = [],
    activity = [],
  } = data;

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Overview
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1">
          Your resume performance at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="ATS Score"
          value={kpi?.atsScore?.value ?? "—"}
          suffix="/ 100"
          delta={kpi?.atsScore?.delta}
          icon={Gauge}
        />
        <KpiCard
          label="Versions"
          value={kpi?.versions?.value ?? "—"}
          icon={Layers}
        />
        <KpiCard
          label="Issues Identified"
          value={kpi?.issuesIdentified?.value ?? "—"}
          delta={kpi?.issuesIdentified?.delta}
          icon={Lightbulb}
        />
        <KpiCard
          label="Keywords Matched"
          value={kpi?.keywordsMatched?.value ?? "—"}
          suffix={
            kpi?.keywordsMatched?.total != null
              ? `/ ${kpi.keywordsMatched.total}`
              : undefined
          }
          delta={kpi?.keywordsMatched?.delta}
          icon={KeyRound}
          accent
        />
      </div>

      {/* Middle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-base">Score Evolution</CardTitle>
              <CardDescription className="mt-1">
                Your ATS score across recent versions
              </CardDescription>
            </div>
          </CardHeader>

          {scoreSeries.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)] py-10 text-center">
              No scores yet — analyze a resume to see trends
            </p>
          ) : (
            <div className="flex items-end gap-3 h-40 pt-4">
              {scoreSeries.map((item) => (
                <div
                  key={item.label + String(item.versionId || "")}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="text-xs font-medium tabular">{item.score}</div>
                  <div
                    className="w-full rounded-t-lg bg-[var(--color-accent)] transition-all"
                    style={{ height: `${Math.max(item.score || 0, 4)}%` }}
                  />
                  <div className="text-[10px] text-[var(--color-ink-muted)]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest Resume</CardTitle>
          </CardHeader>
          {latestResume ? (
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm leading-snug">
                  {latestResume.title}
                </div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-1">
                  {kpi?.atsScore?.value != null
                    ? `Best score: ${kpi.atsScore.value}`
                    : "Not analyzed yet"}
                </div>
              </div>
              <Button
                variant="accent"
                className="w-full"
                onClick={() => navigate(`/resumes/${latestResume._id}`)}
              >
                <FileText size={15} />
                Open resume
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--ink-muted)]">No resumes yet</p>
              <Button
                variant="accent"
                className="w-full"
                onClick={() => navigate("/resumes")}
              >
                <UploadCloud size={15} />
                Upload resume
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Versions</CardTitle>
            <CardDescription>From your latest resume</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {versionStack.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)] py-4">
                No versions yet
              </p>
            ) : (
              versionStack.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-2)] text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={v.sourceType === "rewrite" ? "accent" : "neutral"}
                    >
                      {v.label}
                    </Badge>
                    <span className="text-[var(--color-ink-muted)] capitalize">
                      {v.sourceType || v.title || ""}
                    </span>
                  </div>
                  <span className="font-display font-semibold tabular">
                    {v.score ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)] py-4">
                No activity yet
              </p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-muted)] shrink-0">
                    {item.type === "upload" && <UploadCloud size={14} />}
                    {item.type === "analyze" && <Sparkles size={14} />}
                    {item.type === "rewrite" && <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="text-[10px] text-[var(--color-ink-muted)] shrink-0">
                    {relativeTime(item.at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix, delta, icon: Icon, accent }) {
  return (
    <Card
      className={
        accent ? "bg-[var(--color-accent)] text-white border-transparent" : ""
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`text-xs ${accent ? "text-white/70" : "text-[var(--color-ink-muted)]"}`}
          >
            {label}
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-display text-2xl font-semibold tabular">
              {value}
            </span>
            {suffix && (
              <span
                className={`text-sm ${accent ? "text-white/70" : "text-[var(--color-ink-muted)]"}`}
              >
                {suffix}
              </span>
            )}
          </div>
          {delta != null && (
            <div
              className={`text-xs mt-1 ${
                accent
                  ? "text-white/80"
                  : delta >= 0
                    ? "text-green-600"
                    : "text-red-600"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta} from last
            </div>
          )}
        </div>
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center ${
            accent
              ? "bg-white/15 text-white"
              : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
    </Card>
  );
}