"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import QuestionCard from "@/components/QuestionCard";
import type { Filters as FiltersType, ProgressData, Question } from "@/lib/types";
import {
  buildFilterKey,
  getQuestionsByIds,
  normalizePracticeBankFromStorage,
  parsePracticeBankQueryParam,
  type PracticeBankKind,
  PRACTICE_MCQ_BATCH_SIZE,
  shuffle,
} from "@/lib/questions";
import {
  defaultPracticeFilters,
  sanitizePracticeFilters,
} from "@/lib/available-filters";
import {
  findFirstPracticeLevelWithQuestions,
  getActivePracticeLevel,
  hasPracticeLevelForFilters,
  PRACTICE_LEVEL_BATCH_SIZE,
} from "@/lib/practice-levels";
import SimplePracticeFilters from "@/components/SimplePracticeFilters";
import {
  applyPracticeLevelComplete,
  getMergedAttemptsMap,
  getPracticeLevelsCompleted,
  getStats,
  loadProgress,
  saveProgress,
  saveSession,
} from "@/lib/storage";
import { useSession } from "next-auth/react";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";
import { usePracticeBank } from "@/hooks/PracticeBankContext";
import { USER_PYQ_ENABLED } from "@/lib/feature-flags";

function parseLevelFromFilterKey(filterKey: string | undefined): number | null {
  const m = filterKey?.match(/::level:(\d+)$/);
  return m ? parseInt(m[1]!, 10) : null;
}

function getAttemptedQuestionIds(): Set<string> {
  return new Set(getMergedAttemptsMap().keys());
}

