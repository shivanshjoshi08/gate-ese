"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createEmptyQuestionDocument } from "@/lib/question-draft";
import { saveQuestion } from "@/lib/admin-api";
import type { QuestionDocument } from "@/lib/question-types";

const QuestionForm = dynamic(() => import("@/components/editor/QuestionForm"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading editor…</p>,
});

export default function NewQuestionPage() {
  const router = useRouter();
  const initial = createEmptyQuestionDocument({
    id: `new_${Date.now()}`,
  });

  const onSave = async (doc: QuestionDocument) => {
    const saved = await saveQuestion(doc);
    if (doc.id.startsWith("new_") && saved.id !== doc.id) {
      router.replace(`/admin/questions/${saved.id}`);
    }
    return saved;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New question</h1>
      <QuestionForm
        initial={initial}
        onSave={onSave}
        onAfterPublish={() =>
          router.push("/admin/questions?status=approved")
        }
      />
    </div>
  );
}
