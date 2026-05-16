import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import { LearnerProgress } from "@/models/LearnerProgress";
import type { ProgressData } from "@/lib/types";

export const runtime = "nodejs";

const UUID_RX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_BODY_BYTES = 900_000;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/** GET `/api/learner/progress?publicId=` — snapshot per exam slots (if saved). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const publicId = url.searchParams.get("publicId")?.trim() ?? "";
    if (!UUID_RX.test(publicId)) {
      return bad("Missing or invalid publicId", 400);
    }
    await connectMongo();
    type LeanDoc = {
      slots?: unknown;
      updatedAt?: Date | string;
    } | null;
    const doc = (await LearnerProgress.findOne({ publicId })
      .lean()
      .exec()) as LeanDoc;
    const slots =
      doc?.slots &&
      typeof doc.slots === "object" &&
      doc.slots !== null &&
      !Array.isArray(doc.slots)
        ? (doc.slots as Record<string, ProgressData>)
        : {};

    return NextResponse.json({
      publicId,
      slots: {
        ...(slots.ESE ? { ESE: slots.ESE } : {}),
        ...(slots.GATE ? { GATE: slots.GATE } : {}),
      },
      updatedAt: doc?.updatedAt ?? null,
    });
  } catch (e) {
    console.error("[learner/progress GET]", e);
    return bad("Server unavailable", 503);
  }
}

type PostBody = {
  publicId?: unknown;
  exam?: unknown;
  progress?: unknown;
};

/** PUT progress for one exam slot (overwrite that slot only). */
export async function POST(req: Request) {
  try {
    const rawLen = Number(req.headers.get("content-length") ?? 0);
    if (rawLen > MAX_BODY_BYTES) return bad("Payload too large", 413);

    const body = (await req.json()) as PostBody;
    const publicId =
      typeof body.publicId === "string" ? body.publicId.trim() : "";
    const exam = typeof body.exam === "string" ? body.exam.trim() : "";

    if (!UUID_RX.test(publicId)) return bad("Invalid publicId");
    if (exam !== "ESE" && exam !== "GATE") return bad("exam must be ESE or GATE");
    const progress = body.progress as ProgressData | null;
    if (!progress || typeof progress !== "object") {
      return bad("progress must be an object");
    }

    await connectMongo();

    type LeanExisting = { slots?: unknown } | null;
    const existing = (await LearnerProgress.findOne({ publicId })
      .lean()
      .exec()) as LeanExisting;

    let slots: Record<string, unknown> = {};
    if (
      existing?.slots &&
      typeof existing.slots === "object" &&
      !Array.isArray(existing.slots)
    ) {
      slots = { ...(existing.slots as Record<string, unknown>) };
    }
    slots[exam] = progress;

    await LearnerProgress.findOneAndUpdate(
      { publicId },
      { $set: { slots } },
      { upsert: true, new: true },
    ).exec();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[learner/progress POST]", e);
    return bad("Server unavailable", 503);
  }
}
