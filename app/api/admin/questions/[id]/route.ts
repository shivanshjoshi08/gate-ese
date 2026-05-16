import { NextResponse } from "next/server";
import { getQuestionById } from "@/backend/services/question.service";
import { dtoToQuestionDocument } from "@/backend/mappers/question.mapper";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import { putQuestion, removeQuestion } from "@/backend/controllers/question.controller";
import { mongoUnavailableResponse } from "@/lib/mongo-http";

type Ctx = { params: Promise<{ id: string }> };

/** Admin editor: GET returns TipTap QuestionDocument shape */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const dto = await getQuestionById(id);
    if (!dto) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(dtoToQuestionDocument(dto));
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return putQuestion(req, id);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return removeQuestion(_req, id);
}
