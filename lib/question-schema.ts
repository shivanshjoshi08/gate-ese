/**
 * Canonical bundled question JSON (`data/questions.json`) + import normalization.
 * @see docs in user spec — core identity, exam metadata, analysis, appearances, references.
 */
import { z } from "zod";
import type { ExamType, Question } from "@/lib/types";
import {
  deriveAppearancesFromLegacy,
  type QuestionAppearance,
  type QuestionReference,
  type QuestionStyleTag,
} from "@/lib/question-sources";
import {
  resolveLegacyAnswerType,
  resolveNumericalFlag,
} from "@/lib/question-numerical";

export type BundledExamType = ExamType | "ISRO" | "SSC-JE";
export type BundledAnswerType = "mcq" | "nat" | "msq" | "subjective";
export type BundledDifficulty = "Easy" | "Moderate" | "Hard";
export type BundledBranch = "CE" | "ME" | "EE" | "ECE" | "CS";

export type SolutionStep = {
  step: number;
  heading: string;
  content: string;
  diagram?: string | null;
};

export type WhyWrongOptions = Record<string, string>;

export type QuestionAddedBy = "admin" | "community" | "ai-generated";
export type QuestionSourceKind =
  | "official-pdf"
  | "book"
  | "community"
  | "ai";

const appearanceSchema = z.object({
  exam: z.enum(["GATE", "ESE", "ISRO", "SSC-JE"]),
  year: z.number().int(),
  paper: z.union([z.enum(["PRE", "P1", "P2"]), z.null()]).optional(),
  qno: z.number().int().nullable().optional(),
  session: z.string().optional(),
});

const referenceSchema = z.object({
  kind: z.enum(["book", "coaching", "standard", "web", "other"]),
  label: z.string().min(1),
  chapter: z.string().optional(),
  exam: z.enum(["GATE", "ESE"]).optional(),
  year: z.number().int().optional(),
  notes: z.string().optional(),
});

const solutionStepSchema = z.object({
  step: z.number().int(),
  heading: z.string(),
  content: z.string(),
  diagram: z.string().nullable().optional(),
});

export const bundledQuestionSchema = z
  .object({
    id: z.string().min(1),
    question: z.string().min(1),
    type: z.enum(["mcq", "nat", "msq", "subjective", "numerical"]),
    options: z.union([z.array(z.string()), z.null()]).optional(),
    correct: z
      .union([z.number(), z.string(), z.array(z.number()), z.null()])
      .optional(),
    numerical: z.boolean().optional(),

    exam: z.enum(["GATE", "ESE", "ISRO", "SSC-JE"]).default("GATE"),
    year: z.number().int(),
    paper: z.union([z.enum(["PRE", "P1", "P2"]), z.null()]).optional(),
    section: z.string().nullable().optional(),
    qno: z.number().int().nullable().optional(),
    marks: z.union([z.literal(1), z.literal(2)]).default(1),
    negativeMarking: z.number().min(0).optional(),

    branch: z.enum(["CE", "ME", "EE", "ECE", "CS"]).default("CE"),
    subject: z.string().min(1),
    topic: z.string().default(""),
    subtopic: z.string().optional(),

    difficulty: z
      .enum(["Easy", "Moderate", "Medium", "Hard"])
      .default("Moderate"),

    questionStyle: z
      .enum([
        "conceptual",
        "formula-based",
        "statement-trap",
        "code-based",
        "practical",
        "numerical-calculation",
        "practical-application",
        "graph-based",
        "diagram-based",
      ])
      .nullable()
      .optional(),

    solution: z.string().default(""),
    solutionSteps: z.array(solutionStepSchema).optional(),
    conceptUsed: z.string().optional(),
    formulaUsed: z.array(z.string()).optional(),
    whyWrongOptions: z.record(z.string(), z.string()).optional(),
    keyTakeaway: z.string().optional(),

    appearances: z.array(appearanceSchema).optional(),
    references: z.array(referenceSchema).optional(),

    repeatCount: z.number().int().min(0).optional(),
    isHighRepeat: z.boolean().optional(),
    trendNote: z.string().optional(),

    tags: z.array(z.string()).optional(),

    mainsRelevant: z.boolean().optional(),
    selfEvalChecklist: z.array(z.string()).optional(),
    diagramRequired: z.boolean().optional(),

    aiExplanation: z.string().nullable().optional(),
    similarQuestionsGenerated: z.array(z.string()).optional(),

    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    diagramUrl: z.string().nullable().optional(),

    addedBy: z.enum(["admin", "community", "ai-generated"]).optional(),
    verified: z.boolean().optional(),
    source: z
      .enum(["official-pdf", "book", "community", "ai"])
      .optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

    hasAnswerKey: z.boolean().optional(),
  })
  .passthrough();

