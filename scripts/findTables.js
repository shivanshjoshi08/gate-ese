const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error("No MONGODB_URI");
  const uri = await resolveMongoUriForScript(rawUri);
  return mongoose.connect(uri);
}

async function run() {
  await connectMongo();

  // Find all questions whose text contains markdown table pipes
  const qs = await Question.find({
    question: { $regex: "\\|.*\\|" },
    sourceType: "practice"
  }).lean();

  console.log(`Found ${qs.length} questions with pipe characters (possible tables):`);
  for (const q of qs) {
    console.log(`\n=== ${q.importKey} ===`);
    console.log(q.question.substring(0, 500));
    console.log("---");
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
