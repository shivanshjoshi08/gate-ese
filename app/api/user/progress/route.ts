import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectMongo } from "@/lib/mongoose";
import { UserProgress } from "@/models/UserProgress";
import type { ExamType, ProgressData } from "@/lib/types";
import { touchUserProgressActivity } from "@/backend/services/admin-users.service";

export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || userId === "admin") return forbidden();

    const url = new URL(req.url);
    const exam = url.searchParams.get("exam")?.trim();
    if (exam !== "ESE" && exam !== "GATE") {
      return NextResponse.json({ error: "exam must be ESE or GATE" }, { status: 400 });
    }

    await connectMongo();
    type LeanDoc = { snapshot?: unknown; updatedAt?: Date } | null;
    const doc = (await UserProgress.findOne({ userId, exam })
      .lean()
      .exec()) as LeanDoc;

    return NextResponse.json({
      progress: (doc?.snapshot as ProgressData | undefined) ?? null,
      updatedAt: doc?.updatedAt ?? null,
    });
  } catch (e) {
    console.error("[user/progress GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 503 });
  }
}

/** DELETE — wipe all cloud progress for the signed-in learner. */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || userId === "admin") return forbidden();

    await connectMongo();
    await UserProgress.deleteMany({ userId }).exec();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[user/progress DELETE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || userId === "admin") return forbidden();

    const body = (await req.json()) as { exam?: unknown; progress?: unknown };
    const examRaw = typeof body.exam === "string" ? body.exam.trim() : "";
    const exam = examRaw as ExamType;
    if (exam !== "ESE" && exam !== "GATE") {
      return NextResponse.json({ error: "exam must be ESE or GATE" }, { status: 400 });
    }
    const progress = body.progress as ProgressData | null;
    if (!progress || typeof progress !== "object") {
      return NextResponse.json({ error: "progress required" }, { status: 400 });
    }

    await connectMongo();
    await UserProgress.findOneAndUpdate(
      { userId, exam },
      { $set: { snapshot: progress } },
      { upsert: true, new: true },
    ).exec();

    await touchUserProgressActivity(userId, progress);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[user/progress POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 503 });
  }
}
