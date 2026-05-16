/**
 * Backfill bundled questions.json with canonical schema defaults (non-destructive).
 * Usage: node scripts/normalizeQuestionsJsonSchema.js
 */
const fs = require("fs");
const path = require("path");

const fp = path.join(__dirname, "..", "data", "questions.json");
const raw = JSON.parse(fs.readFileSync(fp, "utf8"));

function defaults(q) {
  const type = String(q.type ?? "mcq").toLowerCase();
  const numerical =
    q.numerical === true ||
    type === "nat" ||
    type === "numerical";
  const exam = q.exam === "ESE" ? "ESE" : "GATE";
  const year = typeof q.year === "number" ? q.year : 2024;
  const paper = q.paper ?? null;

  return {
    numerical,
    unit: q.unit ?? null,
    answerRange: q.answerRange ?? null,
    branch: q.branch ?? "CE",
    section: q.section ?? null,
    qno: q.qno ?? null,
    subtopic: q.subtopic ?? "",
    negativeMarking: q.negativeMarking ?? 0,
    appearances:
      Array.isArray(q.appearances) && q.appearances.length
        ? q.appearances
        : [{ exam, year, paper, qno: q.qno ?? null }],
    references: Array.isArray(q.references) ? q.references : [],
    questionStyle: q.questionStyle ?? undefined,
    solutionSteps: Array.isArray(q.solutionSteps) ? q.solutionSteps : [],
    conceptUsed: q.conceptUsed ?? "",
    formulaUsed: Array.isArray(q.formulaUsed) ? q.formulaUsed : [],
    whyWrongOptions:
      q.whyWrongOptions && typeof q.whyWrongOptions === "object"
        ? q.whyWrongOptions
        : {},
    keyTakeaway: q.keyTakeaway ?? "",
    repeatCount: q.repeatCount ?? 1,
    isHighRepeat: q.isHighRepeat === true,
    trendNote: q.trendNote ?? "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    mainsRelevant: q.mainsRelevant === true,
    selfEvalChecklist: Array.isArray(q.selfEvalChecklist)
      ? q.selfEvalChecklist
      : [],
    diagramRequired: q.diagramRequired === true,
    diagramUrl: q.diagramUrl ?? null,
    aiExplanation: null,
    similarQuestionsGenerated: [],
    addedBy: q.addedBy ?? "admin",
    verified: q.verified === true,
    source: q.source ?? "official-pdf",
    difficulty:
      q.difficulty === "Easy" || q.difficulty === "Hard"
        ? q.difficulty
        : q.difficulty === "Medium"
          ? "Moderate"
          : q.difficulty ?? "Moderate",
  };
}

const out = raw.map((q) => ({ ...q, ...defaults(q) }));
fs.writeFileSync(fp, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Normalized ${out.length} questions in data/questions.json`);
