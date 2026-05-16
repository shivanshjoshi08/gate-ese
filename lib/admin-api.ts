import type { QuestionDocument } from "@/lib/question-types";

async function readAdminError(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const j = JSON.parse(raw) as {
      error?: string;
      detail?: string;
      fix?: string[];
    };
    const parts = [j.error, j.detail].filter(Boolean);
    if (j.fix?.length) {
      parts.push("", ...j.fix.map((f) => `• ${f}`));
    }
    if (parts.length) return parts.join("\n");
  } catch {
    /* plain text body */
  }
  return raw.trim() || `Request failed (${res.status})`;
}

export async function adminFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "include",
  });
}

export async function saveQuestion(
  doc: QuestionDocument
): Promise<QuestionDocument> {
  const isNew = doc.id.startsWith("new_");
  if (isNew) {
    const res = await adminFetch("/api/admin/questions", {
      method: "POST",
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error(await readAdminError(res));
    return res.json() as Promise<QuestionDocument>;
  }
  const res = await adminFetch(`/api/admin/questions/${doc.id}`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error(await readAdminError(res));
  return res.json() as Promise<QuestionDocument>;
}
