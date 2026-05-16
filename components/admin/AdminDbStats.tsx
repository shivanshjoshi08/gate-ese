import Link from "next/link";
import { getQuestionBankStats } from "@/backend/services/question.service";

export default async function AdminDbStats({ compact }: { compact?: boolean }) {
  let stats = {
    total: 0,
    practice: { total: 0, approved: 0, draft: 0 },
    pyq: { total: 0, approved: 0, draft: 0 },
    legacyPyq: 0,
  };

  try {
    stats = await getQuestionBankStats();
  } catch {
    return (
      <p className="rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
        Could not reach MongoDB — counts unavailable.
      </p>
    );
  }

  if (compact) {
    return (
      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <StatPill label="DB total" value={stats.total} />
        <StatPill
          label="Practice"
          value={stats.practice.total}
          sub={`${stats.practice.approved} live`}
          href="/admin/questions"
        />
      </div>
    );
  }

  return null;
}

function StatPill({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-zinc-500">{label}</span>
      <span className="font-bold tabular-nums text-zinc-100">{value}</span>
      {sub && <span className="text-xs text-emerald-400/90">{sub}</span>}
    </>
  );
  const cls =
    "inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2";
  if (href) {
    return (
      <Link href={href} className={`${cls} hover:border-zinc-500`}>
        {inner}
      </Link>
    );
  }
  return <span className={cls}>{inner}</span>;
}
