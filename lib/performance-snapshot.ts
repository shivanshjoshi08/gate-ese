import { getSubjectsForExam, getSubjectShort } from "@/lib/constants";
import type { AttemptRecord, ExamType, ProgressData, Question } from "@/lib/types";

export type PerformanceSnapshot = {
  exam: ExamType;
  totals: {
    attempted: number;
    correct: number;
    wrong: number;
    accuracy: number;
    streak: number;
  };
  subjects: {
    name: string;
    short: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }[];
  papers?: { paper: string; attempted: number; accuracy: number }[];
  weakTopics: {
    subject: string;
    topic: string;
    attempted: number;
    missRate: number;
  }[];
  strongTopics: {
    subject: string;
    topic: string;
    attempted: number;
    accuracy: number;
  }[];
  recent: {
    last7DaysAttempted: number;
    last7DaysAccuracy: number;
  };
  levels: {
    aiPracticeSetsCompleted: number;
    pyqPracticeSetsCompleted: number;
  };
};

export type AiPerformanceAnalysis = {
  overview: string;
  strengths: { area: string; detail: string }[];
  weaknesses: { area: string; detail: string }[];
  prioritySubjects: { subject: string; reason: string }[];
  topicFocus: { topic: string; action: string }[];
  studyPlan: string;
};

function computeStreak(attempts: AttemptRecord[]): number {
  let streak = 0;
  const sorted = [...attempts].sort((a, b) => b.timestamp - a.timestamp);
  for (const a of sorted) {
    if (a.correct) streak++;
    else break;
  }
  return streak;
}

function topicStats(attempts: AttemptRecord[]) {
  const map = new Map<
    string,
    { subject: string; topic: string; total: number; wrong: number; correct: number }
  >();
  for (const a of attempts) {
    const key = `${a.subject}::${a.topic}`;
    let row = map.get(key);
    if (!row) {
      row = { subject: a.subject, topic: a.topic, total: 0, wrong: 0, correct: 0 };
      map.set(key, row);
    }
    row.total++;
    if (a.correct) row.correct++;
    else row.wrong++;
  }
  return Array.from(map.values());
}

export function buildPerformanceSnapshot(
  exam: ExamType,
  attempts: AttemptRecord[],
  questionMap: Map<string, Question>,
  progress?: Pick<
    ProgressData,
    "aiPracticeSetsCompleted" | "pyqPracticeSetsCompleted"
  >,
): PerformanceSnapshot {
  const correct = attempts.filter((a) => a.correct).length;
  const attempted = attempts.length;

  const subjects = getSubjectsForExam(exam, "All").map((name) => {
    const filtered = attempts.filter((a) => a.subject === name);
    const subCorrect = filtered.filter((a) => a.correct).length;
    const subAttempted = filtered.length;
    return {
      name,
      short: getSubjectShort(name),
      attempted: subAttempted,
      correct: subCorrect,
      accuracy:
        subAttempted > 0
          ? Math.round((subCorrect / subAttempted) * 100)
          : 0,
    };
  });

  const topics = topicStats(attempts);
  const weakTopics = topics
    .filter((t) => t.total >= 2)
    .map((t) => ({
      subject: t.subject,
      topic: t.topic,
      attempted: t.total,
      missRate: Math.round((t.wrong / t.total) * 100),
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 10);

  const strongTopics = topics
    .filter((t) => t.total >= 2 && t.correct / t.total >= 0.7)
    .map((t) => ({
      subject: t.subject,
      topic: t.topic,
      attempted: t.total,
      accuracy: Math.round((t.correct / t.total) * 100),
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 8);

  let papers: PerformanceSnapshot["papers"];
  if (exam === "ESE") {
    papers = (["PRE", "P1", "P2"] as const).map((paper) => {
      const paperAttempts = attempts.filter((a) => {
        const q = questionMap.get(a.questionId);
        return q?.paper === paper;
      });
      const pCorrect = paperAttempts.filter((a) => a.correct).length;
      const pAttempted = paperAttempts.length;
      return {
        paper,
        attempted: pAttempted,
        accuracy:
          pAttempted > 0
            ? Math.round((pCorrect / pAttempted) * 100)
            : 0,
      };
    });
  }

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentAttempts = attempts.filter((a) => a.timestamp >= cutoff);
  const recentCorrect = recentAttempts.filter((a) => a.correct).length;

  return {
    exam,
    totals: {
      attempted,
      correct,
      wrong: attempted - correct,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      streak: computeStreak(attempts),
    },
    subjects: subjects.filter((s) => s.attempted > 0),
    papers,
    weakTopics,
    strongTopics,
    recent: {
      last7DaysAttempted: recentAttempts.length,
      last7DaysAccuracy:
        recentAttempts.length > 0
          ? Math.round((recentCorrect / recentAttempts.length) * 100)
          : 0,
    },
    levels: {
      aiPracticeSetsCompleted: progress?.aiPracticeSetsCompleted ?? 0,
      pyqPracticeSetsCompleted: progress?.pyqPracticeSetsCompleted ?? 0,
    },
  };
}

export function snapshotFingerprint(snapshot: PerformanceSnapshot): string {
  const sub = snapshot.subjects
    .map((s) => `${s.short}:${s.attempted}:${s.accuracy}`)
    .join("|");
  return [
    snapshot.exam,
    snapshot.totals.attempted,
    snapshot.totals.correct,
    snapshot.recent.last7DaysAttempted,
    sub,
  ].join(";");
}

export function parseAiPerformanceAnalysis(raw: string): AiPerformanceAnalysis | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<AiPerformanceAnalysis>;
    if (typeof parsed.overview !== "string") return null;
    return {
      overview: parsed.overview.trim(),
      strengths: normalizeItems(parsed.strengths, "area", "detail"),
      weaknesses: normalizeItems(parsed.weaknesses, "area", "detail"),
      prioritySubjects: normalizeItems(
        parsed.prioritySubjects,
        "subject",
        "reason",
      ),
      topicFocus: normalizeItems(parsed.topicFocus, "topic", "action"),
      studyPlan:
        typeof parsed.studyPlan === "string" ? parsed.studyPlan.trim() : "",
    };
  } catch {
    return null;
  }
}

function normalizeItems<T extends Record<string, string>>(
  value: unknown,
  keyA: string,
  keyB: string,
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      [keyA]: String(item[keyA] ?? "").trim(),
      [keyB]: String(item[keyB] ?? "").trim(),
    }))
    .filter((item) => item[keyA] && item[keyB]) as T[];
}
