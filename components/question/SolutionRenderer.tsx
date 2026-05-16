"use client";

import type { RichContent } from "@/lib/question-types";
import RichContentRenderer from "./RichContentRenderer";

interface SolutionRendererProps {
  solution: RichContent;
  title?: string;
  className?: string;
}

export default function SolutionRenderer({
  solution,
  title = "Solution",
  className = "",
}: SolutionRendererProps) {
  return (
    <section className={`solution-renderer ${className}`}>
      <h3 className="mb-2 font-semibold text-zinc-200">
        {title}
      </h3>
      <RichContentRenderer content={solution} />
    </section>
  );
}
