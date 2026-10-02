import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, ExternalLink, MapPin, Briefcase, Check } from "lucide-react";
import { jobsApi } from "@/api/jobs";
import { useCreateApplication } from "@/hooks/useApplications";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";

function toneFor(score) {
  return score >= 70 ? "success" : score >= 45 ? "warning" : "danger";
}

function JobCard({ job, resumeId, versionId, onBanner }) {
  const create = useCreateApplication();
  const [tracked, setTracked] = useState(false);
  const m = job.match;

  async function track() {
    try {
      await create.mutateAsync({
        resumeId,
        versionId,
        jobTitle: job.title.slice(0, 160),
        company: (job.company || "Unknown company").slice(0, 160),
        jobUrl: job.url.slice(0, 500),
      });
      setTracked(true);
      onBanner({ tone: "success", message: `Saved "${job.title}" to Applications.` });
    } catch (err) {
      onBanner({ tone: "error", message: err?.message || "Couldn't save this job." });
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold leading-snug">{job.title}</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {job.company && (
              <span className="inline-flex items-center gap-1">
                <Briefcase size={12} />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {job.location}
              </span>
            )}
          </p>
        </div>
        <Badge tone={toneFor(m.score)}>{m.score}% match</Badge>
      </div>

      <ul className="mt-3 text-xs text-[var(--color-ink-muted)] space-y-1 list-disc pl-4">
        {m.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      {(m.matchedSkills.length > 0 || m.missingSkills.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.matchedSkills.map((s) => (
            <span
              key={`m-${s}`}
              className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
            >
              {s}
            </span>
          ))}
          {m.missingSkills.map((s) => (
            <span
              key={`x-${s}`}
              className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700"
              title="Asked for in the posting, not found in your resume"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {job.url && (
          <a href={job.url} target="_blank" rel="noreferrer noopener">
            <Button variant="accent" size="sm">
              <ExternalLink size={13} /> View &amp; apply
            </Button>
          </a>
        )}
        <Button variant="outline" size="sm" onClick={track} disabled={tracked || create.isPending}>
          {tracked ? (
            <Check size={13} />
          ) : create.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Briefcase size={13} />
          )}
          {tracked ? "Saved" : "Save to Applications"}
        </Button>
      </div>
    </Card>
  );
}

export function JobSearch({ resumeId, versionId }) {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [params, setParams] = useState(null);
  const [banner, setBanner] = useState(null);

  const status = useQuery({ queryKey: ["jobs", "status"], queryFn: jobsApi.status });
  const search = useQuery({
    queryKey: ["jobs", "search", params],
    queryFn: () => jobsApi.search(params),
    enabled: !!params,
    retry: false,
    staleTime: 60_000,
  });

  function submit(e) {
    e.preventDefault();
    if (!resumeId) return setBanner({ tone: "error", message: "Choose a resume first." });
    if (q.trim().length < 2)
      return setBanner({ tone: "error", message: "Enter a job title or skill to search for." });
    setBanner(null);
    setParams({
      resumeId,
      versionId: versionId || undefined,
      q: q.trim(),
      location: location.trim() || undefined,
      remote: remote ? "true" : "false",
    });
  }

  const notConfigured = status.data && !status.data.configured;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Find jobs</CardTitle>
            <CardDescription>Live postings, ranked by how well your resume fits.</CardDescription>
          </div>
        </CardHeader>

        {notConfigured && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 mb-4">
            Job search isn&apos;t switched on for this server yet — an Adzuna API key needs to be added to
            the backend.
          </p>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5">
          <Input
            placeholder="Job title or skill (e.g. React developer)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Input
            placeholder="City (e.g. Kolkata)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={remote}
          />
          <Button type="submit" variant="accent" disabled={search.isFetching || notConfigured}>
            {search.isFetching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </Button>
        </form>
        <label className="mt-3 inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          Remote / work from home
        </label>
      </Card>

      <Banner {...banner} onDismiss={() => setBanner(null)} />

      {search.isError && (
        <Banner
          tone="error"
          message={search.error?.message || "Job search failed. Please try again."}
          onDismiss={() => search.refetch()}
        />
      )}

      {search.isFetching && !search.data && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Loader2 className="animate-spin" size={16} /> Searching…
        </div>
      )}

      {search.data && search.data.jobs.length === 0 && (
        <Card className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
          No postings found for that search. Try a broader title, a different city, or switch on remote.
        </Card>
      )}

      {search.data && search.data.jobs.length > 0 && (
        <>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Showing {search.data.jobs.length} of {search.data.total.toLocaleString()} postings, best match
            first. Match % uses only the skills, role, seniority and location found in the posting compared
            with your resume.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {search.data.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                resumeId={resumeId}
                versionId={search.data.versionId}
                onBanner={setBanner}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
