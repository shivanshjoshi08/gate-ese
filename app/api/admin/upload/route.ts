import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import {
  isCloudinaryConfigured,
  uploadImageBufferToCloudinary,
} from "@/lib/cloudinary-upload-server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

/**
 * Stores the file briefly on disk (when not on Vercel), uploads to Cloudinary,
 * then removes the temp file. Falls back to persisted local `/uploads/question-images/`
 * if Cloudinary is missing or fails (self‑hosted only).
 */
export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: `Unsupported type: ${mime}` },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }

  const ext = EXT[mime] ?? "";
  const name = `${randomUUID()}${ext}`;
  const stagingRel = ["public", "uploads", "question-images-staging", name];
  const publicRel = ["public", "uploads", "question-images", name];
  const absStaging = path.join(process.cwd(), ...stagingRel);
  const absPublic = path.join(process.cwd(), ...publicRel);

  const onVercel = process.env.VERCEL === "1";

  if (!onVercel) {
    await mkdir(path.dirname(absStaging), { recursive: true });
    await writeFile(absStaging, buf);
  }

  if (isCloudinaryConfigured()) {
    try {
      const secureUrl = await uploadImageBufferToCloudinary(buf, mime);
      if (!onVercel) {
        await unlink(absStaging).catch(() => {});
      }
      return NextResponse.json({
        url: secureUrl,
        storage: "cloudinary",
      });
    } catch (e) {
      if (onVercel) {
        return NextResponse.json(
          {
            error:
              e instanceof Error
                ? e.message
                : "Cloudinary upload failed on Vercel (no disk fallback).",
          },
          { status: 502 },
        );
      }
    }
  }

  if (onVercel) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_* env vars for uploads on Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    await mkdir(path.dirname(absPublic), { recursive: true });
    await writeFile(absPublic, buf);
    await unlink(absStaging).catch(() => {});
    const url = `/uploads/question-images/${name}`;
    return NextResponse.json({ url, storage: "local" });
  } catch (e) {
    await unlink(absStaging).catch(() => {});
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Local save failed" },
      { status: 500 },
    );
  }
}
