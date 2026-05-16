import type {
  AttemptRecord,
  ExamType,
  ProgressData,
  SessionState,
} from "./types";
import { LEGACY_STORAGE_KEY, PROGRESS_KEYS } from "./constants";
import { getSelectedExam } from "./exam";
import { PRACTICE_MCQ_BATCH_SIZE } from "./questions";

const defaultProgress: ProgressData = {
  attempts: [],
  bookmarks: [],
  session: null,
  lastVisited: null,
  aiPracticeSetsCompleted: 0,
  pyqPracticeSetsCompleted: 0,
  aiLastRoundQuestionIds: [],
};

function getKey(exam?: ExamType): string {
  const e = exam ?? (typeof window !== "undefined" ? getSelectedExam() : "ESE");
  return PROGRESS_KEYS[e];
}

function migrateLegacyProgress(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy && !localStorage.getItem(PROGRESS_KEYS.GATE)) {
    localStorage.setItem(PROGRESS_KEYS.GATE, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export function loadProgress(exam?: ExamType): ProgressData {
  if (typeof window === "undefined") return { ...defaultProgress };
  migrateLegacyProgress();
  try {
    const raw = localStorage.getItem(getKey(exam));
    if (!raw) return { ...defaultProgress };
    const data = JSON.parse(raw) as ProgressData;
    return {
      attempts: data.attempts ?? [],
      bookmarks: data.bookmarks ?? [],
      session: data.session ?? null,
      lastVisited: data.lastVisited ?? null,
      aiPracticeSetsCompleted: data.aiPracticeSetsCompleted ?? 0,
      pyqPracticeSetsCompleted: data.pyqPracticeSetsCompleted ?? 0,
      aiLastRoundQuestionIds: Array.isArray(data.aiLastRoundQuestionIds)
        ? data.aiLastRoundQuestionIds
        : [],
    };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(data: ProgressData, exam?: ExamType): void {
  if (typeof window === "undefined") return;
  const e = exam ?? getSelectedExam();
  localStorage.setItem(getKey(e), JSON.stringify(data));
  try {
    window.dispatchEvent(
      new CustomEvent("gate-progress-saved", { detail: { exam: e } }),
    );
  } catch {
    /* ignore */
  }
}

export function recordAttempt(attempt: AttemptRecord, exam?: ExamType): void {
  const e = exam ?? attempt.exam ?? getSelectedExam();
  const progress = loadProgress(e);
  const existing = progress.attempts.findIndex(
    (a) => a.questionId === attempt.questionId
  );
  if (existing >= 0) {
    progress.attempts[existing] = attempt;
  } else {
    progress.attempts.push(attempt);
  }
  progress.lastVisited = new Date().toISOString();
  saveProgress(progress, e);
}

export function toggleBookmark(questionId: string, exam?: ExamType): boolean {
  const e = exam ?? getSelectedExam();
  const progress = loadProgress(e);
  const idx = progress.bookmarks.indexOf(questionId);
  if (idx >= 0) {
    progress.bookmarks.splice(idx, 1);
    saveProgress(progress, e);
    return false;
  }
  progress.bookmarks.push(questionId);
  saveProgress(progress, e);
  return true;
}

export function isBookmarked(questionId: string, exam?: ExamType): boolean {
  return loadProgress(exam).bookmarks.includes(questionId);
}

export function saveSession(session: SessionState | null, exam?: ExamType): void {
  const progress = loadProgress(exam);
  progress.session = session;
  progress.lastVisited = new Date().toISOString();
  saveProgress(progress, exam);
}

/**
 * Call when learner finishes an AI Practice MCQ round (all questions in batch).
 * Tracks set count for progress UI and biases the following round away from the same 10 ids.
 */
export function applyAiPracticeRoundComplete(
  exam: ExamType,
  roundQuestionIds: string[],
): void {
  applyPracticeLevelComplete(exam, "ai", roundQuestionIds);
}

export function applyPracticeLevelComplete(
  exam: ExamType,
  bank: "ai" | "pyq",
  roundQuestionIds: string[],
): void {
  const p = loadProgress(exam);
  if (bank === "ai") {
    p.aiLastRoundQuestionIds = Array.from(new Set(roundQuestionIds)).slice(
      0,
      PRACTICE_MCQ_BATCH_SIZE + 4,
    );
    p.aiPracticeSetsCompleted = (p.aiPracticeSetsCompleted ?? 0) + 1;
  } else {
    p.pyqPracticeSetsCompleted = (p.pyqPracticeSetsCompleted ?? 0) + 1;
  }
  p.lastVisited = new Date().toISOString();
  saveProgress(p, exam);
}

export function getPracticeLevelsCompleted(
  exam: ExamType | undefined,
  bank: "ai" | "pyq",
): number {
  const p = loadProgress(exam);
  return bank === "ai"
    ? (p.aiPracticeSetsCompleted ?? 0)
    : (p.pyqPracticeSetsCompleted ?? 0);
}

export function getAttemptedIds(exam?: ExamType): Set<string> {
  return new Set(loadProgress(exam).attempts.map((a) => a.questionId));
}

/** Latest attempt per question across GATE + ESE progress slots. */
export function getMergedAttemptsMap(): Map<string, AttemptRecord> {
  const byId = new Map<string, AttemptRecord>();
  for (const ex of ["ESE", "GATE"] as const) {
    for (const a of loadProgress(ex).attempts) {
      const prev = byId.get(a.questionId);
      if (!prev || a.timestamp > prev.timestamp) {
        byId.set(a.questionId, a);
      }
    }
  }
  return byId;
}

/** Resolve attempted question ids when practice filters include both GATE + ESE. */
export function getAttemptedIdsForFilter(
  filterExam: ExamType | "All",
): Set<string> {
  if (filterExam === "All") {
    const g = loadProgress("GATE").attempts.map((a) => a.questionId);
    const e = loadProgress("ESE").attempts.map((a) => a.questionId);
    return new Set(g.concat(e));
  }
  return getAttemptedIds(filterExam);
}

export function createEmptyProgress(): ProgressData {
  return {
    attempts: [],
    bookmarks: [],
    session: null,
    lastVisited: null,
    aiPracticeSetsCompleted: 0,
    pyqPracticeSetsCompleted: 0,
    aiLastRoundQuestionIds: [],
  };
}

export function resetProgress(exam?: ExamType): void {
  if (typeof window === "undefined") return;
  const e = exam ?? getSelectedExam();
  localStorage.removeItem(getKey(e));
  try {
    window.dispatchEvent(
      new CustomEvent("gate-progress-saved", { detail: { exam: e } }),
    );
  } catch {
    /* ignore */
  }
}

/** Clear local progress for both GATE and ESE exam slots. */
export function resetAllProgress(): void {
  if (typeof window === "undefined") return;
  migrateLegacyProgress();
  (["ESE", "GATE"] as const).forEach((e) => localStorage.removeItem(getKey(e)));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  try {
    window.dispatchEvent(
      new CustomEvent("gate-progress-saved", { detail: { exam: "ALL" } }),
    );
  } catch {
    /* ignore */
  }
}

export function getStats(exam?: ExamType) {
  const { attempts } = loadProgress(exam);
  const correct = attempts.filter((a) => a.correct).length;
  const wrong = attempts.filter((a) => !a.correct).length;
  const attempted = attempts.length;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  let streak = 0;
  const sorted = [...attempts].sort((a, b) => b.timestamp - a.timestamp);
  for (const a of sorted) {
    if (a.correct) streak++;
    else break;
  }

  return { attempted, correct, wrong, accuracy, streak };
}

export function getSubjectStats(subject: string, exam?: ExamType) {
  const { attempts } = loadProgress(exam);
  const filtered =
    subject === "All"
      ? attempts
      : attempts.filter((a) => a.subject === subject);
  const correct = filtered.filter((a) => a.correct).length;
  const attempted = filtered.length;
  return {
    attempted,
    correct,
    accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
  };
}
