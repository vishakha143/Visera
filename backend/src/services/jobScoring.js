// Explainable, deterministic resume-vs-job scoring. Every point in the score
// comes from something visible in the job text and the resume — nothing is
// estimated by a model, so the percentage can be justified line by line.

// Tech/skill terms we can reliably detect in postings and resumes.
const SKILLS = [
  "javascript","typescript","react","next.js","angular","vue","node.js","express","nestjs","redux",
  "html","css","sass","tailwind","bootstrap","python","django","flask","fastapi","java","spring",
  "kotlin","swift","c++","c#",".net","php","laravel","ruby","rails","go","golang","rust","sql",
  "mysql","postgresql","mongodb","redis","elasticsearch","graphql","rest","microservices","docker",
  "kubernetes","aws","azure","gcp","terraform","ci/cd","jenkins","git","linux","firebase","react native",
  "flutter","android","ios","machine learning","deep learning","tensorflow","pytorch","nlp","pandas",
  "numpy","data analysis","power bi","tableau","excel","spark","kafka","rabbitmq","selenium","cypress",
  "jest","testing","agile","scrum","jira","figma","ui/ux","seo","salesforce","sap","devops","api",
];

const LEVELS = [
  ["intern", /\b(intern|internship|trainee)\b/i],
  ["fresher", /\b(fresher|entry[- ]level|graduate|junior|jr\.?)\b/i],
  ["senior", /\b(senior|sr\.?|lead|principal|staff|architect|manager)\b/i],
];

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSkills(text) {
  const t = ` ${(text || "").toLowerCase()} `;
  return SKILLS.filter((s) =>
    new RegExp(`(^|[^a-z0-9+#.])${esc(s)}($|[^a-z0-9+#])`, "i").test(t)
  );
}

function levelOf(text) {
  for (const [name, re] of LEVELS) if (re.test(text || "")) return name;
  return null;
}

function tokens(text) {
  return new Set(
    (text || "").toLowerCase().split(/[^a-z0-9+#]+/).filter((w) => w.length > 2)
  );
}

const STOP = new Set(["and","the","for","with","developer","engineer","senior","junior","job"]);

function resumeText(sections, rawText) {
  const s = sections || {};
  const parts = [
    rawText,
    s.summary,
    ...(s.skills || []),
    ...(s.experience || []).flatMap((e) => [e.role, e.company, ...(e.bullets || [])]),
    ...(s.projects || []).flatMap((p) => [p.name, p.description, ...(p.tech || [])]),
  ];
  return parts.filter(Boolean).join(" \n ");
}

function scoreJob(job, { sections, rawText, query, remote, location }) {
  const text = resumeText(sections, rawText);
  const jobText = `${job.title} ${job.description}`;
  const reasons = [];

  // 1) Skills (60 pts): share of the job's detected skills the resume covers.
  const required = findSkills(jobText);
  const have = new Set(findSkills(text));
  const matched = required.filter((s) => have.has(s));
  const missing = required.filter((s) => !have.has(s));
  let skillPts = 0;
  if (required.length) {
    skillPts = (matched.length / required.length) * 60;
    reasons.push(`Matches ${matched.length} of ${required.length} skills mentioned in the posting.`);
  } else {
    skillPts = 30;
    reasons.push("The posting lists no recognisable tech skills, so skills are scored neutrally.");
  }

  // 2) Role fit (25 pts): job title words vs your search + your past job titles.
  const mine = tokens(
    [query, sections?.basics?.title, ...(sections?.experience || []).map((e) => e.role)].join(" ")
  );
  const titleWords = [...tokens(job.title)].filter((w) => !STOP.has(w));
  const hit = titleWords.filter((w) => mine.has(w));
  const rolePts = titleWords.length ? (hit.length / titleWords.length) * 25 : 12;
  if (hit.length) reasons.push(`Job title overlaps with your profile (${hit.join(", ")}).`);
  else reasons.push("Job title doesn't overlap with your search or past roles.");

  // 3) Level (10 pts).
  const jobLevel = levelOf(job.title);
  const myLevel = levelOf([sections?.basics?.title, ...(sections?.experience || []).map((e) => e.role)].join(" "));
  let levelPts = 7;
  if (jobLevel && myLevel) {
    levelPts = jobLevel === myLevel ? 10 : 2;
    reasons.push(jobLevel === myLevel ? `Seniority lines up (${jobLevel}).` : `Seniority differs: job looks ${jobLevel}, your roles look ${myLevel}.`);
  } else if (jobLevel === "senior" && !myLevel) {
    levelPts = 4;
    reasons.push("Job looks senior-level; check you meet the experience asked for.");
  }

  // 4) Location / work mode (5 pts).
  const remoteJob = /\b(remote|work from home|wfh|hybrid)\b/i.test(`${job.title} ${job.description} ${job.location}`);
  let locPts = 3;
  if (remote) {
    locPts = remoteJob ? 5 : 0;
    reasons.push(remoteJob ? "Mentions remote / work-from-home." : "Doesn't mention remote work.");
  } else if (location && job.location.toLowerCase().includes(location.toLowerCase())) {
    locPts = 5;
    reasons.push(`Located in ${job.location}.`);
  }

  const score = Math.max(0, Math.min(100, Math.round(skillPts + rolePts + levelPts + locPts)));
  return { score, matchedSkills: matched, missingSkills: missing, reasons, remote: remoteJob };
}

module.exports = { scoreJob };
