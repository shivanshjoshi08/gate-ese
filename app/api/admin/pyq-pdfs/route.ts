import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import {
  buildPyqPdfFilename,
  defaultPyqPdfTitle,
  pyqPdfStorageDir,
  readPyqPdfManifest,
  removePyqPdfEntry,
  sanitizePdfFilename,
  upsertPyqPdfEntry,
} from "@/lib/pyq-pdf-manifest";
import type { PyqPdfEntry, PyqPdfTrack } from "@/lib/pyq-pdfs";

const MAX_BYTES = 25 * 1024 * 1024;

function parseTrack(raw: FormDataEntryValue | null): PyqPdfTrack | null {
  const v = String(raw ?? "").toUpperCase();
  if (v === "GATE") return "GATE";
  if (v === "PRE") return "PRE";
  return null;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await readPyqPdfManifest();
  return NextResponse.json({ entries });
}

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
    return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  if (mime !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  const track = parseTrack(form.get("track"));
  const year = Number(form.get("year"));
  if (!track) {
    return NextResponse.json({ error: "Track must be GATE or PRE" }, { status: 400 });
  }
  if (!Number.isInteger(year) || year < 1990 || year > 2100) {
    return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 25MB)" },
      { status: 400 },
    );
  }

  const customName = String(form.get("filename") ?? "").trim();
  const filename = customName
    ? sanitizePdfFilename(customName)
    : buildPyqPdfFilename(track, year);

  const title =
    String(form.get("title") ?? "").trim() || defaultPyqPdfTitle(track, year);

  const dir = pyqPdfStorageDir();
  await mkdir(dir, { recursive: true });
  const absPath = path.join(dir, filename);
  await writeFile(absPath, buf);

  const entry: PyqPdfEntry = { year, filename, title, track };
  const entries = await upsertPyqPdfEntry(entry);

  return NextResponse.json({ entry, entries }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filename = req.nextUrl.searchParams.get("filename")?.trim();
  if (!filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }

  const safe = sanitizePdfFilename(filename);
  const absPath = path.join(pyqPdfStorageDir(), safe);
  await unlink(absPath).catch(() => {});
  const entries = await removePyqPdfEntry(safe);

  return NextResponse.json({ entries });
}
