import Link from "next/link";
import { PYQ_PDF_ENTRIES, pyqPdfDownloadUrl } from "@/lib/pyq-pdfs";

const PREVIEW_COUNT = 4;

export default function PyqPdfsHomeSection() {
  const preview = PYQ_PDF_ENTRIES.slice(0, PREVIEW_COUNT);

  return (
    <section className="mt-10" aria-label="Previous year PDF papers">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-study-ink">
            Download PYQ papers
          </h2>
          <p className="mt-1 text-sm text-study-muted">
            ESE CE Prelims PDFs — read offline or save to your device.
          </p>
        </div>
        <Link
          href="/pyq-pdfs"
          className="text-sm font-semibold text-emerald-300/95 underline-offset-2 hover:underline"
        >
          View all {PYQ_PDF_ENTRIES.length} papers →
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] shadow-inner shadow-black/[0.06]">
        <ul className="divide-y divide-study-border/60">
          {preview.map((entry) => (
            <li
              key={entry.filename}
              className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
            >
              <div className="min-w-0">
                <p className="font-medium text-study-ink">{entry.title}</p>
                <p className="text-xs text-study-muted">{entry.year}</p>
              </div>
              <a
                href={pyqPdfDownloadUrl(entry.filename)}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-black/15 transition hover:brightness-110"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
        {PYQ_PDF_ENTRIES.length > PREVIEW_COUNT ? (
          <div className="border-t border-study-border/60 bg-study-raised/20 px-4 py-3 text-center sm:px-5">
            <Link
              href="/pyq-pdfs"
              className="text-sm font-medium text-study-soft hover:text-study-ink"
            >
              + {PYQ_PDF_ENTRIES.length - PREVIEW_COUNT} more years
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
