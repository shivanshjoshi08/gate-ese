/**
 * Delete every document in the Questions collection.
 *
 * Usage (repo root, MONGODB_URI in .env.local):
 *   node scripts/deleteAllQuestions.js
 *   node scripts/deleteAllQuestions.js --yes
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

async function main() {
  const force = process.argv.includes("--yes");
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI?.trim());
  if (!uri) {
    console.error("MONGODB_URI missing in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const count = await Question.countDocuments();
  console.log(`Questions in database: ${count}`);

  if (count === 0) {
    console.log("Nothing to delete.");
    await mongoose.disconnect();
    return;
  }

  if (!force) {
    console.error(
      "This permanently deletes ALL questions. Re-run with: node scripts/deleteAllQuestions.js --yes",
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const result = await Question.deleteMany({});
  console.log(`Deleted ${result.deletedCount} question(s).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
