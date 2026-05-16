import type { ProgressData } from "@/lib/types";

export type ProgressSummary = {
  attemptCount: number;
  correctCount: number;
  wrongCount: number;
  bookmarkCount: number;
  aiPracticeLevels: number;
  pyqPracticeLevels: number;
  lastAttemptAt: string | null;
  lastVisited: string | null;
};

export function summarizeProgressSnapshot(
  snapshot: ProgressData | null | undefined,
): ProgressSummary {
  if (!snapshot || typeof snapshot !== "object") {
    return {
      attemptCount: 0,
      correctCount: 0,
      wrongCount: 0,
      bookmarkCount: 0,
      aiPracticeLevels: 0,
      pyqPracticeLevels: 0,
      lastAttemptAt: null,
      lastVisited: snapshot?.lastVisited ?? null,
    };
  }

  const attempts = Array.isArray(snapshot.attempts) ? snapshot.attempts : [];
  let lastAttemptMs = 0;
  let correctCount = 0;
  for (const a of attempts) {
    if (a.correct) correctCount++;
    if (typeof a.timestamp === "number" && a.timestamp > lastAttemptMs) {
      lastAttemptMs = a.timestamp;
    }
  }

  return {
    attemptCount: attempts.length,
    correctCount,
    wrongCount: attempts.length - correctCount,
    bookmarkCount: Array.isArray(snapshot.bookmarks)
      ? snapshot.bookmarks.length
      : 0,
    aiPracticeLevels: snapshot.aiPracticeSetsCompleted ?? 0,
    pyqPracticeLevels: snapshot.pyqPracticeSetsCompleted ?? 0,
    lastAttemptAt: lastAttemptMs > 0 ? new Date(lastAttemptMs).toISOString() : null,
    lastVisited: snapshot.lastVisited ?? null,
  };
}

export function mergeProgressSummaries(
  a: ProgressSummary,
  b: ProgressSummary,
): ProgressSummary {
  const lastAttemptAt =
    [a.lastAttemptAt, b.lastAttemptAt]
      .filter(Boolean)
      .sort()
      .pop() ?? null;

  const lastVisited =
    [a.lastVisited, b.lastVisited]
      .filter(Boolean)
      .sort()
      .pop() ?? null;

  return {
    attemptCount: a.attemptCount + b.attemptCount,
    correctCount: a.correctCount + b.correctCount,
    wrongCount: a.wrongCount + b.wrongCount,
    bookmarkCount: a.bookmarkCount + b.bookmarkCount,
    aiPracticeLevels: Math.max(a.aiPracticeLevels, b.aiPracticeLevels),
    pyqPracticeLevels: Math.max(a.pyqPracticeLevels, b.pyqPracticeLevels),
    lastAttemptAt,
    lastVisited,
  };
}

export function latestIsoDate(...values: (string | Date | null | undefined)[]): string | null {
  let best = 0;
  for (const v of values) {
    if (!v) continue;
    const ms = v instanceof Date ? v.getTime() : Date.parse(String(v));
    if (!Number.isNaN(ms) && ms > best) best = ms;
  }
  return best > 0 ? new Date(best).toISOString() : null;
}
