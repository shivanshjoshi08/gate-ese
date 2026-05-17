"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuestionDocument } from "@/lib/question-types";
import { createParagraph } from "@/lib/rich-content";
import RichTextEditor from "./RichTextEditor";
import QuestionPreview from "./QuestionPreview";

interface QuestionFormProps {
  initial: QuestionDocument;
  onSave: (doc: QuestionDocument) => Promise<QuestionDocument>;
  onAfterPublish?: (doc: QuestionDocument) => void;
}

import { PRACTICE_FILTER_SUBJECTS } from "@/lib/practice-subjects";

const SUBJECTS = [...PRACTICE_FILTER_SUBJECTS];

export default function QuestionForm({
  initial,
  onSave,
  onAfterPublish,
}: QuestionFormProps) {
  const [doc, setDoc] = useState<QuestionDocument>(initial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = useCallback(
    (partial: Partial<QuestionDocument>) =>
      setDoc((d) => ({ ...d, ...partial })),
    []
  );

  useEffect(() => {
    if (doc.id.startsWith("new_")) return undefined;
    const t = setInterval(async () => {
      try {
        const saved = await onSave(doc);
        setDoc(saved);
        setLastSaved(new Date().toLocaleTimeString());
      } catch {
        /* ignore */
      }
    }, 30000);
    return () => clearInterval(t);
  }, [doc, onSave]);

  /* eslint-disable react-hooks/exhaustive-deps -- reset editor only when question id changes */
  useEffect(() => {
    setDoc(initial);
  }, [initial.id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave({ ...doc, status: "draft" });
      setDoc(saved);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave({ ...doc, status: "published" });
      setDoc(saved);
      onAfterPublish?.(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const updateOption = (index: number, text: string) => {
    const options = [...doc.options];
    options[index] = { ...options[index], body: createParagraph(text) };
    patch({ options });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
            Practice
          </span>
          <select
            value={doc.type}
            onChange={(e) => {
              const type = e.target.value as QuestionDocument["type"];
              patch({
                type,
                numerical:
                  type === "numerical" ? true : doc.numerical,
              });
            }}
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="mcq">MCQ</option>
            <option value="msq">MSQ</option>
            <option value="numerical">Numerical (number input)</option>
            <option value="subjective">Subjective</option>
          </select>
          <label className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={doc.numerical === true}
              onChange={(e) => patch({ numerical: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-500"
            />
            Numericals filter
          </label>
          <select
            value={doc.exam === "GATE" ? "GATE" : "PRE"}
            onChange={(e) => {
              const track = e.target.value;
              if (track === "GATE") {
                patch({ exam: "GATE", paper: null });
              } else {
                patch({ exam: "ESE", paper: "PRE" });
              }
            }}
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="PRE">PRE (ESE Prelims)</option>
            <option value="GATE">GATE</option>
          </select>
          <select
            value={doc.difficulty}
            onChange={(e) =>
              patch({
                difficulty: e.target.value as QuestionDocument["difficulty"],
              })
            }
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={doc.marks}
            onChange={(e) =>
              patch({ marks: Number(e.target.value) as 1 | 2 })
            }
            className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value={1}>1 mark</option>
            <option value={2}>2 marks</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Subject</label>
          <select
            value={doc.subject}
            onChange={(e) => {
              const subject = e.target.value;
              patch({
                subject,
              });
            }}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Topic</label>
          <input
            value={doc.topic}
            onChange={(e) => patch({ topic: e.target.value })}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Year (filters)</label>
          <input
            type="number"
            min={1990}
            max={2100}
            value={doc.year}
            onChange={(e) =>
              patch({ year: Number(e.target.value) || doc.year })
            }
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Question stem</label>
          <RichTextEditor
            value={doc.stem}
            onChange={(stem) => patch({ stem })}
            minHeight="200px"
          />
        </div>

        {(doc.type === "mcq" || doc.type === "msq") && (
          <div className="space-y-3">
            <h3 className="font-medium text-zinc-100">Options</h3>
            {doc.options.map((opt, i) => (
              <div key={opt.id}>
                <label className="text-xs text-zinc-500">{opt.label}</label>
                <input
                  value={opt.body.plainText ?? ""}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-zinc-200">Correct answer</label>
              <select
                value={
                  Array.isArray(doc.correctAnswer)
                    ? doc.correctAnswer[0]
                    : String(doc.correctAnswer ?? "A")
                }
                onChange={(e) => patch({ correctAnswer: e.target.value })}
                className="ml-2 rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-zinc-100"
              >
                {doc.options.map((o) => (
                  <option key={o.id} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {doc.type === "numerical" && (
          <div>
            <label className="text-sm text-zinc-200">Correct answer</label>
            <input
              type="text"
              value={String(doc.correctAnswer ?? "")}
              onChange={(e) => patch({ correctAnswer: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Solution</label>
          <RichTextEditor
            value={doc.solution}
            onChange={(solution) => patch({ solution })}
            minHeight="120px"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200">Tags</label>
          <input
            value={doc.tags.join(", ")}
            onChange={(e) =>
              patch({
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
          {onAfterPublish && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Publish
            </button>
          )}
          {lastSaved && (
            <span className="self-center text-xs text-zinc-500">
              Autosaved {lastSaved}
            </span>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <h3 className="mb-3 font-semibold text-zinc-100">Live preview</h3>
        <QuestionPreview question={doc} />
      </div>
    </div>
  );
}
