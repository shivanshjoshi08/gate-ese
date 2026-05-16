import { z } from "zod";

const tipTapDoc: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tipTapDoc).optional(),
    text: z.string().optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),
  })
);

export const richContentSchema = z.object({
  format: z.literal("tiptap-v1"),
  doc: tipTapDoc,
  plainText: z.string().optional(),
});

export const questionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().max(8),
  body: richContentSchema,
});

export const questionDocumentSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["draft", "published"]),
  type: z.enum(["mcq", "msq", "numerical", "subjective"]),
  stem: richContentSchema,
  options: z.array(questionOptionSchema),
  solution: richContentSchema,
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
    z.null(),
  ]),
  subject: z.string().min(1),
  topic: z.string(),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  marks: z.union([z.literal(1), z.literal(2)]),
  exam: z.enum(["GATE", "ESE"]),
  paper: z.union([z.enum(["PRE", "P1", "P2"]), z.null()]).optional(),
  year: z.number().int().min(1990).max(2100),
  hasAnswerKey: z.boolean(),
  media: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type QuestionDocumentInput = z.infer<typeof questionDocumentSchema>;
