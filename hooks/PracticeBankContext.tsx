"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Question } from "@/lib/types";
import { legacyQuestions } from "@/lib/legacy-questions";
import { buildingMaterialsQuestions } from "@/lib/buildingMaterials";
import { USER_PYQ_ENABLED } from "@/lib/feature-flags";

type PracticeBankContextValue = {
  /** Practice bank: bundled JSON + Mongo `sourceType=practice` (approved). */
  aiQuestions: Question[];
  /** PYQ bank from Mongo (`sourceType=pyq`, approved). */
  pyqQuestions: Question[];
  questions: Question[];
  loadingPyq: boolean;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

const PracticeBankContext = createContext<PracticeBankContextValue | null>(
  null,
);

async function fetchApprovedBank(
  sourceType: "pyq" | "practice",
): Promise<Question[]> {
  const all: Question[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetch(
      `/api/questions/practice?sourceType=${sourceType}&page=${page}&limit=50`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as {
      dbQuestions?: Question[];
      totalPages?: number;
      error?: string;
      detail?: string;
    };
    if (!res.ok) {
      throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
    }
    all.push(...(data.dbQuestions ?? []));
    totalPages = data.totalPages ?? 1;
    page += 1;
  }
  return all;
}

export function PracticeBankProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pyqRemote, setPyqRemote] = useState<Question[]>([]);
  const [practiceRemote, setPracticeRemote] = useState<Question[]>([]);
  const [loadingPyq, setLoadingPyq] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingPyq(true);
    setError(null);
    try {
      const [pyq, practice] = await Promise.all([
        USER_PYQ_ENABLED ? fetchApprovedBank("pyq") : Promise.resolve([]),
        fetchApprovedBank("practice"),
      ]);
      setPyqRemote(pyq);
      setPracticeRemote(practice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load questions");
      setPyqRemote([]);
      setPracticeRemote([]);
    } finally {
      setLoadingPyq(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const aiQuestions = useMemo(() => {
    const ids = new Set(legacyQuestions.map((q) => q.id));
    const merged: Question[] = legacyQuestions.map((q) => ({
      ...q,
      questionBank: "ai" as const,
    }));
    for (const q of practiceRemote) {
      if (!ids.has(q.id)) {
        ids.add(q.id);
        merged.push({ ...q, questionBank: "ai" as const });
      }
    }
    return merged;
  }, [practiceRemote]);

  const pyqQuestions = useMemo(() => {
    if (!USER_PYQ_ENABLED) return [];
    const fromMongo = pyqRemote.map((q) => ({
      ...q,
      questionBank: "pyq" as const,
    }));
    if (fromMongo.length > 0) return fromMongo;
    return buildingMaterialsQuestions.map((q) => ({
      ...q,
      questionBank: "pyq" as const,
    }));
  }, [pyqRemote]);

  const questions = useMemo(() => {
    const ids = new Set(aiQuestions.map((q) => q.id));
    const merged: Question[] = [...aiQuestions];
    for (const q of pyqQuestions) {
      if (!ids.has(q.id)) merged.push(q);
    }
    return merged;
  }, [aiQuestions, pyqQuestions]);

  const value = useMemo(
    () => ({
      aiQuestions,
      pyqQuestions,
      questions,
      loadingPyq,
      loading: loadingPyq,
      error,
      reload: load,
    }),
    [aiQuestions, pyqQuestions, questions, loadingPyq, error, load],
  );

  return (
    <PracticeBankContext.Provider value={value}>
      {children}
    </PracticeBankContext.Provider>
  );
}

export function usePracticeBank(): PracticeBankContextValue {
  const ctx = useContext(PracticeBankContext);
  if (!ctx) {
    throw new Error("usePracticeBank must be used inside PracticeBankProvider");
  }
  return ctx;
}
