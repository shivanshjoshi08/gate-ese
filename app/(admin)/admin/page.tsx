import Link from "next/link";
import type { ReactNode } from "react";
import { getQuestionBankStats } from "@/backend/services/question.service";
import { listLearnersForAdmin } from "@/backend/services/admin-users.service";

export default async function AdminDashboardPage() {
  let stats = {
    total: 0,
    practice: { total: 0, approved: 0, draft: 0 },
    pyq: { total: 0, approved: 0, draft: 0 },
    legacyPyq: 0,
  };

  let learnerCount = 0;
  let activeLearners = 0;

  try {
    stats = await getQuestionBankStats();
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
    <div>
      <h1 className="text-2xl font-bold text-zinc-100">Question CMS</h1>
      <p className="mt-1 text-zinc-400">
        MongoDB question bank — Practice and PYQ counts (live from database).
      </p>

      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900/60 p-5">
        <p className="text-sm font-medium text-zinc-400">Total in database</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-zinc-100">
          {stats.total}
        </p>
        <p className="mt-1 text-xs text-zinc-500">All questions in the collection</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <BankStatCard
          title="Practice"
          subtitle="sourceType: practice"
          stats={stats.practice}
          href="/admin/questions?sourceType=practice"
          accent="sky"
        />
        <BankStatCard
          title="PYQ"
          subtitle="sourceType: pyq + legacy admin uploads"
          stats={stats.pyq}
          href="/admin/questions?sourceType=pyq"
          accent="emerald"
          extra={
            stats.legacyPyq > 0 ? (
              <p className="mt-2 text-xs text-zinc-500">
                Includes {stats.legacyPyq} legacy-format PYQ (stem / published).
              </p>
            ) : null
          }
        />
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Learners see <strong className="text-zinc-400">approved</strong> questions
        only. Drafts stay hidden until published/approved.
      </p>

      <Link
        href="/admin/users"
        className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-500/30 bg-zinc-900/60 p-5 transition hover:brightness-110"
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

      <div className="mt-10 flex flex-wrap gap-3">
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
          Browse all
        </Link>
      </div>
    </div>
  );
}

function BankStatCard({
  title,
  subtitle,
  stats,
  href,
  accent,
  extra,
}: {
  title: string;
  subtitle: string;
  stats: { total: number; approved: number; draft: number };
  href: string;
  accent: "sky" | "emerald";
  extra?: ReactNode;
}) {
  const border =
    accent === "sky" ? "border-sky-500/30" : "border-emerald-500/30";
  return (
    <Link
      href={href}
      className={`rounded-xl border ${border} bg-zinc-900/60 p-5 shadow-sm shadow-black/20 transition hover:brightness-110`}
    >
      <p className="text-sm font-semibold text-zinc-200">{title}</p>
      <p className="text-xs text-zinc-500">{subtitle}</p>
      <p className="mt-3 text-3xl font-bold tabular-nums text-zinc-100">
        {stats.total}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-zinc-500">Approved (live)</dt>
          <dd className="font-semibold text-emerald-400">{stats.approved}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Draft</dt>
          <dd className="font-semibold text-amber-400/90">{stats.draft}</dd>
        </div>
      </dl>
      {extra}
    </Link>
  );
}
