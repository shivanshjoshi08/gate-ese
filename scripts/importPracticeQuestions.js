/**
 * Import bundled practice MCQs from data/questions.json into MongoDB.
 *
 * Usage (from repo root):
 *   node scripts/importPracticeQuestions.js
 *   node scripts/importPracticeQuestions.js data/environmental-questions.json
 *
 * Requires MONGODB_URI in .env.local (loaded via dotenv).
 */
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const dns = require("dns");
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

/** Passwords with @ : / # ? must be URL-encoded in MONGODB_URI */
function validateMongoUri(uri) {
  if (!uri) return "MONGODB_URI is not set in .env.local";
  const body = uri.replace(/^mongodb(\+srv)?:\/\//, "");
  const atCount = (body.match(/@/g) || []).length;
  if (atCount > 1) {
    return (
      "MONGODB_URI has more than one '@' before the hostname — usually an unencoded '@' in the password.\n" +
      "Fix: encode the password (e.g. shivGees@0810 → shivGees%400810) or change the Atlas password.\n" +
      "Example: mongodb+srv://USER:shivGees%400810@cluster0.xxxxx.mongodb.net/"
    );
  }
  const hostMatch = uri.match(/@([^/?]+)/);
  const host = hostMatch?.[1] ?? "";
  if (/^\d+$/.test(host) || (host.length > 0 && host.length < 8 && !host.includes("."))) {
    return (
      `MONGODB_URI hostname looks wrong ("${host}"). Same cause: '@' inside the password.\n` +
      "Encode special characters with encodeURIComponent() before pasting into .env.local."
    );
  }
  return null;
}

const DEFAULT_QUESTIONS_JSON = path.join(__dirname, "..", "data", "questions.json");
const fileArg = process.argv[2];
const QUESTIONS_JSON = fileArg
  ? path.isAbsolute(fileArg)
    ? fileArg
    : path.join(process.cwd(), fileArg)
  : DEFAULT_QUESTIONS_JSON;

const optionSchema = new mongoose.Schema(
  { id: String, text: String, image: { type: String, default: null } },
  { _id: false },
);
const solutionSchema = new mongoose.Schema(
  { text: String, latex: String, images: [String] },
  { _id: false },
);
const questionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    importKey: { type: String, sparse: true, unique: true },
    sourceType: { type: String, enum: ["pyq", "practice"], required: true },
    exam: { type: String, enum: ["GATE", "ESE"], required: true },
    branch: { type: String, default: "CE" },
    subject: { type: String, required: true },
    topic: { type: String, default: "" },
    subtopic: { type: String, default: "" },
    year: { type: Number, required: true },
    paper: { type: String, default: null },
    type: { type: String, enum: ["mcq", "numerical"], required: true },
    numerical: { type: Boolean, default: false },
    unit: { type: String, default: null },
    answerRange: { type: mongoose.Schema.Types.Mixed, default: null },
    appearances: { type: Array, default: [] },
    references: { type: Array, default: [] },
    questionStyle: { type: String, default: null },
    section: { type: String, default: null },
    qno: { type: Number, default: null },
    conceptUsed: { type: String, default: "" },
    formulaUsed: { type: [String], default: [] },
    solutionSteps: { type: [mongoose.Schema.Types.Mixed], default: [] },
    whyWrongOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
    keyTakeaway: { type: String, default: "" },
    repeatCount: { type: Number, default: 0 },
    isHighRepeat: { type: Boolean, default: false },
    trendNote: { type: String, default: "" },
    mainsRelevant: { type: Boolean, default: false },
    selfEvalChecklist: { type: [String], default: [] },
    diagramRequired: { type: Boolean, default: false },
    diagramUrl: { type: String, default: null },
    addedBy: { type: String, default: "admin" },
    verified: { type: Boolean, default: false },
    source: { type: String, default: "official-pdf" },
    question: { type: String, required: true },
    options: [optionSchema],
    correctOption: String,
    solution: solutionSchema,
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Medium", "Hard"],
      required: true,
    },
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    tags: [String],
    images: { type: [String], default: [] },
    status: { type: String, enum: ["approved", "draft"], default: "approved" },
  },
  { timestamps: true },
);

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

