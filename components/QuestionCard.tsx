"use client";

import { useEffect, useRef, useState } from "react";
import type { AttemptRecord, Question } from "@/lib/types";
import { formatDuration } from "@/lib/format-date";
import {
  getClientAiSummary,
  setClientAiSummary,
} from "@/lib/ai-summary-client-cache";
import { buildGroqQuestionContextString } from "@/lib/groq-question-context";
import { checkAnswer } from "@/lib/questions";
import { EXAM_COLORS } from "@/lib/exam";
import ImageBlock from "@/components/question/ImageBlock";
import QuestionRenderer from "@/components/question/QuestionRenderer";
import RichContentRenderer from "@/components/question/RichContentRenderer";
import OptionRenderer from "@/components/question/OptionRenderer";
import QuestionSourcePanel from "@/components/question/QuestionSourcePanel";
import "@/components/question/question-renderer.css";
import {
  recordAttempt,
  toggleBookmark,
  isBookmarked,
} from "@/lib/storage";
import { shouldShowAnsweredSolutionPanel } from "@/lib/learner-solution";

const LABELS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: Question;
  questionNumber?: number;
  questionTotal?: number;
  levelNumber?: number;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  focusMode?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  questionTotal,
  levelNumber,
  onAnswered,
  onNext,
  focusMode = false,
}: QuestionCardProps) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [natInput, setNatInput] = useState("");
  const [msqSelected, setMsqSelected] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const questionStartRef = useRef(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timeSpentSec, setTimeSpentSec] = useState<number | null>(null);

  const hasAnswerKey = question.hasAnswerKey !== false;
  const figureUrls =
    question.images && question.images.length > 0
      ? question.images
      : question.image
        ? [question.image]
        : [];
  const figureMedia = figureUrls.map((url, i) => ({
    id: `fig-${i}`,
    url,
    alt: `Figure ${i + 1}`,
  }));
  const correctIndex =
    question.type === "mcq" && hasAnswerKey
      ? (question.correct as number)
      : -1;

  useEffect(() => {
    questionStartRef.current = Date.now();
    setElapsedSec(0);
    setTimeSpentSec(null);
  }, [question.id]);

  useEffect(() => {
    if (answered) return;
    const tick = () => {
      setElapsedSec(
        Math.floor((Date.now() - questionStartRef.current) / 1000),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [answered, question.id]);

  const captureTimeSpent = () => {
    const sec = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setTimeSpentSec(sec);
    return sec;
  };

  const saveAttempt = (
    data: Omit<AttemptRecord, "timestamp" | "timeSpentSec">,
  ) => {
    const sec = captureTimeSpent();
    recordAttempt({
      ...data,
      timestamp: Date.now(),
      timeSpentSec: sec,
    });
  };

  const handleMcqSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
  };

  const handleMcqSubmit = () => {
    if (answered || selected === null) return;

    if (!hasAnswerKey) {
      setAnswered(true);
      setIsCorrect(true);
      saveAttempt({
        questionId: question.id,
        userAnswer: selected,
        correct: true,
        subject: question.subject,
        topic: question.topic,
        exam: question.exam,
      });
      onAnswered(true);
      return;
    }

    const correct = selected === correctIndex;
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    saveAttempt({
      questionId: question.id,
      userAnswer: selected,
      correct,
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const submitBtnClass =
    "w-full min-h-[3rem] rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 py-3.5 text-base font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 sm:min-h-0 sm:text-sm";

  const handleNatCheck = () => {
    if (answered || !natInput.trim()) return;
    const correct = checkAnswer(question, natInput.trim());
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    saveAttempt({
      questionId: question.id,
      userAnswer: natInput.trim(),
      correct,
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const handleMsqToggle = (index: number) => {
    if (answered) return;
    setMsqSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleMsqSubmit = () => {
    if (answered || msqSelected.length === 0) return;
    const correct = checkAnswer(question, msqSelected);
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    saveAttempt({
      questionId: question.id,
      userAnswer: msqSelected,
      correct,
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const handleBookmark = () => {
    const added = toggleBookmark(question.id);
    setBookmarked(added);
  };

  const getOptionClass = (index: number) => {
    const base =
      "w-full min-h-[3rem] rounded-2xl border-2 px-4 py-4 text-left text-base font-medium transition-all duration-200 active:scale-[0.99] sm:min-h-0 sm:py-3.5 ";
    if (!answered) {
      if (selected === index) {
        return (
          base +
          "border-sky-500/80 bg-sky-500/12 text-study-ink shadow-[0_0_0_1px_rgba(56,189,248,0.2)] cursor-pointer"
        );
      }
      return (
        base +
        "border-study-border bg-study-raised/60 text-study-ink hover:border-sky-400/50 hover:bg-sky-500/[0.08] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.18)] cursor-pointer"
      );
    }
    if (!hasAnswerKey && selected === index) {
      return (
        base +
        "border-sky-500/80 bg-sky-500/15 cursor-default text-study-ink shadow-[0_0_0_1px_rgba(56,189,248,0.25)]"
      );
    }
    if (question.type === "mcq" && hasAnswerKey) {
      if (index === correctIndex) {
        return base + "border-correct bg-correct text-white cursor-default animate-pulse-correct";
      }
      if (index === selected && index !== correctIndex) {
        return base + "border-wrong bg-wrong text-white cursor-default animate-shake";
      }
    }
    return base + "border-study-border/60 bg-study-surface/40 text-study-muted cursor-not-allowed opacity-65";
  };

  useEffect(() => {
    setAiSummary(null);
    setAiError(null);
    setAiLoading(false);
  }, [question.id]);

  useEffect(() => {
    if (!answered) return;

    const local = getClientAiSummary(question.id);
    if (local) {
      setAiSummary(local);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);

    const context = buildGroqQuestionContextString(question);

    void (async () => {
      try {
        const cachedRes = await fetch(
          `/api/ai/question-summary?questionId=${encodeURIComponent(question.id)}`,
        );
        if (cancelled) return;

        if (cachedRes.ok) {
          const cached = (await cachedRes.json()) as { summary?: string };
          if (cached.summary) {
            setAiSummary(cached.summary);
            setClientAiSummary(question.id, cached.summary);
            return;
          }
        }

        const res = await fetch("/api/ai/question-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            context,
          }),
        });
        const data = (await res.json()) as {
          summary?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setAiError(data.error || "Could not load AI summary.");
          return;
        }
        if (data.summary) {
          setAiSummary(data.summary);
          setClientAiSummary(question.id, data.summary);
        } else setAiError("No summary returned.");
      } catch {
        if (!cancelled) setAiError("Network error while loading AI summary.");
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [answered, question]);

  const numberLabel =
    questionNumber != null
      ? questionTotal != null
        ? `Question ${questionNumber} of ${questionTotal}`
        : `Question ${questionNumber}`
      : null;

  return (
    <div
      className={`mx-auto w-full max-w-2xl px-3 py-5 pb-8 sm:px-4 sm:py-6 ${shake && !isCorrect ? "animate-shake" : ""}`}
      onAnimationEnd={() => setShake(false)}
    >
      {(numberLabel || levelNumber != null) && (
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {numberLabel && (
            <p className="text-base font-bold tabular-nums text-study-ink sm:text-lg">
              {numberLabel}
            </p>
          )}
          {levelNumber != null && (
            <p className="text-xs font-medium text-study-muted">
              Level {levelNumber}
            </p>
          )}
          <p
            className="hidden text-[11px] font-mono text-study-muted/90 sm:inline"
            title="Question ID for support or admin updates"
          >
            ID: {question.id}
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-y-2 text-xs text-study-muted sm:text-sm">
        <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-2 leading-relaxed sm:gap-x-2 sm:gap-y-1">
          {question.questionBank === "pyq" ? (
            <span
              title="Previous-year question (official paper track)"
              className="shrink-0 rounded-md border border-emerald-400/45 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200"
            >
              PYQ
            </span>
          ) : question.questionBank === "ai" ? (
            <span
              title="Practice bank question"
              className="shrink-0 rounded-md border border-sky-400/45 bg-sky-500/12 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sky-200"
            >
              Practice
            </span>
          ) : null}
          <span
            className="inline-flex shrink-0 items-center rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:text-[11px]"
            style={{ backgroundColor: EXAM_COLORS[question.exam].accent }}
          >
            {question.exam}
          </span>
          {question.paper && (
            <>
              <span className="font-medium text-study-soft">
                Paper {question.paper}
              </span>
              <span aria-hidden className="mx-1.5 text-study-border">
                ·
              </span>
            </>
          )}
          <span className="font-medium text-study-ink">{question.subject}</span>
          <span aria-hidden className="mx-1.5 text-study-border">
            ·
          </span>
          <span className="hidden sm:inline">{question.topic}</span>
          <span aria-hidden className="mx-1.5 hidden text-study-border sm:inline">
            ·
          </span>
          <span className="hidden sm:inline">{question.year}</span>
          <span aria-hidden className="mx-1.5 hidden text-study-border sm:inline">
            ·
          </span>
          <span>
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </span>
          <span aria-hidden className="mx-1.5 text-study-border">
            ·
          </span>
          <span>{question.difficulty}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-lg border border-study-border/80 bg-study-raised/70 px-2.5 py-1 font-mono text-xs tabular-nums text-study-soft"
            aria-live="polite"
            title={
              answered
                ? "Time taken on this question"
                : "Time on this question"
            }
          >
            ⏱{" "}
            {formatDuration(
              answered && timeSpentSec != null ? timeSpentSec : elapsedSec,
            )}
          </span>
          <button
            type="button"
            onClick={handleBookmark}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-xl text-study-muted transition hover:text-amber-400/95"
            aria-label="Bookmark"
          >
            {bookmarked || isBookmarked(question.id) ? "⭐" : "☆"}
          </button>
        </div>
      </div>

      <QuestionSourcePanel question={question} className="mb-4" />

      {question.richStem ? (
        <div className="mb-6">
          <QuestionRenderer
            question={{
              stem: question.richStem,
              media: figureMedia,
              type: question.type === "nat" ? "numerical" : question.type,
            }}
            showMedia={figureMedia.length > 0}
          />
        </div>
      ) : (
        <>
          {figureUrls.length > 0 && (
            <div className="mb-6 space-y-4">
              {figureUrls.map((src, i) => (
                <ImageBlock
                  key={`${question.id}-fig-${i}`}
                  src={src}
                  alt={`Figure for ${question.topic || "question"} ${i + 1}`}
                />
              ))}
            </div>
          )}
          <p className="mb-6 text-lg leading-relaxed text-study-ink whitespace-pre-wrap">
            {question.question}
          </p>
        </>
      )}

      {question.type === "mcq" &&
        question.options.length === 0 &&
        !question.richOptions?.length && (
          <p className="mb-4 text-sm text-study-muted">
            Open-ended — see solution when ready.
          </p>
        )}

      {question.type === "mcq" && question.richOptions?.length ? (
        <div className="space-y-3">
          {question.richOptions.map((opt, i) => (
            <OptionRenderer
              key={opt.id}
              option={opt}
              index={i}
              selected={selected === i}
              correct={answered && hasAnswerKey && i === correctIndex}
              wrong={
                answered && hasAnswerKey && i === selected && i !== correctIndex
              }
              disabled={answered}
              showResult={answered}
              onClick={() => handleMcqSelect(i)}
            />
          ))}
          {!answered && (
            <button
              type="button"
              onClick={handleMcqSubmit}
              disabled={selected === null}
              className={submitBtnClass}
            >
              Submit answer
            </button>
          )}
        </div>
      ) : question.type === "mcq" ? (
        question.options.length === 0 && !question.richOptions?.length ? (
          !answered ? (
            <button
              type="button"
              onClick={() => {
                setAnswered(true);
                setIsCorrect(true);
                saveAttempt({
                  questionId: question.id,
                  userAnswer: "open",
                  correct: true,
                  subject: question.subject,
                  topic: question.topic,
                  exam: question.exam,
                });
                onAnswered(true);
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 py-3.5 font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-105"
            >
              Show solution
            </button>
          ) : null
        ) : (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handleMcqSelect(i)}
              className={getOptionClass(i)}
            >
              <span className="mr-2 font-bold">{LABELS[i]}.</span>
              {opt}
              {answered && hasAnswerKey && i === correctIndex && (
                <span className="float-right">✓</span>
              )}
              {answered &&
                hasAnswerKey &&
                i === selected &&
                i !== correctIndex && (
                  <span className="float-right">✗</span>
                )}
              {answered && !hasAnswerKey && i === selected && (
                <span className="float-right text-sky-300">●</span>
              )}
            </button>
          ))}
          {!answered && (
            <button
              type="button"
              onClick={handleMcqSubmit}
              disabled={selected === null}
              className={submitBtnClass}
            >
              Submit answer
            </button>
          )}
        </div>
        )
      ) : null}

      {question.type === "nat" && (
        <div className="space-y-3">
          <input
            type="text"
            inputMode="decimal"
            value={natInput}
            onChange={(e) => setNatInput(e.target.value)}
            disabled={answered}
            placeholder="Enter your answer"
            className="w-full rounded-2xl border-2 border-study-border bg-study-raised/80 px-4 py-3 text-lg text-study-ink placeholder:text-study-muted focus:border-sky-500 focus:outline-none disabled:bg-study-surface/60 disabled:opacity-60"
          />
          {!answered && (
            <button
              type="button"
              onClick={handleNatCheck}
              disabled={!natInput.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 py-3.5 font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-105 disabled:opacity-50"
            >
              Submit answer
            </button>
          )}
          {answered && (
            <p className={`text-sm font-medium ${isCorrect ? "text-correct" : "text-wrong"}`}>
              Correct answer: {String(question.correct)}
              {isCorrect ? " ✓" : " ✗"}
            </p>
          )}
        </div>
      )}

      {question.type === "msq" && (
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const selectedMsq = msqSelected.includes(i);
            const correctArr = (question.correct as number[]) ?? [];
            const isCorrectOpt = correctArr.includes(i);
            let cls =
              "w-full rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150 ";
            if (!answered) {
              cls += selectedMsq
                ? "border-sky-500/80 bg-sky-500/12 text-study-ink cursor-pointer shadow-[0_0_0_1px_rgba(56,189,248,0.2)]"
                : "border-study-border bg-study-raised/60 text-study-ink hover:border-sky-400/45 cursor-pointer";
            } else if (isCorrectOpt) {
              cls += "border-correct bg-correct text-white";
            } else if (selectedMsq && !isCorrectOpt) {
              cls += "border-wrong bg-wrong text-white";
            } else {
              cls += "border-study-border/60 bg-study-surface/35 text-study-muted opacity-65";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => handleMsqToggle(i)}
                className={cls}
              >
                <span className="mr-2 font-bold">{LABELS[i]}.</span>
                {opt}
              </button>
            );
          })}
          {!answered && (
            <button
              type="button"
              onClick={handleMsqSubmit}
              disabled={msqSelected.length === 0}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 py-3.5 font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-105 disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </div>
      )}

      {answered && (
        <div
          className="mt-6 animate-slide-up rounded-2xl border border-teal-400/35 bg-teal-500/[0.07] px-4 py-3.5 shadow-inner shadow-black/[0.06]"
          aria-live="polite"
          aria-busy={aiLoading}
        >
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-200/95">
            AI brief recap
          </h3>
          {aiLoading && (
            <p className="text-sm italic text-teal-100/80">Generating takeaway…</p>
          )}
          {!aiLoading && aiError && (
            <p className="text-sm text-amber-300/95">{aiError}</p>
          )}
          {!aiLoading && aiSummary && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-study-soft">
              {aiSummary}
            </p>
          )}
        </div>
      )}

      {answered && shouldShowAnsweredSolutionPanel(question) && (
        <div className="mt-6 animate-slide-up rounded-2xl border border-study-border/80 bg-study-surface/90 p-5 shadow-inner shadow-black/10">
          <h3 className="mb-2 font-semibold text-study-soft">
            {hasAnswerKey ? "Solution" : "Your selection"}
          </h3>
          {question.richSolution && hasAnswerKey ? (
            <RichContentRenderer content={question.richSolution} />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-study-soft">
              {hasAnswerKey
                ? question.solution
                : `Your choice: ${selected != null ? LABELS[selected] : "—"}.`}
            </p>
          )}
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={onNext}
          className="mt-6 w-full min-h-[3rem] rounded-2xl bg-white py-3.5 text-base font-semibold text-study-page shadow-lg shadow-black/25 ring-1 ring-white/30 transition hover:bg-zinc-50 hover:shadow-xl hover:brightness-105 active:scale-[0.99] sm:min-h-0 sm:text-sm"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}

