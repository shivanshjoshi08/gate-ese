export type QuestionType = "mcq" | "nat" | "msq";

/** `Medium` kept for legacy rows; prefer `Moderate` in new JSON. */
export type Difficulty = "Easy" | "Moderate" | "Medium" | "Hard";

export type ExamType = "GATE" | "ESE";

export type EsePaper = "PRE" | "P1" | "P2" | null;

export type {
  QuestionAppearance,
  QuestionReference,
  QuestionReferenceKind,
  QuestionStyleTag,
} from "@/lib/question-sources";

import type {
  QuestionAppearance,
  QuestionReference,
  QuestionStyleTag,
} from "@/lib/question-sources";

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correct: number | string | number[];
  solution: string;
  subject: string;
  topic: string;
  marks: 1 | 2;
  year: number;
  difficulty: Difficulty;
  exam: ExamType;
  paper: EsePaper;
  /** Primary diagram (first of {@link images}). */
  image?: string;
  /** All stem / figure URLs for this question. */
  images?: string[];
  /** When false, practice records selection only (no right/wrong) */
  hasAnswerKey?: boolean;
  /**
   * Category for Numericals filter (calculation-heavy). Independent of {@link type}
   * — numerical items may use MCQ options or NAT number input.
   */
  numerical?: boolean;
  /** Rich content (TipTap) — when set, QuestionRenderer is used */
  richStem?: import("@/lib/question-types").RichContent;
  richSolution?: import("@/lib/question-types").RichContent;
  richOptions?: import("@/lib/question-types").QuestionOption[];
  /** Learner-facing source: bundled JSON vs published PYQ bank (set by PracticeBank provider). */
  questionBank?: "ai" | "pyq";
  /** Official PYQ appearances (GATE / ESE / year / paper). */
  appearances?: QuestionAppearance[];
  /** Books, coaching modules, or duplicate exam tracks. */
  references?: QuestionReference[];
  /** Pattern tag for analysis (conceptual, formula, trap, etc.). */
  questionStyle?: QuestionStyleTag;

  branch?: string;
  section?: string | null;
  qno?: number | null;
  subtopic?: string;
  negativeMarking?: number;
  solutionSteps?: import("@/lib/question-schema").SolutionStep[];
  conceptUsed?: string;
  formulaUsed?: string[];
  whyWrongOptions?: import("@/lib/question-schema").WhyWrongOptions;
  keyTakeaway?: string;
  repeatCount?: number;
  isHighRepeat?: boolean;
  trendNote?: string;
  tags?: string[];
  mainsRelevant?: boolean;
  selfEvalChecklist?: string[];
  diagramRequired?: boolean;
  diagramUrl?: string;
  addedBy?: string;
  verified?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Filled at runtime by AI — keep null in DB/JSON. */
  aiExplanation?: string | null;
  similarQuestionsGenerated?: string[];
}

export interface AttemptRecord {
  questionId: string;
  userAnswer: string | number | number[];
  correct: boolean;
  timestamp: number;
  /** Seconds spent on this question before submit (practice timer). */
  timeSpentSec?: number;
  subject: string;
  topic: string;
  exam: ExamType;
}

export interface SessionState {
  questionIds: string[];
  currentIndex: number;
  filterKey: string;
  /** Which curated bank (`ai` = bundled JSON, `pyq` = published PYQ Mongo). Legacy value `cms` is normalized client-side to `pyq`. */
  practiceBank?: "ai" | "pyq";
}

export interface ProgressData {
  attempts: AttemptRecord[];
  bookmarks: string[];
  session: SessionState | null;
  lastVisited: string | null;
  /** Practice (AI bank) levels completed — next visit starts at this + 1. */
  aiPracticeSetsCompleted?: number;
  /** PYQ bank levels completed. */
  pyqPracticeSetsCompleted?: number;
  /** Last completed AI round question ids (legacy; level sets are fixed now). */
  aiLastRoundQuestionIds?: string[];
}

export interface Filters {
  /** Learner PYQ pool can span GATE + ESE; `"All"` includes both when filtering. */
  exam: ExamType | "All";
  paper: string;
  subject: string;
  difficulty: string;
  year: string;
  marks: string;
  type: string;
  reviewMode: boolean;
}
