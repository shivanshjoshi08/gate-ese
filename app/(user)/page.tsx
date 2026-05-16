"use client";

import Link from "next/link";
import { usePracticeBank } from "@/hooks/PracticeBankContext";

const EXAM_LABEL = "ESE" as const;

export default function HomePage() {
  const { pyqQuestions, loadingPyq } = usePracticeBank();
  const pyqEmpty = !loadingPyq && pyqQuestions.length === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-study-ink">
      <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        {EXAM_LABEL}{" "}
        <span className="font-semibold text-study-muted">Civil Engineering</span>
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-study-muted">
        Pick <strong className="text-study-soft">Practice</strong> for regular sets, or{" "}
        <strong className="text-study-soft">PYQ</strong> for previous-year papers.
      </p>

      <section className="mt-10" aria-label="Previous year PDF papers">
        <Link
          href="/pyq-pdfs"
          className="group relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.10] via-study-surface/80 to-study-surface/60 p-6 shadow-lg shadow-black/15 ring-1 ring-inset ring-white/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/45 hover:shadow-xl hover:shadow-amber-500/10 sm:min-h-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-400/15 blur-2xl transition group-hover:bg-amber-400/25"
          />
          <div className="relative min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-study-ink">
              PYQ papers (PDF)
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-study-muted">
              ESE CE Prelims previous-year papers — download year-wise PDFs for offline prep.
            </p>
          </div>
          <span className="relative mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-md shadow-black/20 transition group-hover:brightness-110 sm:mt-0 sm:w-auto">
            Downloads
            <span aria-hidden className="text-base transition group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
        <Link
          href="/practice?bank=ai"
          className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-sky-500/35 bg-gradient-to-br from-sky-500/[0.12] via-study-surface/80 to-study-surface/60 p-6 shadow-lg shadow-black/15 ring-1 ring-inset ring-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-xl hover:shadow-sky-500/10 hover:ring-sky-400/15"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-400/15 blur-2xl transition group-hover:bg-sky-400/25"
          />
          <h2 className="text-lg font-semibold tracking-tight text-study-ink">Practice</h2>
          <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-study-muted">
            Curated sets with filters, streaks, and the full practice flow.
          </p>
          <span className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-black/20 transition group-hover:brightness-110 group-hover:shadow-lg">
            Start
            <span aria-hidden className="text-base transition group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>

        <Link
          href="/practice?bank=pyq"
          className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.12] via-study-surface/80 to-study-surface/60 p-6 shadow-lg shadow-black/15 ring-1 ring-inset ring-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:ring-emerald-400/15"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl transition group-hover:bg-emerald-400/25"
          />
          <h2 className="text-lg font-semibold tracking-tight text-study-ink">PYQ</h2>
          <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-study-muted">
            Previous-year questions from published papers.
            {pyqEmpty && (
              <span className="mt-2 block text-amber-400/95">Nothing published yet.</span>
            )}
            {loadingPyq && (
              <span className="mt-2 block text-xs text-study-muted">Syncing question bank…</span>
            )}
          </p>
          <span className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-black/20 transition group-hover:brightness-110 group-hover:shadow-lg">
            Start
            <span aria-hidden className="text-base transition group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-study-muted/80">
        <Link href="/me" className="hover:text-study-soft">
          My progress
        </Link>
        <span aria-hidden className="mx-2 text-study-border">
          ·
        </span>
        <Link href="/admin" className="underline decoration-study-border underline-offset-2 hover:text-study-soft">
          Admin
        </Link>
      </p>
    </div>
  );
}
