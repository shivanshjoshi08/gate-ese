"use client";

import ExamSwitcher from "./ExamSwitcher";
import Nav from "./Nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ExamSwitcher />
      <Nav />
      <main className="min-h-[calc(100vh-56px)]">{children}</main>
    </>
  );
}
