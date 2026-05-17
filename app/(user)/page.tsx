import Link from "next/link";
import PyqPdfsHomeSection from "@/components/PyqPdfsHomeSection";
import { USER_PYQ_PDFS_ENABLED } from "@/lib/feature-flags";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 text-study-ink sm:px-5 sm:pb-12 sm:pt-10">
      <header className="mb-8 text-center sm:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/90">
          ESE · Civil Engineering
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Question practice,{" "}
          <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
            done right
          </span>
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-study-muted">
          Level-based MCQs with instant solutions, subject filters, and progress
          tracking.
        </p>
      </header>

      <Link
        href="/practice?bank=ai"
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-sky-500/40 bg-gradient-to-br from-sky-500/15 via-study-surface/90 to-violet-600/10 p-6 shadow-lg shadow-sky-950/25 ring-1 ring-inset ring-white/[0.06] transition duration-300 active:scale-[0.99] sm:p-7 sm:hover:-translate-y-0.5 sm:hover:border-sky-400/55 sm:hover:shadow-xl sm:hover:shadow-sky-500/15"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl transition group-hover:bg-sky-400/30"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-violet-500/15 blur-3xl"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/35 bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden />
              Practice
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-study-ink sm:text-[1.35rem]">
              Start practising
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-study-muted">
              MCQs by level — pick a subject, get feedback, and build your streak.
            </p>
          </div>
          <span
            aria-hidden
            className="hidden shrink-0 rounded-xl border border-study-border/50 bg-study-raised/50 p-3 text-2xl sm:block"
          >
            📐
          </span>
        </div>

        <ul className="relative mt-5 flex flex-wrap gap-2">
          {["Subject filters", "Step solutions", "Progress"].map((label) => (
            <li
              key={label}
              className="rounded-lg border border-study-border/60 bg-study-surface/60 px-2.5 py-1 text-[11px] font-medium text-study-soft"
            >
              {label}
            </li>
          ))}
        </ul>

        <span className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-950/30 transition group-hover:brightness-110">
          Open practice
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </Link>

      {USER_PYQ_PDFS_ENABLED ? <PyqPdfsHomeSection /> : null}

      <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-study-muted/90">
        <Link href="/me" className="hover:text-study-soft">
          My progress
        </Link>
        {USER_PYQ_PDFS_ENABLED ? (
          <>
            <span aria-hidden className="text-study-border">
              ·
            </span>
            <Link href="/pyq-pdfs" className="hover:text-study-soft">
              All PDFs
            </Link>
          </>
        ) : null}
        <span aria-hidden className="text-study-border">
          ·
        </span>
        <Link
          href="/admin"
          className="underline decoration-study-border underline-offset-2 hover:text-study-soft"
        >
          Admin
        </Link>
      </footer>
    </div>
  );
}
