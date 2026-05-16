import Link from "next/link";
import type { AdminLearnerListItem } from "@/backend/services/admin-users.service";
import { formatDateTime, formatRelative } from "@/lib/format-date";

export default function AdminUsersTable({
  users,
}: {
  users: AdminLearnerListItem[];
}) {
  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-10 text-center text-zinc-400">
        No registered learners yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900/60">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-zinc-700 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Last login</th>
            <th className="px-4 py-3 font-medium">Last question</th>
            <th className="px-4 py-3 font-medium">Attempts</th>
            <th className="px-4 py-3 font-medium">Accuracy</th>
            <th className="px-4 py-3 font-medium">Registered</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {users.map((u) => {
            const accuracy =
              u.stats.attemptCount > 0
                ? Math.round(
                    (u.stats.correctCount / u.stats.attemptCount) * 100,
                  )
                : null;
            return (
              <tr key={u.id} className="text-zinc-200 hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-100">{u.email}</p>
                  {u.name ? (
                    <p className="text-xs text-zinc-500">{u.name}</p>
                  ) : null}
                  {!u.hasCloudProgress && (
                    <p className="mt-0.5 text-xs text-amber-400/90">
                      No cloud sync yet
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  <p>{formatRelative(u.lastLoginAt)}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDateTime(u.lastLoginAt)}
                  </p>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  <p>{formatRelative(u.lastAttemptAt)}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDateTime(u.lastAttemptAt)}
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {u.stats.attemptCount}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {accuracy != null ? `${accuracy}%` : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {formatDateTime(u.registeredAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-sm font-medium text-sky-400 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
