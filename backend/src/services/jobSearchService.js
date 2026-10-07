const env = require("../config/env");
const ApiError = require("../utils/ApiError");

// Job sources. Jooble or Adzuna (free keys, broad local coverage incl. India)
// are used when configured. Otherwise we fall back to two public, keyless feeds — Remotive
// and Arbeitnow — so job search works at zero cost out of the box. Every
// result links to the original posting and names its source.

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map();

function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  const value = loader().catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 200) cache.delete(cache.keys().next().value);
  return value;
}

function isConfigured() {
  // Always available: keyless sources back up Adzuna.
  return true;
}

function hasAdzuna() {
  return !!(env.adzunaAppId && env.adzunaAppKey);
}

function sourcesInUse() {
  if (env.joobleApiKey) return ["Jooble"];
  if (hasAdzuna()) return ["Adzuna"];
  return ["Remotive", "Arbeitnow"];
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

async function getJson(url) {
  let res;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json" },
    });
  } catch {
    throw ApiError.internal("Couldn't reach the job search provider. Please try again.");
  }
  if (!res.ok) throw ApiError.internal(`Job search provider returned ${res.status}.`);
  return res.json();
}

/* ------------------------------- Jooble ---------------------------------- */

async function searchJooble({ query, location, page }) {
  let res;
  try {
    res = await fetch(`https://jooble.org/api/${encodeURIComponent(env.joobleApiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keywords: query, location: location || "", page: String(page) }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw ApiError.internal("Couldn't reach the job search provider. Please try again.");
  }
  if (res.status === 403 || res.status === 401) {
    throw ApiError.internal("Job search key was rejected by Jooble. Check JOOBLE_API_KEY.");
  }
  if (!res.ok) throw ApiError.internal(`Job search provider returned ${res.status}.`);

  const data = await res.json();
  return {
    total: data.totalCount || 0,
    jobs: (data.jobs || []).map((j) => ({
      id: `jooble-${j.id}`,
      source: "Jooble",
      title: stripHtml(j.title),
      company: j.company || "",
      location: j.location || "",
      description: stripHtml(`${j.title} ${j.snippet}`),
      url: j.link || "",
      postedAt: j.updated || null,
      salaryMin: null,
      salaryMax: null,
      contractTime: j.type || null,
    })),
  };
}

/* ------------------------------- Adzuna ---------------------------------- */

async function searchAdzuna({ query, location, page, perPage }) {
  const params = new URLSearchParams({
    app_id: env.adzunaAppId,
    app_key: env.adzunaAppKey,
    results_per_page: String(perPage),
    what: query,
    "content-type": "application/json",
  });
  if (location) params.set("where", location);

  const data = await getJson(
    `https://api.adzuna.com/v1/api/jobs/${env.adzunaCountry}/search/${page}?${params}`
  );
  return {
    total: data.count || 0,
    jobs: (data.results || []).map((j) => ({
      id: `adzuna-${j.id}`,
      source: "Adzuna",
      title: j.title || "",
      company: j.company?.display_name || "",
      location: j.location?.display_name || "",
      description: j.description || "",
      url: j.redirect_url || "",
      postedAt: j.created || null,
      salaryMin: j.salary_min ?? null,
      salaryMax: j.salary_max ?? null,
      contractTime: j.contract_time || null,
    })),
  };
}

/* ------------------------------ Keyless feeds ----------------------------- */

async function fetchRemotive(rawQuery) {
  const query = rawQuery.replace(/remote/gi, "").replace(/\s+/g, " ").trim() || rawQuery;
  const data = await cached(`remotive:${query.toLowerCase()}`, () =>
    getJson(`https://remotive.com/api/remote-jobs?${new URLSearchParams({ search: query, limit: "40" })}`)
  );
  return (data.jobs || []).map((j) => ({
    id: `remotive-${j.id}`,
    source: "Remotive",
    title: j.title || "",
    company: j.company_name || "",
    location: `Remote${j.candidate_required_location ? ` · ${j.candidate_required_location}` : ""}`,
    description: stripHtml(`${(j.tags || []).join(" ")} ${j.description}`),
    url: j.url || "",
    postedAt: j.publication_date || null,
    salaryMin: null,
    salaryMax: null,
    contractTime: j.job_type || null,
  }));
}

async function fetchArbeitnow() {
  const pages = await cached("arbeitnow", async () => {
    const out = [];
    for (const p of [1, 2, 3]) {
      const data = await getJson(`https://www.arbeitnow.com/api/job-board-api?page=${p}`);
      out.push(...(data.data || []));
    }
    return out;
  });
  return pages.map((j) => ({
    id: `arbeitnow-${j.slug}`,
    source: "Arbeitnow",
    title: j.title || "",
    company: j.company_name || "",
    location: j.remote ? `Remote${j.location ? ` · ${j.location}` : ""}` : j.location || "",
    description: stripHtml(`${(j.tags || []).join(" ")} ${j.description}`),
    url: j.url || "",
    postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
    salaryMin: null,
    salaryMax: null,
    contractTime: (j.job_types || [])[0] || null,
  }));
}

function matchesQuery(job, terms) {
  const hay = `${job.title} ${job.description}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

async function searchKeyless({ query, location }) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1 && t !== "remote");

  const results = await Promise.allSettled([fetchRemotive(query), fetchArbeitnow()]);
  if (results.every((r) => r.status === "rejected")) {
    throw ApiError.internal("Couldn't reach the job search providers. Please try again.");
  }

  let jobs = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (terms.length) jobs = jobs.filter((j) => matchesQuery(j, terms));
  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc) || /remote/i.test(j.location));
  }

  const seen = new Set();
  jobs = jobs.filter((j) => j.url && !seen.has(j.url) && seen.add(j.url));
  return { total: jobs.length, jobs: jobs.slice(0, 30) };
}

/* --------------------------------- Entry ---------------------------------- */

async function searchJobs({ query, location, page = 1, perPage = 20 }) {
  if (env.joobleApiKey) return searchJooble({ query, location, page });
  if (hasAdzuna()) {
    return searchAdzuna({ query, location, page, perPage });
  }
  return searchKeyless({ query, location });
}

module.exports = { searchJobs, isConfigured, sourcesInUse };
