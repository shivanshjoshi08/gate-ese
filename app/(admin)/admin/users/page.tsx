import Link from "next/link";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import { listLearnersForAdmin } from "@/backend/services/admin-users.service";

export default async function AdminUsersPage() {
  let users: Awaited<ReturnType<typeof listLearnersForAdmin>> = [];
  let error: string | null = null;

  try {
    users = await listLearnersForAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load users";
  }

  const activeRecently = users.filter((u) => {
    if (!u.lastAttemptAt) return false;
    const days =
      (Date.now() - new Date(u.lastAttemptAt).getTime()) / (24 * 60 * 60 * 1000);
    return days <= 7;
  }).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Learners</h1>
          <p className="mt-1 text-zinc-400">
            Track sign-ups, logins, and practice activity synced to the cloud.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Dashboard
        </Link>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Registered" value={String(users.length)} />
            <StatCard
              label="Active (7 days)"
              value={String(activeRecently)}
              hint="Attempted a question"
            />
            <StatCard
              label="Cloud sync"
              value={String(users.filter((u) => u.hasCloudProgress).length)}
              hint="Saved progress on server"
            />
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Last question uses cloud progress (ESE + GATE slots). Users who only
            practice offline appear after they log in and sync.
          </p>

          <div className="mt-6">
            <AdminUsersTable users={users} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-100">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
