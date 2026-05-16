"use client";

import type { QuestionDocument } from "@/lib/question-types";
import QuestionRenderer from "@/components/question/QuestionRenderer";
import OptionRenderer from "@/components/question/OptionRenderer";
import SolutionRenderer from "@/components/question/SolutionRenderer";
import "@/components/question/question-renderer.css";

interface QuestionPreviewProps {
  question: QuestionDocument;
}

export default function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6 text-zinc-100 shadow-sm shadow-black/30">
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span className="rounded bg-blue-500/25 px-2 py-0.5 text-blue-300">
          {question.exam}
        </span>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{question.subject}</span>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{question.type}</span>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">{question.difficulty}</span>
      </div>

      <QuestionRenderer question={question} />

      {(question.type === "mcq" || question.type === "msq") && (
        <div className="mt-6 space-y-2">
          {question.options.map((opt, i) => (
            <OptionRenderer key={opt.id} option={opt} index={i} disabled />
          ))}
        </div>
      )}

      <div className="mt-6">
        <SolutionRenderer solution={question.solution} />
      </div>
    </div>
  );
}
