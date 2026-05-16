import type { ExamType, Question } from "@/lib/types";

/** Official exam appearance (PYQ track). */
export type QuestionAppearance = {
  exam: ExamType;
  year: number;
  paper?: "PRE" | "P1" | "P2" | null;
  /** e.g. "Set A", "Session 1" */
  session?: string;
};

export type QuestionReferenceKind =
  | "book"
  | "coaching"
  | "standard"
  | "web"
  | "other";

/** Book / coaching / duplicate track (same Q elsewhere). */
export type QuestionReference = {
  kind: QuestionReferenceKind;
  label: string;
  exam?: ExamType;
  year?: number;
  notes?: string;
};

export type QuestionStyleTag =
  | "conceptual"
  | "formula-based"
  | "statement-trap"
  | "code-based"
  | "practical";

export const QUESTION_STYLE_LABELS: Record<QuestionStyleTag, string> = {
  conceptual: "Conceptual",
  "formula-based": "Formula-based",
  "statement-trap": "Statement trap",
  "code-based": "Code / IS",
  practical: "Practical / Application",
};

type LegacyShape = Pick<Question, "exam" | "year" | "paper"> & {
  appearances?: QuestionAppearance[];
};

/** Build PYQ row from exam/year/paper when `appearances` omitted in JSON. */
export function deriveAppearancesFromLegacy(q: LegacyShape): QuestionAppearance[] {
  if (q.appearances?.length) return q.appearances;
  if (!q.exam || !q.year) return [];
  return [
    {
      exam: q.exam,
      year: q.year,
      paper: q.paper ?? null,
    },
  ];
}

export function formatAppearance(a: QuestionAppearance): string {
  const paper = a.paper ? ` ${a.paper}` : "";
  const session = a.session ? ` · ${a.session}` : "";
  return `${a.exam} ${a.year}${paper}${session}`;
}

export function formatReference(r: QuestionReference): string {
  const examBit =
    r.exam && r.year ? ` (${r.exam} ${r.year})` : r.exam ? ` (${r.exam})` : "";
  return `${r.label}${examBit}`;
}

export function mergeQuestionSources(question: Question): {
  appearances: QuestionAppearance[];
  references: QuestionReference[];
} {
  const appearances = deriveAppearancesFromLegacy(question);
  const references = question.references ?? [];
  return { appearances, references };
}

export function hasExtraSources(question: Question): boolean {
  const { appearances, references } = mergeQuestionSources(question);
  return appearances.length > 1 || references.length > 0;
}
