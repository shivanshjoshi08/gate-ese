/**
 * PYQ PDF catalog — manifest in `data/pyq-pdfs-manifest.json` (admin-managed).
 */
import manifest from "@/data/pyq-pdfs-manifest.json";

export type PyqPdfTrack = "GATE" | "PRE";

export interface PyqPdfEntry {
  year: number;
  filename: string;
  title: string;
  track?: PyqPdfTrack;
}

const sorted = [...(manifest as PyqPdfEntry[])].sort((a, b) => b.year - a.year);

/** Build-time / SSR snapshot from manifest file. */
export const PYQ_PDF_ENTRIES: PyqPdfEntry[] = sorted;

export const PYQ_PDF_ALLOWLIST = new Set(PYQ_PDF_ENTRIES.map((e) => e.filename));

export function pyqPdfDownloadUrl(filename: string): string {
  return `/api/pyq-pdf/${encodeURIComponent(filename)}`;
}
