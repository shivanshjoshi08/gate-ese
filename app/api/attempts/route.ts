import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  listAttempts,
  recordAttempt,
} from "@/backend/services/progress.service";
import { mongoUnavailableResponse } from "@/lib/mongo-http";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.string().default(""),
  isCorrect: z.boolean(),
  timeTaken: z.coerce.number().min(0).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Number(url.searchParams.get("limit")) || 50);
    const result = await listAttempts(session.user.id, page, limit);
    return NextResponse.json(result);
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const doc = await recordAttempt({
      userId: session.user.id,
      ...parsed.data,
    });
    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}
