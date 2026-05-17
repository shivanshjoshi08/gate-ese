import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPyqPdfAllowlist } from "@/lib/pyq-pdf-manifest";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  const segment = decodeURIComponent(params.file ?? "").trim();

  if (!segment || segment.includes("/") || segment.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const allowlist = await getPyqPdfAllowlist();
  if (!allowlist.has(segment)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "pdfs", segment);

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${segment}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("File not available", { status: 404 });
  }
}
