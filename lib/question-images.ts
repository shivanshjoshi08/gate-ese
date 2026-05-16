import type { JSONContent } from "@tiptap/core";

/** Normalize bundled JSON / Mongo image refs to a browser-loadable path or URL. */
export function normalizeQuestionImageUrl(
  raw: string | null | undefined,
): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;

  if (t.startsWith("https://") || t.startsWith("http://")) return t;
  if (t.startsWith("/uploads/") || t.startsWith("/images/")) return t;

  if (/^fig\d+$/i.test(t)) {
    return `/images/${t.toLowerCase()}.png`;
  }
  if (/^fig\d+\.(png|jpe?g|webp)$/i.test(t)) {
    return `/images/${t.toLowerCase()}`;
  }

  if (t.startsWith("/")) return t;

  if (!t.includes("/") && !t.includes("://")) {
    if (/\.(png|jpe?g|webp|gif)$/i.test(t)) {
      return `/images/${t}`;
    }
    return `/images/${t}.png`;
  }

  return t;
}

export function normalizeImageList(
  urls: (string | null | undefined)[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const n = normalizeQuestionImageUrl(u);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

/** Collect `src` from TipTap image nodes (legacy stem / options / solution). */
export function extractImageUrlsFromRichDoc(doc: unknown): string[] {
  if (!doc || typeof doc !== "object") return [];
  const urls: string[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === "image") {
      const src = (node.attrs as { src?: string } | undefined)?.src;
      if (typeof src === "string" && src.trim()) {
        urls.push(src.trim());
      }
    }
    node.content?.forEach(walk);
  };
  walk(doc as JSONContent);
  return urls;
}
