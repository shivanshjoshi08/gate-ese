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

  const showSubject = available.subjects.length > 1;
  const showDifficulty = available.difficulties.length > 1;

  if (!showSubject && !showDifficulty) return null;

  const active =
    filters.subject !== "All" || filters.difficulty !== "All";

  const update = (key: keyof FiltersType, value: string) => {
    onChange({ ...filters, [key]: value, type: "MCQ" as const });
  };

  return (
    <div className="hide-in-focus border-b border-study-border/60 bg-study-surface/50 px-4 py-2">
      <div className="mx-auto max-w-4xl space-y-2">
        {showSubject && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-study-muted">
              Subject
            </span>
            {available.subjects.map((s) => {
              const on = filters.subject === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update("subject", s.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "text-white shadow-sm"
                      : "border border-study-border/80 bg-study-raised/50 text-study-muted hover:text-study-ink"
                  }`}
                  style={on ? { backgroundColor: accent } : undefined}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
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
        {showSubject && !showDifficulty && active && (
          <div className="flex justify-end">
            <ClearButton onClear={() => onChange(defaultPracticeFilters())} />
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
