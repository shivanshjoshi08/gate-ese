import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Admin gate for mutating routes. Uses NextAuth JWT session (not a separate Express server).
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const email = session?.user?.email?.trim().toLowerCase();
  if (
    !session?.user ||
    session.user.role !== "admin" ||
    !adminEmail ||
    email !== adminEmail
  ) {
    return null;
  }
  return session;
}
