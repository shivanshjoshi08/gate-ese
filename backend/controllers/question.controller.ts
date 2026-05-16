import { NextResponse } from "next/server";
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  listQuestions,
  updateQuestion,
} from "@/backend/services/question.service";
import {
  questionCreateSchema,
  questionListQuerySchema,
  questionUpdateSchema,
} from "@/backend/validators/question.validator";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import { parsePagination } from "@/backend/utils/pagination";
import { mongoUnavailableResponse } from "@/lib/mongo-http";
import {
  documentToDtoInput,
  dtoToQuestionDocument,
} from "@/backend/mappers/question.mapper";
import type { QuestionDocument } from "@/lib/question-types";

export async function getQuestionsList(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = questionListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { page, limit } = parsePagination(url.searchParams);
    const result = await listQuestions({ ...parsed.data, page, limit });
    return NextResponse.json(result);
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function getQuestion(req: Request, id: string) {
  try {
    const doc = await getQuestionById(id);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function postQuestion(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    /** Accept legacy admin QuestionDocument or new REST shape */
    const parsed =
      "stem" in body
        ? questionCreateSchema.safeParse({
            ...documentToDtoInput(body as QuestionDocument & { sourceType?: "pyq" | "practice" }),
          })
        : questionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const created = await createQuestion(parsed.data);
    return NextResponse.json(dtoToQuestionDocument(created), { status: 201 });
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function putQuestion(req: Request, id: string) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed =
      "stem" in body
        ? questionUpdateSchema.safeParse(
            documentToDtoInput(body as QuestionDocument & { sourceType?: "pyq" | "practice" }),
          )
        : questionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const updated = await updateQuestion(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(dtoToQuestionDocument(updated));
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function removeQuestion(req: Request, id: string) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const ok = await deleteQuestion(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}
