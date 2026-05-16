import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnerDetailForAdmin } from "@/backend/services/admin-users.service";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/format-date";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  let user: Awaited<ReturnType<typeof getLearnerDetailForAdmin>> = null;

  try {
    user = await getLearnerDetailForAdmin(id);
  } catch {
    user = null;
  }

  if (!user) notFound();

  const accuracy =
    user.stats.attemptCount > 0
      ? Math.round((user.stats.correctCount / user.stats.attemptCount) * 100)
      : null;

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← All learners
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-zinc-100">{user.email}</h1>
        {user.name ? (
          <p className="mt-1 text-zinc-400">{user.name}</p>
        ) : null}
        <p className="mt-1 font-mono text-xs text-zinc-600">{user.id}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Last login" value={formatRelative(user.lastLoginAt)}>
          {formatDateTime(user.lastLoginAt)}
        </InfoCard>
        <InfoCard
          title="Last question attempt"
          value={formatRelative(user.lastAttemptAt)}
        >
          {formatDateTime(user.lastAttemptAt)}
        </InfoCard>
        <InfoCard
          title="Last cloud sync"
          value={formatRelative(user.lastCloudSyncAt)}
        >
          {formatDateTime(user.lastCloudSyncAt)}
        </InfoCard>
        <InfoCard title="Registered" value={formatRelative(user.registeredAt)}>
          {formatDateTime(user.registeredAt)}
        </InfoCard>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/60 p-5">
        <h2 className="text-sm font-semibold text-zinc-200">Practice summary</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Questions attempted" value={user.stats.attemptCount} />
          <Metric label="Correct" value={user.stats.correctCount} />
          <Metric label="Wrong" value={user.stats.wrongCount} />
          <Metric
            label="Accuracy"
            value={accuracy != null ? `${accuracy}%` : "—"}
          />
          <Metric label="Bookmarks" value={user.stats.bookmarkCount} />
          <Metric
            label="Practice levels done"
            value={user.stats.aiPracticeLevels}
          />
          <Metric label="PYQ levels done" value={user.stats.pyqPracticeLevels} />
          <Metric
            label="Cloud data"
            value={user.hasCloudProgress ? "Yes" : "No"}
          />
        </dl>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ExamSlotCard title="ESE slot" data={user.byExam.ESE} />
        <ExamSlotCard title="GATE slot" data={user.byExam.GATE} />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/60">
        <h2 className="border-b border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200">
          Recent attempts
        </h2>
        {user.recentAttempts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No attempts in cloud progress yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-2">When</th>
                  <th className="px-4 py-2">Slot</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Result</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Question</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {user.recentAttempts.map((a, i) => (
                  <tr key={`${a.questionId}-${a.timestamp}-${i}`}>
                    <td className="px-4 py-2 text-zinc-300">
                      {formatDateTime(new Date(a.timestamp).toISOString())}
                    </td>
                    <td className="px-4 py-2">{a.slot}</td>
                    <td className="px-4 py-2 text-zinc-400">
                      {a.subject}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          a.correct ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {a.correct ? "Correct" : "Wrong"}
                      </span>
                    </td>
                    <td className="px-4 py-2 tabular-nums text-zinc-400">
                      {a.timeSpentSec != null
                        ? formatDuration(a.timeSpentSec)
                        : "—"}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-2 font-mono text-xs text-zinc-500">
                      {a.questionId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
      {children ? (
        <p className="mt-1 text-xs text-zinc-500">{children}</p>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function ExamSlotCard({
  title,
  data,
}: {
  title: string;
  data: {
    updatedAt: string | null;
    summary: {
      attemptCount: number;
      correctCount: number;
      bookmarkCount: number;
    };
    recentAttempts: { timestamp: number; correct: boolean; subject: string }[];
  };
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
      <h3 className="font-semibold text-zinc-200">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Synced {formatDateTime(data.updatedAt)}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-zinc-500">Attempts</dt>
          <dd className="font-semibold">{data.summary.attemptCount}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Correct</dt>
          <dd className="font-semibold text-emerald-400">
            {data.summary.correctCount}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Bookmarks</dt>
          <dd className="font-semibold">{data.summary.bookmarkCount}</dd>
        </div>
      </dl>
    </div>
  );
}
