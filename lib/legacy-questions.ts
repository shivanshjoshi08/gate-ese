import questionsData from "@/data/questions.json";
import type { Question } from "@/lib/types";
import {
  resolveLegacyAnswerType,
  resolveNumericalFlag,
} from "@/lib/question-numerical";
import { deriveAppearancesFromLegacy } from "@/lib/question-sources";

/**
 * Practice bank: questions are **pre-stored** in `data/questions.json` (not generated at runtime)
 * for instant UI, offline use, and predictable quality. Extend via JSON or admin import — not per-request LLM.
 */
const raw = questionsData as Question[];

/** Bundled Practice questions (ship with the app; synchronous import). */
export const legacyQuestions: Question[] = raw.map((q) => {
  const exam = q.exam ?? "GATE";
  const paper = q.paper ?? null;
  return {
    ...q,
    type: resolveLegacyAnswerType(q),
    numerical: resolveNumericalFlag(q),
    exam,
    paper,
    appearances: deriveAppearancesFromLegacy({ ...q, exam, paper }),
    references: Array.isArray(q.references) ? q.references : [],
    questionStyle: q.questionStyle,
  };
});
