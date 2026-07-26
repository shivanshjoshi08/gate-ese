const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(__dirname, "..", "data", "pyq-pdfs-manifest.json");

const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
const manifest = JSON.parse(raw);

manifest.push({
  year: 2024,
  filename: "gate_CE_2024_S4.pdf",
  title: "GATE CE 2024 S4 Question Paper",
  track: "GATE"
});

manifest.push({
  year: 2024,
  filename: "gate_ce_2024_s4_FinalAnswerKey.pdf",
  title: "GATE CE 2024 S4 Answer Key",
  track: "GATE"
});

manifest.sort((a, b) => b.year - a.year);

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Successfully updated pyq-pdfs-manifest.json!");
