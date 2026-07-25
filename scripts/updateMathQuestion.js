const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({
  importKey: { type: String },
  question: { type: String },
  options: { type: [String] }
}, { strict: false });

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
  const q = await Question.findOne({ importKey: "gate_ce_math_02" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  console.log("Found question:", q.question);
  
  q.question = "The general solution of $\\frac{dy}{dx} + y = e^x$ is:";
  q.options = [
    "$y = \\frac{e^x}{2} + Ce^{-x}$",
    "$y = \\frac{e^x}{2} - Ce^{-x}$",
    "$y = e^x + Ce^{-x}$",
    "$y = xe^x + C$"
  ];
  
  await q.save();
  console.log("Question updated successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
