/** Canonical question shape stored in MongoDB and returned by REST APIs. */

export type SourceType = "pyq" | "practice";
export type ExamType = "GATE" | "ESE";
export type QuestionStatus = "approved" | "draft";
export type QuestionType = "mcq" | "numerical";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuestionOptionDto {
  id: string;
  text: string;
  image?: string | null;
}

export interface QuestionSolutionDto {
  text: string;
  latex?: string;
  images?: string[];
}

export interface QuestionDto {
  id: string;
  slug: string;
  sourceType: SourceType;
  exam: ExamType;
  branch: string;
  subject: string;
  topic: string;
  subtopic?: string;
  year: number;
  paper: string | null;
  type: QuestionType;
  question: string;
  options: QuestionOptionDto[];
  correctOption: string;
  solution: QuestionSolutionDto;
  difficulty: Difficulty;
  marks: number;
  negativeMarks: number;
  tags: string[];
  images: string[];
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListQuery {
  page?: number;
  limit?: number;
  sourceType?: SourceType;
  exam?: ExamType;
  subject?: string;
  topic?: string;
  year?: number;
  difficulty?: Difficulty;
  status?: QuestionStatus;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type SourceTypeStats = {
  total: number;
  approved: number;
  draft: number;
};

export type QuestionBankStats = {
  total: number;
  practice: SourceTypeStats;
  pyq: SourceTypeStats;
  /** Old admin schema (stem / examType) counted as PYQ */
  legacyPyq: number;
};
