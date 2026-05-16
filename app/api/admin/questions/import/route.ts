import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import { importQuestionsFromJson } from "@/backend/services/question-import.service";
import { mongoUnavailableResponse } from "@/lib/mongo-http";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  questions: z.unknown(),
  defaults: z
    .object({
      sourceType: z.enum(["pyq", "practice"]).optional(),
      status: z.enum(["approved", "draft"]).optional(),
    })
    .optional(),
});

/** POST /api/admin/questions/import — bulk JSON upload (admin only) */
export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload =
      parsed.data.questions !== undefined
        ? { questions: parsed.data.questions }
        : json;

    const result = await importQuestionsFromJson(
      payload,
      parsed.data.defaults,
    );

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && e.message.includes("JSON must be")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return mongoUnavailableResponse(e);
  }
}
