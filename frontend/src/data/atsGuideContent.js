// Static educational content for the ATS Guide.
// Kept separate from JSX so it stays easy to edit, search, and link into a TOC.

export const atsGuideTOC = [
  { id: "what-is-ats", label: "What is an ATS?", group: "Understand ATS" },
  { id: "processing", label: "How it works", group: "Understand ATS" },
  { id: "dimensions", label: "What ATS may look for", group: "Understand ATS" },
  { id: "status-system", label: "Recommendation status", group: "Understand ATS" },
  { id: "checklist", label: "ATS checklist", group: "Optimize Your Resume" },
  { id: "resume-length", label: "One page mandatory?", group: "Optimize Your Resume" },
  { id: "fonts", label: "ATS-approved font?", group: "Optimize Your Resume" },
  { id: "keywords", label: "Keywords", group: "Optimize Your Resume" },
  { id: "formatting", label: "Formatting safety", group: "Optimize Your Resume" },
  { id: "section-headings", label: "Section headings", group: "Optimize Your Resume" },
  { id: "file-formats", label: "File formats", group: "Optimize Your Resume" },
  { id: "myths", label: "ATS myths", group: "Optimize Your Resume" },
  { id: "freshers", label: "No internship?", group: "For Freshers" },
  { id: "projects", label: "Projects as evidence", group: "For Freshers" },
  { id: "why-flagged", label: "Why Visera flagged this", group: "Visera" },
  { id: "your-knowledge", label: "Your progress", group: "Visera" },
];

export const atsProcessSteps = [
  {
    id: "submission",
    title: "Resume submitted",
    detail:
      "The resume enters an employer's application workflow, often through a careers page or job board.",
  },
  {
    id: "parsing",
    title: "Document read / parsed",
    detail:
      "The system may attempt to read the document and identify name, contact details, education, experience, skills, projects, dates, job titles, and organizations. How well this works can vary between systems.",
    why: "If key details can't be reliably read, they may not make it into the fields a recruiter searches or filters by — regardless of how strong the actual content is.",
    viseraChecks: "Visera parses your resume the same way and shows you what it was able to extract, so you can see anything that looks off before an employer would.",
  },
  {
    id: "structuring",
    title: "Information organized",
    detail:
      "Recognized content can be mapped into structured fields or kept as searchable text, depending on the platform.",
    why: "Clear structure makes it more likely your experience lands in the right field instead of being lost as unstructured text.",
  },
  {
    id: "matching",
    title: "Search / filtering / matching",
    detail:
      "Depending on the employer's system and workflow, information can be searched, filtered, or compared against job requirements.",
    why: "This is where terminology and completeness matter most — but it's one input among several, not the whole decision.",
    viseraChecks: "Visera compares your resume's terminology against a target job description and shows what's present, partial, or missing — never as a pass/fail verdict.",
  },
  {
    id: "review",
    title: "Recruiter workflow",
    detail:
      "Recruiters and hiring teams review candidates and ultimately make hiring decisions — the ATS supports the workflow, it doesn't replace it.",
    why: "No matter how a resume moves through a system, a human still makes the final call — which is why writing for people still matters.",
  },
];

