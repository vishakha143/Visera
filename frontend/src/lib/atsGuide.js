import { guidelineStatusMeta, atsGuideTOC, flagToSection } from "@/data/atsGuideContent";

export function getGuidelineStatusLabel(status) {
  return guidelineStatusMeta[status]?.label || "Informational";
}

export function getGuidelineStatusDescription(status) {
  return guidelineStatusMeta[status]?.description || "";
}

// items: array of { status: "done" | "review" | "not-applicable" }
export function calculateGuideProgress(items) {
  const total = items.length;
  const done = items.filter((i) => i === "done").length;
  if (total === 0) return { done: 0, total: 0, fraction: 0, label: "Not started" };

  const fraction = done / total;
  let label = "Not started";
  if (fraction >= 1) label = "Guide complete";
  else if (fraction >= 0.75) label = "Almost done";
  else if (fraction >= 0.4) label = "Halfway there";
  else if (fraction > 0) label = "Getting started";

  return { done, total, fraction, label };
}

export function scrollToGuideSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function getRelatedGuideSection(flagType) {
  return flagToSection[flagType] || null;
}

export function getSectionTitle(id) {
  return atsGuideTOC.find((s) => s.id === id)?.label || id;
}

// Very small substring search across section titles + arbitrary searchable text entries.
export function searchGuideContent(query, entries) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return entries.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      (e.text || "").toLowerCase().includes(q)
  );
}
