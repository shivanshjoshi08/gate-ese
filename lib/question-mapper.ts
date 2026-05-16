import type { Types } from "mongoose";
import type { Question as PracticeQuestion } from "@/lib/types";
import type { QuestionDocument, QuestionOption } from "@/lib/question-types";
import { extractPlainText } from "@/lib/rich-content";
import {
  extractImageUrlsFromRichDoc,
  normalizeImageList,
  normalizeQuestionImageUrl,
} from "@/lib/question-images";

/** Shape from `Question.findOne().lean()` / `create().toObject()` */
export type MongoQuestionRow = {
  _id: Types.ObjectId | string;
  type: string;
  stem: unknown;
  options: unknown;
  solution: unknown;
  correctAnswer: unknown;
  subject: string;
  topic: string;
  difficulty: string;
  examType: string;
  paper: string | null;
  marks: number;
  year: number;
  status: string;
  tags: string[];
  hasAnswerKey: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function parseJson<T>(v: unknown): T {
  return v as T;
}

function rowId(row: MongoQuestionRow): string {
  const id = row._id;
  return typeof id === "string" ? id : id.toString();
}

function asIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function collectMediaFromLegacyRow(
  stem: QuestionDocument["stem"],
  options: QuestionOption[],
  solution: QuestionDocument["solution"],
): QuestionDocument["media"] {
  const rawUrls = [
    ...extractImageUrlsFromRichDoc(stem.doc),
    ...options.flatMap((o) => extractImageUrlsFromRichDoc(o.body?.doc)),
    ...extractImageUrlsFromRichDoc(solution.doc),
  ];
  return normalizeImageList(rawUrls).map((url, i) => ({
    id: `img-${i}`,
    url,
    alt: "",
  }));
}

export function mongoToQuestionDocument(row: MongoQuestionRow): QuestionDocument {
  const stem = parseJson<QuestionDocument["stem"]>(row.stem);
  const options = parseJson<QuestionOption[]>(row.options);
  const solution = parseJson<QuestionDocument["solution"]>(row.solution);
  return {
    id: rowId(row),
    status: row.status as QuestionDocument["status"],
    type: row.type as QuestionDocument["type"],
    stem,
    options,
    solution,
    correctAnswer: parseJson(row.correctAnswer),
    subject: row.subject,
    topic: row.topic,
    tags: row.tags ?? [],
    difficulty: row.difficulty as QuestionDocument["difficulty"],
    marks: row.marks === 2 ? 2 : 1,
    exam: row.examType as QuestionDocument["exam"],
    paper: (row.paper as QuestionDocument["paper"]) ?? null,
    year: row.year,
    hasAnswerKey: row.hasAnswerKey,
    media: collectMediaFromLegacyRow(stem, options, solution),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt),
  };
}

/** Plain fields for Mongoose create / update (maps API `exam` → stored `examType`). */
export function questionDocumentToMongoFields(doc: QuestionDocument): {
  type: string;
  stem: unknown;
  options: unknown;
  solution: unknown;
  correctAnswer: unknown;
  subject: string;
  topic: string;
  difficulty: string;
  examType: string;
  paper: string | null;
  marks: number;
  year: number;
  status: string;
  tags: string[];
  hasAnswerKey: boolean;
} {
  return {
    type: doc.type,
    stem: doc.stem,
    options: doc.options,
    solution: doc.solution,
    correctAnswer: doc.correctAnswer,
    subject: doc.subject,
    topic: doc.topic ?? "",
    difficulty: doc.difficulty,
    examType: doc.exam,
    paper: doc.paper,
    marks: doc.marks,
    year: doc.year,
    status: doc.status,
    tags: doc.tags ?? [],
    hasAnswerKey: doc.hasAnswerKey,
  };
}

/** Practice UI expects MCQ correct index, NAT type string `nat`, etc. */
export function questionDocumentToPractice(doc: QuestionDocument): PracticeQuestion {
  const stemPlain =
    doc.stem.plainText ?? extractPlainText(doc.stem.doc);

  const optionsPlain = doc.options.map(
    (o) => o.body.plainText ?? extractPlainText(o.body.doc)
  );

  let type: PracticeQuestion["type"] = "mcq";
  let correct: PracticeQuestion["correct"] = 0;

  if (doc.type === "numerical") {
    type = "nat";
    correct =
      typeof doc.correctAnswer === "number"
        ? doc.correctAnswer
        : String(doc.correctAnswer ?? "");
  } else if (doc.type === "msq") {
    type = "msq";
    const labels = Array.isArray(doc.correctAnswer)
      ? doc.correctAnswer
      : [];
    correct = labels.map((l) => l.charCodeAt(0) - 65).filter((n) => n >= 0);
  } else if (doc.type === "mcq") {
    type = "mcq";
    const label =
      typeof doc.correctAnswer === "string"
        ? doc.correctAnswer
        : "A";
    const idx = doc.options.findIndex(
      (o) => o.label === label || o.id === label
    );
    correct = idx >= 0 ? idx : Math.max(0, label.charCodeAt(0) - 65);
  } else if (doc.type === "subjective") {
    type = "mcq";
    correct = 0;
    return {
      id: doc.id,
      question: stemPlain,
      type,
      options: [],
      correct,
      solution: doc.solution.plainText ?? extractPlainText(doc.solution.doc),
      subject: doc.subject,
      topic: doc.topic,
      marks: doc.marks,
      year: doc.year,
      difficulty: doc.difficulty,
      exam: doc.exam,
      paper: doc.paper,
      image: doc.media?.[0]?.url
        ? normalizeQuestionImageUrl(doc.media[0].url) ?? undefined
        : undefined,
      images: normalizeImageList(doc.media?.map((m) => m.url) ?? []),
      hasAnswerKey: false,
      richStem: doc.stem,
      richSolution: doc.solution,
      richOptions: undefined,
    };
  } else {
    type = "mcq";
    correct = 0;
  }

  return {
    id: doc.id,
    question: stemPlain,
    type,
    options: doc.type === "numerical" ? [] : optionsPlain,
    correct,
    solution: doc.solution.plainText ?? extractPlainText(doc.solution.doc),
    subject: doc.subject,
    topic: doc.topic,
    marks: doc.marks,
    year: doc.year,
    difficulty: doc.difficulty,
    exam: doc.exam,
    paper: doc.paper,
    image: doc.media?.[0]?.url
      ? normalizeQuestionImageUrl(doc.media[0].url) ?? undefined
      : undefined,
    images: normalizeImageList(doc.media?.map((m) => m.url) ?? []),
    hasAnswerKey: doc.hasAnswerKey,
    richStem: doc.stem,
    richSolution: doc.solution,
    richOptions:
      doc.type === "mcq" || doc.type === "msq" ? doc.options : undefined,
  };
}