export const atsDimensions = [
  {
    id: "keywords",
    title: "Keywords",
    status: "context",
    summary:
      "Relevant terminology from a job description can improve discoverability when it truthfully reflects your experience.",
    why: "Some systems and recruiters search or filter by terminology. Matching relevant, truthful terms can make your experience easier to find — but keywords alone don't make a resume strong.",
    viseraChecks: "Compares your resume's terminology against a target job description and shows present / partial / missing.",
  },
  {
    id: "structure",
    title: "Structure",
    status: "recommended",
    summary: "Clear sections with a predictable reading order are easier to parse and easier to skim.",
    why: "Predictable structure reduces ambiguity for both software and human readers.",
    viseraChecks: "Looks for standard section boundaries and a predictable top-to-bottom reading order.",
  },
  {
    id: "formatting",
    title: "Formatting",
    status: "context",
    summary: "Clean, consistent formatting supports readability. Overly complex layouts can create risk.",
    why: "Some layouts (heavy tables, text boxes, multi-column designs) can be read in an unexpected order by certain systems.",
    viseraChecks: "Flags layout patterns that can create parsing ambiguity — never a hard failure, always contextual.",
  },
  {
    id: "skills",
    title: "Skills",
    status: "recommended",
    summary: "A clear, honest skills section helps both parsing and quick human review.",
    why: "Recruiters and systems often look here first for a quick signal of fit.",
  },
  {
    id: "experience",
    title: "Experience",
    status: "context",
    summary: "Experience should be clearly described — professional roles, internships, or substantial projects.",
    why: "Clear, well-described experience gives concrete evidence of what you've actually done.",
  },
  {
    id: "education",
    title: "Education",
    status: "recommended",
    summary: "Clearly labeled education helps both automated review and recruiters confirm baseline qualifications.",
    why: "Education is commonly a required or expected field in many workflows.",
  },
  {
    id: "completeness",
    title: "Completeness",
    status: "informational",
    summary: "Missing contact details or empty sections can make a resume harder to evaluate.",
    why: "A resume that's hard to evaluate quickly is easy to pass over, regardless of the underlying system.",
  },
  {
    id: "relevance",
    title: "Relevance",
    status: "context",
    summary: "How closely your experience aligns with what a specific role is asking for.",
    why: "Relevance depends entirely on the role and company — there's no universal target to hit.",
  },
  {
    id: "readability",
    title: "Readability",
    status: "recommended",
    summary: "Comfortable font sizes, spacing, and hierarchy make a resume easier to read quickly.",
    why: "Both software and humans benefit from a document that's easy to scan.",
  },
  {
    id: "file-format",
    title: "File Format",
    status: "informational",
    summary: "PDF and DOCX are both common. Follow what the employer asks for.",
    why: "Different workflows may prefer different formats — there is no single format that's always correct.",
  },
];

export const guidelineStatusMeta = {
  recommended: {
    label: "Recommended",
    description: "A generally useful practice in most situations.",
  },
  context: {
    label: "Context-dependent",
    description: "Depends on the role, employer, candidate, or situation.",
  },
  risk: {
    label: "Potential risk",
    description: "May create parsing or readability problems in some situations.",
  },
  informational: {
    label: "Informational",
    description: "Educational context, not a direct instruction.",
  },
};

export const atsChecklist = [
  {
    category: "Content",
    items: [
      { id: "content-contact", label: "Contact information is clear.", status: "recommended" },
      { id: "content-skills", label: "Skills are identifiable.", status: "recommended" },
      { id: "content-education", label: "Education is clear.", status: "recommended" },
      { id: "content-projects", label: "Relevant projects are included.", status: "context" },
      { id: "content-experience", label: "Experience is understandable.", status: "recommended" },
      { id: "content-dates", label: "Dates are clear.", status: "recommended" },
      { id: "content-truth", label: "Claims are truthful.", status: "recommended" },
    ],
  },
  {
    category: "Keywords",
    items: [
      { id: "kw-natural", label: "Relevant terminology is represented naturally.", status: "context" },
      { id: "kw-reviewed", label: "Job-specific terminology has been reviewed.", status: "context" },
      { id: "kw-investigated", label: "Missing terms have been investigated.", status: "context" },
      { id: "kw-honest", label: "No unsupported skills have been added.", status: "recommended" },
    ],
  },
  {
    category: "Structure",
    items: [
      { id: "struct-headings", label: "Standard section headings are understandable.", status: "recommended" },
      { id: "struct-separation", label: "Sections are clearly separated.", status: "recommended" },
      { id: "struct-order", label: "Reading order is predictable.", status: "recommended" },
    ],
  },
  {
    category: "Formatting",
    items: [
      { id: "fmt-typography", label: "Typography is readable.", status: "recommended" },
      { id: "fmt-spacing", label: "Spacing is consistent.", status: "recommended" },
      { id: "fmt-hierarchy", label: "Hierarchy is clear.", status: "recommended" },
      { id: "fmt-decorative", label: "Complex decorative layouts are avoided where unnecessary.", status: "risk" },
    ],
  },
  {
    category: "Length",
    items: [
      { id: "len-fits", label: "Resume length fits the candidate and role.", status: "context" },
      { id: "len-filler", label: "No filler.", status: "recommended" },
      { id: "len-pages", label: "Additional pages contain useful information.", status: "context" },
    ],
  },
  {
    category: "Final Check",
    items: [
      { id: "final-links", label: "Links work.", status: "recommended" },
      { id: "final-contact", label: "Contact information is correct.", status: "recommended" },
      { id: "final-export", label: "Exported document looks correct.", status: "recommended" },
      { id: "final-spelling", label: "No obvious spelling/formatting problems.", status: "recommended" },
    ],
  },
];

