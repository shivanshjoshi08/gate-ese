"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Learners" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/questions/new", label: "New" },
  { href: "/admin/questions/import", label: "JSON import" },
  { href: "/admin/pyq-pdfs", label: "PYQ PDFs" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link
            href="/admin"
            className="shrink-0 text-sm font-bold text-zinc-100 sm:text-base"
          >
            Question CMS
          </Link>
          <Link
            href="/"
            className="shrink-0 text-xs text-zinc-500 hover:text-zinc-200 sm:text-sm"
          >
            ← App
          </Link>
        </div>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto pb-3 scrollbar-thin"
          aria-label="Admin"
        >
          {links.map(({ href, label, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
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

