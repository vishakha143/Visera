// Rule-based resume checks that don't need an LLM call — fast, free, and
//100% consistent for the same input. These run alongside Gemini's more
// subjective judgment (bullet quality, clarity, holistic scoring) rather
// than replacing it: anything answerable by counting/matching belongs here,
// anything requiring actual reading comprehension stays with the AI.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const NUMBER_RE = /\d/;

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function issue(title, severity, explanation, fix) {
  return { title, severity, explanation, fix, source: "rule" };
}

function strength(title, evidence) {
  return { title, evidence, source: "rule" };
}

function runDeterministicChecks(rawText, parsedSections) {
  const issues = [];
  const strengths = [];
  const sections = parsedSections || {};
  const basics = sections.basics || {};
  const experience = sections.experience || [];
  const education = sections.education || [];
  const skills = sections.skills || [];
  const words = wordCount(rawText);

  // --- Contact info -----------------------------------------------------
  const hasEmail = EMAIL_RE.test(basics.email || rawText || "");
  const hasPhone = PHONE_RE.test(basics.phone || "");
  const hasLocation = !!(basics.location || "").trim();

  if (!hasEmail) {
    issues.push(
      issue(
        "No valid email address found",
        "high",
        "An ATS and recruiters need a working email to contact you — none was detected in a recognizable format.",
        "Add a standard email address near the top of your resume, outside of any header/footer graphic."
      )
    );
  }
  if (!hasPhone) {
    issues.push(
      issue(
        "No phone number found",
        "medium",
        "No recognizable phone number was detected in your contact section.",
        "Add a phone number in a plain, standard format (e.g. (555) 123-4567)."
      )
    );
  }
  if (hasEmail && hasPhone && hasLocation) {
    strengths.push(
      strength(
        "Complete contact information",
        "Email, phone, and location are all present and machine-readable."
      )
    );
  }

  // --- Section completeness ----------------------------------------------
  if (experience.length === 0) {
    issues.push(
      issue(
        "No work experience listed",
        "high",
        "The parsed resume has no experience entries — ATS systems and recruiters weight this section heavily.",
        "Add your work history with company, role, dates, and bullet points describing your impact."
      )
    );
  }
  if (skills.length === 0) {
    issues.push(
      issue(
        "No dedicated skills section",
        "medium",
        "A distinct skills list helps ATS keyword-matching find your technical/soft skills quickly.",
        "Add a Skills section listing your key tools, languages, and competencies."
      )
    );
  }
  if (experience.length > 0 && education.length > 0 && skills.length > 0) {
    strengths.push(
      strength(
        "All core sections present",
        `Resume includes ${experience.length} experience entr${experience.length === 1 ? "y" : "ies"}, education, and a skills list.`
      )
    );
  }

  // --- Length --------------------------------------------------------------
  if (words > 0 && words < 150) {
    issues.push(
      issue(
        "Resume is very short",
        "medium",
        `At roughly ${words} words, this resume is short enough that it may look sparse to both ATS parsers and recruiters.`,
        "Expand your experience bullets with more specific detail and measurable outcomes."
      )
    );
  } else if (words > 1200) {
    issues.push(
      issue(
        "Resume may be too long",
        "low",
        `At roughly ${words} words, this resume is longer than the 1-2 page range most ATS-friendly resumes target.`,
        "Trim to your most relevant and recent experience — aim for 400-800 words for most roles."
      )
    );
  } else if (words >= 250 && words <= 900) {
    strengths.push(
      strength(
        "Well-scoped length",
        `Roughly ${words} words — within the range that scans well for both ATS parsers and human reviewers.`
      )
    );
  }

  // --- Quantified impact (proxy: bullets containing a digit) --------------
  const allBullets = experience.flatMap((e) => e.bullets || []);
  const quantifiedBullets = allBullets.filter((b) => NUMBER_RE.test(b));

  if (allBullets.length > 0 && quantifiedBullets.length === 0) {
    issues.push(
      issue(
        "No bullets contain measurable numbers",
        "medium",
        "None of your experience bullets include a number, percentage, or metric — quantified impact is one of the strongest signals recruiters look for.",
        "Add concrete numbers where possible: team size, percentage improvement, dollar amount, time saved, or scale."
      )
    );
  } else if (allBullets.length > 0 && quantifiedBullets.length / allBullets.length >= 0.4) {
    strengths.push(
      strength(
        "Good use of quantified impact",
        `${quantifiedBullets.length} of ${allBullets.length} experience bullets include a measurable number or metric.`
      )
    );
  }

  const emptyBulletRoles = experience.filter((e) => !(e.bullets || []).length);
  if (emptyBulletRoles.length > 0) {
    issues.push(
      issue(
        "Experience entries with no bullet points",
        "medium",
        `${emptyBulletRoles.length} experience ${emptyBulletRoles.length === 1 ? "entry has" : "entries have"} no bullet points describing responsibilities or impact.`,
        "Add 2-4 bullet points to every role describing what you did and the outcome."
      )
    );
  }

  return {
    issues,
    strengths,
    stats: {
      wordCount: words,
      hasEmail,
      hasPhone,
      hasLocation,
      experienceCount: experience.length,
      educationCount: education.length,
      skillsCount: skills.length,
      totalBullets: allBullets.length,
      quantifiedBullets: quantifiedBullets.length,
    },
  };
}

module.exports = { runDeterministicChecks };
