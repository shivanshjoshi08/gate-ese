"use client";

import { useMemo, type ReactNode } from "react";
import type { Filters as FiltersType, Question } from "@/lib/types";
import {
  defaultPracticeFilters,
  FILTER_TYPE_MCQ,
  FILTER_TYPE_NUMERICALS,
  getSimplePracticeFilters,
  isNumericalsFilter,
} from "@/lib/available-filters";
import { EXAM_COLORS } from "@/lib/exam";
import SearchableSubjectSelect from "@/components/SearchableSubjectSelect";

type Props = {
  bank: Question[];
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  accent?: string;
};

function FilterChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-study-muted">
        {label}
      </span>
      <div className="filter-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
        {children}
      </div>
    </div>
  );
}

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
  const showNumericals = available.hasNumericals;

  if (!showSubject && !showDifficulty && !showNumericals) return null;

  const active =
    filters.subject !== "All" ||
    filters.difficulty !== "All" ||
    isNumericalsFilter(filters);

  const update = (key: keyof FiltersType, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const chipClass = (on: boolean) =>
    `shrink-0 rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:py-1.5 ${
      on
        ? "text-white shadow-sm"
        : "border border-study-border/80 bg-study-raised/50 text-study-muted hover:text-study-ink"
    }`;

  return (
    <div className="hide-in-focus border-b border-study-border/60 bg-study-surface/50 px-4 py-2.5">
      <div className="mx-auto max-w-4xl space-y-3">
        {showSubject && (
          <SearchableSubjectSelect
            label="Subject"
            options={available.subjects}
            value={filters.subject}
            onChange={(v) => update("subject", v)}
            accent={accent}
          />
        )}
        {showNumericals && (
          <FilterChipRow label="Question type">
            <button
              type="button"
              onClick={() => update("type", FILTER_TYPE_MCQ)}
              className={chipClass(!isNumericalsFilter(filters))}
              style={
                !isNumericalsFilter(filters)
                  ? { backgroundColor: accent }
                  : undefined
              }
            >
              MCQ
            </button>
            <button
              type="button"
              onClick={() => update("type", FILTER_TYPE_NUMERICALS)}
              className={chipClass(isNumericalsFilter(filters))}
              style={
                isNumericalsFilter(filters)
                  ? { backgroundColor: accent }
                  : undefined
              }
            >
              Numericals
            </button>
          </FilterChipRow>
        )}
        {showDifficulty && (
          <FilterChipRow label="Difficulty">
            {available.difficulties.map((d) => {
              const on = filters.difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update("difficulty", d.value)}
                  className={chipClass(on)}
                  style={on ? { backgroundColor: accent } : undefined}
                >
                  {d.label}
                </button>
              );
            })}
          </FilterChipRow>
        )}
        {active && (
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
      className="min-h-[44px] px-2 text-xs font-medium text-study-muted underline-offset-2 hover:text-study-soft hover:underline sm:min-h-0"
    >
      Clear filters
    </button>
  );
}
