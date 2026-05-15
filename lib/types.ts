export type QuestionType = "mcq" | "nat" | "msq";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type ExamType = "GATE" | "ESE";

export type EsePaper = "PRE" | "P1" | "P2" | null;

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correct: number | string | number[];
  solution: string;
  subject: string;
  topic: string;
  marks: 1 | 2;
  year: number;
  difficulty: Difficulty;
  exam: ExamType;
  paper: EsePaper;
}

export interface AttemptRecord {
  questionId: string;
  userAnswer: string | number | number[];
  correct: boolean;
  timestamp: number;
  subject: string;
  topic: string;
  exam: ExamType;
}

export interface SessionState {
  questionIds: string[];
  currentIndex: number;
  filterKey: string;
}

export interface ProgressData {
  attempts: AttemptRecord[];
  bookmarks: string[];
  session: SessionState | null;
  lastVisited: string | null;
}

export interface Filters {
  exam: ExamType;
  paper: string;
  subject: string;
  difficulty: string;
  year: string;
  marks: string;
  type: string;
  reviewMode: boolean;
}
