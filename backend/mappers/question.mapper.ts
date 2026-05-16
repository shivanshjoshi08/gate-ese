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
    questionStyle: dto.questionStyle ?? undefined,
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
  const id = String(raw.id ?? "");
  const type = resolveMongoAnswerType(raw);
  const numerical = resolveNumericalFlag(raw);
  const optionsArr = Array.isArray(raw.options) ? raw.options : [];
  const options = optionsArr.map((text, i) => ({
    id: String.fromCharCode(65 + i),
    text: String(text),
    image: null,
  }));
  const correctIdx =
    typeof raw.correct === "number" ? raw.correct : parseInt(String(raw.correct), 10);
  const correctOption =
    type === "numerical"
      ? String(raw.correct ?? "")
      : String.fromCharCode(65 + (Number.isNaN(correctIdx) ? 0 : correctIdx));

  const exam = raw.exam === "ESE" ? "ESE" : "GATE";
  const year = typeof raw.year === "number" ? raw.year : 2024;

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
    slug: slugify([id, String(raw.subject ?? ""), year]),
    sourceType,
    exam,
    branch: "CE",
    subject: String(raw.subject ?? "General"),
    topic: String(raw.topic ?? ""),
    subtopic: "",
    year,
    paper: raw.paper ? String(raw.paper) : null,
    type,
    numerical,
    appearances: Array.isArray(raw.appearances)
      ? raw.appearances
      : deriveAppearancesFromLegacy({
          exam: raw.exam === "ESE" ? "ESE" : "GATE",
          year: typeof raw.year === "number" ? raw.year : 2024,
          paper: parseEsePaper(raw.paper),
        }),
    references: Array.isArray(raw.references) ? raw.references : [],
    questionStyle:
      typeof raw.questionStyle === "string" ? raw.questionStyle : null,
    question: String(raw.question ?? ""),
    options,
    correctOption,
    solution: {
      text: String(raw.solution ?? ""),
      latex: "",
      images: [],
    },
    difficulty:
      raw.difficulty === "Easy" || raw.difficulty === "Hard"
        ? raw.difficulty
        : "Medium",
    marks: raw.marks === 2 ? 2 : 1,
    negativeMarks: 0,
    tags: [],
    images: raw.image
      ? [normalizeQuestionImageUrl(String(raw.image))].filter(
          (u): u is string => !!u,
        )
      : [],
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
    if (defaults?.sourceType) base.sourceType = defaults.sourceType;
    if (defaults?.status) base.status = defaults.status;
    return base;
  }
  const merged: Record<string, unknown> = { ...defaults, ...raw };
  if (!merged.importKey && raw.id) merged.importKey = String(raw.id);
  return merged;
}
