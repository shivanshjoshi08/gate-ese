import { AI_SUMMARY_VERSION } from "@/lib/ai-summary-constants";

const PREFIX = `gate-ai-summary:${AI_SUMMARY_VERSION}:`;

export function getClientAiSummary(questionId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PREFIX + questionId);
  } catch {
    return null;
  }
}

export function setClientAiSummary(questionId: string, summary: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + questionId, summary);
  } catch {
    /* quota */
  }
}
