"use client";

import { useCallback, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

const SAMPLE_LEGACY = `[
  {
    "id": "ese_ce_2025_01",
    "question": "Minimum grade of concrete for RCC in moderate exposure (IS 456)?",
    "type": "mcq",
    "options": ["M15", "M20", "M25", "M30"],
    "correct": 1,
    "solution": "M20 is minimum for moderate exposure.",
    "subject": "Structural Engineering",
    "topic": "RCC",
    "marks": 1,
    "year": 2025,
    "difficulty": "Easy",
    "exam": "GATE",
    "paper": null
  }
]`;

const SAMPLE_UNIFIED = `[
  {
    "sourceType": "pyq",
    "exam": "GATE",
    "branch": "CE",
    "subject": "Fluid Mechanics",
    "topic": "Bernoulli",
    "year": 2023,
    "paper": null,
    "type": "mcq",
    "question": "Bernoulli equation along a streamline applies when flow is:",
    "options": [
      { "id": "A", "text": "Steady incompressible inviscid" },
      { "id": "B", "text": "Turbulent only" },
      { "id": "C", "text": "Unsteady compressible" },
      { "id": "D", "text": "Open channel only" }
    ],
    "correctOption": "A",
    "solution": { "text": "Standard Bernoulli assumptions.", "latex": "", "images": [] },
    "difficulty": "Medium",
    "marks": 1,
    "negativeMarks": 0,
    "tags": ["PYQ"],
    "images": [],
    "status": "approved"
  }
]`;

type ImportResult = {
  inserted: number;
  skipped: number;
  failed: { index: number; id?: string; reason: string }[];
  total: number;
};

export default function JsonQuestionImport() {
  const [jsonText, setJsonText] = useState("");
  const [sourceType, setSourceType] = useState<"pyq" | "practice">("practice");
  const [status, setStatus] = useState<"approved" | "draft">("approved");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const loadSample = (kind: "legacy" | "unified") => {
    setJsonText(kind === "legacy" ? SAMPLE_LEGACY : SAMPLE_UNIFIED);
    setError(null);
    setResult(null);
  };

  const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(String(reader.result ?? ""));
      setError(null);
      setResult(null);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }, []);

  const onSubmit = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error("Invalid JSON. Check commas and quotes.");
      }

      const res = await adminFetch("/api/admin/questions/import", {
        method: "POST",
        body: JSON.stringify({
          questions: parsed,
          defaults: { sourceType, status },
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Upload failed (${res.status})`);
      }

      setResult((await res.json()) as ImportResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        <p className="mb-2 text-zinc-200">JSON se questions upload</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Ek question object ya array bhej sakte ho</li>
          <li>
            <strong>Simple format</strong> - jaise{" "}
            <code className="text-zinc-300">questions.json</code> (id, question,
            options, correct index)
          </li>
          <li>
            <strong>Full format</strong> - sourceType, correctOption, solution
            object, etc.
          </li>
          <li>
            Approved + Practice/PYQ select karo - users ko practice / PYQ bank
            me dikhenge
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm text-zinc-300">
          Default source
          <select
            value={sourceType}
            onChange={(e) =>
              setSourceType(e.target.value as "pyq" | "practice")
            }
            className="ml-2 rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-zinc-100"
          >
            <option value="practice">Practice</option>
            <option value="pyq">PYQ</option>
          </select>
        </label>
        <label className="text-sm text-zinc-300">
          Status
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "approved" | "draft")
            }
            className="ml-2 rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-zinc-100"
          >
            <option value="approved">Approved (live for users)</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => loadSample("legacy")}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Sample: simple
        </button>
        <button
          type="button"
          onClick={() => loadSample("unified")}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Sample: full schema
        </button>
        <label className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
          Upload .json file
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onFile}
          />
        </label>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='Paste JSON array here, e.g. [{ "id": "...", "question": "...", ... }]'
        className="h-80 w-full rounded-xl border border-zinc-600 bg-zinc-950 p-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
        spellCheck={false}
      />

      <button
        type="button"
        disabled={busy || !jsonText.trim()}
        onClick={onSubmit}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Importing..." : "Import to database"}
      </button>

      {error && (
        <pre className="whitespace-pre-wrap rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">
          {error}
        </pre>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-sm">
          <p className="font-medium text-emerald-300">Import complete</p>
          <p className="mt-2 text-zinc-300">
            {result.inserted} inserted | {result.skipped} skipped (duplicate) |{" "}
            {result.failed.length} failed | {result.total} total
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-3 max-h-48 overflow-y-auto text-red-300">
              {result.failed.slice(0, 15).map((f) => (
                <li key={f.index}>
                  #{f.index + 1}
                  {f.id ? ` (${f.id})` : ""}: {f.reason}
                </li>
              ))}
              {result.failed.length > 15 && (
                <li>... and {result.failed.length - 15} more</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
