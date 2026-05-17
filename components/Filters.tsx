"use client";

import { useEffect } from "react";
import type { ExamType, Filters as FiltersType, Question } from "@/lib/types";
import { getYears } from "@/lib/questions";
import {
  ESE_PAPER_LABELS,
  getSubjectShort,
  getSubjectsForExam,
} from "@/lib/constants";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";
import {
  matchesPracticeExamFilter,
  normalizePracticeExamFilter,
  practiceTrackColors,
} from "@/lib/practice-track";

interface FiltersProps {
  bank: Question[];
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  /** When true, filter exam is not overwritten by {@link useExam} (PYQ shows GATE+ESE items). */
  suspendExamSync?: boolean;
}

function clearedFilters(exam: FiltersType["exam"]): FiltersType {
  return {
    exam,
    paper: "All",
    subject: "All",
    difficulty: "All",
    year: "All",
    marks: "All",
    type: "All",
    reviewMode: false,
  };
}

export default function Filters({
  bank,
  filters,
  onChange,
  suspendExamSync = false,
}: FiltersProps) {
  const { exam } = useExam();
  const listExam = suspendExamSync ? filters.exam : exam;
  const years = getYears(bank, listExam);

  let subjects: string[];
  if (suspendExamSync) {
    let pool = bank;
    if (filters.exam !== "All") {
      pool = pool.filter((q) =>
        matchesPracticeExamFilter(
          q,
          normalizePracticeExamFilter(filters.exam),
        ),
      );
    }
    if (filters.paper !== "All") {
      pool = pool.filter((q) => q.paper === filters.paper);
    }
    subjects = Array.from(new Set(pool.map((q) => q.subject))).sort();
  } else {
    const paperForSubjects =
      exam === "ESE" && filters.paper === "All" ? "P1" : filters.paper;
    subjects = getSubjectsForExam(exam, paperForSubjects);
  }

  const trackFilter = suspendExamSync
    ? normalizePracticeExamFilter(filters.exam)
    : null;
  const accentColor = suspendExamSync
    ? trackFilter === "All"
      ? "#64748b"
      : practiceTrackColors(trackFilter!).accent
    : EXAM_COLORS[exam].accent;

  useEffect(() => {
    if (suspendExamSync) return;
    const appExamTyped = exam;
    if (filters.exam !== appExamTyped) {
      onChange({
        ...filters,
        exam: appExamTyped,
        paper: "All",
        subject: "All",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, suspendExamSync]);

  const update = (key: keyof FiltersType, value: string | boolean) => {
    const next: FiltersType = { ...filters, [key]: value };
    if (key === "paper") {
      next.subject = "All";
    }
    if (
      key === "exam" &&
      (value === "GATE" || value === "All")
    ) {
      next.paper = "All";
    }
    onChange(next);
  };

  const anyAdvancedActive =
    filters.difficulty !== "All" ||
    filters.year !== "All" ||
    filters.marks !== "All" ||
    filters.type !== "All" ||
    filters.reviewMode;

  return (
    <div className="hide-in-focus border-b border-study-border/80 bg-study-page/95 px-4 py-4">
      <div className="mx-auto max-w-4xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-study-muted">
          Filters
        </p>
        <div className="flex flex-wrap items-end gap-3">
          {suspendExamSync && (
            <Field label="Exam">
              <Select
                value={filters.exam}
                onChange={(v) => update("exam", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: "GATE + ESE" },
                  { value: "GATE", label: "GATE" },
                  { value: "ESE", label: "ESE" },
                ]}
              />
            </Field>
          )}
          {((!suspendExamSync && exam === "ESE") ||
            (suspendExamSync &&
              (filters.exam === "ESE" || filters.exam === "All"))) && (
            <Field label="Paper">
              <Select
                value={filters.paper}
                onChange={(v) => update("paper", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: ESE_PAPER_LABELS.All },
                  { value: "PRE", label: ESE_PAPER_LABELS.PRE },
                  { value: "P1", label: ESE_PAPER_LABELS.P1 },
                  { value: "P2", label: ESE_PAPER_LABELS.P2 },
                ]}
              />
            </Field>
          )}
          <Field label="Subject" className="min-w-[10rem] flex-1 sm:min-w-[14rem]">
            <Select
              value={filters.subject}
              onChange={(v) => update("subject", v)}
              accent={accentColor}
              options={[
                { value: "All", label: "All subjects" },
                ...subjects.map((s) => ({
                  value: s,
                  label: getSubjectShort(s),
                })),
              ]}
            />
          </Field>
          <button
            type="button"
            onClick={() =>
              onChange(clearedFilters(suspendExamSync ? "All" : exam))
            }
            className="mb-0.5 rounded-lg border border-study-border bg-study-raised/50 px-3 py-2 text-sm text-study-soft hover:bg-study-raised"
          >
            Reset
          </button>
        </div>

        <details className="group rounded-2xl border border-study-border/90 bg-study-surface/70 p-3 shadow-inner shadow-black/5">
          <summary className="cursor-pointer list-none text-sm font-medium text-study-ink marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              Optional filters
              {anyAdvancedActive && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-normal text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  On
                </span>
              )}
            </span>
          </summary>
          <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-study-border/70 pt-3">
            <Field label="Difficulty">
              <Select
                value={filters.difficulty}
                onChange={(v) => update("difficulty", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: "Any" },
                  { value: "Easy", label: "Easy" },
                  { value: "Medium", label: "Medium" },
                  { value: "Hard", label: "Hard" },
                ]}
              />
            </Field>
            <Field label="Year">
              <Select
                value={filters.year}
                onChange={(v) => update("year", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: "Any year" },
                  ...years.map((y) => ({ value: String(y), label: String(y) })),
                ]}
              />
            </Field>
            <Field label="Marks">
              <Select
                value={filters.marks}
                onChange={(v) => update("marks", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: "Any" },
                  { value: "1 Mark", label: "1 mark" },
                  { value: "2 Marks", label: "2 marks" },
                ]}
              />
            </Field>
            <Field label="Question type">
              <Select
                value={filters.type}
                onChange={(v) => update("type", v)}
                accent={accentColor}
                options={[
                  { value: "All", label: "Any" },
                  { value: "MCQ", label: "MCQ" },
                  { value: "NAT", label: "Numerical" },
                  { value: "MSQ", label: "MSQ" },
                ]}
              />
            </Field>
            <label className="flex max-w-[18rem] cursor-pointer items-start gap-2 rounded-xl border border-study-border bg-study-raised/40 px-3 py-2 text-sm text-study-soft transition hover:bg-study-raised/70">
              <input
                type="checkbox"
                checked={filters.reviewMode}
                onChange={(e) => update("reviewMode", e.target.checked)}
                className="mt-0.5 rounded border-study-border bg-study-surface"
              />
              <span>
                <span className="font-medium text-study-ink">Repeat</span>
                <span className="block text-xs text-study-muted">
                  Include questions you&apos;ve tried.
                </span>
              </span>
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-study-muted">{label}</span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  accent: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[2.5rem] min-w-[7rem] rounded-lg border border-study-border bg-study-raised px-2.5 py-2 text-sm text-study-ink focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-study-page"
      style={
        {
          ["--tw-ring-color" as string]: accent,
        } as React.CSSProperties
      }
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
