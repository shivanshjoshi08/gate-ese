/**
 * Classify bundled questions: numerical MCQ vs theory MCQ.
 * Numerical MCQ = type mcq, options are mostly numeric answers (calculation).
 * NAT / empty-options → convert to mcq with 4 numeric options (no range input).
 */
const fs = require("fs");
const path = require("path");

const fp = path.join(__dirname, "..", "data", "questions.json");
const raw = JSON.parse(fs.readFileSync(fp, "utf8"));

const THEORY_WORD =
  /^(clay|sand|gravel|silt|steel|concrete|brick|wood|rcc|psc|plain|steady|turbulent|unsteady|incompressible|viscous|laminar|open|closed|one-way|two-way|simply|fixed|hinged|roller|deep|shallow|rankine|coulomb|terzaghi|permeability|consistency|bearing|settlement|shear|normal|critical|submerged|buoyant|ultimate|working|allowable|safe|limit|state|deflection|crack|creep|shrinkage|durability|exposure|curing|moderate|severe|mild|grade|type|is\s)/i;

function isNumericOption(s) {
  const t = String(s ?? "").trim();
  if (!t) return false;
  if (/any value| for |days|°c\b/i.test(t)) return false;
  if (/^M\d{1,2}$/i.test(t)) return false;
  if (THEORY_WORD.test(t)) return false;
  if (/^[A-Za-z][A-Za-z\s\-]{2,}$/.test(t) && !/[\d.]/.test(t)) return false;
  if (/^(>|<|>=|<=|=)\s*[\d.]+/.test(t)) return true;
  if (/^[\d.]+°(\d+['′])?(\d+["″])?$/i.test(t)) return true;
  if (/^[\d.]+%$/.test(t)) return true;
  if (/^[\d.]+\s*(%|kN\/m|kN\/m³|kN\/m\^3|kg\/m³|m\/s|m³\/s|m\^3\/s|kg|MPa|GPa|N\/mm|°|deg|rad|Hz|Pa|kPa|cm|mm|km|hr|min|sec|s|m|cm|mm)\b/i.test(t))
    return true;
  if (/^[\d.]+(\s*[-–]\s*[\d.]+)?$/.test(t)) return true;
  if (/^[\d.]+\s*\/\s*[\d.]+$/.test(t)) return true;
  if (/^[\d.]+(\s*[×x*]\s*10\^?[-+]?\d+)?$/i.test(t)) return true;
  if (t === "Infinity" || t === "∞") return true;
  return /^[\d.]+$/.test(t);
}

function parseCorrectNumber(correct) {
  if (typeof correct === "number" && Number.isFinite(correct)) return correct;
  const s = String(correct ?? "").trim().replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function roundNice(n, decimals = 3) {
  const mag = Math.abs(n);
  const d = mag >= 100 ? 0 : mag >= 10 ? 1 : mag >= 1 ? 2 : 3;
  return Number(n.toFixed(d));
}

function buildNumericOptions(correctVal) {
  const c = roundNice(correctVal);
  const deltas = [0.85, 1, 1.12, 1.28].map((f) => roundNice(c * f));
  const uniq = [...new Set(deltas.map(String))];
  while (uniq.length < 4) {
    const bump = roundNice(c * (1 + 0.07 * (uniq.length + 1)));
    if (!uniq.includes(String(bump))) uniq.push(String(bump));
  }
  const opts = uniq.slice(0, 4).map(Number);
  if (!opts.some((x) => Math.abs(x - c) < 1e-6)) opts[0] = c;
  else {
    const i = opts.findIndex((x) => Math.abs(x - c) < 1e-6);
    if (i > 0) [opts[0], opts[i]] = [opts[i], opts[0]];
  }
  return opts.map(String);
}

function classifyQuestion(q) {
  const type = String(q.type ?? "mcq").toLowerCase();
  const opts = Array.isArray(q.options) ? q.options.map(String) : [];

  if (type === "nat" || type === "numerical") {
    const n = parseCorrectNumber(q.correct);
    if (n == null) {
      return { numerical: false, type: "mcq", options: opts, correct: q.correct };
    }
    const options = buildNumericOptions(n);
    const correctIdx = options.findIndex(
      (o) => Math.abs(Number(o) - roundNice(n)) < 1e-6,
    );
    return {
      numerical: true,
      type: "mcq",
      options,
      correct: correctIdx >= 0 ? correctIdx : 0,
    };
  }

  if (opts.length < 2) {
    return { numerical: false, type: "mcq", options: opts, correct: q.correct };
  }

  const numericCount = opts.filter(isNumericOption).length;
  const numerical =
    numericCount === opts.length && numericCount >= 2;

  return { numerical, type: "mcq", options: opts, correct: q.correct };
}

function apply() {
  let numCount = 0;
  const out = raw.map((q) => {
    const c = classifyQuestion(q);
    if (c.numerical) numCount++;
    return {
      ...q,
      type: c.type,
      options: c.options,
      correct: c.correct,
      numerical: c.numerical,
    };
  });

  fs.writeFileSync(fp, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(
    `Updated ${out.length} questions: ${numCount} numerical MCQ, ${out.length - numCount} theory MCQ.`,
  );
}

module.exports = { classifyQuestion, isNumericOption, apply };

if (require.main === module) {
  if (process.argv.includes("--dry")) {
    for (const q of raw) {
      const c = classifyQuestion(q);
      if (c.numerical || String(q.type).toLowerCase() === "nat") {
        console.log(
          q.id,
          "→",
          c.numerical ? "NUM" : "theory",
          "| opts:",
          (c.options || []).join(" | "),
        );
      }
    }
  } else {
    apply();
  }
}
