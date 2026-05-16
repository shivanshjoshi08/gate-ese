"use client";



import Link from "next/link";

import { useExam } from "@/hooks/useExam";

import { EXAM_COLORS } from "@/lib/exam";

import { PYQ_CATALOG } from "@/lib/pyqSources";

import { getYearBreakdown } from "@/lib/questions";

import { usePracticeBank } from "@/hooks/PracticeBankContext";



export default function PyqSection() {

  const { exam } = useExam();

  const { pyqQuestions } = usePracticeBank();

  const accent = EXAM_COLORS[exam];

  const catalog = PYQ_CATALOG[exam];

  const inAppYears = getYearBreakdown(pyqQuestions, exam);



  return (

    <section className="mb-8">

      <h2 className="text-lg font-semibold text-study-ink">

        Previous year papers ({exam})

      </h2>

      <p className="mt-1 text-sm text-study-muted">

        Quick practice by exam year · Links to full PDFs at the bottom.

      </p>



      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {inAppYears.map(({ year, count }) => (

          <div

            key={year}

            className="flex flex-col rounded-xl border border-study-border bg-study-surface/75 p-4 shadow-sm shadow-black/10 ring-1 ring-white/[0.03]"

          >

            <div className="flex items-center justify-between">

              <span className="text-xl font-bold text-study-ink">{year}</span>

              <span className="text-xs text-study-muted">{count} in app</span>

            </div>

            <Link

              href={`/practice?bank=pyq&year=${year}`}

              className="mt-3 rounded-lg px-3 py-2 text-center text-sm font-semibold text-white shadow-md shadow-black/15 transition hover:brightness-105"

              style={{ backgroundColor: accent.accent }}

            >

              Practice {year}

            </Link>

          </div>

        ))}

      </div>



      <div className="mt-6 rounded-xl border border-study-border bg-study-surface/75 p-4 shadow-inner shadow-black/10">

        <h3 className="text-sm font-semibold text-study-soft">Official PDF papers</h3>

        <a

          href={catalog.portalUrl}

          target="_blank"

          rel="noopener noreferrer"

          className="mt-2 inline-block text-sm font-medium hover:underline"

          style={{ color: accent.accent }}

        >

          {catalog.portalLabel} ↗

        </a>

        <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-sm text-study-muted">

          {catalog.papers.map((paper) => (

            <li key={paper.year} className="flex flex-wrap items-baseline gap-2">

              <span className="w-10 shrink-0 font-medium text-study-soft">

                {paper.year}

              </span>

              <a

                href={paper.url}

                target="_blank"

                rel="noopener noreferrer"

                className="min-w-0 hover:underline"

                style={{ color: accent.accent }}

              >

                {paper.title} ↗

              </a>

            </li>

          ))}

        </ul>

      </div>

    </section>

  );

}

