"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
      <PracticeCompleteCard
        title={allDone ? "All new questions done" : "No questions for this level"}
        description={
          allDone
            ? "You have attempted every question in this set with the current filters."
            : "No new questions match these filters."
        }
        showFilterReset
        onClearFilters={() => {
          const bank = questionsForBank(pb, aiQuestions, pyqQuestions);
          handleFilterChange(
            sanitizePracticeFilters(bank, defaultPracticeFilters()),
          );
        }}
      />
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

    const finishLevel = () => {
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
    };

    return (
      <PracticeCompleteCard
        title={
          isLevelMode ? `Level ${levelFinished} complete` : "Set complete"
        }
        description={
          <>
            You finished {questions.length} question
            {questions.length !== 1 ? "s" : ""}
            {questions.length < PRACTICE_MCQ_BATCH_SIZE && isLevelMode && (
              <span className="mt-2 block text-sm text-amber-300/95">
                This level has {questions.length} questions in the set.
              </span>
            )}
          </>
        }
        hint={
          isLevelMode && hasNext
            ? `Up next: Level ${nextLevel}`
            : isLevelMode && !hasNext
              ? "No more new questions with these filters."
              : undefined
        }
        primaryLabel={
          bookmarksMode
            ? "Practice again"
            : hasNext
              ? `Start Level ${nextLevel}`
              : undefined
        }
        onPrimary={finishLevel}
        showFilterReset={
          !bookmarksMode && isLevelMode && !hasNext && !!practiceBankFromUrl
        }
        onClearFilters={() => {
          if (!practiceBankFromUrl) return;
          const bank =
            practiceBankFromUrl === "pyq" ? pyqQuestions : aiQuestions;
          handleFilterChange(
            sanitizePracticeFilters(bank, defaultPracticeFilters()),
          );
        }}
      />
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
          className="min-h-[44px] rounded-lg border border-study-border/80 bg-study-raised/50 px-4 py-2 text-sm text-study-muted transition hover:bg-study-raised hover:text-study-ink sm:min-h-0 sm:py-1.5"
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

function PracticeCompleteCard({
  title,
  description,
  hint,
  primaryLabel,
  onPrimary,
  showFilterReset,
  onClearFilters,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  showFilterReset?: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[min(70vh,520px)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-study-border/70 bg-study-surface/95 p-6 text-center shadow-xl shadow-black/25">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-2xl text-emerald-300"
          aria-hidden
        >
          ✓
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-study-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-study-muted">
          {description}
        </p>
        {hint ? (
          <p className="mt-3 text-sm font-medium text-study-soft">{hint}</p>
        ) : null}

        <div className="mt-6 flex w-full flex-col gap-3">
          {primaryLabel && onPrimary ? (
            <button
              type="button"
              onClick={onPrimary}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 active:scale-[0.99]"
            >
              {primaryLabel}
              <span aria-hidden>→</span>
            </button>
          ) : null}

          {showFilterReset && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-sky-400/45 bg-sky-500/12 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20 active:scale-[0.99]"
            >
              Try different filters
            </button>
          ) : null}

          <Link
            href="/attempts"
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-study-border/90 bg-study-raised/50 px-5 py-3 text-sm font-semibold text-study-ink transition hover:bg-study-raised active:scale-[0.99]"
          >
            My attempts
          </Link>

          <Link
            href="/"
            className="flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-study-muted transition hover:text-study-soft"
          >
            Home
          </Link>
        </div>
      </div>
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
