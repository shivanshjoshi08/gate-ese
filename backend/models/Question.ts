import mongoose, { Schema, models, model } from "mongoose";

const optionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    image: { type: String, default: null },
  },
  { _id: false },
);

const solutionSchema = new Schema(
  {
    text: { type: String, default: "" },
    latex: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { _id: false },
);

/**
 * Unified question bank: PYQ (admin-uploaded) and Practice (imported / authored).
 * Legacy TipTap payloads may live in `legacyRich` until fully migrated.
 */
const questionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    /** Stable id from questions.json import — dedupe imports */
    importKey: { type: String, sparse: true, unique: true },
    sourceType: {
      type: String,
      enum: ["pyq", "practice"],
      required: true,
      index: true,
    },
    exam: { type: String, enum: ["GATE", "ESE"], required: true, index: true },
    branch: { type: String, default: "CE", index: true },
    subject: { type: String, required: true, index: true },
    topic: { type: String, default: "", index: true },
    subtopic: { type: String, default: "" },
    year: { type: Number, required: true, index: true },
    paper: { type: String, default: null },
    type: { type: String, enum: ["mcq", "numerical"], required: true },
    /** Category: shows under learner Numericals filter (independent of answer `type`). */
    numerical: { type: Boolean, default: false, index: true },
    appearances: {
      type: [
        {
          exam: { type: String, enum: ["GATE", "ESE"] },
          year: Number,
          paper: { type: String, default: null },
          session: { type: String, default: "" },
        },
      ],
      default: [],
    },
    references: {
      type: [
        {
          kind: {
            type: String,
            enum: ["book", "coaching", "standard", "web", "other"],
          },
          label: String,
          exam: { type: String, enum: ["GATE", "ESE"], required: false },
          year: Number,
          notes: { type: String, default: "" },
        },
      ],
      default: [],
    },
    questionStyle: {
      type: String,
      enum: [
        "conceptual",
        "formula-based",
        "statement-trap",
        "code-based",
        "practical",
      ],
      default: null,
    },
    question: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    correctOption: { type: String, default: "" },
    solution: { type: solutionSchema, default: () => ({}) },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
    },
    marks: { type: Number, default: 1, min: 1, max: 2 },
    negativeMarks: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["approved", "draft"],
      default: "draft",
      index: true,
    },
    legacyRich: { type: Schema.Types.Mixed, select: false },
  },
  { timestamps: true },
);

questionSchema.index({ sourceType: 1, status: 1, exam: 1 });
questionSchema.index({ subject: 1, topic: 1, year: -1 });

/** Drop cached pre-refactor schema (stem / examType) after Next.js hot reload. */
function registerQuestionModel() {
  const existing = models.Question;
  if (existing?.schema?.paths?.stem || existing?.schema?.paths?.examType) {
    const modelsMap = mongoose.models as Record<string, mongoose.Model<unknown>>;
    delete modelsMap.Question;
    const connModels = mongoose.connection?.models as
      | Record<string, mongoose.Model<unknown>>
      | undefined;
    if (connModels?.Question) delete connModels.Question;
  }
  return models.Question ?? model("Question", questionSchema);
}

export const Question = registerQuestionModel();

export type QuestionLean = {
  _id: mongoose.Types.ObjectId;
  slug: string;
  importKey?: string;
  sourceType: "pyq" | "practice";
  exam: "GATE" | "ESE";
  branch: string;
  subject: string;
  topic: string;
  subtopic?: string;
  year: number;
  paper: string | null;
  type: "mcq" | "numerical";
  numerical: boolean;
  appearances: {
    exam: "GATE" | "ESE";
    year: number;
    paper?: string | null;
    session?: string;
  }[];
  references: {
    kind: "book" | "coaching" | "standard" | "web" | "other";
    label: string;
    exam?: "GATE" | "ESE";
    year?: number;
    notes?: string;
  }[];
  questionStyle?:
    | "conceptual"
    | "formula-based"
    | "statement-trap"
    | "code-based"
    | "practical"
    | null;
  question: string;
  options: { id: string; text: string; image?: string | null }[];
  correctOption: string;
  solution: { text: string; latex?: string; images?: string[] };
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  negativeMarks: number;
  tags: string[];
  images: string[];
  status: "approved" | "draft";
  createdAt: Date;
  updatedAt: Date;
};
