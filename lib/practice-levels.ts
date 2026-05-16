import practiceLevelsData from "@/data/practice-levels.json";
import type { Filters, Question } from "@/lib/types";
import {
  filterQuestions,
  PRACTICE_MCQ_BATCH_SIZE,
  slicePracticeQuestionsForLevel,
  type PracticeBankKind,
} from "@/lib/questions";
import { isDefaultPracticeFilters } from "@/lib/available-filters";

export type PracticeLevelsManifest = {
  version: number;
  batchSize: number;
  levelCount: number;
  levels: { level: number; questionIds: string[] }[];
};

const manifest = practiceLevelsData as PracticeLevelsManifest;

export const PRACTICE_LEVEL_BATCH_SIZE = PRACTICE_MCQ_BATCH_SIZE;

export function getPracticeLevelCount(): number {
  return manifest.levelCount ?? manifest.levels?.length ?? 0;
}

/** 1-based level number currently in play (first visit = Level 1). */
export function getActivePracticeLevel(completedLevels: number): number {
  return Math.max(1, completedLevels + 1);
}

export function getPracticeLevelQuestionIds(levelNumber: number): string[] {
  const n = Math.max(1, Math.floor(levelNumber));
  const row = manifest.levels.find((l) => l.level === n);
  return row?.questionIds ?? [];
}

export function hasPracticeLevel(levelNumber: number): boolean {
  return getPracticeLevelQuestionIds(levelNumber).length > 0;
}

/** Resolve pre-built level IDs to full Question objects (order preserved). */
export function resolvePracticeLevelQuestions(
  bank: Question[],
  levelNumber: number,
): Question[] {
  const ids = getPracticeLevelQuestionIds(levelNumber);
  if (ids.length === 0) return [];
  const byId = new Map(bank.map((q) => [q.id, q]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Question[];
}

/** PYQ bank: build levels on the fly from sorted MCQs when no manifest exists. */
export function resolvePyqLevelQuestions(
  bank: Question[],
  levelNumber: number,
): Question[] {
  const mcqs = [...bank]
    .filter((q) => q.type === "mcq")
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const batch = PRACTICE_LEVEL_BATCH_SIZE;
  const idx = Math.max(0, levelNumber - 1);
  const start = idx * batch;
  if (start >= mcqs.length) return [];
  return mcqs.slice(start, start + batch);
}

export function getPyqLevelCount(bank: Question[]): number {
  const n = bank.filter((q) => q.type === "mcq").length;
  return Math.max(0, Math.ceil(n / PRACTICE_LEVEL_BATCH_SIZE));
}

function sortedMcqsForFilters(
  bank: Question[],
  filters: Filters,
  excludeAttemptedIds?: Set<string>,
): Question[] {
  const pool = filterQuestions(
    bank,
    { ...filters, type: "MCQ" },
    excludeAttemptedIds,
  );
  return [...pool].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function getFilteredPracticeLevelCount(
  bank: Question[],
  filters: Filters,
  excludeAttemptedIds?: Set<string>,
): number {
  const n = sortedMcqsForFilters(bank, filters, excludeAttemptedIds).length;
  return Math.max(0, Math.ceil(n / PRACTICE_LEVEL_BATCH_SIZE));
}

export function resolveFilteredPracticeLevel(
  bank: Question[],
  filters: Filters,
  levelNumber: number,
  excludeAttemptedIds?: Set<string>,
): Question[] {
  const sorted = sortedMcqsForFilters(bank, filters, excludeAttemptedIds);
  return slicePracticeQuestionsForLevel(sorted, levelNumber);
}

export function hasFilteredPracticeLevel(
  bank: Question[],
  filters: Filters,
  levelNumber: number,
  excludeAttemptedIds?: Set<string>,
): boolean {
  return (
    resolveFilteredPracticeLevel(
      bank,
      filters,
      levelNumber,
      excludeAttemptedIds,
    ).length > 0
  );
}

/** True when bundled `practice-levels.json` IDs exist in this bank (legacy JSON ids). */
export function manifestMatchesBank(bank: Question[]): boolean {
  const ids = getPracticeLevelQuestionIds(1);
  if (!ids.length || !bank.length) return false;
  const byId = new Map(bank.map((q) => [q.id, q]));
  return ids.some((id) => byId.has(id));
}

function useManifestLevels(
  bank: Question[],
  bankKind: PracticeBankKind,
): boolean {
  return bankKind === "ai" && manifestMatchesBank(bank);
}

/** Level questions: manifest for bundled practice JSON; dynamic batches for PYQ / Mongo. */
export function resolvePracticeLevelForFilters(
  bank: Question[],
  filters: Filters,
  levelNumber: number,
  bankKind: PracticeBankKind = "ai",
  excludeAttemptedIds?: Set<string>,
): Question[] {
  if (excludeAttemptedIds) {
    return resolveFilteredPracticeLevel(
      bank,
      filters,
      levelNumber,
      excludeAttemptedIds,
    );
  }
  if (isDefaultPracticeFilters(filters)) {
    if (useManifestLevels(bank, bankKind)) {
      return resolvePracticeLevelQuestions(bank, levelNumber);
    }
    return resolvePyqLevelQuestions(bank, levelNumber);
  }
  return resolveFilteredPracticeLevel(bank, filters, levelNumber);
}

export function getPracticeLevelCountForFilters(
  bank: Question[],
  filters: Filters,
  bankKind: PracticeBankKind = "ai",
  excludeAttemptedIds?: Set<string>,
): number {
  if (excludeAttemptedIds) {
    return getFilteredPracticeLevelCount(bank, filters, excludeAttemptedIds);
  }
  if (isDefaultPracticeFilters(filters)) {
    if (useManifestLevels(bank, bankKind)) {
      return getPracticeLevelCount();
    }
    return getPyqLevelCount(bank);
  }
  return getFilteredPracticeLevelCount(bank, filters);
}

export function hasPracticeLevelForFilters(
  bank: Question[],
  filters: Filters,
  levelNumber: number,
  bankKind: PracticeBankKind = "ai",
  excludeAttemptedIds?: Set<string>,
): boolean {
  if (excludeAttemptedIds) {
    return hasFilteredPracticeLevel(
      bank,
      filters,
      levelNumber,
      excludeAttemptedIds,
    );
  }
  if (isDefaultPracticeFilters(filters)) {
    if (useManifestLevels(bank, bankKind)) {
      return hasPracticeLevel(levelNumber);
    }
    return resolvePyqLevelQuestions(bank, levelNumber).length > 0;
  }
  return hasFilteredPracticeLevel(bank, filters, levelNumber);
}

/** First level at or after `startLevel` that still has unattempted MCQs. */
export function findFirstPracticeLevelWithQuestions(
  bank: Question[],
  filters: Filters,
  bankKind: PracticeBankKind,
  startLevel: number,
  excludeAttemptedIds: Set<string>,
): { level: number; questions: Question[] } {
  const max = Math.max(
    getPracticeLevelCountForFilters(bank, filters, bankKind, excludeAttemptedIds),
    startLevel,
  );
  for (let level = Math.max(1, startLevel); level <= max; level++) {
    const questions = resolvePracticeLevelForFilters(
      bank,
      filters,
      level,
      bankKind,
      excludeAttemptedIds,
    );
    if (questions.length > 0) {
      return { level, questions };
    }
  }
  return { level: Math.max(1, startLevel), questions: [] };
}
