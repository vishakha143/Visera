import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useAtsGuideContext } from "@/hooks/useAtsGuideContext";
import { atsChecklist } from "@/data/atsGuideContent";
import { scrollToGuideSection } from "@/lib/atsGuide";

import { ATSGuideHero } from "@/components/ats-guide/ATSGuideHero";
import { ATSGuideTOC } from "@/components/ats-guide/ATSGuideTOC";
import { GuideSection } from "@/components/ats-guide/GuideSection";
import { GuideSearch } from "@/components/ats-guide/GuideSearch";
import { ATSProcessFlow } from "@/components/ats-guide/ATSProcessFlow";
import { ATSDimensionGrid } from "@/components/ats-guide/ATSDimensionGrid";
import { ATSChecklist } from "@/components/ats-guide/ATSChecklist";
import { KeywordDemo } from "@/components/ats-guide/KeywordDemo";
import { FresherSection } from "@/components/ats-guide/FresherSection";
import { ProjectEvidence } from "@/components/ats-guide/ProjectEvidence";
import { FormattingExplorer } from "@/components/ats-guide/FormattingExplorer";
import { MythCards } from "@/components/ats-guide/MythCards";
import { WhyViseraFlagged } from "@/components/ats-guide/WhyViseraFlagged";
import { ATSKnowledgeProgress } from "@/components/ats-guide/ATSKnowledgeProgress";

import {
  sectionHeadings,
  fileFormats,
  exportChecklist,
} from "@/data/atsGuideContent";

const PAGE_TITLE = "ATS Guide — Understand Resume Screening | Visera";
const PAGE_DESCRIPTION =
  "Understand how ATS resume parsing, keywords, structure, formatting and relevance work, with practical guidance from Visera.";

function upsertMetaTag(selector, createEl) {
  let el = document.querySelector(selector);
  const created = !el;
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  return { el, created };
}

function useSeo() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    const canonicalUrl = `${window.location.origin}/ats-guide`;

    const tags = [
      upsertMetaTag('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.name = "description";
        return m;
      }),
      upsertMetaTag('meta[property="og:title"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:title");
        return m;
      }),
      upsertMetaTag('meta[property="og:description"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:description");
        return m;
      }),
      upsertMetaTag('meta[property="og:type"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:type");
        return m;
      }),
      upsertMetaTag('link[rel="canonical"]', () => {
        const l = document.createElement("link");
        l.rel = "canonical";
        return l;
      }),
    ];

    const prevValues = tags.map(({ el }) =>
      el.tagName === "LINK" ? el.href : el.content
    );

    const [descTag, ogTitleTag, ogDescTag, ogTypeTag, canonicalTag] = tags;
    descTag.el.content = PAGE_DESCRIPTION;
    ogTitleTag.el.content = PAGE_TITLE;
    ogDescTag.el.content = PAGE_DESCRIPTION;
    ogTypeTag.el.content = "website";
    canonicalTag.el.href = canonicalUrl;

    return () => {
      document.title = prevTitle;
      tags.forEach(({ el, created }, i) => {
        if (created) {
          el.remove();
        } else if (el.tagName === "LINK") {
          el.href = prevValues[i];
        } else {
          el.content = prevValues[i];
        }
      });
    };
  }, []);
}

