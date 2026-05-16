"use client";

import katex from "katex";
import { useMemo } from "react";

interface EquationBlockProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export default function EquationBlock({
  latex,
  displayMode = false,
  className = "",
}: EquationBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: "ignore",
        trust: false,
      });
    } catch {
      return `<span class="text-red-500">Invalid LaTeX</span>`;
    }
  }, [latex, displayMode]);

  return (
    <div
      className={`qb-equation ${displayMode ? "" : "qb-equation--inline"} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={displayMode ? "Block equation" : "Inline equation"}
    />
  );
}
