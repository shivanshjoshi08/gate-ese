"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuestionsByIds } from "@/lib/questions";
import { loadProgress } from "@/lib/storage";
import type { ExamType, Question } from "@/lib/types";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

export default function BookmarksPage() {
  const { exam, setExam } = useExam();
  const [bookmarked, setBookmarked] = useState<Question[]>([]);
  const [filterExam, setFilterExam] = useState<ExamType | "All">("All");

  useEffect(() => {
    const gateBookmarks = loadProgress("GATE").bookmarks;
    const eseBookmarks = loadProgress("ESE").bookmarks;
    const allIds =
      filterExam === "All"
        ? [...gateBookmarks, ...eseBookmarks]
        : loadProgress(filterExam).bookmarks;
    const qs = getQuestionsByIds(allIds);
    const filtered =
      filterExam === "All" ? qs : qs.filter((q) => q.exam === filterExam);
    setBookmarked(filtered);
  }, [filterExam, exam]);

  const accent = EXAM_COLORS[exam];

  if (bookmarked.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center gap-2">
          {(["All", "GATE", "ESE"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setFilterExam(e)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                filterExam === e ? "text-white" : "bg-gray-100 text-gray-600"
              }`}
              style={
                filterExam === e
                  ? {
                      backgroundColor:
                        e === "ESE"
                          ? EXAM_COLORS.ESE.accent
                          : e === "GATE"
                            ? EXAM_COLORS.GATE.accent
                            : "#374151",
                    }
                  : undefined
              }
            >
              {e}
            </button>
          ))}
        </div>
        <p className="text-6xl">⭐</p>
        <h1 className="mt-4 text-xl font-bold">No bookmarks yet</h1>
        <p className="mt-2 text-gray-600">
          Tap the star on any question during practice to save it here.
        </p>
        <Link
          href="/practice"
          className="mt-6 inline-block rounded-xl px-6 py-2.5 font-semibold text-white"
          style={{ backgroundColor: accent.accent }}
        >
          Start Practicing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Bookmarked Questions</h1>
      <div className="mt-4 flex gap-2">
        {(["All", "GATE", "ESE"] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setFilterExam(e)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filterExam === e ? "text-white" : "bg-gray-100 text-gray-600"
            }`}
            style={
              filterExam === e
                ? {
                    backgroundColor:
                      e === "ESE"
                        ? EXAM_COLORS.ESE.accent
                        : e === "GATE"
                          ? EXAM_COLORS.GATE.accent
                          : "#374151",
                  }
                : undefined
            }
          >
            {e}
          </button>
        ))}
      </div>
      <p className="mt-2 text-gray-600">{bookmarked.length} saved</p>
      <Link
        href="/practice?bookmarks=1"
        className="mt-4 inline-block rounded-xl px-5 py-2 font-semibold text-white"
        style={{ backgroundColor: accent.accent }}
        onClick={() => {
          if (filterExam !== "All") setExam(filterExam);
        }}
      >
        Practice All Bookmarks
      </Link>
      <ul className="mt-8 space-y-4">
        {bookmarked.map((q) => (
          <li key={q.id} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-2 flex flex-wrap gap-2 text-xs">
              <span
                className="rounded px-2 py-0.5 font-semibold text-white"
                style={{
                  backgroundColor: EXAM_COLORS[q.exam].accent,
                }}
              >
                {q.exam}
              </span>
              {q.paper && (
                <span className="rounded bg-violet-400 px-2 py-0.5 text-white">
                  {q.paper}
                </span>
              )}
              <span className="text-gray-500">{q.subject}</span>
              <span className="text-gray-500">· {q.year}</span>
            </div>
            <p className="line-clamp-2 text-gray-800">{q.question}</p>
            <Link
              href={`/practice?subject=${encodeURIComponent(q.subject)}${q.paper ? `&paper=${q.paper}` : ""}`}
              className="mt-2 inline-block text-sm hover:underline"
              style={{ color: EXAM_COLORS[q.exam].accent }}
              onClick={() => setExam(q.exam)}
            >
              Practice similar →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
