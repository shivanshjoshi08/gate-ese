import type { JSONContent } from "@tiptap/core";
import path from "node:path";
import { readFile, unlink } from "node:fs/promises";
import type { RichContent } from "@/lib/question-types";
import { createRichContent } from "@/lib/rich-content";
import {
  isCloudinaryConfigured,
  uploadImageBufferToCloudinary,
} from "@/lib/cloudinary-upload-server";
import type { QuestionDocumentInput } from "@/lib/question-validation";

const UPLOAD_PREFIXES = [
  "/uploads/question-images/",
  "/uploads/question-images-staging/",
];

function mimeFromExt(filePath: string): string {
  const e = path.extname(filePath).toLowerCase();
  switch (e) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/jpeg";
  }
}

function isLocalUploadUrl(src: string): boolean {
  return UPLOAD_PREFIXES.some((p) => src.startsWith(p));
}

/**
 * Rewrite image nodes whose src is under /uploads/... to Cloudinary URLs,
 * reading from `public/` and deleting the local file after success.
 */
async function migrateTipTapDocImages(root: JSONContent): Promise<void> {
  async function walk(n: JSONContent): Promise<void> {
    const src = n.attrs?.src;
    if (
      n.type === "image" &&
      typeof src === "string" &&
      isLocalUploadUrl(src)
    ) {
      const rel = src.replace(/^\//, "");
      const abs = path.join(process.cwd(), "public", ...rel.split("/"));
      try {
        const buf = await readFile(abs);
        const mime = mimeFromExt(abs);
        const cloud = await uploadImageBufferToCloudinary(buf, mime);
        (n.attrs as { src: string }).src = cloud;
        await unlink(abs).catch(() => {});
      } catch {
        /* keep existing src if migration fails */
      }
    }
    if (n.content?.length) {
      for (const c of n.content) {
        await walk(c);
      }
    }
  }
  await walk(root);
}

export async function migrateRichContentLocalImages(
  rc: RichContent,
): Promise<RichContent> {
  if (!isCloudinaryConfigured()) return rc;
  const rawDoc = (rc as { doc?: unknown }).doc;
  const doc = JSON.parse(JSON.stringify(rawDoc ?? {})) as JSONContent;
  await migrateTipTapDocImages(doc);
  return createRichContent(doc);
}

export async function migrateQuestionDocumentLocalImages(
  doc: QuestionDocumentInput,
): Promise<QuestionDocumentInput> {
  if (!isCloudinaryConfigured()) return doc;
  const stem = await migrateRichContentLocalImages(doc.stem as RichContent);
  const options = await Promise.all(
    doc.options.map(async (o) => ({
      ...o,
      body: await migrateRichContentLocalImages(o.body as RichContent),
    })),
  );
  const solution = await migrateRichContentLocalImages(doc.solution as RichContent);
  return { ...doc, stem, options, solution };
}
