"use client";

import type { ReactNode } from "react";
import type { Question } from "@/lib/types";
import RichContentRenderer from "@/components/question/RichContentRenderer";
import { shouldShowAnsweredSolutionPanel } from "@/lib/learner-solution";
import {
  getWhyWrongForOption,
  listWhyWrongEntries,
  normalizeSolutionSteps,
} from "@/lib/question-insights";
import LatexText from "@/components/question/LatexText";

const LABELS = ["A", "B", "C", "D"];

type Props = {
  question: Question;
  answered: boolean;
  selected: number | null;
  isCorrect: boolean;
  hasAnswerKey: boolean;
};

export default function QuestionInsightPanel({
  question,
  answered,
  selected,
  isCorrect,
  hasAnswerKey,
}: Props) {
  if (!answered) return null;

  const correctIndex =
    question.type === "mcq" && hasAnswerKey
      ? (question.correct as number)
      : -1;
  const wrongWhy =
    selected != null && !isCorrect && hasAnswerKey
      ? getWhyWrongForOption(question, selected)
      : null;
  const otherWrong = hasAnswerKey
    ? listWhyWrongEntries(question, correctIndex)
    : [];
  const steps = normalizeSolutionSteps(question.solutionSteps);
  const showSolution = shouldShowAnsweredSolutionPanel(question);

  const hasBody =
    wrongWhy ||
    question.conceptUsed?.trim() ||
    (question.formulaUsed && question.formulaUsed.length > 0) ||
    steps.length > 0 ||
    showSolution ||
    question.keyTakeaway?.trim() ||
    otherWrong.length > 0 ||
    (question.mainsRelevant &&
      question.selfEvalChecklist &&
      question.selfEvalChecklist.length > 0);

  if (!hasBody) return null;

  return (
    <div
      className="mt-6 space-y-4 animate-slide-up"
      aria-label="Answer breakdown"
    >
      {wrongWhy && (
        <div className="rounded-2xl border border-wrong/50 bg-wrong/10 px-4 py-3">
          <p className="text-sm leading-relaxed text-study-soft">
            <span className="font-semibold text-wrong">Why {LABELS[selected!]} is wrong: </span>
            <LatexText text={wrongWhy} />
          </p>
        </div>
      )}

      {question.conceptUsed?.trim() ? (
        <InsightBlock title="Concept tested" tone="violet">
          <div className="text-sm leading-relaxed text-study-soft">
            <LatexText text={question.conceptUsed} />
          </div>
        </InsightBlock>
      ) : null}

      {question.formulaUsed && question.formulaUsed.length > 0 ? (
        <InsightBlock title="Formulas" tone="sky">
          <ul className="space-y-1.5 font-mono text-sm text-study-soft">
            {question.formulaUsed.map((f, i) => (
              <li
                key={i}
                className="rounded-lg border border-study-border/50 bg-study-surface/50 px-2.5 py-1.5"
              >
                <LatexText text={f} />
              </li>
            ))}
          </ul>
        </InsightBlock>
      ) : null}

      {steps.length > 0 ? (
        <InsightBlock title="Step-by-step" tone="teal">
          <ol className="space-y-3">
            {steps.map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-200">
                  {s.step}
                </span>
                <div className="min-w-0 flex-1">
                  {s.heading ? (
                    <p className="text-sm font-semibold text-study-ink">
                      {s.heading}
                    </p>
                  ) : null}
                  <div className="mt-0.5 text-sm leading-relaxed text-study-soft">
                    <LatexText text={s.content} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </InsightBlock>
      ) : null}



      {question.keyTakeaway?.trim() ? (
        <InsightBlock title="Key takeaway" tone="amber">
          <div className="text-sm leading-relaxed text-amber-100/95">
            <LatexText text={question.keyTakeaway} />
          </div>
        </InsightBlock>
      ) : null}

      {otherWrong.length > 0 ? (
        <InsightBlock title="Other distractors" tone="neutral">
          <ul className="space-y-2 text-sm text-study-soft">
            {otherWrong.map(({ label, text }) => (
              <li key={label}>
                <span className="font-semibold text-study-muted">{label}: </span>
                <LatexText text={text} />
              </li>
            ))}
          </ul>
        </InsightBlock>
      ) : null}

      {question.mainsRelevant &&
      question.selfEvalChecklist &&
      question.selfEvalChecklist.length > 0 ? (
        <InsightBlock title="Mains self-check" tone="violet">
          <ul className="list-inside list-disc space-y-1 text-sm text-study-soft">
            {question.selfEvalChecklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </InsightBlock>
      ) : null}
    </div>
  );
}

function InsightBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "violet" | "sky" | "teal" | "amber" | "neutral";
  children: ReactNode;
}) {
  const border: Record<typeof tone, string> = {
    violet: "border-violet-400/30 bg-violet-500/[0.06]",
    sky: "border-sky-400/30 bg-sky-500/[0.06]",
    teal: "border-teal-400/35 bg-teal-500/[0.07]",
    amber: "border-amber-400/35 bg-amber-500/[0.08]",
    neutral: "border-study-border/80 bg-study-surface/90",
  };
  const titleColor: Record<typeof tone, string> = {
    violet: "text-violet-200/90",
    sky: "text-sky-200/90",
    teal: "text-teal-200/95",
    amber: "text-amber-200/95",
    neutral: "text-study-soft",
  };

  return (
    <section
      className={`rounded-2xl border px-4 py-3.5 shadow-inner shadow-black/[0.04] ${border[tone]}`}
    >
      <h3
        className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${titleColor[tone]}`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}
