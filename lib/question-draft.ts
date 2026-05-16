import type { QuestionDocument } from "@/lib/question-types";
import { createRichContent, EMPTY_DOC } from "@/lib/rich-content";

export function createEmptyQuestionDocument(
  partial?: Partial<QuestionDocument>
): QuestionDocument {
  const now = new Date().toISOString();
  const id = partial?.id ?? `new_${Date.now()}`;
  return {
    id,
    sourceType: "practice",
    status: "draft",
    type: "mcq",
    stem: createRichContent(EMPTY_DOC),
    options: [
      { id: "opt_a", label: "A", body: createRichContent(EMPTY_DOC) },
      { id: "opt_b", label: "B", body: createRichContent(EMPTY_DOC) },
      { id: "opt_c", label: "C", body: createRichContent(EMPTY_DOC) },
      { id: "opt_d", label: "D", body: createRichContent(EMPTY_DOC) },
    ],
    solution: createRichContent(EMPTY_DOC),
    correctAnswer: "A",
    subject: "Building Materials",
    topic: "Untitled",
    tags: [],
    difficulty: "Medium",
    marks: 1,
    exam: "ESE",
    paper: "PRE",
    year: new Date().getFullYear(),
    hasAnswerKey: true,
    media: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
