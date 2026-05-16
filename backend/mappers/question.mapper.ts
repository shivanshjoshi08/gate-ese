import type { ExamType, Question as PracticeQuestion } from "@/lib/types";
import type { QuestionDocument, QuestionOption } from "@/lib/question-types";
import { createParagraph, extractPlainText } from "@/lib/rich-content";
import type { QuestionDto } from "@/backend/types/question";
import type { QuestionLean } from "@/backend/models/Question";
import { slugify } from "@/backend/utils/slug";
import {
  mongoToQuestionDocument,
  questionDocumentToPractice,
  type MongoQuestionRow,
} from "@/lib/question-mapper";
import {
  extractImageUrlsFromRichDoc,
  normalizeImageList,
  normalizeQuestionImageUrl,
} from "@/lib/question-images";
import {
  resolveMongoAnswerType,
  resolveNumericalFlag,
} from "@/lib/question-numerical";
import {
  deriveAppearancesFromLegacy,
  type QuestionAppearance,
} from "@/lib/question-sources";
import {
  bundledQuestionSchema,
  normalizeBundledQuestion,
  normalizeDifficulty,
  normalizeQuestionStyle,
} from "@/lib/question-schema";

function asIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function rowId(row: { _id: { toString(): string } | string }): string {
  const id = row._id;
  return typeof id === "string" ? id : id.toString();
}