export type BundledQuestionInput = z.infer<typeof bundledQuestionSchema>;

/** Map JSON difficulty to app filter value (legacy `Medium` → `Moderate`). */
export function normalizeDifficulty(
  raw: string | undefined,
): BundledDifficulty {
  if (raw === "Easy" || raw === "Hard") return raw;
  return "Moderate";
}

/** App stores Moderate; filters may still see legacy Medium in old rows. */
export function difficultyForFilters(d: string): string {
  return d === "Medium" ? "Moderate" : d;
}

export function normalizeQuestionStyle(
  raw: string | undefined,
): QuestionStyleTag | undefined {
  if (!raw) return undefined;
  if (raw === "practical" || raw === "practical-application")
    return "practical-application";
  if (raw === "numerical-calculation") return "formula-based";
  if (raw === "code-based") return "code-based";
  if (
    raw === "conceptual" ||
    raw === "formula-based" ||
    raw === "statement-trap" ||
    raw === "graph-based" ||
    raw === "diagram-based"
  ) {
    return raw as QuestionStyleTag;
  }
  return undefined;
}

function normalizeExam(exam: BundledExamType): ExamType {
  return exam === "ESE" ? "ESE" : "GATE";
}

function normalizeAppearances(
  parsed: BundledQuestionInput,
  exam: ExamType,
  paper: Question["paper"],
): QuestionAppearance[] {
  if (parsed.appearances?.length) {
    return parsed.appearances.map((a) => ({
      exam: a.exam === "ESE" ? "ESE" : "GATE",
      year: a.year,
      paper:
        a.paper === "PRE" || a.paper === "P1" || a.paper === "P2"
          ? a.paper
          : null,
      session: a.session,
      qno: a.qno ?? undefined,
    }));
  }
  return deriveAppearancesFromLegacy({
    exam,
    year: parsed.year,
    paper,
    appearances: undefined,
  }).map((a) => ({
    ...a,
    qno: parsed.qno,
  }));
}

function resolveCorrect(
  parsed: BundledQuestionInput,
  answerType: BundledAnswerType,
): Question["correct"] {
  const c = parsed.correct;
  if (answerType === "subjective") return "";
  if (answerType === "msq") {
    return Array.isArray(c) ? c : [];
  }
  if (answerType === "nat") {
    if (typeof c === "number") return c;
    return String(c ?? "");
  }
  if (typeof c === "number") return c;
  const n = parseInt(String(c ?? "0"), 10);
  return Number.isNaN(n) ? 0 : n;
}

function computeHighRepeat(parsed: BundledQuestionInput): boolean {
  if (parsed.isHighRepeat === true) return true;
  const count =
    parsed.repeatCount ??
    (parsed.appearances?.length ? parsed.appearances.length : 1);
  return count >= 3;
}

