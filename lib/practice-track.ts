import type { Question } from "@/lib/types";
import { EXAM_COLORS } from "@/lib/exam";

/** Learner-facing exam track on practice questions. */
export type PracticeTrack = "GATE" | "PRE";

export type PracticeExamFilter = "All" | PracticeTrack;

/** GATE vs ESE Prelims (PRE) — every practice row is one or the other. */
export function getPracticeTrack(
  q: Pick<Question, "exam" | "paper">,
): PracticeTrack {
  if (q.exam === "GATE") return "GATE";
  return "PRE";
}

export function matchesPracticeExamFilter(
  q: Pick<Question, "exam" | "paper">,
  filter: PracticeExamFilter,
): boolean {
  if (filter === "All") return true;
  return getPracticeTrack(q) === filter;
}

export function practiceTrackLabel(track: PracticeTrack): string {
  return track;
}

export function practiceTrackColors(track: PracticeTrack) {
  return track === "GATE" ? EXAM_COLORS.GATE : EXAM_COLORS.ESE;
}
