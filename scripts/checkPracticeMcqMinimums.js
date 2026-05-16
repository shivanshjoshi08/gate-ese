#!/usr/bin/env node
/**
 * Lists exam subjects that have fewer than MIN MCQs in data/questions.json.
 * Run: node scripts/checkPracticeMcqMinimums.js
 */
const MIN = 10;
const path = require("path");
const fs = require("fs");

const fp = path.join(__dirname, "..", "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(fp, "utf8"));

const byExam = new Map();
for (const q of questions) {
  if (q.type !== "mcq") continue;
  const ex = q.exam ?? "UNKNOWN";
  if (!byExam.has(ex)) byExam.set(ex, new Map());
  const m = byExam.get(ex);
  m.set(q.subject, (m.get(q.subject) ?? 0) + 1);
}

let ok = true;
for (const [exam, subjMap] of byExam) {
  const short = [];
  for (const [subject, n] of subjMap) {
    if (n < MIN) {
      short.push({ subject, n });
      ok = false;
    }
  }
  short.sort((a, b) => a.subject.localeCompare(b.subject));
  if (short.length) {
    console.log(`\n${exam}: subjects with MCQ count < ${MIN}`);
    for (const { subject, n } of short) {
      console.log(`  - ${subject}: ${n}`);
    }
  }
}

if (ok) {
  console.log(`All subjects have at least ${MIN} MCQs per exam (among those that appear).`);
} else {
  console.log(
    `\nAdd more MCQs in data/questions.json (or publish PYQs) until each subject reaches at least ${MIN} for full rounds.`,
  );
  process.exitCode = 1;
}
