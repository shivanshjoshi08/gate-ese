import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  addBookmark,
  listBookmarks,
  removeBookmark,
} from "@/backend/services/progress.service";
import { mongoUnavailableResponse } from "@/lib/mongo-http";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  questionId: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await listBookmarks(session.user.id);
    return NextResponse.json({
      items: items.map((b) => ({
        questionId: String(b.questionId),
        createdAt: b.createdAt,
      })),
    });
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
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const result = await addBookmark(session.user.id, parsed.data.questionId);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const questionId =
      url.searchParams.get("questionId") ??
      (await req.json().catch(() => ({})) as { questionId?: string })
        .questionId;
    if (!questionId) {
      return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }
    const ok = await removeBookmark(session.user.id, questionId);
    return NextResponse.json({ ok });
  } catch (e) {
    return mongoUnavailableResponse(e);
  }
}