export default function ATSGuide() {
  useSeo();
  const { isAuthenticated } = useAuth();
  const ctx = useAtsGuideContext();

  const totalChecklistItems = atsChecklist.flatMap((g) => g.items).length;
  const [checklistProgress, setChecklistProgress] = useState({ done: 0, total: totalChecklistItems });
  const [exploredSections, setExploredSections] = useState(() => new Set());

  const markExplored = useCallback((id) => {
    setExploredSections((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Knowledge progress = checklist completion + distinct interactive demos touched.
  const knowledgeTotal = totalChecklistItems + 2; // keyword demo + at least one myth opened
  const knowledgeDone = checklistProgress.done + exploredSections.size;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      <Navbar />

      <main className="pt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ATSGuideHero />

          <div className="mb-8">
            <GuideSearch />
          </div>

          {isAuthenticated && (
            <section className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)] mb-3">
                Based on your latest resume
              </p>
              <WhyViseraFlagged
                loading={ctx.loading}
                failed={ctx.failed}
                hasResume={ctx.hasResume}
                hasAnalysis={ctx.hasAnalysis}
                flags={ctx.flags}
                resume={ctx.resume}
              />
            </section>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-10">
          <ATSGuideTOC />

          <div className="flex-1 min-w-0">
            <GuideSection
              id="what-is-ats"
              eyebrow="Foundations"
              title="What Is an ATS?"
              status="informational"
              takeaway="Different employers use different systems — there's no single universal ATS algorithm."
              takeawayStatus="informational"
            >
              <p className="text-sm leading-relaxed max-w-2xl">
                An Applicant Tracking System (ATS) is software employers can use to collect,
                organize, search, filter, and manage job applications. Depending on the system and
                workflow, resume information may be parsed into structured fields and used
                alongside job requirements and recruiter workflows.
              </p>
              <p className="text-sm leading-relaxed max-w-2xl text-[var(--color-ink-muted)]">
                Not every company uses an ATS, not every ATS scores resumes the same way, and no
                ATS automatically rejects every resume that doesn't match perfectly. Implementations differ.
              </p>
            </GuideSection>

            <GuideSection
              id="processing"
              eyebrow="Foundations"
              title="How ATS Processing Works"
              takeaway="Recruiters make the final call — an ATS supports the workflow, it doesn't replace human review."
              takeawayStatus="informational"
            >
              <ATSProcessFlow />
            </GuideSection>

            <GuideSection
              id="dimensions"
              eyebrow="Foundations"
              title="ATS Is More Than Keywords"
              takeaway="Every dimension matters differently depending on the employer's system — none of these carry equal weight everywhere."
              takeawayStatus="context"
            >
              <ATSDimensionGrid />
            </GuideSection>

            <GuideSection
              id="checklist"
              eyebrow="Interactive"
              title="Interactive ATS Checklist"
              takeaway="This tracks guide/checklist progress, never an ATS score."
              takeawayStatus="informational"
            >
              <ATSChecklist onProgressChange={setChecklistProgress} />
            </GuideSection>

            <GuideSection
              id="resume-length"
              eyebrow="Common question"
              title="Is a One-Page Resume Mandatory?"
              status="context"
              summary="No. There is no universal ATS rule that every resume must be one page."
              takeaway="One page is a practical recommendation for many early-career resumes, not a universal ATS law."
              takeawayStatus="context"
            >
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                <Card padding="sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success)] mb-2">
                    Useful one-page resume
                  </p>
                  <ul className="text-sm space-y-1 text-[var(--color-ink-muted)]">
                    <li>• Concise bullets</li>
                    <li>• Relevant projects</li>
                    <li>• Readable spacing</li>
                    <li>• Strong hierarchy</li>
                  </ul>
                </Card>
                <Card padding="sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-warning)] mb-2">
                    Over-compressed one-page resume
                  </p>
                  <ul className="text-sm space-y-1 text-[var(--color-ink-muted)]">
                    <li>• Tiny fonts</li>
                    <li>• Tiny margins</li>
                    <li>• Dense paragraphs</li>
                    <li>• Unreadable sections</li>
                  </ul>
                </Card>
              </div>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
                Experienced candidates may reasonably need more space — but a second page should
                contain meaningful information, not filler.
              </p>
            </GuideSection>

            <GuideSection
              id="fonts"
              eyebrow="Common question"
              title="Is There an ATS-Approved Font?"
              status="informational"
              summary="There is no single universal ATS-approved font."
              takeaway="Readability, consistency, and hierarchy matter more than any specific typeface."
              takeawayStatus="informational"
            >
              <p className="text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
                Common professional fonts are often a safe, practical choice because they're
                readable and widely supported — not because any single font is required.
              </p>
            </GuideSection>

            <GuideSection
              id="keywords"
              eyebrow="Keywords"
              title="Keywords: What Should I Actually Add?"
              status="context"
              summary="Job-description keywords may include technologies, tools, methodologies, job titles, domain terms, certifications, responsibilities, and qualifications."
              takeaway="Do not add a keyword merely because Visera detected it."
              takeawayStatus="context"
            >
              <KeywordDemo onInteract={() => markExplored("keyword-demo")} />
            </GuideSection>

            <GuideSection
              id="freshers"
              eyebrow="For freshers"
              title="No Internship? Your Resume Can Still Show Relevant Experience."
              takeaway="Internships are not mandatory. Projects, coursework, and achievements are legitimate evidence."
              takeawayStatus="informational"
            >
              <FresherSection />
            </GuideSection>

            <GuideSection
              id="projects"
              eyebrow="For freshers"
              title="Projects as Evidence"
              summary="A project is not professional employment, but a well-described project can provide concrete evidence that you've used technologies to build something."
              takeaway="Describe what you actually built — don't invent users, revenue, or team size."
              takeawayStatus="recommended"
            >
              <ProjectEvidence />

              <Card variant="accent" className="max-w-lg">
                <p className="font-display font-semibold text-sm mb-1">
                  ATS Optimization + Truth = Useful Resume
                </p>
                <p className="text-sm opacity-90 leading-relaxed">
                  A lower keyword match is better than claiming a skill you do not have.
                </p>
              </Card>
            </GuideSection>

            <GuideSection
              id="formatting"
              eyebrow="Formatting"
              title="Formatting Safety"
              summary="Formatting should optimize for readability, predictable structure, clean extraction, and human review."
              takeaway="These are potential risks, not guaranteed ATS failures."
              takeawayStatus="risk"
            >
              <FormattingExplorer />
            </GuideSection>

            <GuideSection
              id="section-headings"
              eyebrow="Structure"
              title="Section Headings"
              status="recommended"
              takeaway="Standard headings are generally a practical recommendation, not an ATS law."
              takeawayStatus="recommended"
            >
              <div className="flex flex-wrap gap-2 max-w-2xl">
                {sectionHeadings.recommended.map((h) => (
                  <span key={h} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-2)]">
                    {h}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-2xl leading-relaxed">
                Creative headings aren't automatically invalid — "{sectionHeadings.example.creative}"
                can be understandable to a human, but "{sectionHeadings.example.standard}" is more
                immediately recognizable.
              </p>
            </GuideSection>

            <GuideSection
              id="file-formats"
              eyebrow="Export"
              title="Which File Format Should I Use?"
              summary="Follow the employer's application instructions first."
              takeaway="If no format is specified, use a clean, widely supported format and verify the exported document."
              takeawayStatus="informational"
            >
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-6">
                {fileFormats.map((f) => (
                  <Card key={f.id} padding="sm">
                    <p className="font-display font-semibold text-sm mb-2">{f.title}</p>
                    <ul className="text-sm space-y-1 text-[var(--color-ink-muted)]">
                      {f.pros.map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              <p className="text-sm font-medium mb-3">Final File Check</p>
              <ul className="grid sm:grid-cols-2 gap-2 max-w-2xl">
                {exportChecklist.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                    <span className="text-[var(--color-success)]" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </GuideSection>

            <GuideSection
              id="myths"
              eyebrow="Myths"
              title="ATS Myths"
              takeaway="If it sounds like a universal law, it's probably a myth."
              takeawayStatus="informational"
            >
              <MythCards onOpen={markExplored} />
            </GuideSection>

            <GuideSection
              id="why-flagged"
              eyebrow="Your resume"
              title="Why Visera Flagged This"
              summary="This is the bridge between education and the actual product — content comes from your real analysis, never invented."
              takeaway="Only add a flagged term if you can genuinely support it."
              takeawayStatus="context"
            >
              {isAuthenticated ? (
                <WhyViseraFlagged
                  loading={ctx.loading}
                  failed={ctx.failed}
                  hasResume={ctx.hasResume}
                  hasAnalysis={ctx.hasAnalysis}
                  flags={ctx.flags}
                  resume={ctx.resume}
                />
              ) : (
                <Card>
                  <p className="text-sm text-[var(--color-ink-muted)] mb-3">
                    Sign in and analyze a resume to see exactly why Visera flagged something in yours.
                  </p>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Sign in
                    </Button>
                  </Link>
                </Card>
              )}
            </GuideSection>

            <GuideSection
              id="your-knowledge"
              eyebrow="Progress"
              title="Your ATS Knowledge"
            >
              <ATSKnowledgeProgress done={Math.min(knowledgeDone, knowledgeTotal)} total={knowledgeTotal} />
            </GuideSection>
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            Ready to see how these principles apply to your resume?
          </h2>
          <p className="text-[var(--color-ink-muted)] max-w-xl mx-auto mb-7 leading-relaxed">
            Analyze your resume with Visera and get an explainable breakdown of structure,
            keywords, skills, formatting, and relevance.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/resumes">
              <Button variant="accent" size="lg">
                Analyze My Resume
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => scrollToGuideSection("what-is-ats")}>
              Back to top
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
