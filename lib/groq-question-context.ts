import type { Question } from "@/lib/types";
import { extractPlainText } from "@/lib/rich-content";

/** Must stay in sync with the API route validator. */
export const GROQ_CONTEXT_CHAR_LIMIT = 14_000;

function trunc(s: string, max: number): string {
  const t = s.trim().replace(/\r\n/g, "\n");
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function stemPlainFull(q: Question): string {
  if (q.richStem) {
    return trunc(q.richStem.plainText ?? extractPlainText(q.richStem.doc), 5000);
  }
  return trunc(q.question || "", 5000);
}

function optionPlain(q: Question, i: number): string {
  if (q.richOptions?.[i]) {
    const o = q.richOptions[i];
    return trunc(o.body.plainText ?? extractPlainText(o.body.doc), 2000);
  }
  return trunc(q.options[i] ?? "", 2000);
}

function solutionPlainFull(q: Question): string {
  if (q.richSolution) {
    return trunc(q.richSolution.plainText ?? extractPlainText(q.richSolution.doc), 6500);
  }
  return trunc(q.solution || "", 6500);
}

function formatCorrect(q: Question): string {
  if (q.hasAnswerKey === false) {
    return "Not provided — infer only from stem and explanation above.";
  }
  if (q.type === "mcq") {
    const i = q.correct as number;
    const L = String.fromCharCode(65 + i);
    return `${L} — ${optionPlain(q, i)}`;
  }
  if (q.type === "nat") {
    return `Numerical answer: ${String(q.correct)}`;
  }
  if (q.type === "msq") {
    const nums = [...((q.correct as number[]) ?? [])].sort((a, b) => a - b);
    return nums.map((idx) => String.fromCharCode(65 + idx)).join(", ");
  }
  return "—";
}

/**
 * Plain-text bundle for Groq (TipTap-safe). Truncated to {@link GROQ_CONTEXT_CHAR_LIMIT}.
 */
export function buildGroqQuestionContextString(q: Question): string {
  const lines: string[] = [];
  lines.push(`Exam: ${q.exam}`);
  if (q.paper) lines.push(`Paper: ${q.paper}`);
  lines.push(
    `Subject: ${q.subject}`,
    `Topic: ${q.topic}`,
    `Year: ${q.year}`,
    `Question type: ${q.type}`,
    `Marks: ${q.marks}`,
    `Difficulty: ${q.difficulty}`,
  );
  lines.push("", "Stem:");
  lines.push(stemPlainFull(q));

  if (q.type === "mcq" || q.type === "msq") {
    const n = Math.max(q.richOptions?.length ?? 0, q.options.length);
    if (n > 0) {
      lines.push("", "Options:");
      for (let i = 0; i < n; i++) {
        lines.push(`${String.fromCharCode(65 + i)}) ${optionPlain(q, i)}`);
      }
    }
  }

  const sol = solutionPlainFull(q);
  if (sol) {
    lines.push("", "Solution / explanation:");
    lines.push(sol);
  }

  lines.push("", "Marked correct answer (reference):");
  lines.push(formatCorrect(q));

  return lines.join("\n").slice(0, GROQ_CONTEXT_CHAR_LIMIT);
}
