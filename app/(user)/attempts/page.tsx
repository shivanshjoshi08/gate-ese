"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { AttemptRecord, Question } from "@/lib/types";
import { filterQuestions } from "@/lib/questions";
import {
  defaultPracticeFilters,
  getSimplePracticeFilters,
  sanitizePracticeFilters,
} from "@/lib/available-filters";
import { getMergedAttemptsMap } from "@/lib/storage";
import { usePracticeBank } from "@/hooks/PracticeBankContext";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";
import { getSubjectShort } from "@/lib/constants";

type StatusFilter = "all" | "correct" | "incorrect";
type BankFilter = "all" | "ai" | "pyq";

type Row = {
  question: Question;
  attempt?: AttemptRecord;
};

export default function MyAttemptsPage() {
  const { exam } = useExam();
  const accent = EXAM_COLORS[exam];
  const { questions, aiQuestions, pyqQuestions, loadingPyq } =
    usePracticeBank();

  // const [bankFilter, setBankFilter] = useState<BankFilter>("all");
  // const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const bankFilter = "all" as BankFilter;
  const statusFilter = "all" as StatusFilter;
  const [filters, setFilters] = useState(defaultPracticeFilters);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    const onSave = () => setEpoch((e) => e + 1);
    window.addEventListener("gate-progress-saved", onSave);
    return () => window.removeEventListener("gate-progress-saved", onSave);
  }, []);

  const attemptsMap = useMemo(() => {
    void epoch;
    return getMergedAttemptsMap();
  }, [epoch]);

  const sourceBank = useMemo(() => {
    if (bankFilter === "ai") return aiQuestions;
    if (bankFilter === "pyq") return pyqQuestions;
    return questions;
  }, [bankFilter, questions, aiQuestions, pyqQuestions]);

  const sanitized = useMemo(
    () => sanitizePracticeFilters(sourceBank, filters),
    [sourceBank, filters],
  );

  const available = useMemo(
    () => getSimplePracticeFilters(sourceBank, sanitized),
    [sourceBank, sanitized],
  );

  const rows = useMemo(() => {
    const pool = filterQuestions(sourceBank, { ...sanitized, type: "MCQ" });
    const out: Row[] = [];
    for (const question of pool) {
      const attempt = attemptsMap.get(question.id);
      if (!attempt) continue;
      if (statusFilter === "correct" && !attempt.correct) continue;
      if (statusFilter === "incorrect" && attempt.correct) continue;
      out.push({ question, attempt });
    }
    return out;
  }, [sourceBank, sanitized, statusFilter, attemptsMap]);

  const summary = useMemo(() => {
    const pool = filterQuestions(sourceBank, { ...sanitized, type: "MCQ" });
    let attempted = 0;
    let correct = 0;
    for (const q of pool) {
      const a = attemptsMap.get(q.id);
      if (a) {
        attempted++;
        if (a.correct) correct++;
      }
    }
    const total = pool.length;
    return {
      total,
      attempted,
      notAttempted: total - attempted,
      correct,
      wrong: attempted - correct,
    };
  }, [sourceBank, sanitized, attemptsMap]);

  const practiceHref = (q: Question) => {
    const bank = q.questionBank === "pyq" ? "pyq" : "ai";
    return `/practice?bank=${bank}`;
  };

  if (loadingPyq && sourceBank.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-study-muted">
        Loading question bank...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-study-ink">
      <div className="mb-6 text-center">
        <Link
          href="/me"
          className="text-sm text-study-muted hover:text-study-soft"
        >
          My progress
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          My attempts
        </h1>
        <p className="mt-1 text-sm text-study-muted">
          Questions you have already attempted — filter by result or difficulty
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Attempted" value={summary.attempted} highlight="sky" />
        <SummaryCard label="Correct" value={summary.correct} highlight="ok" />
        <SummaryCard label="Wrong" value={summary.wrong} />
      </div>

      <div className="mb-4 rounded-xl border border-study-border/80 bg-study-surface/80 p-4">
        {/* Bank filter — re-enable when needed (bankFilter: all | ai | pyq) */}
        {/* Status filter — re-enable when needed (statusFilter: all | correct | incorrect) */}

        {available.difficulties.length > 1 && (
          <>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-study-muted">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              {available.difficulties.map((d) => (
                <FilterChip
                  key={d.value}
                  active={sanitized.difficulty === d.value}
                  onClick={() =>
                    setFilters((f) => ({ ...f, difficulty: d.value }))
                  }
                  accent={accent.accent}
                >
                  {d.label}
                </FilterChip>
              ))}
            </div>
          </>
        )}

        {/* Exam filter — re-enable when needed */}
      </div>

      <p className="mb-3 text-sm text-study-muted">
        Showing {rows.length} question{rows.length === 1 ? "" : "s"}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-study-border/60 bg-study-surface/50 px-4 py-8 text-center text-study-muted">
          No attempted questions match these filters yet. Start practicing to see
          them here.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ question, attempt }) => (
            <li
              key={question.id}
              className="rounded-xl border border-study-border/70 bg-study-surface/90 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <StatusBadge attempt={attempt!} />
                <span className="text-xs text-study-muted">
                  {question.questionBank === "pyq" ? "PYQ" : "Practice"} |{" "}
                  {question.difficulty}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-study-ink">
                {question.question}
              </p>
              <p className="mt-1 text-xs text-study-muted">
                {getSubjectShort(question.subject)} | {question.exam} |{" "}
                {question.year}
              </p>
              <p className="mt-2 text-xs text-study-muted">
                Last attempt:{" "}
                {new Date(attempt!.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <Link
                href={practiceHref(question)}
                className="mt-3 inline-block text-sm font-medium text-sky-400 hover:underline"
              >
                Practice again
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setEpoch((e) => e + 1)}
        className="mt-6 w-full rounded-lg border border-study-border py-2 text-sm text-study-muted hover:bg-study-raised/50"
      >
        Refresh list
      </button>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "sky" | "ok" | "muted";
}) {
  const valueCls =
    highlight === "ok"
      ? "text-correct"
      : highlight === "sky"
        ? "text-sky-400"
        : "text-study-ink";
  return (
    <div className="rounded-xl border border-study-border/60 bg-study-surface/80 px-3 py-2.5 text-center">
      <p className="text-xs text-study-muted">{label}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${valueCls}`}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  accent,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "text-white"
          : "border border-study-border/80 bg-study-raised/40 text-study-muted hover:text-study-ink"
      }`}
      style={active ? { backgroundColor: accent } : undefined}
    >
      {children}
    </button>
  );
}

function StatusBadge({ attempt }: { attempt: AttemptRecord }) {
  if (attempt.correct) {
    return (
      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
        Correct
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
      Incorrect
    </span>
  );
}
