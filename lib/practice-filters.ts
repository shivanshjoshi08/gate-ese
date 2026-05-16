import type { Filters } from "@/lib/types";

/** Practice filter: non-numerical pool (default). */
export const FILTER_TYPE_MCQ = "MCQ";
/** Practice filter: `question.numerical === true` only. */
export const FILTER_TYPE_NUMERICALS = "NUMERICALS";

export function isNumericalsFilter(filters: Pick<Filters, "type">): boolean {
  return (
    filters.type === FILTER_TYPE_NUMERICALS || filters.type === "NAT"
  );
}
