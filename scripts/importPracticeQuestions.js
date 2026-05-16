/**
 * Import bundled practice MCQs from data/questions.json into MongoDB.
 *
 * Usage (from repo root):
 *   node scripts/importPracticeQuestions.js
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

const QUESTIONS_JSON = path.join(__dirname, "..", "data", "questions.json");

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
    appearances: { type: Array, default: [] },
    references: { type: Array, default: [] },
    questionStyle: { type: String, default: null },
    question: { type: String, required: true },
    options: [optionSchema],
    correctOption: String,
    solution: solutionSchema,
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    tags: [String],
    images: [String],
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
    typeRaw === "nat" || typeRaw === "numerical"
      ? "numerical"
      : "mcq";
  const optionsArr = Array.isArray(raw.options) ? raw.options : [];
  const options = optionsArr.map((text, i) => ({
    id: String.fromCharCode(65 + i),
    text: String(text),
    image: null,
  }));

  const correctIdx =
    typeof raw.correct === "number" ? raw.correct : parseInt(String(raw.correct), 10);
  const correctOption =
    type === "numerical"
      ? String(raw.correct ?? "")
      : String.fromCharCode(65 + (Number.isNaN(correctIdx) ? 0 : correctIdx));

  const exam = raw.exam === "ESE" ? "ESE" : "GATE";
  const year = typeof raw.year === "number" ? raw.year : 2024;
  let difficulty = raw.difficulty;
  if (!["Easy", "Medium", "Hard"].includes(difficulty)) difficulty = "Medium";

  return {
    importKey: id,
    slug: slugify([id, raw.subject, year]),
    sourceType: "practice",
    exam,
    branch: "CE",
    subject: String(raw.subject || "General"),
    topic: String(raw.topic || ""),
    subtopic: "",
    year,
    paper: raw.paper ? String(raw.paper) : null,
    type,
    numerical,
    appearances: Array.isArray(raw.appearances)
      ? raw.appearances
      : [
          {
            exam,
            year,
            paper: raw.paper ? String(raw.paper) : null,
          },
        ],
    references: Array.isArray(raw.references) ? raw.references : [],
    questionStyle:
      typeof raw.questionStyle === "string" ? raw.questionStyle : null,
    question: String(raw.question),
    options,
    correctOption,
    solution: { text: String(raw.solution || ""), latex: "", images: [] },
    difficulty,
    marks: raw.marks === 2 ? 2 : 1,
    negativeMarks: 0,
    tags: [],
    images: raw.image ? [String(raw.image)] : [],
    status: "approved",
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
  let skipped = 0;
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
        await Question.updateOne(
          { _id: exists._id },
          {
            $set: {
              numerical: doc.numerical,
              type: doc.type,
              options: doc.options,
              correctOption: doc.correctOption,
              appearances: doc.appearances,
              references: doc.references,
              questionStyle: doc.questionStyle,
            },
          },
        );
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
  console.log(
    `Import done: +${inserted} inserted, ${updated} updated (numerical/type sync), ${skipped} skipped`,
  );
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
