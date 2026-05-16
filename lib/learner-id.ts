import { LEARNER_PUBLIC_ID_KEY } from "@/lib/constants";

const UUID_RX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Stable per-browser learner id used for `/api/learner/progress` when MongoDB is available.
 */
export function getOrCreateLearnerPublicId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(LEARNER_PUBLIC_ID_KEY)?.trim();
  if (!id || !UUID_RX.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(LEARNER_PUBLIC_ID_KEY, id);
  }
  return id;
}
