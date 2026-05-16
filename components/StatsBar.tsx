"use client";

interface StatsBarProps {
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  streak: number;
  current: number;
  total: number;
}

export default function StatsBar({
  attempted,
  correct,
  wrong,
  accuracy,
  streak,
  current,
  total,
}: StatsBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="sticky top-14 z-40 border-b border-study-border/60 bg-study-surface/85 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-study-muted sm:text-sm">
          <span>
            This set:{" "}
            <strong className="text-study-ink">
              {total === 0 ? "—" : `${current}/${total}`}
            </strong>
          </span>
          <span className="hidden text-study-border sm:inline" aria-hidden>
            ·
          </span>
          <span>
            All-time:{" "}
            <strong className="text-study-ink">{attempted}</strong> tried ·{" "}
            <strong className="text-correct">{correct}</strong> ✓ ·{" "}
            <strong className="text-wrong">{wrong}</strong> ✗ ·{" "}
            <strong className="text-study-soft">{accuracy}%</strong>
          </span>
          <span className="hidden text-study-border sm:inline" aria-hidden>
            ·
          </span>
          <span>
            Streak <strong className="text-study-ink">{streak}</strong> 🔥
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-study-raised">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-teal-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={total || 1}
          />
        </div>
      </div>
    </div>
  );
}
