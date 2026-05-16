"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { PRACTICE_FILTER_SUBJECTS } from "@/lib/practice-subjects";

const SUBJECTS = ["", ...PRACTICE_FILTER_SUBJECTS];

export default function AdminQuestionFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const status = sp.get("status") ?? "draft";
  const subject = sp.get("subject") ?? "";
  const exam = sp.get("exam") ?? "";
  const difficulty = sp.get("difficulty") ?? "";
  const page = sp.get("page") ?? "1";

  const build = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!patch.page) next.set("page", "1");
    return `/admin/questions?${next.toString()}`;
  };

  const onSelect =
    (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      router.push(build({ [key]: e.target.value, page: "1" }));
    };

  const selectCls =
    "rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100";

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabLink href="/admin/questions?status=draft" active={status === "draft"}>
          Drafts
        </TabLink>
        <TabLink
          href="/admin/questions?status=approved"
          active={status === "approved" || status === "published"}
        >
          Approved
        </TabLink>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={exam}
          onChange={onSelect("exam")}
          className={selectCls}
          aria-label="Exam"
        >
          <option value="">All exams</option>
          <option value="GATE">GATE</option>
          <option value="ESE">ESE</option>
        </select>
        <select
          value={subject}
          onChange={onSelect("subject")}
          className={selectCls}
          aria-label="Subject"
        >
          {SUBJECTS.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All subjects"}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={onSelect("difficulty")}
          className={selectCls}
          aria-label="Difficulty"
        >
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <p className="text-xs text-zinc-500">Page {page}</p>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm ${
        active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
      }`}
    >
      {children}
    </Link>
  );
}
