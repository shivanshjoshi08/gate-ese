"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/lib/admin-api";

export default function AdminQuestionRowActions({
  questionId,
}: {
  questionId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this question permanently?")) return;
    setBusy(true);
    try {
      const res = await adminFetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDelete}
      className="shrink-0 rounded-lg border border-red-900/60 px-2 py-1 text-xs text-red-400 hover:bg-red-950/40 disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
