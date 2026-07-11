export type ExamType = "GATE" | "ESE";

export type EsePaper = "PRE" | "P1" | "P2" | null;

export const EXAM_STORAGE_KEY = "selected_exam";

export const EXAM_COLORS = {
  GATE: {
    accent: "#2563eb",
    light: "bg-blue-500/20",
    text: "text-blue-300",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  ESE: {
    accent: "#9575ea",
    light: "bg-violet-400/15",
    text: "text-violet-200",
    btn: "bg-violet-500 hover:bg-violet-600",
  },
} as const;

/** Fetch the currently selected exam from localStorage. Fallback to ESE. */
export function getSelectedExam(): ExamType {
  if (typeof window === "undefined") return "ESE";
  const stored = localStorage.getItem(EXAM_STORAGE_KEY);
  if (stored === "GATE" || stored === "ESE") return stored;
  return "ESE";
}

export function setSelectedExam(exam: ExamType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXAM_STORAGE_KEY, exam);
  window.dispatchEvent(new CustomEvent("exam-changed", { detail: exam }));
}
