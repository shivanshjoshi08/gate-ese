import type { Question } from "@/lib/types";
import type { SolutionStep } from "@/lib/question-schema";
import { mergeQuestionSources } from "@/lib/question-sources";

const LABELS = ["A", "B", "C", "D"];

export function hasStructuredInsights(q: Question): boolean {
  return Boolean(
    q.conceptUsed?.trim() ||
      (q.formulaUsed && q.formulaUsed.length > 0) ||
      q.keyTakeaway?.trim() ||
      (q.solutionSteps && q.solutionSteps.length > 0) ||
      (q.whyWrongOptions && Object.keys(q.whyWrongOptions).length > 0) ||
      q.trendNote?.trim() ||
      q.isHighRepeat ||
      (q.repeatCount != null && q.repeatCount > 1) ||
      (q.selfEvalChecklist && q.selfEvalChecklist.length > 0) ||
      q.mainsRelevant,
  );
}

/** Prefer bundled analysis over auto AI when enough structured content exists. */
export function shouldFetchAiRecap(q: Question): boolean {
  const rich =
    Boolean(q.keyTakeaway?.trim()) &&
    Boolean(q.conceptUsed?.trim()) &&
    (q.solutionSteps?.length ?? 0) >= 1;
  return !rich;
}

export function getWhyWrongForOption(
  q: Question,
  optionIndex: number,
): string | null {
  const map = q.whyWrongOptions;
  if (!map) return null;
  const byIndex = map[String(optionIndex)] ?? map[LABELS[optionIndex] ?? ""];
  return byIndex?.trim() || null;
}

export function listWhyWrongEntries(
  q: Question,
  correctIndex: number,
): { label: string; text: string }[] {
  const map = q.whyWrongOptions;
  if (!map) return [];
  return Object.entries(map)
    .map(([key, text]) => {
      const idx = /^\d+$/.test(key)
        ? parseInt(key, 10)
        : LABELS.indexOf(key.toUpperCase());
      if (idx < 0 || idx === correctIndex || !text?.trim()) return null;
      return { label: LABELS[idx] ?? key, text: text.trim() };
    })
    .filter(Boolean) as { label: string; text: string }[];
}

export function formatCorrectAnswer(q: Question): string | null {
  if (q.hasAnswerKey === false) return null;
  if (q.type === "mcq" && typeof q.correct === "number") {
    const letter = LABELS[q.correct];
    const opt = q.options[q.correct];
    return opt ? `${letter}. ${opt}` : letter;
  }
  if (q.type === "nat") return String(q.correct);
  return null;
}

export function primaryAppearanceLabel(q: Question): string | null {
  const { appearances } = mergeQuestionSources(q);
  if (appearances.length === 0) return null;
  const a = appearances[0]!;
  const paper = a.paper ? ` ${a.paper}` : "";
  const qno = a.qno != null ? ` · Q${a.qno}` : "";
  return `${a.exam} ${a.year}${paper}${qno}`;
}

export function normalizeSolutionSteps(
  steps: SolutionStep[] | undefined,
): SolutionStep[] {
  if (!steps?.length) return [];
  return [...steps].sort((a, b) => a.step - b.step);
}
