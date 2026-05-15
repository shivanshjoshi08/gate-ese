"use client";

import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS, type ExamType } from "@/lib/exam";

export default function ExamSwitcher() {
  const { exam, setExam } = useExam();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl justify-center gap-1 px-4 py-2">
        {(["GATE", "ESE"] as ExamType[]).map((e) => {
          const active = exam === e;
          const colors = EXAM_COLORS[e];
          return (
            <button
              key={e}
              type="button"
              onClick={() => setExam(e)}
              className={`min-w-[100px] rounded-lg px-6 py-2 text-sm font-bold transition ${
                active
                  ? "text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={active ? { backgroundColor: colors.accent } : undefined}
            >
              {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}
