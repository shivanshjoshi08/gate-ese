import { connectMongo } from "@/lib/mongoose";
import { Question, type QuestionLean } from "@/backend/models/Question";
import type {
  QuestionDto,
  QuestionListQuery,
  PaginatedResult,
  QuestionBankStats,
} from "@/backend/types/question";
import type { QuestionCreateInput, QuestionUpdateInput } from "@/backend/validators/question.validator";
import { leanRowToDto } from "@/backend/mappers/question.mapper";
import { slugify } from "@/backend/utils/slug";
import { paginatedMeta } from "@/backend/utils/pagination";

function buildFilter(query: QuestionListQuery): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];

  if (query.sourceType === "pyq") {
    and.push({
      $or: [
        { sourceType: "pyq" },
        { sourceType: { $exists: false }, stem: { $exists: true } },
      ],
    });
  } else if (query.sourceType === "practice") {
    and.push({ sourceType: "practice" });
  }

  if (query.status === "approved") {
    and.push({ status: { $in: ["approved", "published"] } });
  } else if (query.status) {
    and.push({ status: query.status });
  }

  if (query.exam) {
    and.push({
      $or: [{ exam: query.exam }, { examType: query.exam }],
    });
  }
  if (query.subject) and.push({ subject: new RegExp(query.subject, "i") });
  if (query.topic) and.push({ topic: new RegExp(query.topic, "i") });
  if (query.year) and.push({ year: query.year });
  if (query.difficulty) and.push({ difficulty: query.difficulty });

  if (query.search?.trim()) {
    const s = query.search.trim();
    const rx = new RegExp(s, "i");
    and.push({
      $or: [
        { question: rx },
        { subject: rx },
        { topic: rx },
      ],
    });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0];
  return { $and: and };
}

export async function listQuestions(
  query: QuestionListQuery,
): Promise<PaginatedResult<QuestionDto>> {
  await connectMongo();
  const page = query.page ?? 1;
  const limit = Math.min(50, query.limit ?? 20);
  const skip = (page - 1) * limit;
  const filter = buildFilter(query);

  const [rows, total] = await Promise.all([
    Question.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<QuestionLean[]>(),
    Question.countDocuments(filter),
  ]);

  const items = rows
    .map((row) => leanRowToDto(row as unknown as Parameters<typeof leanRowToDto>[0]))
    .filter((d): d is NonNullable<typeof d> => d != null);

  return {
    items,
    ...paginatedMeta(total, page, limit),
  };
}

export async function getQuestionById(id: string): Promise<QuestionDto | null> {
  await connectMongo();
  const row = await Question.findById(id).lean();
  return row
    ? leanRowToDto(row as unknown as Parameters<typeof leanRowToDto>[0])
    : null;
}

export async function createQuestion(
  input: QuestionCreateInput,
): Promise<QuestionDto> {
  await connectMongo();
  const slug =
    input.slug ??
    slugify([
      input.sourceType,
      input.exam,
      input.subject,
      input.topic,
      input.year,
      Date.now(),
    ]);

  const row = await Question.create({
    slug,
    importKey: input.importKey,
    sourceType: input.sourceType,
    exam: input.exam,
    branch: input.branch ?? "CE",
    subject: input.subject,
    topic: input.topic ?? "",
    subtopic: input.subtopic ?? "",
    year: input.year,
    paper: input.paper ?? null,
    type: input.type,
    numerical: input.numerical ?? false,
    unit: input.unit ?? null,
    answerRange: input.answerRange ?? null,
    question: input.question,
    options: input.options ?? [],
    correctOption: input.correctOption ?? "",
    solution: input.solution ?? { text: "" },
    difficulty: input.difficulty,
    marks: input.marks ?? 1,
    negativeMarks: input.negativeMarks ?? 0,
    tags: input.tags ?? [],
    appearances: input.appearances ?? [],
    references: input.references ?? [],
    questionStyle: input.questionStyle ?? null,
    images: input.images ?? [],
    status: input.status ?? "draft",
  });
  const dto = leanRowToDto(
    row.toObject() as unknown as Parameters<typeof leanRowToDto>[0],
  );
  if (!dto) throw new Error("Failed to map created question");
  return dto;
}

export async function updateQuestion(
  id: string,
  input: QuestionUpdateInput,
): Promise<QuestionDto | null> {
  await connectMongo();
  const row = await Question.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true },
  ).lean<QuestionLean | null>();
  return row
    ? leanRowToDto(row as unknown as Parameters<typeof leanRowToDto>[0])
    : null;
}

export async function deleteQuestion(id: string): Promise<boolean> {
  await connectMongo();
  const res = await Question.deleteOne({ _id: id });
  return res.deletedCount === 1;
}

const approvedStatus = { $in: ["approved", "published"] as const };

async function countBySource(
  sourceType: "practice" | "pyq",
): Promise<QuestionBankStats["practice"]> {
  const base =
    sourceType === "pyq"
      ? {
          $or: [
            { sourceType: "pyq" },
            { sourceType: { $exists: false }, stem: { $exists: true } },
          ],
        }
      : { sourceType: "practice" };

  const [total, approved, draft] = await Promise.all([
    Question.countDocuments(base),
    Question.countDocuments({ ...base, status: approvedStatus }),
    Question.countDocuments({ ...base, status: "draft" }),
  ]);
  return { total, approved, draft };
}

/** Admin dashboard: live counts from MongoDB by sourceType. */
export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  await connectMongo();
  const [total, practice, pyq, legacyPyq] = await Promise.all([
    Question.countDocuments({}),
    countBySource("practice"),
    countBySource("pyq"),
    Question.countDocuments({
      sourceType: { $exists: false },
      stem: { $exists: true },
    }),
  ]);
  return { total, practice, pyq, legacyPyq };
}

/** Learner practice bank: approved only, paginated by sourceType */
export async function listPracticeQuestions(params: {
  sourceType?: "pyq" | "practice";
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<QuestionDto>> {
  return listQuestions({
    ...params,
    status: "approved",
    limit: params.limit ?? 50,
    page: params.page ?? 1,
  });
}

/** Lean Mongo rows for learner mapping (preserves legacy `stem` for images). */
export async function listPracticeQuestionRows(params: {
  sourceType?: "pyq" | "practice";
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<QuestionLean>> {
  await connectMongo();
  const page = params.page ?? 1;
  const limit = Math.min(50, params.limit ?? 50);
  const skip = (page - 1) * limit;
  const filter = buildFilter({
    ...params,
    status: "approved",
    limit,
    page,
  });

  const [rows, total] = await Promise.all([
    Question.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<QuestionLean[]>(),
    Question.countDocuments(filter),
  ]);

  return {
    items: rows,
    ...paginatedMeta(total, page, limit),
  };
}
