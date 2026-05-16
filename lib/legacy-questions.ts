import questionsData from "@/data/questions.json";
import type { Question } from "@/lib/types";
import { normalizeBundledQuestion } from "@/lib/question-schema";

/**
 * Practice bank: questions are **pre-stored** in `data/questions.json` (not generated at runtime)
 * for instant UI, offline use, and predictable quality. Extend via JSON or admin import — not per-request LLM.
 */
const raw = questionsData as unknown[];

/** Bundled Practice questions (ship with the app; synchronous import). */
export const legacyQuestions: Question[] = raw.map((row, idx) => {
  try {
    return normalizeBundledQuestion(row);
  } catch (err) {
    const id = (row as { id?: string })?.id ?? `index ${idx}`;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`questions.json invalid at ${id}: ${msg}`);
  }
});
