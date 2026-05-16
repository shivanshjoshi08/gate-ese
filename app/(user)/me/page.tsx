"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { CSSProperties } from "react";
import type { ExamType, ProgressData } from "@/lib/types";
import { getActivePracticeLevel } from "@/lib/practice-levels";
import {
  loadProgress,
  resetAllProgress,
  saveProgress,
  getStats,
} from "@/lib/storage";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

export default function MyProgressPage() {
  const { exam } = useExam();
  const accent = EXAM_COLORS[exam];
  const { data: session, status } = useSession();
  const [epoch, setEpoch] = useState(0);
  const [syncOpen, setSyncOpen] = useState(false);

  const userId = session?.user?.id;
  const canCloudSync =
    status === "authenticated" && !!userId && userId !== "admin";

  const progress = useMemo(() => loadProgress(exam), [exam, epoch]);
  const stats = useMemo(() => getStats(exam), [exam, epoch]);

  const practiceLevel = getActivePracticeLevel(
    progress.aiPracticeSetsCompleted ?? 0,
  );
  const pyqLevel = getActivePracticeLevel(
    progress.pyqPracticeSetsCompleted ?? 0,
  );

  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const bump = () => setEpoch((e) => e + 1);

  const pushExamToCloud = async (ex: ExamType) => {
    const body = loadProgress(ex);
    const res = await fetch("/api/user/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam: ex, progress: body }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `Save failed (${ex}).`);
    }
  };

  const syncNow = useCallback(async () => {
    if (!canCloudSync) return;
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      await pushExamToCloud("ESE");
      await pushExamToCloud("GATE");
      setSyncMsg("Progress saved to your account.");
    } catch (e) {
      setSyncMsg(
        e instanceof Error ? e.message : "Could not sync. Try again later.",
      );
    } finally {
      setSyncBusy(false);
    }
  }, [canCloudSync]);

  const pullFromServer = useCallback(async () => {
    if (!canCloudSync) return;
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const exams = ["ESE", "GATE"] as const;
      for (const ex of exams) {
        const res = await fetch(`/api/user/progress?exam=${ex}`, {
          cache: "no-store",
        });
        const j = (await res.json()) as {
          error?: string;
          progress: ProgressData | null;
        };
        if (!res.ok) throw new Error(j.error ?? `Pull failed (${ex}).`);
        if (j.progress && typeof j.progress === "object") {
          const merged = mergeImportedProgress(loadProgress(ex), j.progress);
          saveProgress(merged, ex);
        }
      }
      bump();
      setSyncMsg("Progress restored on this device.");
    } catch (e) {
      setSyncMsg(
        e instanceof Error ? e.message : "Could not load from account.",
      );
    } finally {
      setSyncBusy(false);
    }
  }, [canCloudSync]);

  const handleResetAll = useCallback(async () => {
    const ok = window.confirm(
      "Reset all progress on this device?\n\nThis clears attempts, bookmarks, practice levels, and streaks for both GATE and ESE. This cannot be undone.",
    );
    if (!ok) return;

    setResetBusy(true);
    setResetMsg(null);
    setSyncMsg(null);

    try {
      resetAllProgress();

      if (canCloudSync) {
        const res = await fetch("/api/user/progress", { method: "DELETE" });
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error ?? "Could not clear account progress.");
        }
        setResetMsg("All progress reset on this device and your account.");
      } else {
        setResetMsg("All progress reset on this device.");
      }

      bump();
    } catch (e) {
      setResetMsg(
        e instanceof Error
          ? e.message
          : "Local progress was cleared, but cloud reset failed.",
      );
      bump();
    } finally {
      setResetBusy(false);
    }
  }, [canCloudSync]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-lg items-center justify-center px-4 text-study-muted">
        Loading...
      </div>
    );
  }

  const accuracyPct = stats.accuracy;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-study-ink">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-block text-sm text-study-muted transition hover:text-study-soft"
        >
          Home
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">My progress</h1>
        <p className="mt-2 text-sm text-study-muted">
          {exam} prep - pick up where you left off
        </p>
      </div>

      {session?.user?.id === "admin" ? (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-study-soft">
          Admin account - stats below are from this browser only.
        </p>
      ) : session?.user?.email ? (
        <p className="mb-6 text-center text-xs text-study-muted">
          Signed in as {session.user.email}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <LevelCard
          label="Practice"
          level={practiceLevel}
          accentClass="border-sky-400/40 bg-sky-500/[0.08]"
          href="/practice?bank=ai"
          buttonStyle={{ backgroundColor: accent.accent }}
        />
        <LevelCard
          label="PYQ"
          level={pyqLevel}
          accentClass="border-emerald-400/40 bg-emerald-500/[0.08]"
          href="/practice?bank=pyq"
          buttonClass="bg-emerald-600 hover:bg-emerald-500"
        />
      </div>

      <div
        className="mt-6 rounded-2xl border border-study-border/80 bg-study-surface/90 p-5"
        style={{ borderLeftColor: accent.accent, borderLeftWidth: 3 }}
      >
        <h2 className="text-sm font-semibold text-study-soft">Your stats</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <StatBlock label="Questions tried" value={String(stats.attempted)} />
          <StatBlock label="Accuracy" value={`${accuracyPct}%`} />
          <StatBlock
            label="Correct"
            value={String(stats.correct)}
            highlight="correct"
          />
          <StatBlock label="Streak" value={`${stats.streak} days`} />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-study-muted">
            <span>Accuracy</span>
            <span>{accuracyPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-study-raised">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 transition-all"
              style={{ width: `${Math.min(100, accuracyPct)}%` }}
            />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-study-muted">
          <strong className="text-study-ink">{progress.bookmarks.length}</strong>{" "}
          bookmarked
          {progress.bookmarks.length > 0 && (
            <>
              {" "}
              |{" "}
              <Link href="/bookmarks" className="text-sky-400 hover:underline">
                Review
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/practice?bank=ai"
          className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-105"
          style={{ backgroundColor: accent.accent }}
        >
          Continue Practice
        </Link>
        <Link
          href="/practice?bank=pyq"
          className="flex w-full items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-600/20 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/30"
        >
          Continue PYQ
        </Link>
        <Link
          href="/attempts"
          className="flex w-full items-center justify-center rounded-xl border border-study-border bg-study-raised/40 py-3 text-sm font-semibold text-study-soft transition hover:bg-study-raised/70"
        >
          View my attempts
        </Link>
        <Link
          href="/analysis"
          className="text-center text-sm text-study-muted hover:text-study-soft"
        >
          View detailed analysis
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-red-900/40 bg-red-950/20 p-5">
        <h2 className="text-sm font-semibold text-red-200/95">Reset progress</h2>
        <p className="mt-2 text-xs text-study-muted">
          Start fresh: clears attempts, bookmarks, levels, and streaks for GATE and
          ESE on this device
          {canCloudSync ? " and on your signed-in account" : ""}.
        </p>
        <button
          type="button"
          disabled={resetBusy || syncBusy}
          onClick={() => void handleResetAll()}
          className="mt-4 w-full rounded-xl border border-red-500/50 bg-red-600/20 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-600/30 disabled:opacity-40"
        >
          {resetBusy ? "Resetting..." : "Reset all progress"}
        </button>
        {resetMsg && (
          <p className="mt-3 text-sm text-red-200/90">{resetMsg}</p>
        )}
      </div>

      {canCloudSync && (
        <div className="mt-6 rounded-2xl border border-study-border/60 bg-study-surface/50">
          <button
            type="button"
            onClick={() => setSyncOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-study-soft"
          >
            Sync across devices
            <span className="text-study-muted">{syncOpen ? "-" : "+"}</span>
          </button>
          {syncOpen && (
            <div className="border-t border-study-border/60 px-4 pb-4 pt-3">
              <p className="text-xs text-study-muted">
                Save progress to your account or load it on a new device.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={syncBusy}
                  onClick={() => void syncNow()}
                  className="rounded-lg bg-study-raised px-4 py-2 text-sm font-medium text-study-ink hover:bg-study-muted/20 disabled:opacity-40"
                >
                  Save now
                </button>
                <button
                  type="button"
                  disabled={syncBusy}
                  onClick={() => void pullFromServer()}
                  className="rounded-lg border border-study-border px-4 py-2 text-sm font-medium text-study-soft hover:bg-study-raised/50 disabled:opacity-40"
                >
                  Load from account
                </button>
              </div>
              {syncMsg && (
                <p className="mt-3 text-sm text-emerald-300/90">{syncMsg}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LevelCard({
  label,
  level,
  accentClass,
  href,
  buttonStyle,
  buttonClass,
}: {
  label: string;
  level: number;
  accentClass: string;
  href: string;
  buttonStyle?: CSSProperties;
  buttonClass?: string;
}) {
  return (
    <div className={`flex flex-col rounded-2xl border p-5 ${accentClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-study-muted">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums text-study-ink">
        Level {level}
      </p>
      <p className="mt-1 text-xs text-study-muted">Your current level</p>
      <Link
        href={href}
        className={`mt-4 inline-flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition hover:brightness-105 ${buttonClass ?? ""}`}
        style={buttonStyle}
      >
        Start
      </Link>
    </div>
  );
}

function StatBlock({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "correct";
}) {
  return (
    <div className="rounded-xl bg-study-raised/40 px-3 py-2.5">
      <p className="text-xs text-study-muted">{label}</p>
      <p
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          highlight === "correct" ? "text-correct" : "text-study-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function mergeImportedProgress(
  local: ProgressData,
  remote: ProgressData,
): ProgressData {
  const byId = new Map<string, ProgressData["attempts"][number]>();
  for (const a of local.attempts) {
    byId.set(a.questionId, a);
  }
  for (const a of remote.attempts ?? []) {
    const prev = byId.get(a.questionId);
    if (!prev || a.timestamp > prev.timestamp) {
      byId.set(a.questionId, a);
    }
  }
  const bookmarks = Array.from(
    new Set([...(local.bookmarks ?? []), ...(remote.bookmarks ?? [])]),
  );
  const mergedAttempts = Array.from(byId.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const aiSets = Math.max(
    local.aiPracticeSetsCompleted ?? 0,
    remote.aiPracticeSetsCompleted ?? 0,
  );
  const pyqSets = Math.max(
    local.pyqPracticeSetsCompleted ?? 0,
    remote.pyqPracticeSetsCompleted ?? 0,
  );
  return {
    ...local,
    attempts: mergedAttempts,
    bookmarks,
    aiPracticeSetsCompleted: aiSets,
    pyqPracticeSetsCompleted: pyqSets,
    aiLastRoundQuestionIds:
      remote.aiLastRoundQuestionIds?.length
        ? (remote.aiLastRoundQuestionIds ?? [])
        : (local.aiLastRoundQuestionIds ?? []),
    lastVisited: new Date().toISOString(),
    session: local.session ?? remote.session ?? null,
  };
}
