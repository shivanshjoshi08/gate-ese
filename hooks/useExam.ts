"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExamType } from "@/lib/exam";
import { getSelectedExam, setSelectedExam } from "@/lib/exam";

export function useExam() {
  const [exam, setExamState] = useState<ExamType>("GATE");

  useEffect(() => {
    setExamState(getSelectedExam());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ExamType>).detail;
      setExamState(detail ?? getSelectedExam());
    };
    window.addEventListener("exam-changed", handler);
    return () => window.removeEventListener("exam-changed", handler);
  }, []);

  const setExam = useCallback((e: ExamType) => {
    setSelectedExam(e);
    setExamState(e);
  }, []);

  return { exam, setExam };
}
