"use client";

import Link from "next/link";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS, type ExamType } from "@/lib/exam";

export default function ExamCards() {
  const { setExam } = useExam();

  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <ExamCard
        exam="GATE"
        title="Start GATE"
        description="Practice MCQs and numericals for GATE Civil Engineering."
        onClick={() => setExam("GATE")}
        colors={EXAM_COLORS.GATE}
      />
      <ExamCard
        exam="ESE"
        title="Start ESE"
        description="Level-based MCQs with instant solutions for ESE Prelims."
        onClick={() => setExam("ESE")}
        colors={EXAM_COLORS.ESE}
      />
    </div>
  );
}

function ExamCard({ exam, title, description, onClick, colors }: { exam: ExamType, title: string, description: string, onClick: () => void, colors: any }) {
  // Use the accent color for borders/shadows/backgrounds
  return (
    <Link
      href="/practice?bank=ai"
      onClick={onClick}
      className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border bg-study-surface/90 p-6 shadow-lg ring-1 ring-inset ring-white/[0.06] transition duration-300 active:scale-[0.99] sm:p-7 sm:hover:-translate-y-0.5 sm:hover:shadow-xl"
      style={{
        borderColor: `${colors.accent}40`,
        boxShadow: `0 10px 15px -3px ${colors.accent}15, 0 4px 6px -4px ${colors.accent}15`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition group-hover:opacity-80"
        style={{ backgroundColor: `${colors.accent}20` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full blur-3xl"
        style={{ backgroundColor: `${colors.accent}15` }}
      />

      <div className="relative flex flex-col items-start gap-3 h-full">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            borderColor: `${colors.accent}50`,
            backgroundColor: `${colors.accent}20`,
            color: colors.accent,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.accent }} aria-hidden />
          {exam}
        </span>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-study-ink sm:text-[1.35rem]">
          {title}
        </h2>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-study-muted">
          {description}
        </p>

        <span
          className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition group-hover:brightness-110"
          style={{ backgroundColor: colors.accent }}
        >
          Open practice
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