export const atsMyths = [
  {
    id: "one-page",
    myth: "Every ATS rejects resumes longer than one page.",
    reality: "There is no universal one-page ATS rule. Length should fit the candidate's experience and the role.",
  },
  {
    id: "font",
    myth: "ATS requires a specific font.",
    reality: "There is no universal ATS-approved font. Readability and consistency matter more than any one typeface.",
  },
  {
    id: "internship",
    myth: "You must have an internship.",
    reality:
      "Internships can provide useful experience, but they are not a universal resume requirement. Projects and coursework can also demonstrate ability.",
  },
  {
    id: "every-keyword",
    myth: "Add every keyword from the job description.",
    reality: "Use relevant terminology truthfully. Adding terms you can't support can hurt you in an interview.",
  },
  {
    id: "ugly",
    myth: "ATS-friendly means ugly.",
    reality: "A resume can be professional, readable, structured, and visually clean at the same time.",
  },
  {
    id: "guarantee",
    myth: "A high ATS score guarantees an interview.",
    reality: "No resume score guarantees a hiring outcome. A score is a signal, not a promise.",
  },
];

export const keywordDemoTerms = [
  { id: "react", label: "React", status: "present" },
  { id: "javascript", label: "JavaScript", status: "present" },
  { id: "rest-apis", label: "REST APIs", status: "present" },
  { id: "git", label: "Git", status: "present" },
  { id: "responsive-ui", label: "Responsive UI", status: "present" },
  { id: "typescript", label: "TypeScript", status: "missing" },
];

export const keywordDemoOptions = [
  {
    id: "use",
    label: "I use TypeScript",
    guidance: "Consider adding it accurately to your Skills or a relevant project, in a way you could speak to confidently in an interview.",
  },
  {
    id: "learned",
    label: "I have learned TypeScript",
    guidance: "If appropriate, mention coursework, learning, or a project where you actually used it — only where it's truthful.",
  },
  {
    id: "not-used",
    label: "I have not used TypeScript",
    guidance: "Don't add it merely for ATS matching. A lower keyword match is better than claiming a skill you don't have.",
  },
  {
    id: "unsure",
    label: "I'm not sure",
    guidance: "Investigate the requirement before changing your resume — re-read the job description and consider what it's actually asking for.",
  },
];

export const fresherEvidence = [
  "Projects",
  "Academic work",
  "Open-source contributions",
  "Coursework",
  "Hackathons",
  "Certifications",
  "Technical competitions",
  "Research",
  "Achievements",
];

export const fresherStructure = [
  "Name + Contact",
  "Summary / Objective",
  "Technical Skills",
  "Projects",
  "Education",
  "Certifications / Achievements",
  "Additional Relevant Information",
];

// General resume-structure guidance for experienced candidates — not an ATS
// claim, just standard practice, kept in the same tone as the fresher content.
export const experiencedEvidence = [
  "Professional experience",
  "Quantified achievements",
  "Leadership",
  "Promotions",
  "Certifications",
  "Technical depth",
];

