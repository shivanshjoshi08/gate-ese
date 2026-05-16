"use client";

import { useCallback, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

const SAMPLE_LEGACY = `[
  {
    "id": "ese_ce_2025_01",
    "question": "Minimum grade of concrete for RCC in moderate exposure (IS 456)?",
    "type": "mcq",
    "numerical": false,
    "unit": null,
    "answerRange": null,
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
    "sourceType": "practice",
    "exam": "GATE",
    "branch": "CE",
    "subject": "Fluid Mechanics",
    "topic": "Bernoulli",
    "year": 2023,
    "type": "mcq",
    "numerical": false,
    "unit": null,
    "answerRange": null,
    "question": "Bernoulli equation along a streamline applies when flow is:",
    "options": [
      { "id": "A", "text": "Steady incompressible inviscid" },
      { "id": "B", "text": "Turbulent only" }
    ],
    "correctOption": "A",
    "solution": { "text": "Standard Bernoulli assumptions.", "latex": "", "images": [] },
    "difficulty": "Moderate",
    "marks": 1,
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
          defaults: { sourceType: "practice", status },
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
      <section className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-zinc-200">How to import</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-400">
          <li>Send one question object or a JSON array.</li>
          <li>
            <strong className="text-zinc-300">Simple</strong> - like{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-200">
              data/questions.json
            </code>{" "}
            (id, question, options, correct index).
          </li>
          <li>
            <strong className="text-zinc-300">Full</strong> - unified schema with
            appearances, references, solutionSteps, etc.
          </li>
          <li>
            Set status to <strong className="text-zinc-300">Approved</strong> for
            questions to show in the practice bank.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1.5 text-sm text-zinc-300">
            <span className="font-medium">Status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "approved" | "draft")
              }
              className="rounded-lg border border-zinc-600 bg-zinc-950 px-3 py-2 text-zinc-100"
            >
              <option value="approved">Approved (live for users)</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadSample("legacy")}
              className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Sample: simple
            </button>
            <button
              type="button"
              onClick={() => loadSample("unified")}
              className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Sample: full schema
            </button>
            <label className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
              Choose .json file
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={onFile}
              />
            </label>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-zinc-300">
            JSON payload
          </span>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Paste JSON here, e.g. [{ "id": "...", "question": "...", "options": [...], "correct": 0 }]'
            className="min-h-[320px] w-full resize-y rounded-xl border border-zinc-600 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            spellCheck={false}
          />
        </label>

        <button
          type="button"
          disabled={busy || !jsonText.trim()}
          onClick={onSubmit}
          className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {busy ? "Importing..." : "Import to database"}
        </button>
      </section>

      {error && (
        <pre className="whitespace-pre-wrap rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
          {error}
        </pre>
      )}

      {result && (
        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/25 p-4 sm:p-5">
          <p className="font-semibold text-emerald-300">Import complete</p>
          <p className="mt-2 text-sm text-zinc-300">
            <span className="font-medium text-emerald-200">{result.inserted}</span>{" "}
            inserted | <span className="text-zinc-400">{result.skipped}</span> skipped
            (duplicate) |{" "}
            <span className={result.failed.length ? "text-red-300" : "text-zinc-400"}>
              {result.failed.length}
            </span>{" "}
            failed | {result.total} total
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-red-300">
              {result.failed.slice(0, 15).map((f) => (
                <li key={f.index}>
                  #{f.index + 1}
                  {f.id ? ` (${f.id})` : ""}: {f.reason}
                </li>
              ))}
              {result.failed.length > 15 && (
                <li className="text-zinc-500">
                  ... and {result.failed.length - 15} more
                </li>
              )}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
