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
  const q = await Question.findOne({ importKey: "gate_ce_2017_te_04" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "According to Webster's method, the optimum cycle length ($C_o$) for a signalized intersection is given by the formula (where $L$ is total lost time and $Y$ is the sum of critical flow ratios):");
  
  q.set("options", [
    { id: "A", text: "$C_o = \\frac{1.5L + 5}{1 - Y}$", image: null },
    { id: "B", text: "$C_o = \\frac{1.5L + 5}{1 + Y}$", image: null },
    { id: "C", text: "$C_o = \\frac{L + 5}{1 - Y}$", image: null },
    { id: "D", text: "$C_o = \\frac{1.5L - 5}{1 - Y}$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
