import Link from "next/link";
import { redirect } from "next/navigation";
import { readPyqPdfManifest } from "@/lib/pyq-pdf-manifest";
import { pyqPdfDownloadUrl } from "@/lib/pyq-pdfs";
import { USER_PYQ_PDFS_ENABLED, USER_PYQ_ENABLED } from "@/lib/feature-flags";

export const metadata = {
  title: "PYQ papers (PDF) | ESE CE Practice",
  description:
    "Download ESE Civil Engineering Prelims previous-year papers (PDF).",
};

export default async function PyqPdfsPage() {
  if (!USER_PYQ_PDFS_ENABLED) redirect("/");

  const entries = await readPyqPdfManifest();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-study-ink sm:py-14">
      <div className="mb-10 text-center">
        <Link
          href="/"
          className="inline-block text-sm text-study-muted transition hover:text-study-soft"
        >
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Previous year papers
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-study-muted">
          ESE CE <strong className="text-study-soft">Prelims</strong> PDFs for
          offline reading. Files open in the browser or save via your system
          download dialog.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] shadow-inner shadow-black/[0.06]">
        <ul className="divide-y divide-study-border/60">
          {entries.map((entry) => (
            <li
              key={entry.filename}
              className="flex flex-col gap-3 px-4 py-4 transition hover:bg-study-raised/30 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
            >
              <div className="min-w-0">
                <p className="font-semibold text-study-ink">{entry.title}</p>
                <p className="mt-0.5 text-xs text-study-muted">{entry.filename}</p>
              </div>
              <a
                href={pyqPdfDownloadUrl(entry.filename)}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/15 transition hover:brightness-110"
              >
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-study-muted">
        Use alongside{" "}
        <Link
          href="/practice?bank=ai"
          className="text-emerald-300/90 underline-offset-2 hover:underline"
        >
          Practice
        </Link>
        {USER_PYQ_ENABLED ? (
          <>
            {" "}
            or{" "}
            <Link
              href="/practice?bank=pyq"
              className="text-emerald-300/90 underline-offset-2 hover:underline"
            >
              PYQ practice
            </Link>
          </>
        ) : null}
        . Copyright belongs to the exam authority; personal preparation only.
      </p>
    </div>
  );
}