function questionsForBank(
  pb: PracticeBankKind,
  ai: Question[],
  pyq: Question[],
): Question[] {
  return pb === "pyq" && USER_PYQ_ENABLED ? pyq : ai;
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exam } = useExam();
  const { status, data: session } = useSession();
  const {
    questions: mergedBank,
    aiQuestions,
    pyqQuestions,
    loadingPyq,
    error: bankError,
    reload: reloadBank,
  } = usePracticeBank();

  const [dbHydrated, setDbHydrated] = useState(false);
  const practiceBankFromUrl = useMemo(() => {
    const raw = parsePracticeBankQueryParam(searchParams.get("bank"));
    if (!USER_PYQ_ENABLED && raw === "pyq") return "ai" as PracticeBankKind;
    return raw;
  }, [searchParams]);

  const bookmarksMode = searchParams.get("bookmarks") === "1";
  const continueSession = searchParams.get("continue") === "1";

  useEffect(() => {
    if (USER_PYQ_ENABLED || bookmarksMode || continueSession) return;
    const raw = parsePracticeBankQueryParam(searchParams.get("bank"));
    if (raw === null || raw === "pyq") {
      router.replace("/practice?bank=ai");
    }
  }, [searchParams, bookmarksMode, continueSession, router]);

  const [filters, setFilters] = useState<FiltersType>(defaultPracticeFilters);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState(() => getStats(exam));
  const [focusMode, setFocusMode] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const activeBank = useMemo(() => {
    if (practiceBankFromUrl === "pyq") return pyqQuestions;
    if (practiceBankFromUrl === "ai") return aiQuestions;
    return mergedBank;
  }, [practiceBankFromUrl, aiQuestions, pyqQuestions, mergedBank]);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user) {
      setDbHydrated(true);
      return;
    }
    if (session.user.id === "admin") {
      setDbHydrated(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const exams = ["ESE", "GATE"] as const;
        for (const ex of exams) {
          const r = await fetch(`/api/user/progress?exam=${ex}`, {
            cache: "no-store",
          });
          if (!r.ok || cancelled) continue;
          const j = (await r.json()) as { progress: ProgressData | null };
          if (j.progress && typeof j.progress === "object" && !cancelled) {
            saveProgress(j.progress, ex);
          }
        }
      } finally {
        if (!cancelled) setDbHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user]);

  const booting =
    status === "loading" ||
    (status === "authenticated" && !dbHydrated);

  const loadLevel = useCallback(
    (pb: PracticeBankKind, levelNumber: number, f: FiltersType) => {
      const bank = pb === "pyq" ? pyqQuestions : aiQuestions;
      const attemptedIds = getAttemptedQuestionIds();
      const { level, questions: list } = findFirstPracticeLevelWithQuestions(
        bank,
        f,
        pb,
        levelNumber,
        attemptedIds,
      );

      const baseKey = buildFilterKey(f, undefined, pb);
      saveSession(
        {
          questionIds: list.map((q) => q.id),
          currentIndex: 0,
          filterKey: `${baseKey}::level:${level}`,
          practiceBank: pb,
        },
        exam,
      );
      setQuestions(list);
      setCurrentLevel(level);
      setIndex(0);
    },
    [aiQuestions, pyqQuestions, exam],
  );

  const startBankAtUserLevel = useCallback(
    (pb: PracticeBankKind, f: FiltersType) => {
      const completed = getPracticeLevelsCompleted(exam, pb);
      loadLevel(pb, getActivePracticeLevel(completed), f);
    },
    [exam, loadLevel],
  );

  const handleFilterChange = useCallback(
    (next: FiltersType) => {
      if (!practiceBankFromUrl) return;
      const bank = practiceBankFromUrl === "pyq" ? pyqQuestions : aiQuestions;
      const sanitized = sanitizePracticeFilters(bank, next);
      setFilters(sanitized);
      loadLevel(practiceBankFromUrl, 1, sanitized);
    },
    [practiceBankFromUrl, aiQuestions, pyqQuestions, loadLevel],
  );

  useEffect(() => {
    setStats(getStats(exam));
    setInitialized(false);
  }, [exam, searchParams, practiceBankFromUrl]);

  useEffect(() => {
    if (booting) return;
    if (loadingPyq && practiceBankFromUrl) return;
    if (initialized) return;

    if (!bookmarksMode && !continueSession && practiceBankFromUrl === null) {
      setInitialized(true);
      return;
    }

    if (bookmarksMode) {
      const { bookmarks } = loadProgress(exam);
      setQuestions(
        shuffle(
          getQuestionsByIds(mergedBank, bookmarks).filter((q) => q.exam === exam),
        ),
      );
      setIndex(0);
      setCurrentLevel(0);
      setInitialized(true);
      return;
    }

    if (continueSession) {
      const progress = loadProgress(exam);
      if (progress.session?.questionIds.length) {
        const ids = progress.session.questionIds;
        const pb = normalizePracticeBankFromStorage(
          progress.session.practiceBank,
          progress.session.filterKey,
        );
        const primary =
          pb === "pyq" ? pyqQuestions : pb === "ai" ? aiQuestions : mergedBank;
        const attemptedIds = getAttemptedQuestionIds();
        const qs = ids
          .map(
            (id) =>
              primary.find((q) => q.id === id) ??
              mergedBank.find((q) => q.id === id),
          )
          .filter(
            (q): q is Question => !!q && !attemptedIds.has(q.id),
          );
        const savedIndex = progress.session.currentIndex;
        const nextIndex = Math.min(
          savedIndex,
          Math.max(0, qs.length - 1),
        );
        setQuestions(qs);
        setIndex(nextIndex);
        setCurrentLevel(
          parseLevelFromFilterKey(progress.session.filterKey) ??
            getActivePracticeLevel(
              getPracticeLevelsCompleted(exam, pb ?? "ai"),
            ),
        );
        setInitialized(true);
        return;
      }
    }

    if (practiceBankFromUrl === null) {
      setInitialized(true);
      return;
    }

    const bank =
      practiceBankFromUrl === "pyq" ? pyqQuestions : aiQuestions;
    // const yearParam = searchParams.get("year");
    let f = sanitizePracticeFilters(bank, defaultPracticeFilters());
    // if (yearParam && /^\d{4}$/.test(yearParam)) {
    //   f = { ...f, year: yearParam };
    // }
    setFilters(f);
    startBankAtUserLevel(practiceBankFromUrl, f);
    setInitialized(true);
  }, [
    initialized,
    startBankAtUserLevel,
    exam,
    mergedBank,
    aiQuestions,
    pyqQuestions,
    bookmarksMode,
    continueSession,
    practiceBankFromUrl,
    booting,
    loadingPyq,
    searchParams,
  ]);

  const accent = EXAM_COLORS[exam];
  const isLevelMode = practiceBankFromUrl === "ai";

  const handleAnswered = () => setStats(getStats(exam));

  const handleNext = () => {
    const next = index + 1;
    if (next >= questions.length) {
      setIndex(questions.length);
      return;
    }
    setIndex(next);
    const progress = loadProgress(exam);
    if (progress.session) {
      saveSession({ ...progress.session, currentIndex: next }, exam);
    }
  };

  const bankBanner = useMemo(() => {
    if (bookmarksMode) return "Bookmarks";
    if (practiceBankFromUrl === "ai") {
      return `Level ${currentLevel}`;
    }
    return null;
  }, [practiceBankFromUrl, bookmarksMode, currentLevel]);

  const bankBannerClass =
    "border-l-[3px] border-l-sky-400/80 bg-sky-500/[0.06]";

  if (!initialized || booting || (loadingPyq && practiceBankFromUrl)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-study-muted">Loading...</p>
      </div>
    );
  }

  if (questions.length === 0 && isLevelMode) {
    const pb = practiceBankFromUrl!;
    const completed = getPracticeLevelsCompleted(exam, pb);
    const bank = questionsForBank(pb, aiQuestions, pyqQuestions);
    const attemptedIds = getAttemptedQuestionIds();
    const allDone =
      !hasPracticeLevelForFilters(
        bank,
        filters,
        getActivePracticeLevel(completed),
        pb,
        attemptedIds,
      );

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-2xl font-bold text-study-ink">
          {allDone ? "All new questions done" : "No questions for this level"}
        </p>
        <p className="mt-2 text-sm text-study-muted">
          {allDone
            ? "You have attempted every question in this set with the current filters. Try different filters or review past attempts."
            : "No new questions match these filters. Try broader filters above."}
        </p>
        <Link
          href="/attempts"
          className="mt-4 inline-block text-sm font-medium text-sky-400 hover:underline"
        >
          View my attempts
        </Link>
        <Link href="/" className="mt-4 block text-sm text-study-muted hover:text-study-soft">
          Home
        </Link>
      </div>
    );
  }

  if (index >= questions.length) {
    const pb = practiceBankFromUrl ?? "ai";
    const levelFinished = currentLevel > 0 ? currentLevel : 1;
    const nextLevel = levelFinished + 1;
    const bank = questionsForBank(pb, aiQuestions, pyqQuestions);
    const attemptedIds = getAttemptedQuestionIds();
    const hasNext = hasPracticeLevelForFilters(
      bank,
      filters,
      nextLevel,
      pb,
      attemptedIds,
    );

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-2xl font-bold text-study-ink">
          {isLevelMode ? <>Level {levelFinished} complete</> : <>Done</>}
        </p>
        <p className="mt-2 text-study-muted">
          You finished {questions.length} question
          {questions.length !== 1 ? "s" : ""}
          {questions.length < PRACTICE_MCQ_BATCH_SIZE && isLevelMode && (
            <span className="block pt-1 text-xs text-amber-400/90">
              This level has {questions.length} questions in the set.
            </span>
          )}
        </p>
        {isLevelMode && hasNext && (
          <p className="mt-3 text-sm font-medium text-study-soft">
            Up next: Level {nextLevel}
          </p>
        )}
        {isLevelMode && !hasNext && (
          <p className="mt-3 text-sm text-study-muted">
            No more new questions in this set with current filters.
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            if (bookmarksMode) {
              const { bookmarks } = loadProgress(exam);
              setQuestions(
                shuffle(
                  getQuestionsByIds(mergedBank, bookmarks).filter(
                    (q) => q.exam === exam,
                  ),
                ),
              );
              setIndex(0);
              return;
            }
            if (practiceBankFromUrl && questions.length > 0) {
              applyPracticeLevelComplete(
                exam,
                practiceBankFromUrl,
                questions.map((q) => q.id),
              );
              if (hasNext) loadLevel(practiceBankFromUrl, nextLevel, filters);
            }
          }}
          disabled={
            bookmarksMode ? false : !practiceBankFromUrl || (!hasNext && isLevelMode)
          }
          className="mt-6 rounded-xl px-6 py-2.5 font-semibold text-white shadow-lg shadow-black/15 transition hover:brightness-105 disabled:opacity-40"
          style={{ backgroundColor: accent.accent }}
        >
          {bookmarksMode
            ? "Again"
            : hasNext
              ? `Start Level ${nextLevel} →`
              : "All levels done"}
        </button>
        {!hasNext && isLevelMode && (
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-study-muted hover:text-study-soft"
          >
            Home
          </Link>
        )}
      </div>
    );
  }

  const current = questions[index];

  return (
    <div className={focusMode ? "focus-mode" : ""}>
      {bankBanner && (
        <div
          className={`border-b border-study-border/70 bg-study-surface/85 px-4 py-2.5 text-center text-xs font-medium text-study-soft ${bankBannerClass}`}
        >
          {bankBanner}
        </div>
      )}
      <StatsBar
        attempted={stats.attempted}
        correct={stats.correct}
        wrong={stats.wrong}
        accuracy={stats.accuracy}
        streak={stats.streak}
      />
      {isLevelMode && !bookmarksMode && (
        <SimplePracticeFilters
          bank={activeBank}
          filters={filters}
          onChange={handleFilterChange}
          accent={accent.accent}
        />
      )}
      <div className="hide-in-focus flex justify-end px-4 pt-2">
        <button
          type="button"
          onClick={() => setFocusMode((fm) => !fm)}
          className="rounded-lg border border-study-border/80 bg-study-raised/50 px-3 py-1.5 text-sm text-study-muted transition hover:bg-study-raised hover:text-study-ink"
        >
          {focusMode ? "Show menus" : "Focus"}
        </button>
      </div>
      {current && (
        <QuestionCard
          key={current.id}
          question={current}
          questionNumber={index + 1}
          questionTotal={questions.length}
          levelNumber={isLevelMode ? currentLevel : undefined}
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
        <div className="flex min-h-[50vh] items-center justify-center text-study-muted">
          Loading...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
