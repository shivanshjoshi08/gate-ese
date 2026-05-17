import Link from "next/link";
import { PYQ_PDF_ENTRIES, pyqPdfDownloadUrl } from "@/lib/pyq-pdfs";

const PREVIEW_YEARS = 6;

export default function PyqPdfsHomeSection() {
  const preview = PYQ_PDF_ENTRIES.slice(0, PREVIEW_YEARS);
  const rest = PYQ_PDF_ENTRIES.length - PREVIEW_YEARS;

  return (
    <section
      className="mt-8 border-t border-study-border/50 pt-8"
      aria-label="Previous year PDF papers"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-study-muted">
            Reference
          </p>
          <h2 className="mt-1 text-base font-semibold text-study-ink">
            Previous year papers (PDF)
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-study-muted">
            ESE CE Prelims — download and read offline.
          </p>
        </div>
        <Link
          href="/pyq-pdfs"
          className="shrink-0 rounded-lg border border-study-border/70 bg-study-raised/40 px-3 py-1.5 text-xs font-semibold text-study-soft transition hover:border-emerald-500/40 hover:text-emerald-200"
        >
          All papers
        </Link>
      </div>

      <div className="rounded-2xl border border-study-border/70 bg-study-surface/50 p-4 ring-1 ring-inset ring-white/[0.03]">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {preview.map((entry) => (
            <a
              key={entry.filename}
              href={pyqPdfDownloadUrl(entry.filename)}
              className="group flex flex-col items-center rounded-xl border border-study-border/60 bg-study-raised/30 px-2 py-3 text-center transition hover:border-emerald-500/45 hover:bg-emerald-500/10 active:scale-[0.98]"
              title={entry.title}
            >
              <span className="text-lg font-bold tabular-nums text-study-ink group-hover:text-emerald-100">
                {entry.year}
              </span>
              <span className="mt-1 text-[10px] font-medium text-study-muted group-hover:text-emerald-200/90">
                PDF ↓
              </span>
            </a>
          ))}
        </div>

        {rest > 0 ? (
          <p className="mt-3 text-center">
            <Link
              href="/pyq-pdfs"
              className="text-xs font-medium text-study-muted transition hover:text-emerald-300"
            >
              + {rest} older papers on the PDF page →
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
