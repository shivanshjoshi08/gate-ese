import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { signCloudinaryUpload } from "@/lib/cloudinary";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const sig = signCloudinaryUpload();
    return NextResponse.json(sig);
  } catch {
    return NextResponse.json(
      { error: "Cloudinary not configured (CLOUDINARY_* env vars)" },
      { status: 503 }
    );
  }
}
