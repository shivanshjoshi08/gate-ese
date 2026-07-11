import Link from "next/link";
import PyqPdfsHomeSection from "@/components/PyqPdfsHomeSection";
import ExamCards from "@/components/ExamCards";
import { USER_PYQ_PDFS_ENABLED } from "@/lib/feature-flags";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6 text-study-ink sm:px-5 sm:pb-12 sm:pt-10">
      <header className="mb-8 text-center sm:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/90">
          GATE & ESE · Civil Engineering
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

      <ExamCards />

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
