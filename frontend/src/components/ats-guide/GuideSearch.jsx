import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { atsGuideTOC, atsDimensions, atsMyths, atsChecklist } from "@/data/atsGuideContent";
import { searchGuideContent, scrollToGuideSection } from "@/lib/atsGuide";

function buildIndex() {
  const entries = atsGuideTOC.map((s) => ({ title: s.label, text: "", sectionId: s.id }));
  atsDimensions.forEach((d) =>
    entries.push({ title: d.title, text: `${d.summary} ${d.why}`, sectionId: "dimensions" })
  );
  atsMyths.forEach((m) =>
    entries.push({ title: m.myth, text: m.reality, sectionId: "myths" })
  );
  atsChecklist.forEach((g) =>
    g.items.forEach((i) => entries.push({ title: i.label, text: g.category, sectionId: "checklist" }))
  );
  return entries;
}

const INDEX = buildIndex();

export function GuideSearch({ onSearch }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchGuideContent(query, INDEX).slice(0, 8), [query]);

  return (
    <div className="relative max-w-md mx-auto">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
        aria-hidden="true"
      />
      <input
        id="ats-guide-search-input"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) onSearch?.();
        }}
        placeholder="Search ATS Guide..."
        aria-label="Search ATS Guide"
        className="w-full h-10 pl-9 pr-3.5 rounded-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      />
      {query.trim() && (
        <div className="absolute mt-2 w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-hover z-20 overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-ink-muted)]">No results</p>
          ) : (
            <>
              <p className="px-4 pt-3 pb-1 text-xs text-[var(--color-ink-muted)]">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    scrollToGuideSection(r.sectionId);
                    setQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-2)] text-sm"
                >
                  <span className="font-medium block">{r.title}</span>
                  {r.text && (
                    <span className="text-xs text-[var(--color-ink-muted)] line-clamp-1">{r.text}</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
