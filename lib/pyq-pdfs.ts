/**
 * ESE CE Prelims PYQ PDFs stored under `/pdfs` at repo root (served via `/api/pyq-pdf/...`).
 */
export interface PyqPdfEntry {
  year: number;
  filename: string;
  /** Short learner-facing title */
  title: string;
}

export const PYQ_PDF_ENTRIES: PyqPdfEntry[] = [
  { year: 2026, filename: "ESE_CE_2026_PRE.pdf", title: "ESE CE Prelims 2026" },
  { year: 2025, filename: "ESE_CE_2025_PRE.pdf", title: "ESE CE Prelims 2025" },
  { year: 2024, filename: "ESE_CE_2024_PRE.pdf", title: "ESE CE Prelims 2024" },
  { year: 2023, filename: "ESE_CE_2023_PRE.pdf", title: "ESE CE Prelims 2023" },
  { year: 2022, filename: "ESE_CE_2022_PRE.pdf", title: "ESE CE Prelims 2022" },
  { year: 2021, filename: "ESE_CE_2021_PRE.pdf", title: "ESE CE Prelims 2021" },
  { year: 2020, filename: "ESE_CE_2020_PRE.pdf", title: "ESE CE Prelims 2020" },
  { year: 2019, filename: "ESE_CE_2019_PRE.pdf", title: "ESE CE Prelims 2019" },
  { year: 2018, filename: "ESE_CE_2018_PRE.pdf", title: "ESE CE Prelims 2018" },
  { year: 2017, filename: "ESE_CE_2017_PRE.pdf", title: "ESE CE Prelims 2017" },
].sort((a, b) => b.year - a.year);

export const PYQ_PDF_ALLOWLIST = new Set(PYQ_PDF_ENTRIES.map((e) => e.filename));

export function pyqPdfDownloadUrl(filename: string): string {
  return `/api/pyq-pdf/${encodeURIComponent(filename)}`;
}
