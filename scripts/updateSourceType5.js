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
  const keys = [
    "gate_ce_2024_37",
    "gate_ce_2024_39",
    "gate_ce_2024_40",
    "gate_ce_2024_41",
    "gate_ce_2024_42"
  ];
  
  const result = await Question.updateMany(
    { importKey: { $in: keys } },
    { $set: { sourceType: "practice" } }
  );
  
  console.log(`Updated ${result.modifiedCount} questions back to sourceType: 'practice'.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
