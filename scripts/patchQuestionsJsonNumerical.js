/**
 * Add `numerical` boolean to every row in data/questions.json.
 * - numerical: true  → type nat/numerical OR explicit numerical: true
 * - numerical: false → default MCQ theory pool
 *
 * Usage: node scripts/patchQuestionsJsonNumerical.js
 */
const fs = require("fs");
const path = require("path");

const fp = path.join(__dirname, "..", "data", "questions.json");
const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
if (!Array.isArray(raw)) {
  console.error("questions.json must be an array");
  process.exit(1);
}

let trueCount = 0;
const out = raw.map((q) => {
  const type = String(q.type ?? "mcq").toLowerCase();
  const numerical =
    q.numerical === true ||
    q.numerical === "true" ||
    type === "nat" ||
    type === "numerical";
  if (numerical) trueCount++;
  return { ...q, numerical };
});

fs.writeFileSync(fp, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Updated ${out.length} questions (${trueCount} numerical, ${out.length - trueCount} non-numerical).`);