/** New unified schema row */
export function leanToDto(row: QuestionLean): QuestionDto {
  return {
    id: String(row._id),
    slug: row.slug,
    sourceType: row.sourceType,
    exam: row.exam,
    branch: row.branch ?? "CE",
    subject: row.subject,
    topic: row.topic ?? "",
    subtopic: row.subtopic ?? "",
    year: row.year,
    paper: row.paper,
    type: row.type,
    numerical: row.numerical === true,
    appearances: row.appearances ?? [],
    references: row.references ?? [],
    questionStyle: row.questionStyle ?? null,
    question: row.question,
    options: row.options ?? [],
    correctOption: row.correctOption ?? "",
    solution: {
      text: row.solution?.text ?? "",
      latex: row.solution?.latex ?? "",
      images: row.solution?.images ?? [],
    },
    difficulty: row.difficulty,
    marks: row.marks === 2 ? 2 : 1,
    negativeMarks: row.negativeMarks ?? 0,
    tags: row.tags ?? [],
    images: row.images ?? [],
    status: row.status,
    section: row.section ?? null,
    qno: row.qno ?? null,
    conceptUsed: row.conceptUsed ?? "",
    formulaUsed: row.formulaUsed ?? [],
    solutionSteps: row.solutionSteps ?? [],
    whyWrongOptions: row.whyWrongOptions ?? {},
    keyTakeaway: row.keyTakeaway ?? "",
    repeatCount: row.repeatCount ?? 0,
    isHighRepeat: row.isHighRepeat === true,
    trendNote: row.trendNote ?? "",
    mainsRelevant: row.mainsRelevant === true,
    selfEvalChecklist: row.selfEvalChecklist ?? [],
    diagramRequired: row.diagramRequired === true,
    diagramUrl: row.diagramUrl ?? null,
    addedBy: row.addedBy,
    verified: row.verified,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Pre-refactor PYQ rows (stem / examType / published) */
export function legacyLeanToDto(row: MongoQuestionRow): QuestionDto {
  const doc = mongoToQuestionDocument(row);
  const input = documentToDtoInput({
    ...doc,
    sourceType: "pyq",
  });
  return {
    ...input,
    id: rowId(row),
    slug: input.slug ?? rowId(row),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt),
  };
}

export function leanRowToDto(
  row: QuestionLean | MongoQuestionRow,
): QuestionDto | null {
  const r = row as Record<string, unknown>;
  if (typeof r.question === "string" && r.sourceType) {
    return leanToDto(row as QuestionLean);
  }
  if (r.stem != null) {
    return legacyLeanToDto(row as MongoQuestionRow);
  }
  return null;
}

/** Admin TipTap editor ↔ unified Mongo document */
export function documentToDtoInput(
  doc: QuestionDocument & { sourceType?: "pyq" | "practice" },
): Omit<QuestionDto, "id" | "createdAt" | "updatedAt" | "slug"> & {
  slug?: string;
} {
  const options = doc.options.map((o, i) => ({
    id: o.label || String.fromCharCode(65 + i),
    text: o.body.plainText ?? extractPlainText(o.body.doc),
    image: o.body?.doc
      ? normalizeQuestionImageUrl(
          extractImageUrlsFromRichDoc(o.body.doc)[0] ?? null,
        )
      : null,
  }));

  let correctOption = "A";
  if (doc.type === "numerical") {
    correctOption = String(doc.correctAnswer ?? "");
  } else if (doc.type === "mcq" && typeof doc.correctAnswer === "string") {
    correctOption = doc.correctAnswer;
  } else if (doc.type === "msq" && Array.isArray(doc.correctAnswer)) {
    correctOption = doc.correctAnswer[0] ?? "A";
  }

  const status = doc.status === "published" ? "approved" : "draft";

  return {
    slug: doc.id.startsWith("new_") ? undefined : doc.id,
    sourceType: doc.sourceType ?? "pyq",
    exam: doc.exam,
    branch: "CE",
    subject: doc.subject,
    topic: doc.topic ?? "",
    subtopic: "",
    year: doc.year,
    paper: doc.paper,
    type: doc.type === "numerical" ? "numerical" : "mcq",
    numerical: doc.numerical === true || doc.type === "numerical",
    appearances: doc.appearances ?? [],
    references: doc.references ?? [],
    questionStyle: doc.questionStyle ?? null,
    question: doc.stem.plainText ?? extractPlainText(doc.stem.doc),
    options,
    correctOption,
    solution: {
      text: doc.solution.plainText ?? extractPlainText(doc.solution.doc),
      latex: "",
      images: doc.media?.map((m) => m.url) ?? [],
    },
    difficulty: doc.difficulty,
    marks: doc.marks,
    negativeMarks: 0,
    tags: doc.tags ?? [],
    images: doc.media?.map((m) => m.url) ?? [],
    status,
  };
}

export function dtoToQuestionDocument(dto: QuestionDto): QuestionDocument {
  const labels = ["A", "B", "C", "D", "E", "F"] as const;
  const options: QuestionOption[] = dto.options.map((o, i) => ({
    id: o.id,
    label: labels[i] ?? o.id,
    body: createParagraph(o.text),
  }));

  let correctAnswer: QuestionDocument["correctAnswer"] = dto.correctOption;
  let type: QuestionDocument["type"] = "mcq";
  if (dto.type === "numerical") {
    type = "numerical";
    const n = parseFloat(dto.correctOption);
    correctAnswer = Number.isNaN(n) ? dto.correctOption : n;
  }

  return {
    id: dto.id,
    sourceType: dto.sourceType,
    status: dto.status === "approved" ? "published" : "draft",
    type,
    numerical: dto.numerical === true,
    stem: createParagraph(dto.question),
    options,
    solution: createParagraph(dto.solution.text),
    correctAnswer,
    subject: dto.subject,
    topic: dto.topic,
    tags: dto.tags,
    difficulty: dto.difficulty,
    marks: dto.marks === 2 ? 2 : 1,
    exam: dto.exam,
    paper: (dto.paper as QuestionDocument["paper"]) ?? null,
    year: dto.year,
    hasAnswerKey: true,
    media: dto.images.map((url, i) => ({
      id: `img-${i}`,
      url,
      alt: "",
    })),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/** Practice UI card shape (unified Mongo schema). */
export function dtoToPracticeQuestion(dto: QuestionDto): PracticeQuestion {
  const optionsText = dto.options.map((o) => o.text);
  let correct: PracticeQuestion["correct"] = 0;
  if (dto.type === "numerical") {
    const n = parseFloat(dto.correctOption);
    correct = Number.isNaN(n) ? dto.correctOption : n;
  } else {
    const idx = dto.options.findIndex((o) => o.id === dto.correctOption);
    correct = idx >= 0 ? idx : Math.max(0, dto.correctOption.charCodeAt(0) - 65);
  }

  const images = normalizeImageList([
    ...dto.images,
    ...(dto.solution?.images ?? []),
    ...dto.options.map((o) => o.image),
  ]);

  const answerType: PracticeQuestion["type"] =
    dto.type === "numerical" ? "nat" : "mcq";

  return {
    id: dto.id,
    question: dto.question,
    type: answerType,
    numerical: dto.numerical === true,
    appearances: normalizeAppearances(
      dto.appearances?.length > 0
        ? dto.appearances
        : deriveAppearancesFromLegacy({
            exam: dto.exam,
            year: dto.year,
            paper: (dto.paper as PracticeQuestion["paper"]) ?? null,
          }),
    ),
    references: dto.references ?? [],
    questionStyle:
      normalizeQuestionStyle(dto.questionStyle ?? undefined) ?? undefined,
    options: optionsText,
    correct,
    solution: dto.solution.text,
    subject: dto.subject,
    topic: dto.topic,
    marks: dto.marks === 2 ? 2 : 1,
    year: dto.year,
    difficulty: dto.difficulty,
    exam: dto.exam,
    paper: (dto.paper as PracticeQuestion["paper"]) ?? null,
    image: images[0],
    images,
    questionBank: dto.sourceType === "pyq" ? "pyq" : "ai",
    branch: dto.branch,
    section: dto.section,
    qno: dto.qno ?? undefined,
    subtopic: dto.subtopic,
    negativeMarking: dto.negativeMarks,
    solutionSteps: dto.solutionSteps as PracticeQuestion["solutionSteps"],
    conceptUsed: dto.conceptUsed,
    formulaUsed: dto.formulaUsed,
    whyWrongOptions: dto.whyWrongOptions,
    keyTakeaway: dto.keyTakeaway,
    repeatCount: dto.repeatCount,
    isHighRepeat: dto.isHighRepeat,
    trendNote: dto.trendNote,
    tags: dto.tags,
    mainsRelevant: dto.mainsRelevant,
    selfEvalChecklist: dto.selfEvalChecklist,
    diagramRequired: dto.diagramRequired,
    diagramUrl: dto.diagramUrl ?? undefined,
  };
}

/** Map a Mongo lean row to the learner practice card (legacy stem + unified). */
export function leanRowToPracticeQuestion(
  row: QuestionLean | MongoQuestionRow,
): PracticeQuestion | null {
  const r = row as Record<string, unknown>;
  if (typeof r.question === "string" && r.sourceType) {
    return dtoToPracticeQuestion(leanToDto(row as QuestionLean));
  }
  if (r.stem != null) {
    const doc = mongoToQuestionDocument(row as MongoQuestionRow);
    const practice = questionDocumentToPractice(doc);
    const bank =
      (r.sourceType as string) === "practice" ? ("ai" as const) : ("pyq" as const);
    return {
      ...practice,
      id: rowId(row as MongoQuestionRow),
      questionBank: bank,
    };
  }
  return null;
}

export function legacyJsonToCreatePayload(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = bundledQuestionSchema.parse(raw);
  const q = normalizeBundledQuestion(raw);
  const id = q.id;
  const type = resolveMongoAnswerType(raw);
  const options = q.options.map((text, i) => ({
    id: String.fromCharCode(65 + i),
    text,
    image: null,
  }));
  let correctOption = "A";
  if (type === "numerical") {
    correctOption = String(q.correct ?? "");
  } else if (typeof q.correct === "number") {
    correctOption = String.fromCharCode(65 + q.correct);
  }

  const sourceType =
    raw.sourceType === "pyq" || raw.sourceType === "practice"
      ? raw.sourceType
      : "practice";
  const status =
    raw.status === "approved" || raw.status === "draft"
      ? raw.status
      : "approved";

  return {
    importKey: id,
    slug: slugify([id, q.subject, q.year]),
    sourceType,
    exam: q.exam,
    branch: q.branch ?? "CE",
    subject: q.subject,
    topic: q.topic,
    subtopic: q.subtopic ?? "",
    year: q.year,
    paper: q.paper,
    section: q.section ?? null,
    qno: q.qno ?? null,
    type,
    numerical: q.numerical === true,
    appearances: q.appearances ?? [],
    references: q.references ?? [],
    questionStyle: q.questionStyle ?? parsed.questionStyle ?? null,
    question: q.question,
    options,
    correctOption,
    solution: {
      text: q.solution,
      latex: "",
      images: q.images ?? [],
    },
    difficulty: normalizeDifficulty(
      typeof parsed.difficulty === "string" ? parsed.difficulty : "Moderate",
    ),
    marks: q.marks,
    negativeMarks: q.negativeMarking ?? 0,
    tags: q.tags ?? [],
    conceptUsed: q.conceptUsed ?? "",
    formulaUsed: q.formulaUsed ?? [],
    solutionSteps: q.solutionSteps ?? [],
    whyWrongOptions: q.whyWrongOptions ?? {},
    keyTakeaway: q.keyTakeaway ?? "",
    repeatCount: q.repeatCount ?? 0,
    isHighRepeat: q.isHighRepeat === true,
    trendNote: q.trendNote ?? "",
    mainsRelevant: q.mainsRelevant === true,
    selfEvalChecklist: q.selfEvalChecklist ?? [],
    diagramRequired: q.diagramRequired === true,
    diagramUrl: q.diagramUrl ?? null,
    addedBy: q.addedBy ?? "admin",
    verified: q.verified === true,
    source: q.source ?? "official-pdf",
    aiExplanation: null,
    similarQuestionsGenerated: [],
    images: q.images ?? [],
    status,
  };
}

function parseEsePaper(raw: unknown): PracticeQuestion["paper"] {
  if (raw === "PRE" || raw === "P1" || raw === "P2") return raw;
  return null;
}

function normalizeAppearances(
  rows: {
    exam: ExamType;
    year: number;
    paper?: string | null;
    session?: string;
  }[],
): QuestionAppearance[] {
  const papers = new Set(["PRE", "P1", "P2"]);
  return rows.map((a) => ({
    exam: a.exam,
    year: a.year,
    paper:
      a.paper && papers.has(a.paper)
        ? (a.paper as QuestionAppearance["paper"])
        : null,
    session: a.session,
  }));
}

/** Detect legacy `questions.json` shape vs unified REST schema */
export function isLegacyImportShape(raw: Record<string, unknown>): boolean {
  if (raw.sourceType && typeof raw.question === "string") return false;
  return (
    typeof raw.question === "string" &&
    (Array.isArray(raw.options) || raw.type === "numerical" || raw.type === "nat")
  );
}

export function normalizeImportRecord(
  raw: Record<string, unknown>,
  defaults?: { sourceType?: "pyq" | "practice"; status?: "approved" | "draft" },
): Record<string, unknown> {
  if (isLegacyImportShape(raw)) {
    const base = legacyJsonToCreatePayload(raw);
    base.sourceType = "practice";
    if (defaults?.status) base.status = defaults.status;
    return base;
  }
  const merged: Record<string, unknown> = {
    ...defaults,
    ...raw,
    sourceType: "practice",
  };
  if (!merged.importKey && raw.id) merged.importKey = String(raw.id);
  return merged;
}
