/** Allowed tags when rendering legacy HTML or pasted HTML fragments. */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "sub",
  "sup",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
  "a",
  "span",
];

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "class",
  "colspan",
  "rowspan",
  "target",
  "rel",
];

const STRIP_SCRIPT = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const STRIP_EVENTS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

function sanitizeHtmlServer(dirty: string): string {
  return dirty
    .replace(STRIP_SCRIPT, "")
    .replace(STRIP_EVENTS, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
}

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    return sanitizeHtmlServer(dirty);
  }

  const DOMPurify = require("dompurify") as typeof import("dompurify").default;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
  });
}

/** Hostnames we allow when rendering CMS / practice images (SSR + browser). */
export function isSafeImageUrl(url: string): boolean {
  const raw = typeof url === "string" ? url.trim() : "";
  if (!raw) return false;
  if (raw.startsWith("//")) return false;
  /** Same-origin relative paths (disk uploads `/uploads/…`, `/images/…`) */
  if (raw.startsWith("/")) return true;

  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;

    const h = u.hostname.toLowerCase();

    if (process.env.NODE_ENV !== "production" && (h === "localhost" || h === "127.0.0.1")) {
      return true;
    }

    /** Cloudinary image delivery URLs */
    if (h === "res.cloudinary.com" || h.endsWith(".cloudinary.com")) {
      return true;
    }

    const extra = (
      process.env.NEXT_PUBLIC_IMAGE_HOSTS ??
      process.env.NEXT_PUBLIC_CDN_HOSTS ??
      ""
    )
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);

    return extra.some((allowed) => h === allowed || h.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}
