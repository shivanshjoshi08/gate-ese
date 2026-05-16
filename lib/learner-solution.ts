import type { Question } from "@/lib/types";
import { isRichContentEmpty } from "@/lib/rich-content";

/** Legacy / filler solution strings — do not show an empty "Solution" panel for these. */
const PLACEHOLDER_PLAIN = /^standard pyq concept\.?$/i;

/**
 * After the user answers: show the Solution / selection panel only when there is
 * real written content (rich or plain). Hides useless placeholders and empty fields.
 */
export function shouldShowAnsweredSolutionPanel(q: Question): boolean {
  const hasKey = q.hasAnswerKey !== false;
  if (!hasKey) return true;

  if (q.richSolution && !isRichContentEmpty(q.richSolution)) return true;

  const s = (q.solution || "").trim();
  if (!s) return false;
  if (PLACEHOLDER_PLAIN.test(s)) return false;
  return true;
}