export const experiencedStructure = [
  "Name + Contact",
  "Summary",
  "Professional Experience",
  "Skills",
  "Selected Projects",
  "Education",
  "Certifications",
];

export const projectEvidenceLevels = [
  {
    level: "Weak",
    text: "Made an e-commerce website using React.",
  },
  {
    level: "Better",
    text: "Built a MERN e-commerce platform with product search, cart, authentication, and admin product management.",
  },
  {
    level: "Stronger",
    text: "Built a MERN e-commerce platform using React, Node.js, Express, and MongoDB; implemented product search, authentication, cart workflows, and admin product management.",
  },
];

export const formattingRisks = [
  "Overly complex tables",
  "Excessive text boxes",
  "Image-only information",
  "Decorative graphics replacing text",
  "Unusual reading order",
  "Overly complex multi-column layouts",
  "Inconsistent hierarchy",
  "Extremely small text",
];

export const formattingExplorer = [
  {
    id: "lower-risk",
    label: "Lower-risk pattern",
    status: "recommended",
    traits: ["Clear headings", "Readable text", "Predictable hierarchy", "Consistent alignment"],
    why: "A single-column layout with standard headings reads the same way for a person skimming and a system parsing top to bottom.",
    alternative: null,
  },
  {
    id: "potential-risk",
    label: "Potential-risk pattern",
    status: "risk",
    traits: ["Complicated layout", "Image-based content", "Unusual reading order", "Excessive decorative elements"],
    why: "Multi-column layouts, text inside images, or heavy decoration can be read in an order you didn't intend, or missed entirely by some systems.",
    alternative: "Use a single-column layout with real text, standard headings, and consistent spacing.",
  },
];

export const sectionHeadings = {
  recommended: ["Summary", "Education", "Experience", "Projects", "Skills", "Certifications", "Achievements"],
  lessEffective: ["My Journey", "What I Bring", "My Toolkit", "Where I've Worked", "My Academic Story"],
  example: {
    creative: "Technical Arsenal",
    standard: "Skills",
  },
};

export const fontPreviewOptions = [
  { id: "arial", label: "Arial", family: "Arial, sans-serif" },
  { id: "calibri", label: "Calibri", family: "Calibri, Carlito, sans-serif" },
  { id: "helvetica", label: "Helvetica", family: "Helvetica, Arial, sans-serif" },
  { id: "georgia", label: "Georgia", family: "Georgia, serif" },
  { id: "times", label: "Times New Roman", family: "'Times New Roman', Times, serif" },
];

export const fontPreviewSample = {
  name: "Priya Sharma",
  title: "Frontend Engineer",
  bullet: "Built responsive interfaces used by thousands of visitors, working closely with design and backend teams.",
};

export const fileFormatDecisions = [
  { condition: "Employer specifies PDF", recommendation: "Use PDF" },
  { condition: "Employer specifies DOCX", recommendation: "Use DOCX" },
  { condition: "No format specified", recommendation: "Use a clean, widely supported format" },
];

export const fileFormats = [
  {
    id: "pdf",
    title: "PDF",
    pros: ["Preserves visual layout", "Common for resumes", "Easy for humans to review"],
  },
  {
    id: "docx",
    title: "DOCX",
    pros: ["Editable", "Sometimes explicitly requested", "Common in employer workflows"],
  },
];

export const exportChecklist = [
  "Text can be selected",
  "Headings are visible",
  "Links work",
  "No missing sections",
  "No strange page breaks",
  "Formatting is consistent",
  "File opens correctly",
];

export const guideProgressStates = [
  { min: 0, label: "Not started" },
  { min: 1, label: "Getting started" },
  { min: 0.4, label: "Halfway there", fraction: true },
  { min: 0.75, label: "Almost done", fraction: true },
  { min: 1, label: "Guide complete", fraction: true },
];

// Maps a resume-analysis flag type to the guide section it should link to.
export const flagToSection = {
  missing_keyword: "keywords",
  formatting: "formatting",
  length: "resume-length",
  structure: "section-headings",
  file_format: "file-formats",
};
