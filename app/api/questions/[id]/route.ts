import {
  getQuestion,
  putQuestion,
  removeQuestion,
} from "@/backend/controllers/question.controller";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return getQuestion(_req, id);
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return putQuestion(req, id);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return removeQuestion(_req, id);
}
