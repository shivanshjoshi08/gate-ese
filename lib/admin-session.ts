import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = (await getServerSession(
    authOptions as never
  )) as Session | null;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user?.email || !adminEmail || email !== adminEmail) {
    return null;
  }
  return session;
}
