import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { listQuestions } from "@/backend/services/question.service";
import AdminQuestionFilters from "@/components/admin/AdminQuestionFilters";
import AdminQuestionRowActions from "@/components/admin/AdminQuestionRowActions";
import AdminDbStats from "@/components/admin/AdminDbStats";
import { adminExamFilterToDb, dbExamToAdminFilter } from "@/lib/admin-exam-filter";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    sourceType?: string;
    subject?: string;
    topic?: string;
    year?: string;
    difficulty?: string;
    exam?: string;
    page?: string;
    search?: string;
  };
}) {
  const rawStatus = searchParams.status ?? "draft";
  const status =
    rawStatus === "published" || rawStatus === "approved"
      ? "approved"
      : "draft";
  const page = Math.max(1, Number(searchParams.page) || 1);

  let result = {
    items: [] as Awaited<ReturnType<typeof listQuestions>>["items"],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  try {
    result = await listQuestions({
      page,
      limit: 20,
      status,
      sourceType: "practice",
      subject: searchParams.subject || undefined,
      topic: searchParams.topic || undefined,
      year: searchParams.year ? Number(searchParams.year) : undefined,
      difficulty:
        searchParams.difficulty === "Easy" ||
        searchParams.difficulty === "Medium" ||
        searchParams.difficulty === "Hard"
          ? searchParams.difficulty
          : undefined,
      exam: adminExamFilterToDb(searchParams.exam) ?? undefined,
      search: searchParams.search,
    });
  } catch {
    result = { ...result, items: [] };
  }

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) qs.set(k, v);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Practice questions</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/questions/import"
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            JSON import
          </Link>
          <Link
            href="/admin/questions/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            New question
          </Link>
        </div>
      </div>

      <AdminDbStats compact />

      <Suspense fallback={<p className="text-zinc-500">Loading filters...</p>}>
        <AdminQuestionFilters />
      </Suspense>

      <p className="mb-4 text-sm text-zinc-500">
        {result.total} question{result.total === 1 ? "" : "s"} | page{" "}
        {result.page} of {Math.max(1, result.totalPages)}
      </p>

      {result.items.length === 0 ? (
        <p className="text-zinc-500">No questions (or MongoDB unreachable).</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-700 bg-zinc-900/60">
          {result.items.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-800/80"
            >
              <Link href={`/admin/questions/${q.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-100">
                  {q.topic || q.question.slice(0, 80) || "(no title)"}
                </p>
                <p className="text-sm text-zinc-500">
                  {q.sourceType.toUpperCase()} | {q.subject} |{" "}
                  {dbExamToAdminFilter(q.exam) || q.exam} |{" "}
                  {q.year} | {q.difficulty}
                </p>
              </Link>
              <AdminQuestionRowActions questionId={q.id} />
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 && (
        <div className="mt-6 flex gap-2">
          {page > 1 && (
            <PaginationLink href={`/admin/questions?${withPage(qs, page - 1)}`}>
              {"\u2190"} Previous
            </PaginationLink>
          )}
          {page < result.totalPages && (
            <PaginationLink href={`/admin/questions?${withPage(qs, page + 1)}`}>
              Next {"\u2192"}
            </PaginationLink>
          )}
        </div>
      )}
    </div>
  );
}

function withPage(qs: URLSearchParams, page: number) {
  const n = new URLSearchParams(qs);
  n.set("page", String(page));
  return n.toString();
}

function PaginationLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
    >
      {children}
    </Link>
  );
}
