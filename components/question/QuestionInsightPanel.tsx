"use client";

import type { ReactNode } from "react";
import type { Question } from "@/lib/types";
import RichContentRenderer from "@/components/question/RichContentRenderer";
import { shouldShowAnsweredSolutionPanel } from "@/lib/learner-solution";
import {
  formatCorrectAnswer,
  getWhyWrongForOption,
  listWhyWrongEntries,
  normalizeSolutionSteps,
} from "@/lib/question-insights";

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
  const correctLabel = formatCorrectAnswer(question);
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
    correctLabel ||
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
      {hasAnswerKey && (
        <div
          className={`rounded-2xl border px-4 py-3 ${
            isCorrect
              ? "border-correct/50 bg-correct/10"
              : "border-wrong/50 bg-wrong/10"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isCorrect ? "text-correct" : "text-wrong"
            }`}
          >
            {isCorrect ? "Correct" : "Incorrect"}
            {correctLabel ? (
              <span className="mt-1 block font-medium text-study-ink">
                Answer: {correctLabel}
              </span>
            ) : null}
          </p>
          {wrongWhy ? (
            <p className="mt-2 text-sm leading-relaxed text-study-soft">
              <span className="font-medium text-wrong">Why {LABELS[selected!]} is wrong: </span>
              {wrongWhy}
            </p>
          ) : null}
        </div>
      )}

      {question.conceptUsed?.trim() ? (
        <InsightBlock title="Concept tested" tone="violet">
          <p className="text-sm leading-relaxed text-study-soft">
            {question.conceptUsed}
          </p>
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
                {f}
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
                  <p className="mt-0.5 text-sm leading-relaxed text-study-soft whitespace-pre-wrap">
                    {s.content}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </InsightBlock>
      ) : null}

      {showSolution ? (
        <InsightBlock
          title={hasAnswerKey ? "Solution" : "Your selection"}
          tone="neutral"
        >
          {question.richSolution && hasAnswerKey ? (
            <RichContentRenderer content={question.richSolution} />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-study-soft">
              {hasAnswerKey
                ? question.solution
                : `Your choice: ${selected != null ? LABELS[selected] : "—"}.`}
            </p>
          )}
        </InsightBlock>
      ) : null}

      {question.keyTakeaway?.trim() ? (
        <InsightBlock title="Key takeaway" tone="amber">
          <p className="text-sm leading-relaxed text-amber-100/95">
            {question.keyTakeaway}
          </p>
        </InsightBlock>
      ) : null}

      {otherWrong.length > 0 ? (
        <InsightBlock title="Other distractors" tone="neutral">
          <ul className="space-y-2 text-sm text-study-soft">
            {otherWrong.map(({ label, text }) => (
              <li key={label}>
                <span className="font-semibold text-study-muted">{label}: </span>
                {text}
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
