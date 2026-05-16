import { connectMongo } from "@/lib/mongoose";
import { Question } from "@/backend/models/Question";
import {
  normalizeImportRecord,
} from "@/backend/mappers/question.mapper";
import {
  questionCreateSchema,
  type QuestionCreateInput,
} from "@/backend/validators/question.validator";
import { createQuestion } from "@/backend/services/question.service";
import { slugify } from "@/backend/utils/slug";

export type ImportDefaults = {
  sourceType?: "pyq" | "practice";
  status?: "approved" | "draft";
};

export type ImportRowFailure = {
  index: number;
  id?: string;
  reason: string;
};

export type ImportResult = {
  inserted: number;
  skipped: number;
  failed: ImportRowFailure[];
  total: number;
};

function parseImportPayload(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) {
    return body.filter((x) => x && typeof x === "object") as Record<
      string,
      unknown
    >[];
  }
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (Array.isArray(o.questions)) {
      return o.questions.filter(
        (x) => x && typeof x === "object",
      ) as Record<string, unknown>[];
    }
    if (o.question || o.sourceType || o.id) {
      return [o];
    }
  }
  throw new Error("JSON must be an array of questions or { questions: [...] }");
}

function toCreateInput(
  raw: Record<string, unknown>,
  defaults?: ImportDefaults,
): QuestionCreateInput {
  const normalized = normalizeImportRecord(raw, defaults);
  const parsed = questionCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(msg);
  }
  const data = parsed.data;
  if (!data.slug) {
    data.slug = slugify([
      data.importKey,
      data.sourceType,
      data.subject,
      data.topic,
      data.year,
    ]);
  }
  return data;
}

export async function importQuestionsFromJson(
  body: unknown,
  defaults?: ImportDefaults,
): Promise<ImportResult> {
  await connectMongo();
  const rows = parseImportPayload(body);
  const result: ImportResult = {
    inserted: 0,
    skipped: 0,
    failed: [],
    total: rows.length,
  };

  for (let index = 0; index < rows.length; index++) {
    const raw = rows[index];
    const idHint = raw.id != null ? String(raw.id) : undefined;
    try {
      const input = toCreateInput(raw, defaults);
      const dupFilter: Record<string, unknown>[] = [{ slug: input.slug }];
      if (input.importKey) dupFilter.push({ importKey: input.importKey });

      const exists = await Question.findOne({ $or: dupFilter })
        .select("_id")
        .lean();
      if (exists) {
        result.skipped++;
        continue;
      }

      await createQuestion(input);
      result.inserted++;
    } catch (e) {
      result.failed.push({
        index,
        id: idHint,
        reason: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return result;
}
