"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch, saveQuestion } from "@/lib/admin-api";
import type { QuestionDocument } from "@/lib/question-types";

const QuestionForm = dynamic(() => import("@/components/editor/QuestionForm"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading editor…</p>,
});

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<QuestionDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`/api/admin/questions/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setDoc(d as QuestionDocument);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="text-zinc-500">Loading…</p>;
  if (!doc) return <p className="text-red-600">Question not found</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit question</h1>
      <QuestionForm
        key={doc.id}
        initial={doc}
        onSave={saveQuestion}
        onAfterPublish={() => {}}
      />
    </div>
  );
}
