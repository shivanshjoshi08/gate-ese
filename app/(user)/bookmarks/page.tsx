"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestionsByIds } from "@/lib/questions";
import { loadProgress } from "@/lib/storage";
import type { Question } from "@/lib/types";
import { EXAM_COLORS } from "@/lib/exam";
import { usePracticeBank } from "@/hooks/PracticeBankContext";
import { useExam } from "@/hooks/useExam";
import LatexText from "@/components/question/LatexText";

export default function BookmarksPage() {
  const { exam } = useExam();
  const { questions: bank } = usePracticeBank();
  const [bookmarked, setBookmarked] = useState<Question[]>([]);

  useEffect(() => {
    const bookmarkIds = loadProgress(exam).bookmarks;
    const qs = getQuestionsByIds(bank, bookmarkIds).filter((q) => q.exam === exam);
    setBookmarked(qs);
  }, [bank, exam]);

  const accent = EXAM_COLORS[exam];

  if (bookmarked.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-zinc-100">
        <p className="text-6xl">⭐</p>
        <h1 className="mt-4 text-xl font-bold text-zinc-100">No bookmarks</h1>
        <p className="mt-2 text-zinc-400">Star a question while practicing to save it here.</p>
        <Link
          href="/practice?bank=ai"
          className="mt-6 inline-block rounded-xl px-6 py-2.5 font-semibold text-white"
          style={{ backgroundColor: accent.accent }}
        >
          Start
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Bookmarks</h1>
      <p className="mt-2 text-zinc-400">{bookmarked.length} saved</p>
      <Link
        href="/practice?bookmarks=1"
        className="mt-4 inline-block rounded-xl px-5 py-2 font-semibold text-white"
        style={{ backgroundColor: accent.accent }}
      >
        Practice all
      </Link>
      <ul className="mt-8 space-y-4">
        {bookmarked.map((q) => (
          <li key={q.id} className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4">
            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <span
                className="rounded px-2 py-0.5 font-semibold text-white"
                style={{
                  backgroundColor: accent.accent,
                }}
              >
                {exam}
              </span>
              {q.paper && (
                <span className="rounded bg-violet-400 px-2 py-0.5 text-white">
                  {q.paper}
                </span>
              )}
              <span className="text-zinc-500">{q.subject}</span>
              <span className="text-zinc-500">· {q.year}</span>
            </div>
            <div className="line-clamp-2 text-zinc-300"><LatexText text={q.question} /></div>
            <Link
              href={`/practice?bank=ai&mode=random&subject=${encodeURIComponent(q.subject)}${q.paper ? `&paper=${q.paper}` : ""}`}
              className="mt-2 inline-block text-sm hover:underline"
              style={{ color: accent.accent }}
            >
              Similar →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
