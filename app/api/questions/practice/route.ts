import { NextResponse } from "next/server";
import { listPracticeQuestionRows } from "@/backend/services/question.service";
import { leanRowToPracticeQuestion } from "@/backend/mappers/question.mapper";
import { mongoUnavailableResponse } from "@/lib/mongo-http";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Paginated approved questions for the learner app.
 * ?sourceType=pyq|practice&page=1&limit=50
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sourceType =
      url.searchParams.get("sourceType") === "practice" ? "practice" : "pyq";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get("limit")) || 50),
    );

    const result = await listPracticeQuestionRows({ sourceType, page, limit });
    const dbQuestions = result.items
      .map((row) =>
        leanRowToPracticeQuestion(
          row as unknown as Parameters<typeof leanRowToPracticeQuestion>[0],
        ),
      )
      .filter((q): q is Question => q != null);

    return NextResponse.json({
      dbQuestions,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasMore: result.page < result.totalPages,
    });
  } catch (e) {
    console.error(e);
    return mongoUnavailableResponse(e);
  }
}
