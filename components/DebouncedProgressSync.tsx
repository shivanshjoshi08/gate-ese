"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { ExamType } from "@/lib/types";
import { loadProgress } from "@/lib/storage";

const DEBOUNCE_MS = 2500;

export default function DebouncedProgressSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated" || !session?.user?.id) return;
    if (session.user.id === "admin") return;

    const timers: Partial<Record<ExamType, number>> = {};

    const flush = async (exam: ExamType) => {
      const progress = loadProgress(exam);
      try {
        await fetch("/api/user/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exam, progress }),
        });
      } catch {
        /* offline / server down */
      }
    };

    const onSaved = (ev: Event) => {
      const ce = ev as CustomEvent<{ exam?: ExamType }>;
      const exam = ce.detail?.exam;
      if (exam !== "ESE" && exam !== "GATE") return;
      const prev = timers[exam];
      if (prev !== undefined) window.clearTimeout(prev);
      timers[exam] = window.setTimeout(() => {
        void flush(exam);
      }, DEBOUNCE_MS);
    };

    window.addEventListener(
      "gate-progress-saved",
      onSaved as EventListener,
    );
    return () => {
      window.removeEventListener(
        "gate-progress-saved",
        onSaved as EventListener,
      );
      (["ESE", "GATE"] as const).forEach((exam) => {
        const t = timers[exam];
        if (t !== undefined) window.clearTimeout(t);
      });
    };
  }, [session?.user?.id, status]);

  return null;
}
