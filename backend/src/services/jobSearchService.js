const env = require("../config/env");
const ApiError = require("../utils/ApiError");

function isConfigured() {
  return !!(env.adzunaAppId && env.adzunaAppKey);
}

// Searches Adzuna's public jobs API. Only real postings are returned; every
// result carries the employer's own apply URL (redirect_url).
async function searchJobs({ query, location, page = 1, perPage = 20 }) {
  if (!isConfigured()) {
    throw ApiError.badRequest(
      "Job search isn't configured on the server yet (missing ADZUNA_APP_ID / ADZUNA_APP_KEY)."
    );
  }

  const params = new URLSearchParams({
    app_id: env.adzunaAppId,
    app_key: env.adzunaAppKey,
    results_per_page: String(perPage),
    what: query,
    "content-type": "application/json",
  });
  if (location) params.set("where", location);

  const url = `https://api.adzuna.com/v1/api/jobs/${env.adzunaCountry}/search/${page}?${params}`;

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch {
    throw ApiError.internal("Couldn't reach the job search provider. Please try again.");
  }
  if (!res.ok) {
    throw ApiError.internal(`Job search provider returned ${res.status}.`);
  }

  const data = await res.json();
  return {
    total: data.count || 0,
    jobs: (data.results || []).map((j) => ({
      id: String(j.id),
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

module.exports = { searchJobs, isConfigured };
