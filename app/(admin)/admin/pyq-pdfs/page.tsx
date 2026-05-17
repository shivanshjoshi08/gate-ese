import Link from "next/link";
import AdminPyqPdfManager from "@/components/admin/AdminPyqPdfManager";
import { readPyqPdfManifest } from "@/lib/pyq-pdf-manifest";

export const metadata = {
  title: "PYQ PDFs | Admin",
};

export default async function AdminPyqPdfsPage() {
  const entries = await readPyqPdfManifest();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-100">PYQ PDFs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload GATE or PRE (ESE Prelims) previous-year papers. Learners download
          them from the PYQ PDFs page.
        </p>
      </div>

      <AdminPyqPdfManager initialEntries={entries} />
    </div>
  );
}
