"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import MobileBottomNav from "@/components/MobileBottomNav";
import { PracticeBankProvider } from "@/hooks/PracticeBankContext";
import DebouncedProgressSync from "@/components/DebouncedProgressSync";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <PracticeBankProvider>
      <DebouncedProgressSync />
      <Nav />
      <MobileBottomNav />
      <main className="relative min-h-[calc(100vh-56px)] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-14">
        {children}
      </main>
    </PracticeBankProvider>
  );
}
