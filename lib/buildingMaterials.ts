import rawData from "@/data/building-materials.json";
import type { Question } from "./types";

export interface BmRawQuestion {
  question_number: number;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  image?: string;
}

export interface BmQuestionSet {
  title: string;
  description?: string;
  subject: string;
  exam: string;
  year: number;
  questions: BmRawQuestion[];
}

export const buildingMaterialsSet = rawData as BmQuestionSet;

/** Image path in public folder: /images/fig16.png */
export function getQuestionImagePath(q: BmRawQuestion): string | null {
  if (!q.image) return null;
  const name = q.image.startsWith("fig") ? q.image : `fig${q.question_number}`;
  return `/images/${name}.png`;
}

export function convertToAppQuestion(q: BmRawQuestion, meta: BmQuestionSet): Question {
  const opts = [q.options.a, q.options.b, q.options.c, q.options.d];
  const imagePath = getQuestionImagePath(q);
  return {
    id: `bm_${String(q.question_number).padStart(2, "0")}`,
    question: q.question_text,
    type: "mcq",
    options: opts,
    correct: 0,
    hasAnswerKey: false,
    solution:
      "Official answer key not loaded for this set. Verify with your source material.",
    subject: meta.subject,
    topic: `Q${q.question_number}`,
    marks: 1,
    year: meta.year,
    difficulty: "Medium",
    exam: "GATE",
    paper: null,
    image: imagePath ?? undefined,
  };
}

export const buildingMaterialsQuestions: Question[] =
  buildingMaterialsSet.questions.map((q) =>
    convertToAppQuestion(q, buildingMaterialsSet)
  );

export function getBmQuestionByNumber(n: number): Question | undefined {
  return buildingMaterialsQuestions.find(
    (q) => q.id === `bm_${String(n).padStart(2, "0")}`
  );
}
