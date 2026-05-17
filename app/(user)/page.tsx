import Link from "next/link";
import PyqPdfsHomeSection from "@/components/PyqPdfsHomeSection";
import { USER_PYQ_PDFS_ENABLED } from "@/lib/feature-flags";

const EXAM_LABEL = "ESE" as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-3 py-8 pb-4 text-study-ink sm:px-4 sm:py-12">
      <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
        {EXAM_LABEL}{" "}
        <span className="font-semibold text-study-muted">Civil Engineering</span>
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-study-muted">
        Level-based <strong className="text-study-soft">Practice</strong> with
        instant feedback and progress tracking.
      </p>

      {/* PYQ PDFs + PYQ practice cards — re-enable with USER_PYQ_ENABLED
      <section className="mt-10" aria-label="Previous year PDF papers">...</section>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">...</div>
      */}

      <div className="mt-10">
        <Link
          href="/practice?bank=ai"
          className="group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border border-sky-500/35 bg-gradient-to-br from-sky-500/[0.12] via-study-surface/80 to-study-surface/60 p-5 shadow-lg shadow-black/15 ring-1 ring-inset ring-white/[0.04] transition duration-300 active:scale-[0.99] sm:min-h-[240px] sm:p-6 sm:hover:-translate-y-1 sm:hover:border-sky-400/50 sm:hover:shadow-xl sm:hover:shadow-sky-500/10 sm:hover:ring-sky-400/15"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-400/15 blur-2xl transition group-hover:bg-sky-400/25"
          />
          <h2 className="text-lg font-semibold tracking-tight text-study-ink">
            Start Practice
          </h2>
          <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-study-muted">
            Curated MCQs by level — filters, streaks, and solutions.
          </p>
          <span className="mt-auto flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 py-3.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-black/20 transition active:brightness-110 sm:group-hover:brightness-110 sm:group-hover:shadow-lg">
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
        <Link
          href="/admin"
          className="underline decoration-study-border underline-offset-2 hover:text-study-soft"
        >
          Admin
        </Link>
      </p>
    </div>
  );
}
