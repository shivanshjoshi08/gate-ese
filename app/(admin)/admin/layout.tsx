import AdminNav from "@/components/ui/AdminNav";
import "katex/dist/katex.min.css";
import "@/components/question/question-renderer.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Question Bank Admin",
  robots: "noindex",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
