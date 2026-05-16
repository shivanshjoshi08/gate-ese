"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/questions/new", label: "New" },
  { href: "/admin/questions/import", label: "JSON import" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/admin" className="font-bold">
          Question CMS
        </Link>
        <nav className="flex gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← App
        </Link>
      </div>
    </header>
  );
}
