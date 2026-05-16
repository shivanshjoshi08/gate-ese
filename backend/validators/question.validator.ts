import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  image: z.string().nullable().optional(),
});

const solutionSchema = z.object({
  text: z.string().default(""),
  latex: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([]),
});

export const questionCreateSchema = z.object({
  slug: z.string().min(2).max(160).optional(),
  importKey: z.string().min(1).max(200).optional(),
  sourceType: z.enum(["pyq", "practice"]),
  exam: z.enum(["GATE", "ESE"]),
  branch: z.string().default("CE"),
  subject: z.string().min(1),
  topic: z.string().default(""),
  subtopic: z.string().optional().default(""),
  year: z.coerce.number().int().min(1990).max(2100),
  paper: z.string().nullable().optional(),
  type: z.enum(["mcq", "numerical"]),
  numerical: z.boolean().optional().default(false),
  unit: z.string().nullable().optional().default(null),
  answerRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      exact: z.number().optional(),
      tolerance: z.number().optional(),
    })
    .nullable()
    .optional()
    .default(null),
  appearances: z
    .array(
      z.object({
        exam: z.enum(["GATE", "ESE"]),
        year: z.number().int(),
        paper: z.string().nullable().optional(),
        session: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  references: z
    .array(
      z.object({
        kind: z.enum(["book", "coaching", "standard", "web", "other"]),
        label: z.string().min(1),
        exam: z.enum(["GATE", "ESE"]).optional(),
        year: z.number().int().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  questionStyle: z
    .enum([
      "conceptual",
      "formula-based",
      "statement-trap",
      "code-based",
      "practical",
    ])
    .nullable()
    .optional(),
  question: z.string().min(1),
  options: z.array(optionSchema).default([]),
  correctOption: z.string().default(""),
  solution: solutionSchema.default({ text: "", latex: "", images: [] }),
  difficulty: z.enum(["Easy", "Moderate", "Medium", "Hard"]),
  marks: z.coerce.number().int().min(1).max(2).default(1),
  negativeMarks: z.coerce.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  status: z.enum(["approved", "draft"]).default("draft"),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sourceType: z.enum(["pyq", "practice"]).optional(),
  exam: z.enum(["GATE", "ESE"]).optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  year: z.coerce.number().int().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  status: z.enum(["approved", "draft"]).optional(),
  search: z.string().optional(),
});

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
