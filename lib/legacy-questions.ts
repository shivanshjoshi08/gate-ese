import questionsData from "@/data/questions.json";
import type { Question } from "@/lib/types";

/**
 * Practice bank: questions are **pre-stored** in `data/questions.json` (not generated at runtime)
 * for instant UI, offline use, and predictable quality. Extend via JSON or admin import — not per-request LLM.
 */
const raw = questionsData as Question[];

/** Bundled Practice questions (ship with the app; synchronous import). */
export const legacyQuestions: Question[] = raw.map((q) => ({
  ...q,
  exam: q.exam ?? "GATE",
  paper: q.paper ?? null,
}));
