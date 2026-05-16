import type { ExamType, Filters, Question } from "@/lib/types";
import { filterQuestions } from "@/lib/questions";
import { getSubjectShort } from "@/lib/constants";

export type FilterOption = { value: string; label: string };

export type SimplePracticeFilterOptions = {
  exams: FilterOption[];
  subjects: FilterOption[];
  difficulties: FilterOption[];
};

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

function mcqPool(bank: Question[], filters: Filters): Question[] {
  return filterQuestions(bank, { ...filters, type: "MCQ" });
}

function subjectOptionsFromPool(pool: Question[]): FilterOption[] {
  const subjects = new Set<string>();
  for (const q of pool) subjects.add(q.subject);
  const sorted = Array.from(subjects).sort((a, b) =>
    getSubjectShort(a).localeCompare(getSubjectShort(b)),
  );
  if (sorted.length === 0) return [];
  if (sorted.length === 1) {
    return [
      {
        value: sorted[0]!,
        label: getSubjectShort(sorted[0]!),
      },
    ];
  }
  return [
    { value: "All", label: "All subjects" },
    ...sorted.map((subject) => ({
      value: subject,
      label: getSubjectShort(subject),
    })),
  ];
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

  const subjectPool = mcqPool(
    mcqBank,
    { ...filters, subject: "All", type: "MCQ" },
  );
  const subjectOptions = subjectOptionsFromPool(subjectPool);

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
    exams: [],
    subjects:
      subjectOptions.length > 1 ||
      (subjectOptions.length === 1 && subjectOptions[0]!.value !== "All")
        ? subjectOptions
        : [],
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
  if (avail.subjects.length) {
    next.subject = pick(avail.subjects, next.subject, avail.subjects[0]!.value);
  } else {
    next.subject = "All";
  }
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
