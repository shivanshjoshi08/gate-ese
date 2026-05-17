import type { Filters, Question } from "@/lib/types";
import { filterQuestions } from "@/lib/questions";
import { getPracticeSubjectFilterOptions } from "@/lib/practice-subjects";
import { isNumericalQuestion } from "@/lib/question-numerical";
import { getPracticeTrack } from "@/lib/practice-track";
import {
  FILTER_TYPE_MCQ,
  FILTER_TYPE_NUMERICALS,
  isNumericalsFilter,
} from "@/lib/practice-filters";

export {
  FILTER_TYPE_MCQ,
  FILTER_TYPE_NUMERICALS,
  isNumericalsFilter,
} from "@/lib/practice-filters";

export type FilterOption = { value: string; label: string };

export type SimplePracticeFilterOptions = {
  exams: FilterOption[];
  subjects: FilterOption[];
  difficulties: FilterOption[];
  /** Show MCQ vs Numericals chips when the bank has numerical-category questions. */
  hasNumericals: boolean;
};

const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Medium", "Hard"] as const;

function practicePool(bank: Question[], filters: Filters): Question[] {
  return filterQuestions(bank, filters);
}

function subjectOptionsFromPool(pool: Question[]): FilterOption[] {
  if (pool.length === 0) return [];
  return getPracticeSubjectFilterOptions();
}

/**
 * Practice UI: at most Exam + Subject. Other dimensions stay at All.
 * Only values that exist in the bank; subjects capped to keep the list short.
 */
export function getSimplePracticeFilters(
  bank: Question[],
  filters: Filters,
): SimplePracticeFilterOptions {
  const hasNumericals = bank.some((q) => isNumericalQuestion(q));
  const typeScopedBank =
    hasNumericals && isNumericalsFilter(filters)
      ? bank.filter((q) => isNumericalQuestion(q))
      : bank.filter((q) => !isNumericalQuestion(q));

  const examPool = practicePool(typeScopedBank, {
    ...filters,
    exam: "All",
  });
  const tracks = new Set(examPool.map((q) => getPracticeTrack(q)));
  const examOptions: FilterOption[] = [];
  if (tracks.size > 1) {
    examOptions.push({ value: "All", label: "All" });
    if (tracks.has("GATE")) examOptions.push({ value: "GATE", label: "GATE" });
    if (tracks.has("PRE")) examOptions.push({ value: "PRE", label: "PRE" });
  }

  const subjectPool = practicePool(typeScopedBank, {
    ...filters,
    subject: "All",
  });
  const subjectOptions = subjectOptionsFromPool(subjectPool);

  const difficultyPool = practicePool(typeScopedBank, {
    ...filters,
    difficulty: "All",
  });
  const present = new Set(difficultyPool.map((q) => q.difficulty));
  const difficultyOptions: FilterOption[] = [{ value: "All", label: "All" }];
  for (const d of DIFFICULTY_LEVELS) {
    if (present.has(d)) {
      difficultyOptions.push({ value: d, label: d });
    }
  }

  return {
    exams: examOptions,
    subjects:
      subjectOptions.length > 1 ||
      (subjectOptions.length === 1 && subjectOptions[0]!.value !== "All")
        ? subjectOptions
        : [],
    difficulties:
      difficultyOptions.length > 1 ? difficultyOptions : [],
    hasNumericals,
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
    type: FILTER_TYPE_MCQ,
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
    filters.type === FILTER_TYPE_MCQ &&
    !filters.reviewMode
  );
}

export function sanitizePracticeFilters(
  bank: Question[],
  filters: Filters,
): Filters {
  const avail = getSimplePracticeFilters(bank, defaultPracticeFilters());
  const next = { ...defaultPracticeFilters(), ...filters };
  if (!avail.hasNumericals) {
    next.type = FILTER_TYPE_MCQ;
  } else if (next.type !== FILTER_TYPE_NUMERICALS) {
    next.type = FILTER_TYPE_MCQ;
  }

  const pick = (opts: FilterOption[], current: string, fallback: string) =>
    opts.some((o) => o.value === current) ? current : fallback;

  if (avail.exams.length) {
    next.exam = pick(avail.exams, next.exam, "All") as Filters["exam"];
  } else {
    next.exam = "All";
  }
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
