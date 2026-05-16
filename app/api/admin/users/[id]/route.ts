import { NextResponse } from "next/server";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import { getLearnerDetailForAdmin } from "@/backend/services/admin-users.service";
import { mongoUnavailableResponse } from "@/lib/mongo-http";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  try {
    const user = await getLearnerDetailForAdmin(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error("[admin/users/id GET]", e);
    return mongoUnavailableResponse(e);
  }
}
