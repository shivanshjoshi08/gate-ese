import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { PyqPdfEntry, PyqPdfTrack } from "@/lib/pyq-pdfs";

const MANIFEST_PATH = path.join(process.cwd(), "data", "pyq-pdfs-manifest.json");
const PDF_DIR = path.join(process.cwd(), "pdfs");

export function pyqPdfStorageDir(): string {
  return PDF_DIR;
}

export function sanitizePdfFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!base.toLowerCase().endsWith(".pdf")) return `${base}.pdf`;
  return base;
}

export function buildPyqPdfFilename(track: PyqPdfTrack, year: number): string {
  if (track === "GATE") return `GATE_CE_${year}.pdf`;
  return `ESE_CE_${year}_PRE.pdf`;
}

export function defaultPyqPdfTitle(track: PyqPdfTrack, year: number): string {
  if (track === "GATE") return `GATE CE ${year}`;
  return `ESE CE Prelims ${year}`;
}

export async function readPyqPdfManifest(): Promise<PyqPdfEntry[]> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as PyqPdfEntry[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.year - a.year);
  } catch {
    return [];
  }
}

export async function writePyqPdfManifest(entries: PyqPdfEntry[]): Promise<void> {
  const sorted = [...entries].sort((a, b) => b.year - a.year);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

export async function getPyqPdfAllowlist(): Promise<Set<string>> {
  const entries = await readPyqPdfManifest();
  return new Set(entries.map((e) => e.filename));
}

export async function upsertPyqPdfEntry(entry: PyqPdfEntry): Promise<PyqPdfEntry[]> {
  const entries = await readPyqPdfManifest();
  const next = entries.filter((e) => e.filename !== entry.filename);
  next.push(entry);
  await writePyqPdfManifest(next);
  return next.sort((a, b) => b.year - a.year);
}

export async function removePyqPdfEntry(filename: string): Promise<PyqPdfEntry[]> {
  const entries = await readPyqPdfManifest();
  const next = entries.filter((e) => e.filename !== filename);
  await writePyqPdfManifest(next);
  return next;
}
