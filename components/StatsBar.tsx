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
      <div className="mx-auto max-w-4xl px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-study-muted sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-1 sm:text-sm">
          <span className="col-span-2 sm:col-span-1">
            <strong className="text-study-ink">{attempted}</strong> tried ·{" "}
            <strong className="text-correct">{correct}</strong> ✓ ·{" "}
            <strong className="text-wrong">{wrong}</strong> ✗ ·{" "}
            <strong className="text-study-soft">{accuracy}%</strong>
          </span>
          <span>
            Streak <strong className="text-study-ink">{streak}</strong> 🔥
          </span>
        </div>
      </div>
    </div>
  );
}
