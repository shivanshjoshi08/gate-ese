"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  getSubjectShort,
  getSubjectsForExam,
} from "@/lib/constants";
import { loadProgress, getSubjectStats } from "@/lib/storage";
import { usePracticeBank } from "@/hooks/PracticeBankContext";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

const chartGrid = "#3f3f46";
const chartTick = { fill: "#a1a1aa", fontSize: 11 };
const chartTooltip = {
  backgroundColor: "#18181b",
  border: "1px solid #52525b",
  borderRadius: "8px",
};

export default function AnalysisPage() {
  const { exam } = useExam();
  const { questions: bank } = usePracticeBank();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { attempts } = mounted ? loadProgress(exam) : { attempts: [] };
  const accent = EXAM_COLORS[exam];

  const questionMap = useMemo(
    () => new Map(bank.map((q) => [q.id, q])),
    [bank]
  );

  const subjectData = useMemo(() => {
    const subjects = getSubjectsForExam(exam, "All");
    return subjects.map((subject) => {
      const { attempted, accuracy } = getSubjectStats(subject, exam);
      return {
        name: getSubjectShort(subject),
        accuracy,
        attempted,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- getSubjectStats reads latest attempts from localStorage
  }, [exam, attempts.length, mounted]);

  const paperData = useMemo(() => {
    if (exam !== "ESE") return [];
    const papers = ["PRE", "P1", "P2"] as const;
    return papers.map((paper) => {
      const paperAttempts = attempts.filter((a) => {
        const q = questionMap.get(a.questionId);
        return q?.paper === paper;
      });
      const correct = paperAttempts.filter((a) => a.correct).length;
      const attempted = paperAttempts.length;
      return {
        name: paper,
        accuracy:
          attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
        attempted,
      };
    });
  }, [exam, attempts, questionMap]);

  const dailyData = useMemo(() => {
    const byDay: Record<string, { date: string; count: number }> = {};
    for (const a of attempts) {
      const d = new Date(a.timestamp).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      if (!byDay[d]) byDay[d] = { date: d, count: 0 };
      byDay[d].count++;
    }
    return Object.values(byDay).slice(-14);
  }, [attempts]);

  const topicMisses = useMemo(() => {
    const map: Record<string, { topic: string; wrong: number; total: number }> =
      {};
    for (const a of attempts) {
      const key = `${a.subject}::${a.topic}`;
      if (!map[key]) map[key] = { topic: a.topic, wrong: 0, total: 0 };
      map[key].total++;
      if (!a.correct) map[key].wrong++;
    }
    return Object.values(map)
      .filter((t) => t.total >= 2)
      .sort((a, b) => b.wrong / b.total - a.wrong / a.total)
      .slice(0, 8)
      .map((t) => ({
        topic: t.topic,
        missRate: Math.round((t.wrong / t.total) * 100),
      }));
  }, [attempts]);



  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-zinc-100">
      <h1 className="text-2xl font-bold" style={{ color: accent.accent }}>
        Progress
      </h1>

      {exam === "ESE" && paperData.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">Accuracy by Paper</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paperData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="name" stroke={chartGrid} tick={chartTick} />
                <YAxis
                  domain={[0, 100]}
                  stroke={chartGrid}
                  tick={chartTick}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Accuracy"]}
                  contentStyle={chartTooltip}
                />
                <Bar dataKey="accuracy" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Accuracy by Subject</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectData}
              margin={{ top: 8, right: 8, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis
                dataKey="name"
                angle={-35}
                textAnchor="end"
                height={70}
                stroke={chartGrid}
                tick={{ ...chartTick, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke={chartGrid}
                tick={chartTick}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, "Accuracy"]}
                contentStyle={chartTooltip}
              />
              <Bar
                dataKey="accuracy"
                fill={accent.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {dailyData.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">Questions per Day</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="date" stroke={chartGrid} tick={{ ...chartTick, fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke={chartGrid} tick={chartTick} />
                <Tooltip contentStyle={chartTooltip} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {topicMisses.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">Most Missed Topics</h2>
          <ul className="space-y-2">
            {topicMisses.map((t) => (
              <li
                key={t.topic}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/40 px-4 py-3"
              >
                <span className="text-zinc-200">{t.topic}</span>
                <span className="rounded border border-red-900/60 bg-red-950/50 px-2 py-0.5 text-sm font-medium text-red-300">
                  {t.missRate}% miss rate
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {attempts.length === 0 && (
        <p className="mt-12 text-center text-zinc-500">
          Practice to see stats here.
        </p>
      )}
    </div>
  );
}
