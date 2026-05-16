"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { USER_PYQ_ENABLED } from "@/lib/feature-flags";
import QuestionCard from "@/components/QuestionCard";
import {
  buildingMaterialsQuestions,
  buildingMaterialsSet,
} from "@/lib/buildingMaterials";
import { EXAM_COLORS } from "@/lib/exam";

const TOTAL = buildingMaterialsQuestions.length;
const accent = EXAM_COLORS.ESE;

export default function BuildingMaterialsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!USER_PYQ_ENABLED) router.replace("/practice?bank=ai");
  }, [router]);

  const [index, setIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const current = buildingMaterialsQuestions[index];

  const handleAnswered = useCallback(() => {
    setAnsweredCount((c) => c + 1);
  }, []);

  const handleNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, TOTAL));
  }, []);

  const goTo = (n: number) => {
    if (n >= 0 && n < TOTAL) setIndex(n);
  };

  if (index >= TOTAL) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-zinc-100">
        <p className="text-2xl font-bold">Set complete</p>
        <p className="mt-2 text-zinc-400">
          You went through all {TOTAL} questions in{" "}
          {buildingMaterialsSet.title}.
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setAnsweredCount(0);
          }}
          className="mt-6 rounded-xl px-6 py-2.5 font-semibold text-white"
          style={{ backgroundColor: accent.accent }}
        >
          Start over
        </button>
        <Link
          href="/"
          className="mt-4 block text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-3 px-4 py-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-zinc-100">
              {buildingMaterialsSet.title}
            </h1>
            <p className="text-sm text-zinc-500">
              {buildingMaterialsSet.description}
            </p>
          </div>
          <span className="rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-300">
            Q {index + 1} / {TOTAL}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{answeredCount} answered this session</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((index + 1) / TOTAL) * 100}%`,
              backgroundColor: accent.accent,
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {buildingMaterialsQuestions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-8 w-8 rounded text-xs font-medium transition ${
                i === index
                  ? "text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
              style={
                i === index ? { backgroundColor: accent.accent } : undefined
              }
              title={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-400/90">
          No answer key in this set.
        </p>
      </div>

      {current && (
        <QuestionCard
          key={current.id}
          question={current}
          onAnswered={handleAnswered}
          onNext={handleNext}
        />
      )}

      <div className="mx-auto flex max-w-2xl justify-between px-4 pb-8">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          disabled={index >= TOTAL - 1}
          onClick={() => goTo(index + 1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
