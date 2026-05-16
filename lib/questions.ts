import type { AttemptRecord, ExamType, Filters, Question } from "./types";
import { legacyQuestions } from "@/lib/legacy-questions";

/** @deprecated Use usePracticeBank().questions — legacy-only subset without DB. */
export const allQuestions: Question[] = legacyQuestions;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getYears(
  bank: Question[],
  exam: ExamType | "All",
): number[] {
  const slice =
    exam === "All" ? bank : bank.filter((q) => q.exam === exam);
  const years = new Set(slice.map((q) => q.year));
  return Array.from(years).sort((a, b) => b - a);
}

export function getYearBreakdown(
  bank: Question[],
  exam: ExamType | "All",
) {
  const years = getYears(bank, exam);
  return years.map((year) => ({
    year,
    count: bank.filter((q) => {
      const examOk = exam === "All" || q.exam === exam;
      return examOk && q.year === year;
    }).length,
  }));
}

export function filterQuestions(
  bank: Question[],
  filters: Filters,
  attemptedIds?: Set<string>
): Question[] {
  let result =
    filters.exam === "All"
      ? bank
      : bank.filter((q) => q.exam === filters.exam);

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

export type PracticeBankKind = "ai" | "pyq";

/** Practice bank: number of MCQs to serve per round before loading the next set. */
export const PRACTICE_MCQ_BATCH_SIZE = 10;

/** Use MCQ rounds of {@link PRACTICE_MCQ_BATCH_SIZE} for Practice (`ai`) when type is open or MCQ-only. */
export function shouldUsePracticeMcqRounds(
  practiceBank: PracticeBankKind,
  filters: Filters,
): boolean {
  if (practiceBank !== "ai") return false;
  if (filters.type !== "All" && filters.type !== "MCQ") return false;
  return true;
}

function sortQuestionsByStableId(qs: Question[]): Question[] {
  return [...qs].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
}

/** Deterministic [0,1) PRNG for stable shuffles across “cycles” when the MCQ pool is replayed. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a deterministic seed — used so level blocks change each full tour of the bank. */
export function seededShuffleQuestions<T extends { id: string }>(
  questions: T[],
  seed: number,
): T[] {
  const a = [...questions];
  const rand = mulberry32(seed >>> 0);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

/**
 * Level N selects the N-th contiguous block of up to {@link PRACTICE_MCQ_BATCH_SIZE} MCQs
 * after sorting (or seeded shuffle between bank-wide cycles). Blocks do not reuse IDs inside
 * a cycle until shorter tail blocks consume the remainder.
 */
export function slicePracticeQuestionsForLevel(
  canonicalSorted: Question[],
  practiceLevelOrdinal: number,
): Question[] {
  const batch = PRACTICE_MCQ_BATCH_SIZE;
  const n = canonicalSorted.length;
  if (n === 0) return [];

  const level = Math.max(1, practiceLevelOrdinal);

  /** Short bank: fewer than one full batch — reuse all IDs; reorder per level via seed. */
  if (n <= batch) {
    const seed = (level - 1) * 17_019 + 1337;
    const ordered =
      level <= 1 ? canonicalSorted : seededShuffleQuestions(canonicalSorted, seed);
    return ordered.slice(0, n);
  }

  const numBlocks = Math.max(1, Math.ceil(n / batch));
  const zeroBased = level - 1;
  const megaCycle = Math.floor(zeroBased / numBlocks);
  const blockIndex = zeroBased % numBlocks;

  const ordered =
    megaCycle === 0
      ? canonicalSorted
      : seededShuffleQuestions(canonicalSorted, megaCycle);

  const start = blockIndex * batch;
  if (start >= n) return [];
  return ordered.slice(start, Math.min(start + batch, n));
}

const ADAPTIVE_ATTEMPTS_MIN = 8;

/** Try to swap attempted questions inside a level-sized batch with unattempted ones from same pool order. */
function elevateUnattemptedInBatch(
  batch: Question[],
  poolCanonSorted: Question[],
  attemptedIds: Set<string>,
  targetBatch: number,
): Question[] {
  const ordered = [...batch];
  const extras = poolCanonSorted.filter(
    (q) => !ordered.some((b) => b.id === q.id),
  );

  for (let i = 0; i < ordered.length && extras.length > 0; i++) {
    const q = ordered[i]!;
    if (!attemptedIds.has(q.id)) continue;
    const j = extras.findIndex((p) => !attemptedIds.has(p.id));
    if (j < 0) break;
    const repl = extras.splice(j, 1)[0];
    if (repl) ordered[i] = repl;
  }

  return ordered.slice(0, Math.min(targetBatch, ordered.length));
}

/**
 * Prefer subjects where the learner has more incorrect attempts (AI adaptive rounds).
 */
export function prioritizePracticePoolByWeakness(
  pool: Question[],
  attempts: AttemptRecord[],
): Question[] {
  if (pool.length === 0) return [];
  const wrongBySubject = new Map<string, number>();
  for (const a of attempts) {
    if (!a.correct) {
      wrongBySubject.set(
        a.subject,
        (wrongBySubject.get(a.subject) ?? 0) + 1,
      );
    }
  }
  const scored = pool.map((q) => ({
    q,
    s:
      (wrongBySubject.get(q.subject) ?? 0) * 2 +
      Math.random() * 0.4 -
      (q.difficulty === "Hard" ? 0.35 : q.difficulty === "Easy" ? 0.08 : 0),
  }));
  scored.sort((a, b) => b.s - a.s);
  return scored.map((x) => x.q);
}

/**
 * Next Practice MCQ round: assigns a **level block** (distinct 10–ID chunk per level on the
 * filtered bank, then a new seeded order each time the bank wraps). Unattempted swaps are
 * applied within the block when possible. `avoidRecentIds` drops only a few tail IDs from canon
 * before chunking so immediate repeats stay rare without breaking level boundaries.
 *
 * Pass `roundsCompletedBeforePick` from `progress.aiPracticeSetsCompleted` at init time —
 * Level = that count + 1 (first round ⇒ 0 completed ⇒ Level 1).
 */
export function pickPracticeMcqRound(
  bank: Question[],
  filters: Filters,
  attemptedIds: Set<string>,
  avoidRecentIds?: Set<string>,
  adaptiveAttempts?: AttemptRecord[],
  roundsCompletedBeforePick?: number,
): Question[] {
  const mcqFilters: Filters = { ...filters, type: "MCQ" };
  const avoid = avoidRecentIds ?? new Set<string>();

  /** Level currently being entered (stored progress counts finished rounds before this batch). */
  const practiceLevelOrdinal = Math.max(1, (roundsCompletedBeforePick ?? 0) + 1);

  const useAdaptive =
    !!adaptiveAttempts &&
    adaptiveAttempts.length >= ADAPTIVE_ATTEMPTS_MIN &&
    filters.subject === "All";

  const applyAdaptive = (slice: Question[]): Question[] => {
    if (slice.length <= 1 || !useAdaptive) {
      return slice.slice(0, PRACTICE_MCQ_BATCH_SIZE);
    }
    return prioritizePracticePoolByWeakness(
      slice.slice(0, PRACTICE_MCQ_BATCH_SIZE),
      adaptiveAttempts!,
    );
  };

  let canonAll = filterQuestions(bank, mcqFilters);
  const canonSansAvoid =
    avoid.size > 0
      ? canonAll.filter((q) => !avoid.has(q.id))
      : canonAll;
  let sortedCanon = sortQuestionsByStableId(canonSansAvoid);
  if (sortedCanon.length === 0 && canonAll.length > 0) {
    sortedCanon = sortQuestionsByStableId(canonAll);
  }

  let batch = slicePracticeQuestionsForLevel(
    sortedCanon,
    practiceLevelOrdinal,
  );

  if (sortedCanon.length === 0) return [];

  batch = elevateUnattemptedInBatch(
    batch,
    sortedCanon,
    attemptedIds,
    PRACTICE_MCQ_BATCH_SIZE,
  );

  return applyAdaptive(batch);
}

/** How many MCQs are still “fresh” (unattempted) for this Practice filter set. */
export function countFreshPracticeMcqs(
  bank: Question[],
  filters: Filters,
  attemptedIds: Set<string>,
): number {
  const mcqFilters: Filters = { ...filters, type: "MCQ" };
  return filterQuestions(bank, mcqFilters, attemptedIds).length;
}

/** URL `?bank=`. Accepts legacy `cms` as alias for `pyq`. */
export function parsePracticeBankQueryParam(raw: string | null): PracticeBankKind | null {
  if (!raw) return null;
  if (raw === "ai") return "ai";
  if (raw === "pyq" || raw === "cms") return "pyq";
  return null;
}

/**
 * Restore bank from persisted session (`practiceBank`) or legacy `cms::…` /
 * `cms` session field.
 */
export function normalizePracticeBankFromStorage(
  practiceBank?: string | null,
  filterKey?: string | null,
): PracticeBankKind | null {
  if (practiceBank === "ai") return "ai";
  if (practiceBank === "pyq" || practiceBank === "cms") return "pyq";
  return practiceBankFromFilterKey(filterKey ?? "");
}

export function buildFilterKey(
  filters: Filters,
  subjectOverride?: string,
  practiceBank?: PracticeBankKind,
): string {
  const s = subjectOverride ?? filters.subject;
  const prefix = practiceBank ? `${practiceBank}::` : "";
  return `${prefix}${filters.exam}|${filters.paper}|${s}|${filters.difficulty}|${filters.year}|${filters.marks}|${filters.type}|${filters.reviewMode}`;
}

/** Recover bank from saved filter keys (`pyq::…`, legacy `cms::…`, `ai::…`). */
export function practiceBankFromFilterKey(filterKey: string): PracticeBankKind | null {
  if (filterKey.startsWith("pyq::") || filterKey.startsWith("cms::")) return "pyq";
  if (filterKey.startsWith("ai::")) return "ai";
  return null;
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

export function buildGateMockPaper(bank: Question[]): Question[] {
  const pool = bank.filter((q) => q.exam === "GATE");
  const ga = shuffle(
    pool.filter((q) => q.subject === "General Aptitude")
  ).slice(0, 10);
  const tech = shuffle(
    pool.filter((q) => q.subject !== "General Aptitude")
  ).slice(0, 55);
  return [...ga, ...tech];
}

export function buildEsePrelimsMock(bank: Question[]): Question[] {
  let pool = bank.filter((q) => q.exam === "ESE" && q.paper === "PRE");
  if (pool.length < 20) {
    pool = bank.filter((q) => q.exam === "ESE");
  }
  return shuffle(pool).slice(0, Math.min(120, pool.length));
}

export function buildEsePaper2Mock(bank: Question[]): Question[] {
  const pool = shuffle(
    bank.filter((q) => q.exam === "ESE" && q.paper === "P2")
  );
  if (pool.length === 0) {
    return shuffle(bank.filter((q) => q.exam === "ESE")).slice(0, 30);
  }
  const selected: Question[] = [];
  let totalMarks = 0;
  for (const q of pool) {
    if (totalMarks >= 150) break;
    selected.push(q);
    totalMarks += q.marks;
  }
  return selected.length > 0 ? selected : pool.slice(0, Math.min(30, pool.length));
}

export type MockMode = "ese_prelims" | "ese_p2";

export function calculateMockScore(
  paper: Question[],
  answers: Record<string, string | number | number[] | null>,
  mode: MockMode
): {
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  maxScore: number;
} {
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
      if (mode === "ese_prelims") {
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

export function getQuestionsByIds(bank: Question[], ids: string[]): Question[] {
  const map = new Map(bank.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Question[];
}

export function getQuestionsByExam(bank: Question[], exam: ExamType): Question[] {
  return bank.filter((q) => q.exam === exam);
}
