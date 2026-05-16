"use client";

import { useState } from "react";
import { isSafeImageUrl } from "@/lib/sanitize";

interface ImageBlockProps {
  src: string;
  alt?: string;
  caption?: string;
  priority?: boolean;
}

/**
 * Use native <img> so CMS figures work with any HTTPS host (Cloudinary,
 * localhost, NEXT_PUBLIC_IMAGE_HOSTS) — next/image rejects unknown remotes even
 * when unoptimized unless every host is configured.
 */
export default function ImageBlock({
  src,
  alt = "Question figure",
  caption,
  priority = false,
}: ImageBlockProps) {
  const [error, setError] = useState(false);

  if (!isSafeImageUrl(src)) {
    return (
      <div className="qb-image rounded-xl border border-dashed border-rose-400/40 bg-rose-500/[0.08] p-4 text-sm text-rose-200">
        Image blocked (disallowed URL host). Add the host to{" "}
        <code className="rounded bg-study-page/80 px-1 py-0.5 text-xs text-study-soft">
          NEXT_PUBLIC_IMAGE_HOSTS
        </code>{" "}
        or use HTTPS on{" "}
        <code className="rounded bg-study-page/80 px-1 py-0.5 text-xs text-study-soft">/uploads/…</code>{" "}
        or Cloudinary.
      </div>
    );
  }

  if (error) {
    return (
      <figure className="qb-image">
        <div className="rounded-xl border border-dashed border-study-border bg-study-surface/60 p-6 text-center text-sm text-study-muted">
          Image failed to load: {src}
        </div>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure className="qb-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary CMS URLs */}
      <img
        src={src}
        alt={alt}
        className="mx-auto h-auto max-w-full object-contain"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
