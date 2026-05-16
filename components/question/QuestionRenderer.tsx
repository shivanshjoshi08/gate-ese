"use client";

import type { QuestionDocument, QuestionMedia } from "@/lib/question-types";
import RichContentRenderer from "./RichContentRenderer";
import ImageBlock from "./ImageBlock";
import "./question-renderer.css";

interface QuestionRendererProps {
  question: Pick<QuestionDocument, "stem" | "type"> & {
    media?: QuestionMedia[];
  };
  className?: string;
  /** Show attached media below stem (when not embedded in doc) */
  showMedia?: boolean;
}

export default function QuestionRenderer({
  question,
  className = "",
  showMedia = true,
}: QuestionRendererProps) {
  const media = question.media ?? [];
  return (
    <article className={`question-renderer ${className}`}>
      <RichContentRenderer content={question.stem} />
      {showMedia &&
        media.map((m) => (
          <ImageBlock
            key={m.id}
            src={m.url}
            alt={m.alt}
            caption={m.caption}
          />
        ))}
    </article>
  );
}
