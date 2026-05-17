"use client";

import type { Question } from "@/lib/types";
import { ESE_PAPER_LABELS } from "@/lib/constants";
import {
  QUESTION_STYLE_LABELS,
  formatAppearance,
  formatReference,
  mergeQuestionSources,
} from "@/lib/question-sources";
import { primaryAppearanceLabel } from "@/lib/question-insights";

type Props = {
  question: Question;
  className?: string;
};

function styleLabel(raw: string | undefined): string | null {
  if (!raw) return null;
  return (
    QUESTION_STYLE_LABELS[raw as keyof typeof QUESTION_STYLE_LABELS] ??
    raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function QuestionSourcePanel({ question, className = "" }: Props) {
  const { appearances, references } = mergeQuestionSources(question);
  const pattern = styleLabel(question.questionStyle);
  const primary = primaryAppearanceLabel(question);
  const extraAppearances =
    appearances.length > 1 ? appearances.slice(1) : [];
  const showPrimaryPyq =
    Boolean(primary) &&
    (question.questionBank === "pyq" ||
      appearances.some((a) => a.qno != null) ||
      appearances.length > 1 ||
      question.source === "official-pdf");
  const highRepeat =
    question.isHighRepeat ||
    (question.repeatCount != null && question.repeatCount >= 3);
  const tags = question.tags?.filter(Boolean) ?? [];
  const paperLabel =
    question.paper && ESE_PAPER_LABELS[question.paper]
      ? ESE_PAPER_LABELS[question.paper]
      : question.paper;

  if (
    !pattern &&
    !showPrimaryPyq &&
    extraAppearances.length === 0 &&
    references.length === 0 &&
    !question.trendNote?.trim() &&
    !highRepeat &&
    tags.length === 0 &&
    !question.mainsRelevant &&
    !question.diagramRequired
  ) {
    return null;
  }

  return (
    <section
      className={`rounded-xl border border-study-border/60 bg-study-raised/30 px-3 py-2.5 text-xs ${className}`}
      aria-label="Question sources and pattern"
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {pattern ? (
          <span
            className="rounded-md border border-violet-400/35 bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-200"
            title="Question pattern"
          >
            {pattern}
          </span>
        ) : null}
        {showPrimaryPyq && primary ? (
          <span
            className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-100"
            title="Official exam appearance"
          >
            PYQ · {primary}
          </span>
        ) : null}
        {paperLabel && question.exam === "ESE" ? (
          <span className="rounded-md border border-study-border/70 bg-study-surface/60 px-2 py-0.5 text-study-muted">
            {paperLabel}
          </span>
        ) : null}
        {highRepeat ? (
          <span className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-100">
            High repeat
            {question.repeatCount != null && question.repeatCount > 1
              ? ` · ${question.repeatCount}×`
              : ""}
          </span>
        ) : null}
        {question.mainsRelevant ? (
          <span className="rounded-md border border-fuchsia-400/35 bg-fuchsia-500/10 px-2 py-0.5 font-semibold text-fuchsia-100">
            Mains relevant
          </span>
        ) : null}
        {question.diagramRequired ? (
          <span className="rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2 py-0.5 font-semibold text-cyan-100">
            Diagram
          </span>
        ) : null}
      </div>

      {tags.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-md bg-study-surface/80 px-1.5 py-0.5 text-[10px] text-study-muted"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {question.trendNote?.trim() ? (
        <p className="mb-2 text-sm leading-relaxed text-study-soft">
          <span className="font-medium text-study-muted">Trend: </span>
          {question.trendNote}
        </p>
      ) : null}

      {extraAppearances.length > 0 ? (
        <div className="mb-2 last:mb-0">
          <p className="mb-1 font-medium uppercase tracking-wide text-study-muted">
            Also in papers
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {extraAppearances.map((a, i) => (
              <li key={`${a.exam}-${a.year}-${a.paper ?? ""}-${i}`}>
                <span className="inline-block rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-100">
                  {formatAppearance(a)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {references.length > 0 ? (
        <div>
          <p className="mb-1 font-medium uppercase tracking-wide text-study-muted">
            Also in books / coaching
          </p>
          <ul className="space-y-1 text-study-soft">
            {references.map((r, i) => (
              <li key={`${r.kind}-${r.label}-${i}`} className="flex gap-1.5">
                <span className="shrink-0 text-study-muted" aria-hidden>
                  {kindIcon(r.kind)}
                </span>
                <span>{formatReference(r)}</span>
                {r.notes ? (
                  <span className="text-study-muted"> — {r.notes}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function kindIcon(kind: string): string {
  switch (kind) {
    case "book":
      return "📘";
    case "coaching":
      return "🎓";
    case "standard":
      return "📐";
    case "web":
      return "🔗";
    default:
      return "•";
  }
}
