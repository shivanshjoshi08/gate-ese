"use client";

import { useCallback, useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import {
  buildEsePaper2Mock,
  buildEsePrelimsMock,
  calculateMockScore,
  checkAnswer,
  type MockMode,
} from "@/lib/questions";
import {
  MOCK_ESE_P2_DURATION_SEC,
  MOCK_ESE_PRE_DURATION_SEC,
} from "@/lib/constants";
import { EXAM_COLORS } from "@/lib/exam";
import { usePracticeBank } from "@/hooks/PracticeBankContext";

type Phase = "intro" | "test" | "result";

const LABELS = ["A", "B", "C", "D"];

const MOCK_CONFIG: Record<
  MockMode,
  {
    title: string;
    rules: string[];
    duration: number;
    accent: string;
    build: (bank: Question[]) => Question[];
  }
> = {
  ese_prelims: {
    title: "ESE Prelims Mock",
    rules: [
      "120 questions, all objective",
      "2 hour timer",
      "Negative marking: −1/3 per wrong answer",
    ],
    duration: MOCK_ESE_PRE_DURATION_SEC,
    accent: EXAM_COLORS.ESE.accent,
    build: (bank) => buildEsePrelimsMock(bank),
  },
  ese_p2: {
    title: "ESE Paper 2 Mock",
    rules: [
      "~150 marks worth of questions",
      "3 hour timer",
      "No negative marking",
    ],
    duration: MOCK_ESE_P2_DURATION_SEC,
    accent: EXAM_COLORS.ESE.accent,
    build: (bank) => buildEsePaper2Mock(bank),
  },
};

export default function MockTestPage() {
  const { aiQuestions: bank } = usePracticeBank();
  const [phase, setPhase] = useState<Phase>("intro");
  const [mockMode, setMockMode] = useState<MockMode | null>(null);
  const [paper, setPaper] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | number | number[] | null>
  >({});
  const [timeLeft, setTimeLeft] = useState(MOCK_ESE_PRE_DURATION_SEC);
  const [natInput, setNatInput] = useState("");
  const [msqSelected, setMsqSelected] = useState<number[]>([]);

  const startTest = (mode: MockMode) => {
    const cfg = MOCK_CONFIG[mode];
    const p = cfg.build(bank);
    setMockMode(mode);
    setPaper(p);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(cfg.duration);
    setPhase("test");
  };

  const submitTest = useCallback(() => {
    setPhase("result");
  }, []);

  useEffect(() => {
    if (phase !== "test") return;
    if (timeLeft <= 0) {
      submitTest();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, submitTest]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const q = paper[currentIndex];

  const saveAnswer = (val: string | number | number[] | null) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  useEffect(() => {
    if (!q) return;
    const existing = answers[q.id];
    if (q.type === "nat") {
      setNatInput(existing != null ? String(existing) : "");
    } else if (q.type === "msq") {
      setMsqSelected(Array.isArray(existing) ? existing : []);
    }
  }, [currentIndex, q, answers]);

  const getPaletteStatus = (question: Question) => {
    if (phase === "test") {
      const ans = answers[question.id];
      if (ans === null || ans === undefined || ans === "") return "skipped";
      return "answered";
    }
    const ans = answers[question.id];
    if (ans === null || ans === undefined || ans === "") return "skipped";
    return checkAnswer(question, ans) ? "correct" : "wrong";
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-zinc-100">
        <h1 className="text-center text-2xl font-bold text-zinc-100">ESE mock tests</h1>
        <p className="mt-2 text-center text-zinc-400">
          Prelims or Paper 2.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-1">
          {(Object.keys(MOCK_CONFIG) as MockMode[]).map((mode) => {
            const cfg = MOCK_CONFIG[mode];
            return (
              <div
                key={mode}
                className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-5 text-left"
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: cfg.accent }}
                >
                  {cfg.title}
                </h2>
                <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                  {cfg.rules.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startTest(mode)}
                  className="mt-4 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: cfg.accent }}
                >
                  Start {cfg.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "result" && mockMode) {
    const { score, correct, wrong, skipped, maxScore } = calculateMockScore(
      paper,
      answers,
      mockMode
    );

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-zinc-100">
        <h1 className="text-2xl font-bold text-zinc-100">
          {MOCK_CONFIG[mockMode].title} — Results
        </h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <ResultCard label="Score" value={`${score} / ${maxScore}`} />
          <ResultCard label="Correct" value={correct} className="text-correct" />
          <ResultCard label="Wrong" value={wrong} className="text-wrong" />
          <ResultCard label="Skipped" value={skipped} />
        </div>

        <div className="mt-8 space-y-6">
          {paper.map((question, i) => {
            const ans = answers[question.id];
            const isCorrect =
              ans != null && ans !== "" && checkAnswer(question, ans);
            return (
              <div
                key={question.id}
                className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold">Q{i + 1}</span>
                  <span
                    className={
                      isCorrect
                        ? "text-correct"
                        : ans
                          ? "text-wrong"
                          : "text-zinc-500"
                    }
                  >
                    {isCorrect ? "✓ Correct" : ans ? "✗ Wrong" : "Skipped"}
                  </span>
                </div>
                <p className="text-zinc-100">{question.question}</p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-400">
                  {question.solution}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setPhase("intro");
            setMockMode(null);
          }}
          className="mt-8 rounded-xl bg-zinc-100 px-6 py-2.5 font-medium text-zinc-950 hover:bg-zinc-200"
        >
          Back to Mock Selection
        </button>
      </div>
    );
  }

  const accent = mockMode ? MOCK_CONFIG[mockMode].accent : EXAM_COLORS.ESE.accent;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-14 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="font-mono text-lg font-bold text-wrong">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-zinc-400">
            Q {currentIndex + 1} / {paper.length}
          </span>
          <button
            type="button"
            onClick={submitTest}
            className="rounded-lg bg-wrong px-4 py-1.5 text-sm font-semibold text-white"
          >
            Submit Test
          </button>
        </div>

        {q && (
          <div className="mx-auto max-w-2xl px-4 py-6">
            <p className="mb-4 text-xs text-zinc-500">
              {q.exam}
              {q.paper ? ` · ${q.paper}` : ""} · {q.subject} · {q.marks} mark ·{" "}
              {q.type.toUpperCase()}
            </p>
            <p className="mb-6 text-lg whitespace-pre-wrap text-zinc-100">{q.question}</p>

            {q.type === "mcq" &&
              q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => saveAnswer(i)}
                  className={`mb-2 w-full rounded-xl border-2 px-4 py-3 text-left text-zinc-100 ${
                    answers[q.id] === i
                      ? "bg-opacity-10"
                      : "border-zinc-600 hover:border-zinc-500"
                  }`}
                  style={
                    answers[q.id] === i
                      ? {
                          borderColor: accent,
                          backgroundColor: `${accent}15`,
                        }
                      : undefined
                  }
                >
                  <span className="font-bold">{LABELS[i]}.</span> {opt}
                </button>
              ))}

            {q.type === "nat" && (
              <input
                type="text"
                value={natInput}
                onChange={(e) => {
                  setNatInput(e.target.value);
                  saveAnswer(e.target.value);
                }}
                className="w-full rounded-xl border-2 border-zinc-600 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500"
                placeholder="Enter answer"
              />
            )}

            {q.type === "msq" && (
              <>
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = msqSelected.includes(i)
                        ? msqSelected.filter((x) => x !== i)
                        : [...msqSelected, i];
                      setMsqSelected(next);
                      saveAnswer(next);
                    }}
                    className={`mb-2 w-full rounded-xl border-2 px-4 py-3 text-left text-zinc-100 ${
                      msqSelected.includes(i)
                        ? ""
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    style={
                      msqSelected.includes(i)
                        ? {
                            borderColor: accent,
                            backgroundColor: `${accent}15`,
                          }
                        : undefined
                    }
                  >
                    <span className="font-bold">{LABELS[i]}.</span> {opt}
                  </button>
                ))}
              </>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                disabled={currentIndex >= paper.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="hidden w-48 shrink-0 border-l border-zinc-800 bg-zinc-900/80 p-3 lg:block">
        <p className="mb-2 text-xs font-semibold text-zinc-500">Palette</p>
        <div className="grid grid-cols-5 gap-1">
          {paper.map((question, i) => {
            const status = getPaletteStatus(question);
            const colors = {
              correct: "bg-correct text-white",
              wrong: "bg-wrong text-white",
              skipped: "bg-zinc-700 text-zinc-200",
              answered: "bg-blue-500 text-white",
            };
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-8 w-8 rounded text-xs font-medium ${
                  colors[status as keyof typeof colors]
                } ${currentIndex === i ? "ring-2 ring-zinc-100" : ""}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function ResultCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 text-center">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`text-2xl font-bold ${className || "text-zinc-100"}`}>{value}</p>
    </div>
  );
}
