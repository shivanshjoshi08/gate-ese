export type ExamType = "GATE" | "ESE";

export type EsePaper = "PRE" | "P1" | "P2" | null;

export const EXAM_STORAGE_KEY = "selected_exam";

export const EXAM_COLORS = {
  GATE: { accent: "#2563eb", light: "bg-blue-50", text: "text-blue-700", btn: "bg-blue-600 hover:bg-blue-700" },
  ESE: { accent: "#7c3aed", light: "bg-violet-50", text: "text-violet-700", btn: "bg-violet-600 hover:bg-violet-700" },
} as const;

export function getSelectedExam(): ExamType {
  if (typeof window === "undefined") return "GATE";
  const v = localStorage.getItem(EXAM_STORAGE_KEY);
  return v === "ESE" ? "ESE" : "GATE";
}

export function setSelectedExam(exam: ExamType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXAM_STORAGE_KEY, exam);
  window.dispatchEvent(new CustomEvent("exam-changed", { detail: exam }));
}
