"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StatsBar from "@/components/StatsBar";
import Filters from "@/components/Filters";
import QuestionCard from "@/components/QuestionCard";
import type { ExamType, Filters as FiltersType, Question } from "@/lib/types";
import {
  allQuestions,
  buildFilterKey,
  filterQuestions,
  getQuestionsByIds,
  shuffle,
} from "@/lib/questions";
import {
  getAttemptedIds,
  getStats,
  loadProgress,
  saveSession,
} from "@/lib/storage";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

function makeDefaultFilters(exam: ExamType): FiltersType {
  return {
    exam,
    paper: "All",
    subject: "All",
    difficulty: "All",
    year: "All",
    marks: "All",
    type: "All",
    reviewMode: false,
  };
}

function PracticeContent() {
  const searchParams = useSearchParams();
  const { exam } = useExam();
  const [filters, setFilters] = useState<FiltersType>(() =>
    makeDefaultFilters(exam)
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(0);
  const [stats, setStats] = useState(() => getStats(exam));
  const [focusMode, setFocusMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const initSession = useCallback(
    (f: FiltersType, subjectOverride?: string) => {
      const attemptedIds = getAttemptedIds(f.exam);
      let filtered = filterQuestions(f, attemptedIds);
      if (filtered.length === 0 && !f.reviewMode) {
        filtered = filterQuestions({ ...f, reviewMode: true }, attemptedIds);
      }
      const shuffled = shuffle(filtered);
      const filterKey = buildFilterKey(f, subjectOverride);
      saveSession(
        {
          questionIds: shuffled.map((q) => q.id),
          currentIndex: 0,
          filterKey,
        },
        f.exam
      );
      setQuestions(shuffled);
      setIndex(0);
      setSessionDone(0);
    },
    []
  );

  useEffect(() => {
    const f = makeDefaultFilters(exam);
    const paperParam = searchParams.get("paper");
    const subjectParam = searchParams.get("subject");
    if (paperParam) f.paper = paperParam;
    if (subjectParam) f.subject = decodeURIComponent(subjectParam);
    setFilters(f);
    setStats(getStats(exam));
    setInitialized(false);
  }, [exam, searchParams]);

  useEffect(() => {
    if (initialized) return;

    const subjectParam = searchParams.get("subject");
    const paperParam = searchParams.get("paper");
    const modeRandom = searchParams.get("mode") === "random";
    const continueSession = searchParams.get("continue") === "1";
    const bookmarksMode = searchParams.get("bookmarks") === "1";

    let f = makeDefaultFilters(exam);
    if (paperParam) f.paper = paperParam;
    if (subjectParam) f.subject = decodeURIComponent(subjectParam);

    if (bookmarksMode) {
      const { bookmarks } = loadProgress(exam);
      const qs = shuffle(
        getQuestionsByIds(bookmarks).filter((q) => q.exam === exam)
      );
      setQuestions(qs);
      setIndex(0);
      setSessionDone(0);
      setFilters(f);
      setInitialized(true);
      return;
    }

    if (continueSession) {
      const progress = loadProgress(exam);
      if (progress.session && progress.session.questionIds.length > 0) {
        const ids = progress.session.questionIds;
        const qs = ids
          .map((id) => allQuestions.find((q) => q.id === id))
          .filter(Boolean) as Question[];
        setQuestions(qs);
        setIndex(progress.session.currentIndex);
        setSessionDone(progress.session.currentIndex);
        setFilters(f);
        setInitialized(true);
        return;
      }
    }

    if (modeRandom) {
      f = makeDefaultFilters(exam);
    }

    initSession(f, subjectParam ?? undefined);
    setFilters(f);
    setInitialized(true);
  }, [searchParams, initialized, initSession, exam]);

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    initSession(newFilters);
  };

  const current = questions[index];
  const accent = EXAM_COLORS[exam];

  const handleAnswered = () => {
    setStats(getStats(exam));
  };

  const handleNext = () => {
    const next = index + 1;
    if (next >= questions.length) {
      setIndex(questions.length);
      return;
    }
    setIndex(next);
    setSessionDone(next);
    const progress = loadProgress(exam);
    if (progress.session) {
      saveSession({ ...progress.session, currentIndex: next }, exam);
    }
  };

  if (!initialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg text-gray-600">No questions match your filters.</p>
        <p className="mt-2 text-sm text-gray-500">
          Try enabling Review Mode or run npm run extract to add {exam} questions.
        </p>
      </div>
    );
  }

  if (index >= questions.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-2xl font-bold">Session complete! 🎉</p>
        <p className="mt-2 text-gray-600">
          You finished {questions.length} questions in this set.
        </p>
        <button
          type="button"
          onClick={() => initSession(filters)}
          className="mt-6 rounded-xl px-6 py-2.5 font-semibold text-white"
          style={{ backgroundColor: accent.accent }}
        >
          Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className={focusMode ? "focus-mode" : ""}>
      <StatsBar
        attempted={stats.attempted}
        correct={stats.correct}
        wrong={stats.wrong}
        accuracy={stats.accuracy}
        streak={stats.streak}
        current={sessionDone}
        total={questions.length}
      />
      <Filters filters={filters} onChange={handleFilterChange} />
      <div className="hide-in-focus flex justify-end px-4 pt-2">
        <button
          type="button"
          onClick={() => setFocusMode((f) => !f)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {focusMode ? "Exit Focus" : "Focus Mode"}
        </button>
      </div>
      {current && (
        <QuestionCard
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          onNext={handleNext}
          focusMode={focusMode}
        />
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
