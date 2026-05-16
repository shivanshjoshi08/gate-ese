import type { Question } from "@/lib/types";

/** Learner filter: show only numerical-category questions. */
export function isNumericalQuestion(q: Pick<Question, "numerical">): boolean {
  return q.numerical === true;
}

/** Default practice pool (non-numerical category). */
export function isTheoryQuestion(q: Pick<Question, "numerical">): boolean {
  return q.numerical !== true;
}

/**
 * Resolve `numerical` from bundled JSON / import payload.
 * Category flag only — not tied to `type: nat` (range NAT inputs are separate).
 */
export function resolveNumericalFlag(raw: {
  numerical?: unknown;
}): boolean {
  if (raw.numerical === true || raw.numerical === "true") return true;
  return false;
}

/** Answer UI type in practice JSON (`mcq` | `nat` | `msq`). */
export function resolveLegacyAnswerType(raw: {
  type?: unknown;
}): "mcq" | "nat" | "msq" {
  const t = String(raw.type ?? "mcq").toLowerCase();
  if (t === "nat" || t === "numerical") return "nat";
  if (t === "msq") return "msq";
  return "mcq";
}

/** Mongo unified schema answer format (`mcq` | `numerical`). */
export function resolveMongoAnswerType(raw: {
  type?: unknown;
  options?: unknown;
  numerical?: unknown;
}): "mcq" | "numerical" {
  const legacy = resolveLegacyAnswerType(raw);
  if (legacy === "nat") return "numerical";
  return "mcq";
}
