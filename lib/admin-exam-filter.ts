import type { ExamType } from "@/lib/types";

/** Admin UI / URL filter values for practice questions. */
export type AdminExamFilter = "" | "GATE" | "PRE";

export function adminExamFilterToDb(
  filter: string | undefined,
): ExamType | undefined {
  if (filter === "GATE") return "GATE";
  if (filter === "PRE") return "ESE";
  return undefined;
}

export function dbExamToAdminFilter(exam: string | undefined): AdminExamFilter {
  if (exam === "GATE") return "GATE";
  if (exam === "ESE") return "PRE";
  return "";
}

export function adminFilterLabel(filter: AdminExamFilter): string {
  if (filter === "GATE") return "GATE";
  if (filter === "PRE") return "PRE";
  return "All";
}
