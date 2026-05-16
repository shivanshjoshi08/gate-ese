"use client";

interface StatsBarProps {
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  streak: number;
}

export default function StatsBar({
  attempted,
  correct,
  wrong,
  accuracy,
  streak,
}: StatsBarProps) {
  return (
    <div className="sticky top-14 z-40 border-b border-study-border/60 bg-study-surface/85 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-study-muted sm:text-sm">
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
      </div>
    </div>
  );
}
