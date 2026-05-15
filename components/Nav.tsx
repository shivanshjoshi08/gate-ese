"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExam } from "@/hooks/useExam";
import { EXAM_COLORS } from "@/lib/exam";

const links = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/mock", label: "Mock Test" },
  { href: "/bookmarks", label: "Bookmarks" },
  { href: "/analysis", label: "Analysis" },
];

export default function Nav() {
  const pathname = usePathname();
  const { exam } = useExam();
  const isPractice = pathname.startsWith("/practice");
  const accent = EXAM_COLORS[exam];

  return (
    <header className="hide-in-focus sticky top-[49px] z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          <span style={{ color: accent.accent }}>{exam}</span>{" "}
          <span className="text-gray-700">CE</span>
        </Link>
        <nav className="flex gap-1 sm:gap-2">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium transition sm:px-3 ${
                  active
                    ? `${accent.light} ${accent.text}`
                    : "text-gray-600 hover:bg-gray-100"
                } ${isPractice && href !== "/practice" ? "hidden sm:inline-flex" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
