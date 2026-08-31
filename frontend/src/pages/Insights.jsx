import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Trophy,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useInsights } from "@/hooks/useAnalytics";

const SEV_TONE = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

export default function Insights() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useInsights();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-[var(--ink-muted)]">
        <Loader2 className="animate-spin" size={18} />
        Loading insights…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        {error?.message || "Failed to load insights"}
      </div>
    );
  }

  if (!data || data.empty) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Insights
          </h1>
          <p className="text-[var(--color-ink-muted)] mt-1">
            Patterns across all your resumes and analyses.
          </p>
        </div>
        <Card className="py-20 text-center">
          <Sparkles size={28} className="mx-auto mb-3 opacity-40" />
          <h2 className="font-display text-lg font-semibold">No analyses yet</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            Analyze resumes to see insights here.
          </p>
          <Button
            className="mt-6"
            variant="accent"
            onClick={() => navigate("/resumes")}
          >
            Go to Resumes
          </Button>
        </Card>
      </div>
    );
  }

  const trend = (data.scoreTrend || []).map((p, i) => ({
    label: `#${i + 1}`,
    score: p.score,
    resumeTitle: p.resumeTitle,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
          Insights
        </h1>
        <p className="text-[var(--color-ink-muted)] mt-1">
          Patterns across all your resumes and analyses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Kpi
          label="Average ATS Score"
          value={data.averageScore}
          suffix="/ 100"
          icon={TrendingUp}
        />
        <Kpi
          label="Best Score"
          value={data.bestScore?.value}
          suffix="/ 100"
          sub={data.bestScore?.resumeTitle}
          icon={Trophy}
          accent
        />
        <Kpi label="Total Analyses" value={data.totalAnalyses} icon={Sparkles} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Score Trend</CardTitle>
            <CardDescription className="mt-1">
              Every analysis you&apos;ve run, chronologically
            </CardDescription>
          </div>
        </CardHeader>
        <div className="h-[240px]">
          {trend.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)] py-10 text-center">
              No trend data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--color-border)"
                  vertical={false}
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-hover px-3 py-2 text-xs">
                        <div className="text-[var(--color-ink-muted)]">
                          {payload[0].payload.resumeTitle}
                        </div>
                        <div className="font-display tabular text-base font-semibold mt-0.5">
                          {payload[0].value} / 100
                        </div>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                  fill="url(#scoreFill)"
                  dot={{
                    r: 3.5,
                    stroke: "var(--color-accent)",
                    fill: "var(--color-surface)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring Issues</CardTitle>
            <CardDescription>What comes up most often</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {(data.topIssues || []).map((issue, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-ink-muted)] shrink-0">
                  <AlertCircle size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{issue.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge tone={SEV_TONE[issue.severity] || "neutral"}>
                      {issue.severity}
                    </Badge>
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      {issue.count}× across analyses
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most-Missed Keywords</CardTitle>
            <CardDescription>Words ATS expected but didn&apos;t see</CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {(data.topMissingKeywords || []).map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"
              >
                {k.keyword}
                <span className="tabular text-[10px] opacity-70">×{k.count}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Keyword Anchors</CardTitle>
          <CardDescription>Words ATS consistently sees</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {(data.topPresentKeywords || []).map((k, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
            >
              {k.keyword}
              <span className="tabular text-[10px] opacity-70">×{k.count}</span>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Resume</CardTitle>
          <CardDescription>How each resume is performing</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)] border-b border-[var(--color-border)]">
                <th className="px-2 py-2 font-medium">Resume</th>
                <th className="px-2 py-2 font-medium text-right">Latest</th>
                <th className="px-2 py-2 font-medium text-right">Best</th>
                <th className="px-2 py-2 font-medium text-right">Improvement</th>
                <th className="px-2 py-2 font-medium text-right">Analyses</th>
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {(data.resumePerformance || []).map((r) => (
                <tr
                  key={r.resumeId}
                  onClick={() => navigate(`/resumes/${r.resumeId}`)}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors"
                >
                  <td className="px-2 py-3 font-medium truncate max-w-[260px]">
                    {r.title}
                  </td>
                  <td className="px-2 py-3 text-right tabular font-display font-semibold">
                    {r.latestScore}
                  </td>
                  <td className="px-2 py-3 text-right tabular text-[var(--color-ink-muted)]">
                    {r.bestScore}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Badge tone={r.improvement >= 0 ? "success" : "danger"}>
                      {r.improvement >= 0 ? "+" : ""}
                      {r.improvement}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-right tabular text-[var(--color-ink-muted)]">
                    {r.analysesCount}
                  </td>
                  <td className="px-2 py-3 text-[var(--color-ink-muted)]">
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, suffix, sub, icon: Icon, accent }) {
  return (
    <Card
      className={
        accent ? "bg-[var(--color-accent)] text-white border-transparent" : ""
      }
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                accent
                  ? "bg-white/15 text-white"
                  : "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
              }`}
            >
              <Icon size={14} />
            </div>
            <span
              className={`text-xs ${accent ? "text-white/70" : "text-[var(--color-ink-muted)]"}`}
            >
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display tabular text-3xl font-semibold tracking-tight">
              {value ?? "—"}
            </span>
            {suffix && (
              <span
                className={`text-sm ${accent ? "text-white/70" : "text-[var(--color-ink-muted)]"}`}
              >
                {suffix}
              </span>
            )}
          </div>
          {sub && (
            <div
              className={`text-xs truncate ${accent ? "text-white/80" : "text-[var(--color-ink-muted)]"}`}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}