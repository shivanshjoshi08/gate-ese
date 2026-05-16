import Link from "next/link";
import { getQuestionBankStats } from "@/backend/services/question.service";
import { listLearnersForAdmin } from "@/backend/services/admin-users.service";

export default async function AdminDashboardPage() {
  let practiceTotal = 0;
  let practiceApproved = 0;
  let practiceDraft = 0;

  let learnerCount = 0;
  let activeLearners = 0;

  try {
    const stats = await getQuestionBankStats();
    practiceTotal = stats.practice.total;
    practiceApproved = stats.practice.approved;
    practiceDraft = stats.practice.draft;
  } catch {
    /* Mongo unreachable */
  }

  try {
    const learners = await listLearnersForAdmin();
    learnerCount = learners.length;
    activeLearners = learners.filter((u) => {
      if (!u.lastAttemptAt) return false;
      const days =
        (Date.now() - new Date(u.lastAttemptAt).getTime()) /
        (24 * 60 * 60 * 1000);
      return days <= 7;
    }).length;
  } catch {
    /* Mongo unreachable */
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Practice CMS</h1>
        <p className="mt-1 text-zinc-400">
          Manage the practice question bank in MongoDB.
        </p>
      </div>

      <Link
        href="/admin/questions?sourceType=practice"
        className="block rounded-xl border border-sky-500/30 bg-zinc-900/60 p-5 shadow-sm shadow-black/20 transition hover:brightness-110"
      >
        <p className="text-sm font-semibold text-zinc-200">Practice questions</p>
        <p className="mt-3 text-4xl font-bold tabular-nums text-zinc-100">
          {practiceTotal}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-zinc-500">Approved (live)</dt>
            <dd className="font-semibold text-emerald-400">{practiceApproved}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Draft</dt>
            <dd className="font-semibold text-amber-400/90">{practiceDraft}</dd>
          </div>
        </dl>
      </Link>

      <p className="text-xs text-zinc-500">
        Learners see <strong className="text-zinc-400">approved</strong> practice
        questions only. Drafts stay hidden until approved.
      </p>

      <Link
        href="/admin/users"
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-500/30 bg-zinc-900/60 p-5 transition hover:brightness-110"
      >
        <div>
          <p className="text-sm font-semibold text-zinc-200">Learners</p>
          <p className="text-xs text-zinc-500">
            Last login, last question attempt, practice stats
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tabular-nums text-zinc-100">
            {learnerCount}
          </p>
          <p className="text-xs text-zinc-500">
            {activeLearners} active in last 7 days
          </p>
        </div>
      </Link>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/questions/new"
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white"
        >
          + New question
        </Link>
        <Link
          href="/admin/questions/import"
          className="rounded-xl border border-zinc-600 px-5 py-2.5 font-semibold text-zinc-200 hover:bg-zinc-800"
        >
          JSON import
        </Link>
        <Link
          href="/admin/questions"
          className="rounded-xl border border-zinc-600 px-5 py-2.5 font-semibold text-zinc-200 hover:bg-zinc-800"
        >
          Browse practice
        </Link>
      </div>
    </div>
  );
}
