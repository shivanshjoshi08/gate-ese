import questionsData from "@/data/questions.json";
import type { ExamType, Filters, Question } from "./types";

const raw = questionsData as Question[];

export const allQuestions: Question[] = raw.map((q) => ({
  ...q,
  exam: q.exam ?? "GATE",
  paper: q.paper ?? null,
}));

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getYears(exam: ExamType): number[] {
  const years = new Set(
    allQuestions.filter((q) => q.exam === exam).map((q) => q.year)
  );
  return Array.from(years).sort((a, b) => b - a);
}

export function filterQuestions(
  filters: Filters,
  attemptedIds?: Set<string>
): Question[] {
  let result = allQuestions.filter((q) => q.exam === filters.exam);

  if (filters.paper !== "All") {
    result = result.filter((q) => q.paper === filters.paper);
  }
  if (filters.subject !== "All") {
    result = result.filter((q) => q.subject === filters.subject);
  }
  if (filters.difficulty !== "All") {
    result = result.filter((q) => q.difficulty === filters.difficulty);
  }
  if (filters.year !== "All") {
    result = result.filter((q) => q.year === parseInt(filters.year, 10));
  }
  if (filters.marks !== "All") {
    const marks = filters.marks === "1 Mark" ? 1 : 2;
    result = result.filter((q) => q.marks === marks);
  }
  if (filters.type !== "All") {
    const type = filters.type.toLowerCase() as Question["type"];
    result = result.filter((q) => q.type === type);
  }
  if (!filters.reviewMode && attemptedIds && attemptedIds.size > 0) {
    result = result.filter((q) => !attemptedIds.has(q.id));
  }

  return result;
}

export function buildFilterKey(filters: Filters, subjectOverride?: string): string {
  const s = subjectOverride ?? filters.subject;
  return `${filters.exam}|${filters.paper}|${s}|${filters.difficulty}|${filters.year}|${filters.marks}|${filters.type}|${filters.reviewMode}`;
}

export function checkAnswer(
  question: Question,
  userAnswer: number | string | number[]
): boolean {
  if (question.type === "mcq") {
    return userAnswer === question.correct;
  }
  if (question.type === "nat") {
    const correct = String(question.correct).trim();
    const given = String(userAnswer).trim();
    const cNum = parseFloat(correct);
    const gNum = parseFloat(given);
    if (!Number.isNaN(cNum) && !Number.isNaN(gNum)) {
      return Math.abs(cNum - gNum) < 0.01 * Math.max(1, Math.abs(cNum));
    }
    return correct === given;
  }
  if (question.type === "msq") {
    const correct = (question.correct as number[]).slice().sort();
    const given = (userAnswer as number[]).slice().sort();
    return (
      correct.length === given.length &&
      correct.every((v, i) => v === given[i])
    );
  }
  return false;
}

export function buildGateMockPaper(): Question[] {
  const pool = allQuestions.filter((q) => q.exam === "GATE");
  const ga = shuffle(
    pool.filter((q) => q.subject === "General Aptitude")
  ).slice(0, 10);
  const tech = shuffle(
    pool.filter((q) => q.subject !== "General Aptitude")
  ).slice(0, 55);
  return [...ga, ...tech];
}

export function buildEsePrelimsMock(): Question[] {
  let pool = allQuestions.filter(
    (q) => q.exam === "ESE" && q.paper === "PRE"
  );
  if (pool.length < 120) {
    const extra = allQuestions.filter(
      (q) => q.exam === "ESE" && (q.paper === "P1" || q.paper === "PRE")
    );
    pool = Array.from(
      new Map([...pool, ...extra].map((q) => [q.id, q])).values()
    );
  }
  return shuffle(pool).slice(0, 120);
}

export function buildEsePaper2Mock(): Question[] {
  const pool = shuffle(
    allQuestions.filter((q) => q.exam === "ESE" && q.paper === "P2")
  );
  const selected: Question[] = [];
  let totalMarks = 0;
  for (const q of pool) {
    if (totalMarks >= 150) break;
    selected.push(q);
    totalMarks += q.marks;
  }
  if (selected.length === 0) {
    return pool.slice(0, Math.min(75, pool.length));
  }
  return selected;
}

export type MockMode = "gate" | "ese_prelims" | "ese_p2";

export function calculateMockScore(
  paper: Question[],
  answers: Record<string, string | number | number[] | null>,
  mode: MockMode
): { score: number; correct: number; wrong: number; skipped: number; maxScore: number } {
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let maxScore = 0;

  for (const q of paper) {
    maxScore += q.marks;
    const ans = answers[q.id];
    if (ans === null || ans === undefined || ans === "") {
      skipped++;
      continue;
    }
    const isCorrect = checkAnswer(q, ans);
    if (isCorrect) {
      correct++;
      score += q.marks;
    } else {
      wrong++;
      if (mode === "gate") {
        score -= q.marks === 1 ? 0.33 : 0.66;
      } else if (mode === "ese_prelims") {
        score -= q.marks / 3;
      }
    }
  }

  return {
    score: Math.max(0, Math.round(score * 100) / 100),
    correct,
    wrong,
    skipped,
    maxScore,
  };
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const map = new Map(allQuestions.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Question[];
}

export function getQuestionsByExam(exam: ExamType): Question[] {
  return allQuestions.filter((q) => q.exam === exam);
}
