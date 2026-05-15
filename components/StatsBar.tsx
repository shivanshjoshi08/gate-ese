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
    <div className="sticky top-[105px] z-40 border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <Stat label="Attempted" value={attempted} />
          <Stat label="Correct" value={correct} className="text-correct" />
          <Stat label="Wrong" value={wrong} className="text-wrong" />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Streak" value={`${streak} 🔥`} />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-gray-500">
          {current} / {total} in current set
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="text-gray-500">{label}</span>{" "}
      <span className="font-semibold">{value}</span>
    </span>
  );
}
