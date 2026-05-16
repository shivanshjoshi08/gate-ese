"use client";

import { useMemo } from "react";
import type { Filters as FiltersType, Question } from "@/lib/types";
import {
  defaultPracticeFilters,
  getSimplePracticeFilters,
} from "@/lib/available-filters";
import { EXAM_COLORS } from "@/lib/exam";

type Props = {
  bank: Question[];
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  accent?: string;
};

export default function SimplePracticeFilters({
  bank,
  filters,
  onChange,
  accent = EXAM_COLORS.ESE.accent,
}: Props) {
  const available = useMemo(
    () => getSimplePracticeFilters(bank, filters),
    [bank, filters],
  );

  const update = (key: keyof FiltersType, value: string) => {
    const next = { ...filters, [key]: value, type: "MCQ" as const };
    // if (key === "exam" && value !== "ESE") next.paper = "All";
    onChange(next);
  };

  // const showExam = available.exams.length > 1;
  // const showSubject = available.subjects.length > 1;
  const showDifficulty = available.difficulties.length > 1;

  if (!showDifficulty) return null;

  const active = filters.difficulty !== "All";

  return (
    <div className="hide-in-focus border-b border-study-border/60 bg-study-surface/50 px-4 py-2">
      <div className="mx-auto max-w-4xl">
        {/* Exam + subject filters — re-enable when needed
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {showExam && (
            <CompactSelect
              label="Exam"
              value={filters.exam}
              options={available.exams}
              accent={accent}
              onChange={(v) => update("exam", v)}
            />
          )}
          {showSubject && (
            <CompactSelect
              label="Subject"
              value={filters.subject}
              options={available.subjects}
              accent={accent}
              onChange={(v) => update("subject", v)}
              wide
            />
          )}
          {active && !showDifficulty && (
            <ClearButton onClear={() => onChange(defaultPracticeFilters())} />
          )}
        </div>
        */}
        {showDifficulty && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-study-muted">
              Difficulty
            </span>
            {available.difficulties.map((d) => {
              const on = filters.difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update("difficulty", d.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "text-white shadow-sm"
                      : "border border-study-border/80 bg-study-raised/50 text-study-muted hover:text-study-ink"
                  }`}
                  style={on ? { backgroundColor: accent } : undefined}
                >
                  {d.label}
                </button>
              );
            })}
            {active && (
              <ClearButton onClear={() => onChange(defaultPracticeFilters())} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClearButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="ml-auto text-xs font-medium text-study-muted underline-offset-2 hover:text-study-soft hover:underline"
    >
      Clear
    </button>
  );
}

/* Re-enable with exam/subject filters above
function CompactSelect({
  label,
  value,
  options,
  accent,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  accent: string;
  onChange: (v: string) => void;
  wide?: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border border-study-border/80 bg-study-surface/80 px-2 py-1 ${wide ? "min-w-0 flex-1 sm:max-w-xs" : ""}`}
    >
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-study-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="study-filter-select min-w-[5.5rem] max-w-full flex-1 rounded-md py-1.5 pl-8 text-sm font-medium"
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            className="bg-study-surface text-study-ink"
          >
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
*/


