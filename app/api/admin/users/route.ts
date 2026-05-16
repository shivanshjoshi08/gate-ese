import { NextResponse } from "next/server";
import { requireAdminSession } from "@/backend/middleware/requireAdmin";
import { listLearnersForAdmin } from "@/backend/services/admin-users.service";
import { mongoUnavailableResponse } from "@/lib/mongo-http";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await listLearnersForAdmin();
    return NextResponse.json({ users, total: users.length });
  } catch (e) {
    console.error("[admin/users GET]", e);
    return mongoUnavailableResponse(e);
  }
}