/** Validate + map one `questions.json` row → learner {@link Question}. */
export function normalizeBundledQuestion(raw: unknown): Question {
  const parsed = bundledQuestionSchema.parse(raw);
  const exam = normalizeExam(parsed.exam);
  const paper =
    parsed.paper === "PRE" || parsed.paper === "P1" || parsed.paper === "P2"
      ? parsed.paper
      : null;

  const legacyType = {
    type: parsed.type,
    numerical: parsed.numerical,
    options: parsed.options,
  };
  const answerType = resolveLegacyAnswerType(legacyType);
  const options =
    parsed.options == null
      ? []
      : Array.isArray(parsed.options)
        ? parsed.options.map(String)
        : [];

  const images = [
    ...(parsed.images ?? []),
    ...(parsed.image ? [parsed.image] : []),
    ...(parsed.diagramUrl ? [parsed.diagramUrl] : []),
  ].filter(Boolean);

  const repeatCount =
    parsed.repeatCount ??
    Math.max(1, parsed.appearances?.length ?? 1);

  return {
    id: parsed.id,
    question: parsed.question,
    type: answerType,
    options,
    correct: resolveCorrect(parsed, answerType),
    solution: parsed.solution ?? "",
    subject: parsed.subject,
    topic: parsed.topic ?? "",
    marks: parsed.marks === 2 ? 2 : 1,
    year: parsed.year,
    difficulty: normalizeDifficulty(parsed.difficulty),
    exam,
    paper,
    image: images[0],
    images: images.length ? images : undefined,
    hasAnswerKey: parsed.hasAnswerKey !== false,
    numerical: resolveNumericalFlag(legacyType),
    appearances: normalizeAppearances(parsed, exam, paper),
    references: (parsed.references ?? []) as QuestionReference[],
    questionStyle: normalizeQuestionStyle(
      parsed.questionStyle ?? undefined,
    ),

    branch: parsed.branch,
    section: parsed.section ?? undefined,
    qno: parsed.qno,
    subtopic: parsed.subtopic,
    negativeMarking: parsed.negativeMarking,
    solutionSteps: parsed.solutionSteps,
    conceptUsed: parsed.conceptUsed,
    formulaUsed: parsed.formulaUsed,
    whyWrongOptions: parsed.whyWrongOptions,
    keyTakeaway: parsed.keyTakeaway,
    repeatCount,
    isHighRepeat: computeHighRepeat(parsed),
    trendNote: parsed.trendNote,
    tags: parsed.tags ?? [],
    mainsRelevant: parsed.mainsRelevant,
    selfEvalChecklist: parsed.selfEvalChecklist,
    diagramRequired: parsed.diagramRequired,
    diagramUrl: parsed.diagramUrl ?? undefined,
    addedBy: parsed.addedBy,
    verified: parsed.verified,
    source: parsed.source,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
    aiExplanation: parsed.aiExplanation ?? undefined,
    similarQuestionsGenerated: parsed.similarQuestionsGenerated,
  };
}

/** Mongo / admin extended payload (subset stored on unified Question doc). */
export function bundledToMongoExtended(
  parsed: BundledQuestionInput,
): Record<string, unknown> {
  return {
    branch: parsed.branch ?? "CE",
    section: parsed.section ?? null,
    qno: parsed.qno ?? null,
    subtopic: parsed.subtopic ?? "",
    negativeMarking: parsed.negativeMarking ?? 0,
    questionStyle: parsed.questionStyle ?? null,
    solutionSteps: parsed.solutionSteps ?? [],
    conceptUsed: parsed.conceptUsed ?? "",
    formulaUsed: parsed.formulaUsed ?? [],
    whyWrongOptions: parsed.whyWrongOptions ?? {},
    keyTakeaway: parsed.keyTakeaway ?? "",
    appearances: parsed.appearances ?? [],
    references: parsed.references ?? [],
    repeatCount: parsed.repeatCount ?? 0,
    isHighRepeat: parsed.isHighRepeat ?? false,
    trendNote: parsed.trendNote ?? "",
    mainsRelevant: parsed.mainsRelevant ?? false,
    selfEvalChecklist: parsed.selfEvalChecklist ?? [],
    diagramRequired: parsed.diagramRequired ?? false,
    diagramUrl: parsed.diagramUrl ?? null,
    addedBy: parsed.addedBy ?? "admin",
    verified: parsed.verified ?? false,
    source: parsed.source ?? "official-pdf",
    tags: parsed.tags ?? [],
  };
}
