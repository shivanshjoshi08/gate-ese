import {
  getQuestionsList,
  postQuestion,
} from "@/backend/controllers/question.controller";

export const dynamic = "force-dynamic";

/** GET /api/questions?page=1&limit=20&sourceType=pyq&subject=... */
export async function GET(req: Request) {
  return getQuestionsList(req);
}

/** POST /api/questions — admin only */
export async function POST(req: Request) {
  return postQuestion(req);
}
