"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiPerformanceAnalysis, PerformanceSnapshot } from "@/lib/performance-snapshot";

const SESSION_PREFIX = "gate-ai-performance:";

type Props = {
  snapshot: PerformanceSnapshot | null;
  fingerprint: string;
  minAttempts: number;
};

export default function AiPerformanceInsights({
  snapshot,
  fingerprint,
  minAttempts,
}: Props) {
  const [analysis, setAnalysis] = useState<AiPerformanceAnalysis | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const load = useCallback(
    async (force = false) => {
      if (!snapshot) return;
      if (snapshot.totals.attempted < minAttempts) {
        setAnalysis(null);
        setError(null);
        return;
      }

      const storageKey = SESSION_PREFIX + fingerprint;
      if (!force && typeof sessionStorage !== "undefined") {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as {
              analysis?: AiPerformanceAnalysis | null;
            };
            if (parsed.analysis) {
              setAnalysis(parsed.analysis);
              setRawFallback(null);
              setCached(true);
              return;
            }
          } catch {
            /* refetch */
          }
        }
      }

      setLoading(true);
      setError(null);
      setCached(false);

      try {
        const res = await fetch("/api/ai/performance-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshot, cacheKey: fingerprint }),
        });
        const data = (await res.json()) as {
          analysis?: AiPerformanceAnalysis | null;
          raw?: string;
          error?: string;
          cached?: boolean;
        };

        if (!res.ok) {
          setAnalysis(null);
          setRawFallback(null);
          setError(data.error ?? "Could not load AI analysis.");
          return;
        }

        if (data.analysis) {
          setAnalysis(data.analysis);
          setRawFallback(null);
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({ analysis: data.analysis }),
          );
        } else if (data.raw) {
          setAnalysis(null);
          setRawFallback(data.raw);
        }
        setCached(!!data.cached);
      } catch {
        setError("Network error while loading AI analysis.");
      } finally {
        setLoading(false);
      }
    },
    [snapshot, fingerprint, minAttempts],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  if (!snapshot) return null;

  if (snapshot.totals.attempted < minAttempts) {
    return (
      <section className="mt-8 rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-200">AI study coach</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Attempt at least {minAttempts} questions to get a personalized analysis
          of strengths, weaknesses, and what to study next.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {snapshot.totals.attempted} / {minAttempts} attempted so far
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">AI study coach</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Powered by your practice stats{cached ? " · cached" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Refresh analysis"}
        </button>
      </div>

      {loading && !analysis && (
        <p className="mt-4 text-sm text-zinc-400">Building your personalized report…</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          {error}
        </p>
      )}

      {analysis && (
        <div className="mt-4 space-y-6">
          <p className="text-sm leading-relaxed text-zinc-300">{analysis.overview}</p>

          {analysis.strengths.length > 0 && (
            <InsightBlock
              title="Strengths"
              variant="strength"
              items={analysis.strengths.map((s) => ({
                label: s.area,
                detail: s.detail,
              }))}
            />
          )}

          {analysis.weaknesses.length > 0 && (
            <InsightBlock
              title="Weak areas"
              variant="weakness"
              items={analysis.weaknesses.map((s) => ({
                label: s.area,
                detail: s.detail,
              }))}
            />
          )}

          {analysis.prioritySubjects.length > 0 && (
            <InsightBlock
              title="Subjects to prioritize"
              variant="priority"
              items={analysis.prioritySubjects.map((s) => ({
                label: s.subject,
                detail: s.reason,
              }))}
            />
          )}

          {analysis.topicFocus.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Topic focus
              </h3>
              <ul className="mt-2 space-y-2">
                {analysis.topicFocus.map((t) => (
                  <li
                    key={t.topic}
                    className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 px-3 py-2.5"
                  >
                    <p className="font-medium text-zinc-200">{t.topic}</p>
                    <p className="mt-0.5 text-sm text-zinc-400">{t.action}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.studyPlan && (
            <div className="rounded-lg border border-zinc-700/60 bg-zinc-950/40 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-300">7-day focus</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {analysis.studyPlan}
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && !analysis && rawFallback && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {rawFallback}
        </p>
      )}
    </section>
  );
}

function InsightBlock({
  title,
  items,
  variant,
}: {
  title: string;
  variant: "strength" | "weakness" | "priority";
  items: { label: string; detail: string }[];
}) {
  const border =
    variant === "strength"
      ? "border-emerald-900/50"
      : variant === "weakness"
        ? "border-red-900/50"
        : "border-violet-900/50";
  const badge =
    variant === "strength"
      ? "text-emerald-300"
      : variant === "weakness"
        ? "text-red-300"
        : "text-violet-300";

  return (
    <div>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${badge}`}>
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={`rounded-lg border bg-zinc-950/40 px-3 py-2.5 ${border}`}
          >
            <p className="font-medium text-zinc-200">{item.label}</p>
            <p className="mt-0.5 text-sm text-zinc-400">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
