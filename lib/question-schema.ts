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

/** NAT / range grading span — fill when range-input questions ship; `null` until then. */
export type AnswerRange = {
  min?: number;
  max?: number;
  exact?: number;
  tolerance?: number;
} | null;

export const answerRangeSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    exact: z.number().optional(),
    tolerance: z.number().optional(),
  })
  .nullable()
  .default(null);

export function normalizeAnswerRange(raw: unknown): AnswerRange {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const out: Exclude<AnswerRange, null> = {};
  for (const key of ["min", "max", "exact", "tolerance"] as const) {
    const v = r[key];
    if (typeof v === "number" && Number.isFinite(v)) out[key] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function normalizeUnit(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  return String(raw).trim() || null;
}

export type QuestionAddedBy = "admin" | "community" | "ai-generated";
export type QuestionSourceKind =
  | "official-pdf"
  | "book"
  | "community"
  | "ai"
  | "ai-generated";

const ESE_PAPER_VALUES = ["PRE", "P1", "P2"] as const;
export type BundledEsePaper = (typeof ESE_PAPER_VALUES)[number];

/** GATE rows often use `""` for paper; coerce to null before validation. */
export function normalizeBundledPaper(
  raw: unknown,
): BundledEsePaper | null | undefined {
  if (raw === undefined) return undefined;
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().toUpperCase();
  if (s === "PRE" || s === "P1" || s === "P2") return s;
  return null;
}

const bundledPaperSchema = z.preprocess(
  normalizeBundledPaper,
  z.union([z.enum(ESE_PAPER_VALUES), z.null()]),
);

const QUESTION_STYLE_VALUES = [
  "conceptual",
  "formula-based",
  "statement-trap",
  "code-based",
  "practical",
  "numerical-calculation",
  "practical-application",
  "graph-based",
  "diagram-based",
] as const;

const bundledQuestionStyleSchema = z.preprocess(
  (raw) => {
    if (raw === undefined) return undefined;
    if (raw == null || raw === "") return null;
    return normalizeQuestionStyle(String(raw)) ?? null;
  },
  z.enum(QUESTION_STYLE_VALUES).nullable().optional(),
);

const appearanceSchema = z.object({
  exam: z.enum(["GATE", "ESE", "ISRO", "SSC-JE"]),
  year: z.number().int(),
  paper: bundledPaperSchema.optional(),
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
    numerical: z.boolean().default(false),
    /** Display / grading unit for future NAT (e.g. mm, kN/m³). */
    unit: z.string().nullable().default(null),
    /** Accepted answer span for future NAT grading. */
    answerRange: answerRangeSchema,

    exam: z.enum(["GATE", "ESE", "ISRO", "SSC-JE"]).default("GATE"),
    year: z.number().int(),
    paper: bundledPaperSchema.optional(),
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

    questionStyle: bundledQuestionStyleSchema,

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
    trendNote: z.string().nullable().optional(),

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
      .enum(["official-pdf", "book", "community", "ai", "ai-generated"])
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
  if (!raw || !String(raw).trim()) return undefined;
  const key = String(raw).trim().toLowerCase();
  const aliases: Record<string, QuestionStyleTag> = {
    conceptual: "conceptual",
    concept: "conceptual",
    theory: "conceptual",
    "formula-based": "formula-based",
    formula: "formula-based",
    "numerical-calculation": "formula-based",
    numerical: "formula-based",
    calculation: "formula-based",
    "statement-trap": "statement-trap",
    trap: "statement-trap",
    "code-based": "code-based",
    code: "code-based",
    practical: "practical-application",
    "practical-application": "practical-application",
    application: "practical-application",
    "application-based": "practical-application",
    "graph-based": "graph-based",
    graph: "graph-based",
    graphical: "graph-based",
    "diagram-based": "diagram-based",
    diagram: "diagram-based",
  };
  return aliases[key];
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
    unit: normalizeUnit(parsed.unit),
    answerRange: normalizeAnswerRange(parsed.answerRange),
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
    unit: normalizeUnit(parsed.unit),
    answerRange: normalizeAnswerRange(parsed.answerRange),
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
