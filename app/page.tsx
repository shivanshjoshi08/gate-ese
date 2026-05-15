"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { allQuestions } from "@/lib/questions";
import {
  ESE_PAPER_LABELS,
  getSubjectShort,
  getSubjectsForExam,
  SUBJECT_ICONS,
} from "@/lib/constants";
import {
  getStats,
  getSubjectStats,
  loadProgress,
  resetProgress,
} from "@/lib/storage";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

export default function HomePage() {
  const { exam } = useExam();
  const [stats, setStats] = useState({
    attempted: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    streak: 0,
  });
  const [hasSession, setHasSession] = useState(false);
  const [esePaper, setEsePaper] = useState<"PRE" | "P1" | "P2">("PRE");

  const accent = EXAM_COLORS[exam];
  const examQuestions = allQuestions.filter((q) => q.exam === exam);

  useEffect(() => {
    setStats(getStats(exam));
    const progress = loadProgress(exam);
    setHasSession(
      !!progress.session && progress.session.questionIds.length > 0
    );
  }, [exam]);

  const paperFilter = exam === "ESE" ? esePaper : "All";
  const subjects = getSubjectsForExam(exam, paperFilter);

  const subjectCards = subjects.map((subject) => {
    const total = examQuestions.filter((q) => {
      if (q.subject !== subject) return false;
      if (exam === "ESE" && esePaper !== "PRE") {
        return q.paper === esePaper || (esePaper === "P1" && q.paper === "PRE");
      }
      if (exam === "ESE") {
        return q.paper === "PRE" || q.paper === "P1";
      }
      return true;
    }).length;
    const { accuracy } = getSubjectStats(subject, exam);
    return { subject, total, accuracy };
  });

  const weakTopics = subjectCards.filter(
    (s) =>
      s.accuracy < 50 && getSubjectStats(s.subject, exam).attempted >= 3
  );

  const handleReset = () => {
    if (
      confirm(
        `Reset all ${exam} progress, attempts, and bookmarks? This cannot be undone.`
      )
    ) {
      resetProgress(exam);
      setStats(getStats(exam));
      setHasSession(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section
        className="mb-8 rounded-2xl border border-gray-200 p-6"
        style={{
          background: `linear-gradient(to bottom right, ${exam === "GATE" ? "#eff6ff" : "#f5f3ff"}, white)`,
        }}
      >
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {exam} Civil Engineering Practice
        </h1>
        <p className="mt-2 text-gray-600">
          {examQuestions.length} {exam} questions · PYQ-based practice
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <StatPill label="Attempted" value={stats.attempted} />
          <StatPill label="Correct" value={stats.correct} className="text-correct" />
          <StatPill label="Accuracy" value={`${stats.accuracy}%`} />
          <StatPill label="Streak" value={`${stats.streak} 🔥`} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/practice?mode=random"
            className="rounded-xl px-5 py-2.5 font-semibold text-white"
            style={{ backgroundColor: accent.accent }}
          >
            Start Random Mix
          </Link>
          {hasSession && (
            <Link
              href="/practice?continue=1"
              className="rounded-xl border-2 border-gray-900 px-5 py-2.5 font-semibold hover:bg-gray-50"
            >
              Continue where I left off
            </Link>
          )}
          <Link
            href="/mock"
            className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50"
          >
            Mock Test
          </Link>
        </div>
      </section>

      {exam === "ESE" && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-600">
            Select Paper
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["PRE", "P1", "P2"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEsePaper(p)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  esePaper === p
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  esePaper === p
                    ? { backgroundColor: accent.accent }
                    : undefined
                }
              >
                {ESE_PAPER_LABELS[p]}
              </button>
            ))}
          </div>
        </section>
      )}

      {weakTopics.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Weak Topics</h2>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(({ subject, accuracy }) => (
              <Link
                key={subject}
                href={`/practice?subject=${encodeURIComponent(subject)}${exam === "ESE" ? `&paper=${esePaper}` : ""}`}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm"
              >
                <span>{getSubjectShort(subject)}</span>
                <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {accuracy}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Practice by Subject</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectCards.map(({ subject, total, accuracy }) => (
            <div
              key={subject}
              className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md"
            >
              <div className="text-3xl">
                {SUBJECT_ICONS[subject] ?? "📚"}
              </div>
              <h3 className="mt-2 font-semibold">{getSubjectShort(subject)}</h3>
              <p className="text-sm text-gray-500">{total} questions</p>
              <p className="mt-1 text-sm">
                Accuracy:{" "}
                <span
                  className={
                    accuracy >= 70
                      ? "text-correct font-medium"
                      : accuracy < 50 && accuracy > 0
                        ? "text-wrong font-medium"
                        : ""
                  }
                >
                  {accuracy}%
                </span>
              </p>
              <Link
                href={`/practice?subject=${encodeURIComponent(subject)}${exam === "ESE" ? `&paper=${esePaper}` : ""}`}
                className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: accent.accent }}
              >
                Practice
              </Link>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleReset}
        className="mt-10 text-sm text-gray-500 underline hover:text-wrong"
      >
        Reset {exam} Progress
      </button>
    </div>
  );
}

function StatPill({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <span className={`rounded-lg bg-white px-3 py-1.5 shadow-sm ${className}`}>
      <span className="text-gray-500">{label}:</span>{" "}
      <span className="font-semibold">{value}</span>
    </span>
  );
}
