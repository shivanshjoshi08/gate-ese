import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const authSecretFallback =
  process.env.NEXTAUTH_SECRET?.trim() ||
  (process.env.NODE_ENV !== "production"
    ? "local-dev-nextauth-secret-change-me"
    : undefined);

function learnerPathNeedsAuth(pathname: string): boolean {
  if (pathname.startsWith("/practice")) return true;
  if (pathname.startsWith("/bookmarks")) return true;
  if (pathname.startsWith("/attempts")) return true;
  if (pathname === "/me") return true;
  if (pathname.startsWith("/me/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const secret = authSecretFallback;

  /** CMS */
  if (path.startsWith("/admin")) {
    if (path.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    const token = await getToken({ req, secret });
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const email = ((token?.email as string | undefined) ?? "").trim().toLowerCase();
    const isAdminRole = token?.role === "admin";
    const allowed =
      !!token &&
      isAdminRole &&
      !!adminEmail &&
      !!email &&
      email === adminEmail;
    if (!allowed) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  /** Learner app (Practice, profile, bookmarks) */
  if (learnerPathNeedsAuth(path)) {
    const token = await getToken({ req, secret });
    const role = token?.role as string | undefined;
    const id = token?.sub as string | undefined;
    const ok =
      !!id &&
      (role === "learner" || (role === "admin" && id === "admin"));
    if (!ok) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", `${path}${req.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/practice/:path*",
    "/me/:path*",
    "/me",
    "/bookmarks/:path*",
    "/bookmarks",
  ],
};
