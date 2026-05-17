"use client";

import { useCallback, useEffect, useState } from "react";
import type { PyqPdfEntry, PyqPdfTrack } from "@/lib/pyq-pdfs";
import { pyqPdfDownloadUrl } from "@/lib/pyq-pdfs";

export default function AdminPyqPdfManager({
  initialEntries,
}: {
  initialEntries: PyqPdfEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [track, setTrack] = useState<PyqPdfTrack>("PRE");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/pyq-pdfs");
    if (!res.ok) return;
    const data = (await res.json()) as { entries: PyqPdfEntry[] };
    setEntries(data.entries ?? []);
  }, []);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!file) {
      setError("Choose a PDF file.");
      return;
    }
    const y = Number(year);
    if (!Number.isInteger(y) || y < 1990) {
      setError("Enter a valid year.");
      return;
    }

    const form = new FormData();
    form.set("file", file);
    form.set("track", track);
    form.set("year", String(y));
    if (title.trim()) form.set("title", title.trim());

    setBusy(true);
    try {
      const res = await fetch("/api/admin/pyq-pdfs", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Upload failed");
        return;
      }
      setEntries(data.entries ?? []);
      setMessage(`Uploaded ${data.entry?.filename ?? "PDF"}.`);
      setFile(null);
      setTitle("");
      const input = document.getElementById("pyq-pdf-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (filename: string) => {
    if (!confirm(`Remove ${filename} from the catalog and disk?`)) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/pyq-pdfs?filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Delete failed");
        return;
      }
      setEntries(data.entries ?? []);
      setMessage(`Removed ${filename}.`);
    } catch {
      setError("Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100";

  return (
    <div className="space-y-8">
      <form
        onSubmit={onUpload}
        className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-5"
      >
        <h2 className="text-lg font-semibold text-zinc-100">Upload PYQ PDF</h2>
        <p className="text-sm text-zinc-500">
          Files are stored in <code className="text-zinc-400">pdfs/</code> and
          listed on the learner PYQ PDFs page after upload.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-400">
            Track
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as PyqPdfTrack)}
              className={`mt-1 ${inputCls}`}
            >
              <option value="PRE">PRE (ESE Prelims)</option>
              <option value="GATE">GATE</option>
            </select>
          </label>
          <label className="block text-sm text-zinc-400">
            Year
            <input
              type="number"
              min={1990}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={`mt-1 ${inputCls}`}
              required
            />
          </label>
        </div>

        <label className="block text-sm text-zinc-400">
          Title (optional)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. ESE CE Prelims 2024"
            className={`mt-1 ${inputCls}`}
          />
        </label>

        <label className="block text-sm text-zinc-400">
          PDF file
          <input
            id="pyq-pdf-file"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            required
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Upload PDF"}
        </button>
      </form>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-100">Catalog</h2>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={busy}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Refresh
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No PDFs in manifest yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-700 bg-zinc-900/60">
            {entries.map((entry) => (
              <li
                key={entry.filename}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-100">{entry.title}</p>
                  <p className="text-sm text-zinc-500">
                    {entry.track ?? "PRE"} · {entry.year} · {entry.filename}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={pyqPdfDownloadUrl(entry.filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDelete(entry.filename)}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