function slugify(parts) {
  return parts
    .filter((p) => p !== null && p !== undefined && String(p).trim() !== "")
    .map((p) =>
      String(p)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .join("-")
    .slice(0, 120);
}

function normalizeDifficulty(raw) {
  if (raw === "Easy" || raw === "Hard") return raw;
  if (raw === "Moderate" || raw === "Medium") return "Moderate";
  return "Moderate";
}

function buildAppearances(raw, exam, year) {
  if (Array.isArray(raw.appearances) && raw.appearances.length > 0) {
    return raw.appearances;
  }
  return [
    {
      exam,
      year,
      paper: raw.paper ? String(raw.paper) : null,
      qno: typeof raw.qno === "number" ? raw.qno : null,
      session: raw.session ? String(raw.session) : "",
    },
  ];
}

function transform(raw) {
  const id = String(raw.id || "");
  if (!id || !raw.question) return null;

  const typeRaw = String(raw.type || "mcq").toLowerCase();
  const numerical =
    raw.numerical === true ||
    raw.numerical === "true" ||
    typeRaw === "nat" ||
    typeRaw === "numerical";
  const type =
    typeRaw === "nat" || typeRaw === "numerical" ? "numerical" : "mcq";
  const optionsArr = Array.isArray(raw.options) ? raw.options : [];
  const options = optionsArr.map((text, i) => ({
    id: String.fromCharCode(65 + i),
    text: String(text),
    image: null,
  }));

  const correctIdx =
    typeof raw.correct === "number"
      ? raw.correct
      : parseInt(String(raw.correct), 10);
  const correctOption =
    type === "numerical"
      ? String(raw.correct ?? "")
      : String.fromCharCode(65 + (Number.isNaN(correctIdx) ? 0 : correctIdx));

  const exam = raw.exam === "ESE" ? "ESE" : "GATE";
  const year = typeof raw.year === "number" ? raw.year : 2024;
  const sourceType =
    raw.sourceType === "pyq" || raw.sourceType === "practice"
      ? raw.sourceType
      : "practice";
  const status =
    raw.status === "draft" ? "draft" : raw.verified === false ? "draft" : "approved";

  return {
    importKey: id,
    slug: slugify([id, raw.subject, year]),
    sourceType,
    exam,
    branch: String(raw.branch || "CE"),
    subject: String(raw.subject || "General"),
    topic: String(raw.topic || ""),
    subtopic: String(raw.subtopic || ""),
    year,
    paper: raw.paper ? String(raw.paper) : null,
    section: raw.section ? String(raw.section) : null,
    qno: typeof raw.qno === "number" ? raw.qno : null,
    type,
    numerical,
    unit: raw.unit != null && raw.unit !== "" ? String(raw.unit) : null,
    answerRange: raw.answerRange ?? null,
    appearances: buildAppearances(raw, exam, year),
    references: Array.isArray(raw.references) ? raw.references : [],
    questionStyle:
      typeof raw.questionStyle === "string" ? raw.questionStyle : null,
    question: String(raw.question),
    options,
    correctOption,
    solution: { text: String(raw.solution || ""), latex: "", images: [] },
    difficulty: normalizeDifficulty(raw.difficulty),
    marks: raw.marks === 2 ? 2 : 1,
    negativeMarks:
      typeof raw.negativeMarking === "number"
        ? raw.negativeMarking
        : typeof raw.negativeMarks === "number"
          ? raw.negativeMarks
          : 0,
    conceptUsed: raw.conceptUsed ? String(raw.conceptUsed) : "",
    formulaUsed: Array.isArray(raw.formulaUsed)
      ? raw.formulaUsed.map(String)
      : [],
    solutionSteps: Array.isArray(raw.solutionSteps) ? raw.solutionSteps : [],
    whyWrongOptions:
      raw.whyWrongOptions && typeof raw.whyWrongOptions === "object"
        ? raw.whyWrongOptions
        : {},
    keyTakeaway: raw.keyTakeaway ? String(raw.keyTakeaway) : "",
    repeatCount:
      typeof raw.repeatCount === "number" ? raw.repeatCount : 0,
    isHighRepeat: raw.isHighRepeat === true,
    trendNote: raw.trendNote ? String(raw.trendNote) : "",
    mainsRelevant: raw.mainsRelevant === true,
    selfEvalChecklist: Array.isArray(raw.selfEvalChecklist)
      ? raw.selfEvalChecklist.map(String)
      : [],
    diagramRequired: raw.diagramRequired === true,
    diagramUrl: raw.diagramUrl ? String(raw.diagramUrl) : null,
    addedBy:
      raw.addedBy === "community" || raw.addedBy === "ai-generated"
        ? raw.addedBy
        : "admin",
    verified: raw.verified === true,
    source:
      typeof raw.source === "string" ? raw.source : "ai-generated",
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    images: Array.isArray(raw.images)
      ? raw.images.map(String)
      : raw.image
        ? [String(raw.image)]
        : [],
    status,
  };
}

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  const uriError = validateMongoUri(uri);
  if (uriError) {
    console.error(uriError);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(QUESTIONS_JSON, "utf8"));
  if (!Array.isArray(raw)) {
    console.error("questions.json must be an array");
    process.exit(1);
  }

  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {
    /* Node < 17 */
  }
  dns.setServers(
    process.env.MONGODB_DNS_SERVERS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .length
      ? process.env.MONGODB_DNS_SERVERS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["8.8.8.8", "1.1.1.1"],
  );

  const connectUri = await resolveMongoUriForScript(uri);
  await mongoose.connect(connectUri, {
    serverSelectionTimeoutMS: 20_000,
    connectTimeoutMS: 20_000,
    family: 4,
  });

  let inserted = 0;
  let updated = 0;
  const failed = [];

  for (const item of raw) {
    try {
      const doc = transform(item);
      if (!doc) {
        failed.push({ id: item?.id, reason: "validation failed" });
        continue;
      }
      const exists = await Question.findOne({
        $or: [{ importKey: doc.importKey }, { slug: doc.slug }],
      })
        .select("_id")
        .lean();
      if (exists) {
        const { importKey: _ik, slug: _slug, ...syncFields } = doc;
        await Question.updateOne({ _id: exists._id }, { $set: syncFields });
        updated++;
        continue;
      }
      await Question.create(doc);
      inserted++;
    } catch (e) {
      failed.push({ id: item?.id, reason: e.message || String(e) });
    }
  }

  const total = await Question.countDocuments({ sourceType: "practice" });
  console.log(`Import done: +${inserted} inserted, ${updated} updated`);
  console.log(`Practice questions in DB: ${total}`);
  if (failed.length) {
    console.log(`Failed (${failed.length}):`);
    failed.slice(0, 20).forEach((f) => console.log(" ", f));
    if (failed.length > 20) console.log(`  … and ${failed.length - 20} more`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  if (e?.code === "ECONNREFUSED" && String(e?.syscall || "").includes("querySrv")) {
    console.error(
      "\nAtlas SRV DNS blocked on this network. The script already uses DNS-over-HTTPS;\n" +
        "if this persists: check VPN/firewall, or set MONGODB_SRV_DOH=off and use a standard\n" +
        "mongodb:// seed list from Atlas → Connect → Drivers.\n",
    );
  }
  console.error(e);
  process.exit(1);
});
