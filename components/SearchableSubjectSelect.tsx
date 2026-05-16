"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FilterOption } from "@/lib/available-filters";

type Props = {
  label?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  accent?: string;
  className?: string;
  placeholder?: string;
};

export default function SearchableSubjectSelect({
  label = "Subject",
  options,
  value,
  onChange,
  accent,
  className = "",
  placeholder = "Search subject…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected =
    options.find((o) => o.value === value) ?? options[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (options.length === 0) return null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label ? (
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-study-muted">
          {label}
        </span>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border border-study-border/80 bg-study-raised/50 px-3.5 py-2.5 text-left text-sm font-medium text-study-ink transition hover:border-study-border hover:bg-study-raised/80 sm:min-h-[40px]"
      >
        <span className="truncate">{selected?.label ?? "Select subject"}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-study-border/90 bg-study-surface shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          role="presentation"
        >
          <div className="border-b border-study-border/60 p-2">
            <div className="relative">
              <SearchIcon />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search subjects"
                className="w-full rounded-lg border border-study-border/70 bg-study-raised/60 py-2.5 pl-9 pr-3 text-sm text-study-ink placeholder:text-study-muted/70 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                autoComplete="off"
              />
            </div>
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-52 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-study-muted">
                No subjects match &ldquo;{query.trim()}&rdquo;
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li key={opt.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        close();
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-study-raised/70 ${
                        isSelected
                          ? "font-semibold text-study-ink"
                          : "text-study-muted hover:text-study-ink"
                      }`}
                      style={
                        isSelected && accent
                          ? {
                              boxShadow: `inset 3px 0 0 ${accent}`,
                            }
                          : undefined
                      }
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected ? (
                        <span className="ml-2 shrink-0 text-sky-400" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-study-muted transition ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-study-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
