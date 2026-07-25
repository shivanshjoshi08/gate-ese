const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({
  importKey: { type: String },
  question: { type: String },
  options: { type: mongoose.Schema.Types.Mixed }
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
  
  q.options = [
    { id: "A", text: "$y = \\frac{e^x}{2} + Ce^{-x}$", image: null },
    { id: "B", text: "$y = \\frac{e^x}{2} - Ce^{-x}$", image: null },
    { id: "C", text: "$y = e^x + Ce^{-x}$", image: null },
    { id: "D", text: "$y = xe^x + C$", image: null }
  ];
  
  await q.save();
  console.log("Question options corrected successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
