import type { ExamType, Filters, Question } from "@/lib/types";
import { filterQuestions } from "@/lib/questions";
import { getSubjectShort } from "@/lib/constants";

export type FilterOption = { value: string; label: string };

/** Max subject choices in the practice bar (plus “All”). */
const MAX_SUBJECT_CHOICES = 8;

export type SimplePracticeFilterOptions = {
  exams: FilterOption[];
  subjects: FilterOption[];
  difficulties: FilterOption[];
};

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

function mcqPool(bank: Question[], filters: Filters): Question[] {
  return filterQuestions(bank, { ...filters, type: "MCQ" });
}

function topSubjectsByCount(
  pool: Question[],
  limit: number,
): { subject: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const q of pool) {
    counts.set(q.subject, (counts.get(q.subject) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject))
    .slice(0, limit);
}

/**
 * Practice UI: at most Exam + Subject. Other dimensions stay at All.
 * Only values that exist in the bank; subjects capped to keep the list short.
 */
export function getSimplePracticeFilters(
  bank: Question[],
  filters: Filters,
): SimplePracticeFilterOptions {
  const mcqBank = bank.filter((q) => q.type === "mcq");

  /* Exam filter — re-enable when needed
  const examPool = mcqPool(
    mcqBank,
    { ...filters, exam: "All", type: "MCQ" },
  );
  const exams = new Set<ExamType>();
  for (const q of examPool) exams.add(q.exam);
  const examOptions: FilterOption[] = [];
  if (exams.size > 1) {
    examOptions.push({ value: "All", label: "All" });
    if (exams.has("GATE")) examOptions.push({ value: "GATE", label: "GATE" });
    if (exams.has("ESE")) examOptions.push({ value: "ESE", label: "ESE" });
  }
  */

  /* Subject filter — re-enable when needed
  const subjectPool = mcqPool(
    mcqBank,
    { ...filters, subject: "All", type: "MCQ" },
  );
  const top = topSubjectsByCount(subjectPool, MAX_SUBJECT_CHOICES);
  const subjectOptions: FilterOption[] = [];
  if (top.length > 1) {
    subjectOptions.push({ value: "All", label: "All subjects" });
    for (const { subject } of top) {
      subjectOptions.push({
        value: subject,
        label: getSubjectShort(subject),
      });
    }
  } else if (top.length === 1) {
    subjectOptions.push({
      value: top[0]!.subject,
      label: getSubjectShort(top[0]!.subject),
    });
  }
  */

  const difficultyPool = mcqPool(
    mcqBank,
    { ...filters, difficulty: "All", type: "MCQ" },
  );
  const present = new Set(difficultyPool.map((q) => q.difficulty));
  const difficultyOptions: FilterOption[] = [{ value: "All", label: "All" }];
  for (const d of DIFFICULTY_LEVELS) {
    if (present.has(d)) {
      difficultyOptions.push({ value: d, label: d });
    }
  }

  return {
    exams: [], // examOptions — re-enable with exam filter UI
    subjects: [], // subjectOptions — re-enable with subject filter UI
    difficulties:
      difficultyOptions.length > 1 ? difficultyOptions : [],
  };
}

export function defaultPracticeFilters(): Filters {
  return {
    exam: "All",
    paper: "All",
    subject: "All",
    difficulty: "All",
    year: "All",
    marks: "All",
    type: "MCQ",
    reviewMode: false,
  };
}

/** True when only broad defaults — use pre-built level manifest. */
export function isDefaultPracticeFilters(filters: Filters): boolean {
  return (
    filters.exam === "All" &&
    filters.paper === "All" &&
    filters.subject === "All" &&
    filters.difficulty === "All" &&
    filters.year === "All" &&
    filters.marks === "All" &&
    filters.type === "MCQ" &&
    !filters.reviewMode
  );
}

export function sanitizePracticeFilters(
  bank: Question[],
  filters: Filters,
): Filters {
  const avail = getSimplePracticeFilters(bank, defaultPracticeFilters());
  const next = { ...defaultPracticeFilters(), ...filters, type: "MCQ" as const };

  const pick = (opts: FilterOption[], current: string, fallback: string) =>
    opts.some((o) => o.value === current) ? current : fallback;

  // if (avail.exams.length) {
  //   next.exam = pick(avail.exams, next.exam, "All") as Filters["exam"];
  // }
  next.exam = "All";
  // if (avail.subjects.length) {
  //   next.subject = pick(avail.subjects, next.subject, "All");
  // } else {
  //   next.subject = "All";
  // }
  next.subject = "All";
  if (avail.difficulties.length) {
    next.difficulty = pick(avail.difficulties, next.difficulty, "All");
  } else {
    next.difficulty = "All";
  }
  next.paper = "All";
  next.year = "All";
  next.marks = "All";
  return next;
}

/** @deprecated Use getSimplePracticeFilters */
export function getAvailablePracticeFilters(
  bank: Question[],
  filters: Filters,
): SimplePracticeFilterOptions & {
  papers: FilterOption[];
  difficulties: FilterOption[];
  years: FilterOption[];
  marks: FilterOption[];
} {
  const simple = getSimplePracticeFilters(bank, filters);
  return {
    ...simple,
    papers: [],
    difficulties: [],
    years: [],
    marks: [],
  };
}
