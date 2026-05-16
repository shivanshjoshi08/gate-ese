"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { EXAM_COLORS } from "@/lib/exam";
import { USER_PYQ_ENABLED } from "@/lib/feature-flags";

const accent = EXAM_COLORS.ESE;

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const homeActive = pathname === "/";
  const pdfsActive = pathname === "/pyq-pdfs";
  const meActive = pathname === "/me";
  const attemptsActive = pathname === "/attempts";

  const authedLearnerNav =
    status === "authenticated" && session?.user?.role !== "admin";
  const authedAsAdminLearnerGate =
    status === "authenticated" && session?.user?.role === "admin";

  return (
    <header className="hide-in-focus sticky top-0 z-50 border-b border-study-border/70 bg-study-surface/90 shadow-sm shadow-black/10 backdrop-blur-md supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-study-ink sm:text-lg"
        >
          <span style={{ color: accent.accent }}>ESE</span>{" "}
          <span className="hidden text-study-muted sm:inline">CE</span>
        </Link>

        <div className="flex items-center gap-1 md:hidden">
          {status === "loading" ? (
            <span className="px-2 text-xs text-study-muted">…</span>
          ) : authedLearnerNav || authedAsAdminLearnerGate ? (
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium text-study-muted"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: accent.accent }}
            >
              Log in
            </Link>
          )}
        </div>

        <nav className="hidden items-center justify-end gap-1 md:flex">
          <Link
            href="/"
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              homeActive
                ? `${accent.light} ${accent.text}`
                : "text-study-muted hover:bg-study-raised/80 hover:text-study-soft"
            }`}
          >
            Home
          </Link>
          {USER_PYQ_ENABLED && (
            <Link
              href="/pyq-pdfs"
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pdfsActive
                  ? `${accent.light} ${accent.text}`
                  : "text-study-muted hover:bg-study-raised/80 hover:text-study-soft"
              }`}
            >
              PYQ PDFs
            </Link>
          )}
          <Link
            href="/attempts"
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              attemptsActive
                ? `${accent.light} ${accent.text}`
                : "text-study-muted hover:bg-study-raised/80 hover:text-study-soft"
            }`}
          >
            My attempts
          </Link>
          <Link
            href="/me"
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              meActive
                ? `${accent.light} ${accent.text}`
                : "text-study-muted hover:bg-study-raised/80 hover:text-study-soft"
            }`}
          >
            Progress
          </Link>

          {status === "loading" ? (
            <span className="px-2 text-xs text-study-muted">…</span>
          ) : authedLearnerNav || authedAsAdminLearnerGate ? (
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-study-muted transition hover:bg-study-raised/80 hover:text-study-soft"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-study-muted transition hover:bg-study-raised/80 hover:text-study-soft"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-study-ink transition hover:bg-study-raised/80"
                style={{ color: accent.accent }}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
