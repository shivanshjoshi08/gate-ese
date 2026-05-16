"use client";

import Image from "next/image";
import { useState } from "react";

interface QuestionImageProps {
  src: string;
  alt: string;
  questionNumber?: number;
}

export default function QuestionImage({
  src,
  alt,
  questionNumber,
}: QuestionImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-study-border bg-study-surface/50 p-6 text-center text-sm text-study-muted">
        <p>Figure for Q{questionNumber ?? ""} not found</p>
        <p className="mt-1">
          Add image at <code className="text-xs">public{src}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="relative mb-6 w-full overflow-hidden rounded-xl border border-study-border bg-study-raised/50 shadow-lg shadow-black/10">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className="h-auto w-full object-contain"
        onError={() => setError(true)}
        unoptimized
      />
      {questionNumber != null && (
        <span className="absolute left-2 top-2 rounded-lg bg-study-page/85 px-2 py-0.5 text-xs text-study-soft shadow-sm backdrop-blur-sm">
          Fig. {questionNumber}
        </span>
      )}
    </div>
  );
}
