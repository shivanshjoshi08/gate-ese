import type { AttemptRecord, ExamType, ProgressData, SessionState } from "./types";
import { LEGACY_STORAGE_KEY, PROGRESS_KEYS } from "./constants";
import { getSelectedExam } from "./exam";

const defaultProgress: ProgressData = {
  attempts: [],
  bookmarks: [],
  session: null,
  lastVisited: null,
};

function getKey(exam?: ExamType): string {
  const e = exam ?? (typeof window !== "undefined" ? getSelectedExam() : "GATE");
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
    };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(data: ProgressData, exam?: ExamType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getKey(exam), JSON.stringify(data));
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
  saveProgress(progress, exam);
}

export function getAttemptedIds(exam?: ExamType): Set<string> {
  return new Set(loadProgress(exam).attempts.map((a) => a.questionId));
}

export function resetProgress(exam?: ExamType): void {
  if (typeof window === "undefined") return;
  const e = exam ?? getSelectedExam();
  localStorage.removeItem(getKey(e));
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
