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
  const q = await Question.findOne({ importKey: "gate_ce_math_15" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "The particular integral of differential equation $\\frac{d^2y}{dx^2} + 4y = \\sin(2x)$ is:");
  
  q.set("options", [
    { id: "A", text: "$\\frac{x \\cos(2x)}{4}$", image: null },
    { id: "B", text: "$-\\frac{x \\cos(2x)}{4}$", image: null },
    { id: "C", text: "$\\frac{\\sin(2x)}{4}$", image: null },
    { id: "D", text: "$\\frac{x \\sin(2x)}{4}$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
