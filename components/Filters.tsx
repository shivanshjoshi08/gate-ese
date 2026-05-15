"use client";

import { useEffect } from "react";
import type { Filters as FiltersType } from "@/lib/types";
import { getYears } from "@/lib/questions";
import {
  ESE_PAPER_LABELS,
  getSubjectShort,
  getSubjectsForExam,
} from "@/lib/constants";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

interface FiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
}

export default function Filters({ filters, onChange }: FiltersProps) {
  const { exam } = useExam();
  const years = getYears(exam);
  const paperForSubjects =
    exam === "ESE" && filters.paper === "All" ? "P1" : filters.paper;
  const subjects = getSubjectsForExam(exam, paperForSubjects);
  const accent = EXAM_COLORS[exam];

  useEffect(() => {
    if (filters.exam !== exam) {
      onChange({
        ...filters,
        exam,
        paper: "All",
        subject: "All",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  const update = (key: keyof FiltersType, value: string | boolean) => {
    const next = { ...filters, [key]: value };
    if (key === "paper") {
      next.subject = "All";
    }
    onChange(next);
  };

  return (
    <div className="hide-in-focus border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
        {exam === "ESE" && (
          <Select
            label="Paper"
            value={filters.paper}
            onChange={(v) => update("paper", v)}
            accent={accent.accent}
            options={[
              { value: "All", label: ESE_PAPER_LABELS.All },
              { value: "PRE", label: ESE_PAPER_LABELS.PRE },
              { value: "P1", label: ESE_PAPER_LABELS.P1 },
              { value: "P2", label: ESE_PAPER_LABELS.P2 },
            ]}
          />
        )}
        <Select
          label="Subject"
          value={filters.subject}
          onChange={(v) => update("subject", v)}
          accent={accent.accent}
          options={[
            { value: "All", label: "All" },
            ...subjects.map((s) => ({
              value: s,
              label: getSubjectShort(s),
            })),
          ]}
        />
        <Select
          label="Difficulty"
          value={filters.difficulty}
          onChange={(v) => update("difficulty", v)}
          accent={accent.accent}
          options={[
            { value: "All", label: "All" },
            { value: "Easy", label: "Easy" },
            { value: "Medium", label: "Medium" },
            { value: "Hard", label: "Hard" },
          ]}
        />
        <Select
          label="Year"
          value={filters.year}
          onChange={(v) => update("year", v)}
          accent={accent.accent}
          options={[
            { value: "All", label: "All" },
            ...years.map((y) => ({ value: String(y), label: String(y) })),
          ]}
        />
        <Select
          label="Marks"
          value={filters.marks}
          onChange={(v) => update("marks", v)}
          accent={accent.accent}
          options={[
            { value: "All", label: "All" },
            { value: "1 Mark", label: "1 Mark" },
            { value: "2 Marks", label: "2 Marks" },
          ]}
        />
        <Select
          label="Type"
          value={filters.type}
          onChange={(v) => update("type", v)}
          accent={accent.accent}
          options={[
            { value: "All", label: "All" },
            { value: "MCQ", label: "MCQ" },
            { value: "NAT", label: "NAT" },
            { value: "MSQ", label: "MSQ" },
          ]}
        />
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={filters.reviewMode}
            onChange={(e) => update("reviewMode", e.target.checked)}
            className="rounded"
          />
          Review Mode
        </label>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  accent: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1"
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
