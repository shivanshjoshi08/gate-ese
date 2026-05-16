/**
 * Backfill `numerical` on all MongoDB questions.
 *
 * Usage (repo root, MONGODB_URI in .env.local):
 *   node scripts/migrateNumericalFlag.js
 *
 * Then re-sync practice rows from JSON (optional):
 *   node scripts/importPracticeQuestions.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema(
  {
    type: String,
    numerical: Boolean,
  },
  { strict: false },
);

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

async function main() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI?.trim());
  if (!uri) {
    console.error("MONGODB_URI missing in .env.local");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connected.");

  const numericalType = await Question.updateMany(
    { type: "numerical" },
    { $set: { numerical: true } },
  );
  console.log(
    `type=numerical → numerical:true: matched ${numericalType.matchedCount}, modified ${numericalType.modifiedCount}`,
  );

  const mcqDefault = await Question.updateMany(
    {
      $or: [{ type: "mcq" }, { type: { $exists: false } }],
      numerical: { $ne: true },
    },
    { $set: { numerical: false } },
  );
  console.log(
    `type=mcq (unset) → numerical:false: matched ${mcqDefault.matchedCount}, modified ${mcqDefault.modifiedCount}`,
  );

  const withTrue = await Question.countDocuments({ numerical: true });
  const total = await Question.countDocuments();
  console.log(`Done. ${withTrue}/${total} questions marked numerical.`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
