"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  {
    href: "/practice?bank=ai",
    label: "Practice",
    match: (p: string) => p.startsWith("/practice"),
  },
  {
    href: "/attempts",
    label: "Attempts",
    match: (p: string) => p.startsWith("/attempts"),
  },
  { href: "/me", label: "Progress", match: (p: string) => p.startsWith("/me") },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hide-in-focus fixed inset-x-0 bottom-0 z-50 border-t border-study-border/80 bg-study-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold uppercase tracking-wide transition active:scale-95 ${
                active
                  ? "text-sky-400"
                  : "text-study-muted hover:text-study-soft"
              }`}
            >
              <TabIcon name={tab.label} active={active} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const className = `h-5 w-5 ${active ? "opacity-100" : "opacity-70"}`;
  switch (name) {
    case "Home":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "Practice":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "Attempts":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
          <path d="M3 3v18h18M7 16l4-8 4 5 5-9" />
        </svg>
      );
  }
}
