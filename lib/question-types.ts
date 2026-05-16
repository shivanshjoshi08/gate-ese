import type { JSONContent } from "@tiptap/core";

export type RichBodyFormat = "tiptap-v1";

export type QuestionType = "mcq" | "msq" | "numerical" | "subjective";
export type QuestionStatus = "draft" | "published";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type ExamType = "GATE" | "ESE";
export type EsePaper = "PRE" | "P1" | "P2" | null;

export interface RichContent {
  format: RichBodyFormat;
  doc: JSONContent;
  plainText?: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  body: RichContent;
}

export interface QuestionMedia {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

/** CMS + API payload (TipTap JSON on stem/options/solution). */
export interface QuestionDocument {
  id: string;
  /** PYQ vs Practice — persisted in unified Mongo `sourceType` */
  sourceType?: "pyq" | "practice";
  status: QuestionStatus;
  type: QuestionType;
  stem: RichContent;
  options: QuestionOption[];
  solution: RichContent;
  correctAnswer: string | string[] | number | null;
  subject: string;
  topic: string;
  tags: string[];
  difficulty: Difficulty;
  marks: 1 | 2;
  exam: ExamType;
  paper: EsePaper;
  year: number;
  hasAnswerKey: boolean;
  media: QuestionMedia[];
  createdAt: string;
  updatedAt: string;
}
