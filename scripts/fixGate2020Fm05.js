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
  const q = await Question.findOne({ importKey: "gate_ce_2020_fm_05" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "For a rectangular channel of width $b$, the critical depth $y_c$ for a given discharge $Q$ is given by:");
  
  q.set("options", [
    { id: "A", text: "$\\left( \\frac{Q^2}{g b^2} \\right)^{1/3}$", image: null },
    { id: "B", text: "$\\left( \\frac{Q}{g b^2} \\right)^{1/3}$", image: null },
    { id: "C", text: "$\\left( \\frac{Q^2}{g b} \\right)^{1/3}$", image: null },
    { id: "D", text: "$\\left( \\frac{Q^2}{g^2 b^2} \\right)^{1/3}$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
