import Link from "next/link";
import JsonQuestionImport from "@/components/admin/JsonQuestionImport";

export default function ImportQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/questions"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to questions
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">Import JSON</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload practice questions to MongoDB (approved = visible in app).
          </p>
        </div>
      </div>
      <JsonQuestionImport />
    </div>
  );
}
