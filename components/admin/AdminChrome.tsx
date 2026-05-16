"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/ui/AdminNav";

export default function AdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {!isLogin && <AdminNav />}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
