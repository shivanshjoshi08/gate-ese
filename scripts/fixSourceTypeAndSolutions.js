const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  
  // 1. Revert sourceType to "practice" for 48 to 57
  const result = await Question.updateMany(
    { importKey: { $in: [
      "gate_ce_2024_48", "gate_ce_2024_49", "gate_ce_2024_50", "gate_ce_2024_51", "gate_ce_2024_52",
      "gate_ce_2024_53", "gate_ce_2024_54", "gate_ce_2024_55", "gate_ce_2024_56", "gate_ce_2024_57"
    ] } },
    { $set: { sourceType: "practice" } }
  );
  console.log(`Updated sourceType to practice for ${result.modifiedCount} questions.`);

  // 2. Add solutions for 53 to 57
  const solutions = {
    "gate_ce_2024_53": "The correct answer is 0.63 to 0.67.",
    "gate_ce_2024_54": "The correct answer is 0.12 to 0.14 or 12 to 14.",
    "gate_ce_2024_55": "The correct answer is 30.",
    "gate_ce_2024_56": "The correct answer is 0.64 to 0.65.",
    "gate_ce_2024_57": "The correct answer is 0.70 to 0.80."
  };

  for (const [key, text] of Object.entries(solutions)) {
    await Question.updateOne(
      { importKey: key },
      { $set: { solution: { text, latex: "", images: [] } } }
    );
  }
  console.log("Added solutions for 53 to 57.");
  
  process.exit(0);
}
run();
