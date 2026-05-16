import Link from "next/link";
import JsonQuestionImport from "@/components/admin/JsonQuestionImport";

export default function ImportQuestionsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/questions"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Questions
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Import JSON</h1>
      </div>
      <JsonQuestionImport />
    </div>
  );
}
