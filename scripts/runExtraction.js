const fs = require("fs");
const { processAllPdfs, PDFS_DIR } = require("./extractQuestions");

function renderProgress(current, total, label) {
  const width = 30;
  const pct = total > 0 ? current / total : 0;
  const filled = Math.round(width * pct);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  process.stdout.write(
    `\r[${bar}] ${Math.round(pct * 100)}% ${label}`.padEnd(80)
  );
}

async function main() {
  console.log("\n🚀 GATE CE Question Extraction\n");
  console.log(`PDF folder: ${PDFS_DIR}\n`);

  if (!fs.existsSync(PDFS_DIR)) {
    fs.mkdirSync(PDFS_DIR, { recursive: true });
  }

  const pdfFiles = fs
    .readdirSync(PDFS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.log("No PDF files found in /pdfs/ folder.");
    console.log("Add GATE_CE_YYYY.pdf files and run again.\n");
    process.exit(0);
  }

  console.log(`Found ${pdfFiles.length} PDF(s):\n`);
  pdfFiles.forEach((f) => console.log(`  • ${f}`));
  console.log("");

  let fileIndex = 0;
  const { results, totalAdded, errors, totalQuestions } = await processAllPdfs(
    (label) => {
      renderProgress(fileIndex, pdfFiles.length, label);
    }
  );

  fileIndex = pdfFiles.length;
  renderProgress(fileIndex, pdfFiles.length, "Complete");

  console.log("\n\n═══════════════ SUMMARY ═══════════════\n");

  for (const r of results) {
    if (r.success) {
      console.log(
        `✅ ${r.extracted} questions extracted from ${r.file} (${r.added} new)`
      );
    } else {
      console.log(`❌ Failed: ${r.file} — ${r.error}`);
    }
  }

  console.log(`\n📊 Total new questions added: ${totalAdded}`);
  console.log(`📁 Total questions in database: ${totalQuestions ?? "—"}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} file(s) had errors.`);
    process.exit(1);
  }

  console.log("\nDone! Run npm run dev to start the app.\n");
}

main().catch((err) => {
  console.error("\nFatal error:", err.message || err);
  process.exit(1);
});
