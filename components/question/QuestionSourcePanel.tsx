"use client";

import type { Question } from "@/lib/types";
import {
  QUESTION_STYLE_LABELS,
  formatAppearance,
  formatReference,
  mergeQuestionSources,
  type QuestionStyleTag,
} from "@/lib/question-sources";

type Props = {
  question: Question;
  className?: string;
};

export default function QuestionSourcePanel({ question, className = "" }: Props) {
  const { appearances, references } = mergeQuestionSources(question);
  const style = question.questionStyle;
  const styleLabel = style ? QUESTION_STYLE_LABELS[style as QuestionStyleTag] : null;

  const extraAppearances = appearances.length > 1 ? appearances : [];

  if (extraAppearances.length === 0 && references.length === 0 && !styleLabel) {
    return null;
  }

  return (
    <section
      className={`rounded-xl border border-study-border/60 bg-study-raised/30 px-3 py-2.5 text-xs ${className}`}
      aria-label="Question sources and pattern"
    >
      {styleLabel && (
        <p className="mb-2">
          <span className="font-medium uppercase tracking-wide text-study-muted">
            Pattern
          </span>
          <span className="ml-2 rounded-md border border-violet-400/35 bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-200">
            {styleLabel}
          </span>
        </p>
      )}

      {extraAppearances.length > 0 && (
        <div className="mb-2 last:mb-0">
          <p className="mb-1 font-medium uppercase tracking-wide text-study-muted">
            Also in papers
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {extraAppearances.map((a, i) => (
              <li key={`${a.exam}-${a.year}-${a.paper ?? ""}-${i}`}>
                <span
                  className="inline-block rounded-md border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-100"
                  title="Previous year / official exam"
                >
                  {formatAppearance(a)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {references.length > 0 && (
        <div>
          <p className="mb-1 font-medium uppercase tracking-wide text-study-muted">
            References
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
      )}
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
