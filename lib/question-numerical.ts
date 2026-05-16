import type { Question } from "@/lib/types";

/** Learner filter: show only numerical-category questions. */
export function isNumericalQuestion(q: Pick<Question, "numerical">): boolean {
  return q.numerical === true;
}

/** Default practice pool (non-numerical category). */
export function isTheoryQuestion(q: Pick<Question, "numerical">): boolean {
  return q.numerical !== true;
}

/** Resolve `numerical` from bundled JSON / import payload. */
export function resolveNumericalFlag(raw: {
  numerical?: unknown;
  type?: unknown;
}): boolean {
  if (raw.numerical === true || raw.numerical === "true") return true;
  if (raw.numerical === false || raw.numerical === "false") return false;
  const t = String(raw.type ?? "").toLowerCase();
  return t === "nat" || t === "numerical";
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
}): "mcq" | "numerical" {
  const legacy = resolveLegacyAnswerType(raw);
  if (legacy === "nat") return "numerical";
  if (legacy === "mcq") {
    const opts = Array.isArray(raw.options) ? raw.options : [];
    return opts.length === 0 && resolveNumericalFlag(raw) ? "numerical" : "mcq";
  }
  return "mcq";
}
